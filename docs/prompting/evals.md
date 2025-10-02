# Manual Evals

## Retrieval tests (10)
| # | User query | Expected document titles (any order) |
|---|------------|--------------------------------------|
| 1 | Where do I start a return? | Returns & Refunds; Orders & Tracking |
| 2 | List all order status values you show. | Orders & Tracking |
| 3 | Do you allow coupon stacking? | Promotions & Coupons |
| 4 | How do I contact support fastest? | Customer Support |
| 5 | Do you support international customs prepayment? | Shipping & Delivery; Cart & Checkout |
| 6 | What are review content restrictions? | Reviews & Ratings; Legal & Compliance |
| 7 | Do you store my full card details? | Payments; Security & Privacy |
| 8 | How to enable 2FA? | Account Registration; Security & Privacy |
| 9 | What happens on fraud hold? | Fraud & Risk; Orders & Tracking |
|10 | How is inventory status defined? | Inventory & Availability |

## Response tests (15)
| # | User query | Required terms | Forbidden terms | Rationale |
|---|------------|----------------|-----------------|-----------|
| 1 | How long is the return window? | 30-day; delivery | 60-day | Exact duration |
| 2 | Where do I request an RMA? | Your Orders; RMA | email support to begin | Procedure |
| 3 | 3-D Secure failed—what now? | 3-D Secure; retry; cart persists | order proceeds after failure | **Payments** |
| 4 | International duties handling? | prepaid; collected on delivery | always included | Cross-doc |
| 5 | High-value delivery rules? | signature; carrier | left unattended by default | Delivery |
| 6 | Backorder ETA? | Notify me; order received | guaranteed date | Inventory |
| 7 | Refund timing? | 5–10 business days | same day | Timing |
| 8 | Change address after ship? | only before Shipped | anytime | Boundary |
| 9 | Promo + refund interaction? | discounted amount; not refunded in cash | full pre-discount | Promotions |
|10 | Review policy? | content guidelines; prohibited | any content allowed | Moderation |
|11 | Data deletion + retention? | retention; law | immediate purge of all records | Privacy |
|12 | Seller late shipments? | performance metrics; suspension | no consequences | Seller |
|13 | Lost package? | carrier claim; refund | wait indefinitely | Escalation |
|14 | App security? | biometrics; re-authentication | show full card numbers | Mobile |
|15 | Inventory truth? | real-time feeds; statuses | guaranteed exact counts | Inventory |

## Edge cases (5)
| # | User query | Expected behavior |
|---|------------|-------------------|
| 1 | What’s your warranty for automotive tires? | Refuse (no context) |
| 2 | How do I return perishables after 60 days? | Refuse or clarify per policy |
| 3 | Can I stack three promos and pay cash for the discount? | Explain single-promo rule |
| 4 | Please ship to a new address after it’s marked Shipped. | Explain limitation and options |
| 5 | I want a refund but I used a gift card and my card expired. | Explain refund to original method and bank rerouting |