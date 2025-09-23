# Cost Model

I’m using the assignment defaults for traffic/cache and pricing a small model (Llama 3.1 8B Instruct). Numbers are per 1K tokens.

---

## Support assistant

## Assumptions
- Model: **Llama 3.1 8B Instruct** — $0.05 / 1K prompt, $0.20 / 1K completion
- Avg tokens in: **500**    Avg tokens out: **150**
- Requests/day: **1,000**
- Cache hit rate: **30%** (I only pay on cache **misses** for FAQ-only answers)

## Calculation
Cost/action = (tokens_in/1000 × prompt_price) + (tokens_out/1000 × completion_price)  
= (500/1000 × 0.05) + (150/1000 × 0.20) = **$0.055**  
Daily cost = Cost/action × Requests/day × (1 − cache_hit_rate)  
= 0.055 × 1,000 × 0.70 = **$38.50/day**

## Results
- Support assistant: **$0.055 per action**, **$38.50/day**

## Cost lever if over budget
- I’ll shrink context to ≤ 400 tokens, include fewer FAQ chunks, increase Redis/CDN cache coverage for FAQ-only, or route trivial intents to a smaller model.

---

## Search suggestions (typeahead)

## Assumptions
- Model: **Llama 3.1 8B Instruct** — $0.05 / 1K prompt, $0.20 / 1K completion
- Avg tokens in: **40**    Avg tokens out: **8**
- Requests/day: **50,000**
- Cache hit rate: **70%** (CloudFront + Redis)

## Calculation
Cost/action = (40/1000 × 0.05) + (8/1000 × 0.20) = **$0.0036**  
Daily cost = 0.0036 × 50,000 × 0.30 = **$54.00/day**

## Results
- Search suggestions: **$0.0036 per action**, **$54.00/day**

## Cost lever if over budget
- I’ll raise TTL for hot prefixes, cap suggestions at 5, trim prompts to ≤ 30 tokens, or force index-only for very low-volume prefixes.