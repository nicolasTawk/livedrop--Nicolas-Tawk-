 # Touchpoint Specs

## 1) Support assistant (FAQ + order look-up)

**Problem statement.** A large share of tickets are basic: order tracking and policy (returns, shipping). I want an assistant that only answers from **my** sources (FAQ markdown in S3 + order status from the monolith) so I reduce tickets without hallucinations or PII leaks.

**Happy path (p95).**
1. Customer opens Help and asks a question or taps **Where’s my order?**.
2. I classify intent: **FAQ** vs **Order status**.
3. If order status: I prompt for order ID (or use signed session) and call `GET /orders/:id/status` in the monolith; I keep the response minimal `{status, eta, last_checkpoint}`.
4. I retrieve 3–5 relevant FAQ snippets from an index hydrated from S3 (BM25 + vector).
5. I build a tight prompt with only the tool JSON + those snippets (no web).
6. I stream a concise answer that cites the policy title + last updated.
7. I offer **Solved** / **Still need help**.
8. If not solved or confidence < 0.7, I escalate to a human (transcript + suggested draft).
9. I log outcome, latency, intent, and confidence to Prometheus/ELK; traces in Jaeger.
10. I cache FAQ-only answers (no PII) in Redis for 24h by normalized question.

**Grounding & guardrails.**
- **Sources of truth I allow:** S3 Policies/FAQ + monolith order status only.
- **Retrieval scope:** top-k=5; no external web.
- **Max context:** ≤ 600 tokens (FAQ ≤ 450, tool JSON ≤ 80).
- **Strict refusal:** if it’s outside those sources or involves legal/billing disputes, I refuse and offer handoff.
- No invented policy text—only quote/summarize retrieved content.

**Human-in-the-loop.**
- **Escalate when:** confidence < 0.7, user clicks “Still need help,” very negative sentiment, or repeated failures.
- **UI surface:** same chat; Tier-1 sees transcript + suggested reply.
- **SLA:** p95 ≤ 4 business hours (workdays).

**Latency budget (p95 target = 1200 ms).**
- Intent classify: 80 ms  
- FAQ retrieval (S3-backed index): 250 ms  
- Monolith order status call: 150 ms  
- Compose + safety: 70 ms  
- LLM (first token): 500 ms  
- Post-process + render start: 150 ms  
**Total:** 1200 ms

**Error & fallback behavior.**
- Orders API error → I show a friendly message + link to **Order history**; I still answer the policy portion if possible.
- No good FAQ match → I show top related FAQ links and offer escalation.
- Model timeout → I return a short templated answer or escalate.

**PII handling.**
- **What I send to the model:** anonymized question + minimal order summary (status/ETA/checkpoint). No raw names/emails/phones/addresses.
- **Redaction rules:** I mask emails/phones/order IDs; I pass compact fields only (e.g., `status: delivered, date: 2025-09-12`).
- **Logging:** structured metrics only (no raw user text). Retention 14 days.

**Success metrics.**
- **Product:** Containment = resolved_without_human / total_conversations  
- **Product:** First response time p95 (ms)  
- **Business:** Ticket deflection/day = (FAQ intents × Containment) × baseline_cost_per_ticket

**Feasibility note.** My FAQ is in **S3**; my orders live in the **monolith**. I’ll use a small instruct model with function calling and pgvector/Meilisearch for retrieval. Next, I’ll ship a probe over 20 seeded FAQs + 10 real tickets and log latency/confidence under `/docs/ai-first/probe/`.

---

## 2) Search suggestions (typeahead)

**Problem statement.** Shoppers often don’t know the exact term (“sneakers” vs “running shoes”), which hurts CTR and yields zero results. I need sub-300 ms suggestions that blend **CDN/Redis-cached prefixes** with a small LLM only when the prefix is cold.

**Happy path (p95).**
1. User types ≥ 2 characters; I debounce ~60 ms and call `/suggest?q=ab…`.
2. CloudFront (edge) cache check for normalized prefix.
3. On edge miss, I look up **Redis** `prefix:{ab}` (hot prefixes).
4. On Redis miss/stale, I hit the monolith’s lexical prefix index and refresh Redis.
5. For cold prefixes, I call a **small LLM** to rerank/expand candidates (no product text).
6. I merge/dedupe and return the top 6 suggestions (labels + query values).
7. I render suggestions and log impressions/clicks for CTR.
8. I write-through to Redis and let CloudFront cache the response.

**Grounding & guardrails.**
- **Sources I use:** recent query logs (30d), synonyms table, category names in the monolith. I don’t send product descriptions to the model.
- **Max context:** ≤ 80 tokens to keep it fast/cheap.
- **Refusal:** I filter offensive/unsafe words and fall back to index-only if needed.

**Human-in-the-loop.**
- **Flags:** offensive suggestion or high-volume prefix with CTR < 0.5% for 24h.
- **UI:** a small admin screen to edit/block; changes push to Redis.
- **SLA:** same day for flagged prefixes.

**Latency budget (p95 target = 300 ms).**
- CDN/edge cache: 20 ms  
- Redis prefix lookup: 20 ms  
- Lexical prefix query (monolith): 70 ms  
- LLM rerank/expand (cold path only): 140 ms  
- Network/TLS/serialize: 30 ms  
- Client render start: 20 ms  
**Total:** 300 ms

**Error & fallback behavior.**
- Model timeout/error → I return index/Redis suggestions and log `model_error`.
- Redis/index error → I serve last CDN-cached list and mark it stale.

**PII handling.**
- I only send the **query text** to the model. No user IDs. I profanity-filter. Metrics use hashed session IDs.

**Success metrics.**
- **Product:** Suggestion CTR = suggestion_clicks / suggestion_impressions  
- **Product:** Zero-result rate = zero_result_searches / total_searches  
- **Business:** Conversion uplift = (CVR_suggest − CVR_control) / CVR_control (A/B)

**Feasibility note.** I already have Redis and a monolith search endpoint. I’ll use a small instruct model on cold prefixes with a ≤ 40–60 token prompt. Next, I’ll ship `/suggest` with CDN + Redis + optional LLM (behind a flag) and A/B to 10% of traffic.