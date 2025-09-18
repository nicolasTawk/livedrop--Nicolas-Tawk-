

### API Contract (high-level)

I think about the API as a few simple families of actions.

#### Public API (used by the apps)

- **Drops**
  - List drops: get "live now" and "upcoming soon".
  - Drop details: one drop’s info (product, price, remaining stock, start/end times).
- **Orders**
  - Create order: place an order for a drop. I require a unique idempotency token so accidental retries don’t create duplicates.
  - Order status: check if it’s reserved, confirmed, failed, or cancelled.
- **Creators & Follows**
  - Follow / Unfollow a creator.
  - List a creator’s followers (paged).
- **Notifications (optional)**
  - List my recent notifications (only if I keep a history).
  - Mark as read.

#### Cross-cutting behavior

- Idempotency on order creation (safe against double-clicks and network retries).
- Pagination for lists (drops, followers).
- Versioned API (e.g., /v1/...) so I can evolve safely.
- Rate limits so a single client can’t overload the system.

#### Internal API / callbacks (behind the scenes)

- Payments webhook: my payment provider calls me when a charge succeeds/fails; I flip the order to confirmed or failed.
- Cache invalidation hook: a small internal endpoint (or background worker) refreshes/evicts caches when something changes.
- Fan-out workers: background processes read events (e.g., "DropStarted") and notify followers (sockets for online users; push for offline).
- Audit / Analytics pipeline: consumes business events to build dashboards and compliance trails. 

### Caching & Invalidation 

What I cache
- Hot pages: drop cards, product info, "live drops" list.
- Counters: follower counts, quick stock snapshots for display.
- Media: images/videos via the CDN (not my app).

What stays authoritative (not a cache)
- The "can I sell this item?" decision: handled atomically in Redis (decrement) or in the database logic; this is the truth for inventory.
- Orders & payments: stored in the relational database.

How I keep caches fresh enough
- Short lifetimes (TTLs): a few seconds for drop pages; tens of seconds for follower counts.
- Stale-while-revalidate: if a cached page expires under load, I serve the slightly old one and refresh it in the background so users don’t suffer a thundering herd.
- Event-driven invalidation: when important things happen, I publish tiny "refresh" messages:
  - OrderConfirmed → refresh that drop’s stock snapshot and related lists.
  - DropStarted/DropEnded → refresh the drop card and the "live now" list.
  - FollowChanged → refresh follower count.
- Periodic reconciliation: a calm background job compares Redis counters with the database and corrects any drift (rare, but it’s my safety net). 

### CDN & Media

- Edge cache: the CDN serves images and videos from locations near users.
- Versioned URLs: when I upload a new image, the filename/URL changes, so I never need to purge the whole edge cache.
- Signed URLs for private assets; the bucket stays private and only the CDN/backend can fetch originals. 

### Trade-offs & Reasoning (why this shape)

#### Architecture: modular monolith now, split later
- Why: one deployable app is simpler to build, test, and operate.
- Trade-off: I don’t get all the independence of microservices yet.
- Mitigation: I keep clean module boundaries (Orders, Drops, Followers, Notifications) so I can split services in the future without rewriting everything.

#### Data: relational + NoSQL (polyglot)
- Relational DB (SQL) for Orders, Drops, Payments, Users: I need transactions and constraints to avoid overselling and money mistakes.
- NoSQL for Followers & notification feeds: these are huge, fast-changing lists where perfect consistency is less important than speed and scale.
- Trade-off: two storage technologies to understand.
- Benefit: each problem uses the database that fits it best.

#### Inventory control: Redis atomic decrement vs DB locks
- Why Redis: it gives a lightning-fast, atomic "is there stock? then reserve one" decision during spikes.
- Trade-off: I must reconcile occasionally to ensure no drift.
- Benefit: smooth, low-latency checkouts without DB contention.

#### Event bus vs direct calls
- Why events: when an order is confirmed, many things should happen (notify user, refresh caches, update analytics). Publishing an event lets each of those happen independently.
- Trade-off: events are at least once, so consumers must handle duplicates.
- Benefit: decoupling, scalability, and the ability to replay history if I need to rebuild a cache or index.

#### Notifications: persistent vs ephemeral
- Ephemeral: "Drop is live!" → push/websocket only; fine if missed.
- Persistent: "Order confirmed" → I keep a history so the user can see it later.
- Trade-off: storing all notifications costs more; storing only important ones keeps things lean.

#### Media via CDN + Blob (not the app)
- Why: faster pages, lower origin load and cost, global delivery.
- Trade-off: I manage URLs, caching headers, and signed access.
- Benefit: my app stays focused on business logic, not file serving.

#### Load balancer behavior
- Fail-fast on overload (short surge buffers) instead of hiding the problem with deep queues.
- Trade-off: some requests get a quick 429/503 during extreme spikes.
- Benefit: the system stays responsive and self-heals; users can retry.

#### Security & payments
- I outsource PCI to a payment provider; I store only payment references.
- Trade-off: dependency on a third party.
- Benefit: huge reduction in risk and compliance burden. 

#### architecture diagram
https://excalidraw.com/#json=ehFgmMrgJYPkf06hkgSjN,7KFJCHCXhuJkF3EqIKnfKQ