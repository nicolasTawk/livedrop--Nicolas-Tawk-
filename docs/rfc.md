## AI Touchpoints

This sprint I’m adding two low-risk AI touchpoints that fit my CloudFront + Redis + modular monolith stack and move core metrics:

- **Support assistant (FAQ + order look-up)** — reduce **contact rate** and speed up first responses by answering from my S3-hosted FAQ and the monolith’s orders endpoint. p95 target **≤ 1200 ms**.
- **Search suggestions (typeahead)** — raise **search CTR** and **conversion** with CDN/Redis-backed prefixes and a small LLM on cold misses. p95 target **≤ 300 ms**.

See details:
- Capability map: [/docs/ai-first/ai-capability-map.md](/docs/ai-first/ai-capability-map.md)  
- Touchpoint specs: [/docs/ai-first/touchpoints.md](/docs/ai-first/touchpoints.md)  
- Cost model: [/docs/ai-first/cost-model.md](/docs/ai-first/cost-model.md)