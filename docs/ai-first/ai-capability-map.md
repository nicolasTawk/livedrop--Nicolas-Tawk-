# AI Capability Map — ShopLite (Week 2)

> Infra I’m using: CDN (CloudFront), blob storage (S3), Redis (cache + counters), modular monolith backend, Stripe, FCM, an internal event bus, and observability (Prometheus/Grafana, ELK/Loki, Jaeger). Defaults: ~10k SKUs, ~20k sessions/day; Policies/FAQ markdown exists in S3; `order-status` API by id exists in the monolith.

| Capability | Intent (user) | Inputs (this sprint) | Risk 1–5 (tag) | p95 ms | Est. cost/action | Fallback | Selected |
|---|---|---|---|---:|---:|---|:---:|
| Support assistant (FAQ + order look-up) | “Where’s my order?” “What’s the return policy?” | Policies/FAQ in S3 (Markdown), monolith Orders endpoint, short reply templates | 2 (simple integration) | 1200 | $0.055 | Show FAQ snippet + link; human handoff | ok |
| Search suggestions (typeahead) | “Help me find products as I type” | Redis prefix sets (hot prefixes), recent query logs, synonyms table | 3 (latency) | 300 | $0.0036 | Index-only prefix suggestions (no LLM) | ok |
| PDP Q&A (on product page) | “Will this fit?” “What’s the fabric?” | Catalog attributes from monolith; size chart in S3 | 3 (scope) | 900 | $0.020 | Show 3 PDP FAQs |  |
| Auto-tag new SKUs | “Put products in the right category/tags” | SKU title/desc (monolith), taxonomy, (optional) image URL in S3 | 4 (data quality) | 2000 | $0.030 | Rule-based tags + human approve |  |
| Merch copy / SEO meta | “Draft titles, bullets, meta descriptions” | Existing copy in monolith/S3, tone guide | 3 (brand) | 1500 | $0.015 | Keep current manual flow |  |

**Why I chose these two.** I’m prioritizing **Support assistant** to cut **contact rate** on repeat questions using my S3 FAQ and the monolith’s order endpoint, and **Search suggestions (typeahead)** to raise **search CTR** and conversion with Redis + CDN and a tiny LLM only on cold misses. Both are low-risk to integrate this sprint, hit high-volume traffic, and are easy to measure.