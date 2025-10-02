# ShopLite Knowledge Base



## Doc 01 — Account Registration
ShopLite accounts use an email or phone number and a password. New users must confirm with a one-time code (email or SMS) before purchases. Enable two-factor authentication (2FA) for stronger protection. If you forget your password, use the reset flow via your verified channel; support can’t change passwords. Locked accounts unlock after 30 minutes or via the unlock link. Delete your account from Account → Privacy; deletion is irreversible and removes personal data after legal retention periods. Requests to export your data are available from the same menu. Keep contact info up to date so we can verify identity when discussing orders or account changes.

## Doc 02 — Product Search & Filters
Search by keyword, brand, model, or SKU. Narrow with category filters and facets (price, rating, availability, color, size, shipping speed). The engine supports typo tolerance and synonyms; use quotes for exact phrases and minus to exclude terms (e.g., “watch -kids”). Sort by Relevance, Best-selling, Price, or New arrivals. Inventory status appears on results where available. Recently viewed items may show on the home page and in the app.

## Doc 03 — Cart & Checkout
Your cart persists across devices while signed in. Guest checkout works in many regions. Confirm shipping address, delivery speed, and payment method. Taxes and shipping fees are shown before placing the order. Promo codes apply in cart; stacking is off unless explicitly allowed. Split shipments display separate ETAs and tracking numbers. If an item goes out of stock during checkout, you’ll be prompted to remove it or save for later. Address changes are possible before the order status reaches Shipped. Pre-authorizations may appear on your card until the order is captured or canceled.

## Doc 04 — Payments
We accept major cards and selected digital wallets. Some cards require 3-D Secure (bank challenge); if 3-D Secure fails, the order isn’t processed. We store tokenized cards with a PCI-compliant provider; full card numbers are never kept. Refunds are issued to the original payment method within **5–10 business days** after inspection. If a payment fails, retry with the same or another method—your cart persists. Pre-authorization holds may appear and are released automatically if the order is canceled or expires. Multiple rapid declines can trigger additional verification.

## Doc 05 — Orders & Tracking
Statuses: Processing, Packed, Shipped, Out for delivery, Delivered, or Canceled. Tracking shows carrier, latest scan, and ETA. If an order is delayed by more than 3 business days beyond ETA, contact Support with your order ID. Address changes are possible only before Shipped; once shipped, carriers rarely redirect except in limited cases. High-value shipments may require a signature. Split shipments produce separate tracking numbers and may arrive on different dates. Undeliverable packages are usually returned and refunded after carrier confirmation.

## Doc 06 — Returns & Refunds
**30-day return window** from delivery. Items must be unused, in original packaging, with all accessories. Exclusions include perishables and final-sale items. Start from Your Orders to get an RMA and return label. Return shipping is free for defective or mis-shipped items; otherwise the label cost may be deducted. Refunds post within **5–10 business days** after inspection. Exchanges are processed as a return + new order. If a package is lost, we open a carrier claim and refund per policy once resolved.

## Doc 07 — Seller Policies
Sellers must list accurately, ship on time, and respond to messages within 2 business days. Performance metrics (cancellation rate, late shipments, satisfaction) affect privileges; repeated issues can lead to restricted features or suspension. Prohibited items include counterfeit, recalled, and restricted products. Listing violations or IP complaints can trigger takedowns. Fees may include referral, advertising, and optional fulfillment services.

## Doc 08 — Inventory & Availability
Statuses: In stock, Low stock, Out of stock, Preorder, Backorder. Backorders ship first-in-first-out as inventory arrives. “Notify me” alerts when an item restocks. Inventory feeds can lag briefly (up to ~15 minutes); this doesn’t affect placed orders. ETAs for preorders/backorders depend on supplier confirmations and may change. Low-stock badges reflect current DC availability and can change quickly during peak demand.

## Doc 09 — Reviews & Ratings
Reviews are allowed after a verified purchase. Offensive, deceptive, or privacy-violating content is prohibited. Incentives for positive reviews are not allowed. Filter by most recent, most helpful, or star rating; search review text by keyword. Images/videos are allowed subject to guidelines: no nudity/exploitation, no personal data of others, no copyrighted material without rights. We remove policy-violating content and may restrict accounts for repeated abuse.

## Doc 10 — Promotions & Coupons
Promotions include % discounts, fixed-amount coupons, free shipping, and buy-more-save-more. Stacking is off unless explicitly allowed in the promo terms. Promos have expiry dates and may exclude certain brands/categories. Refunds reflect the discounted amount actually paid; promotions aren’t refunded in cash. If a promotion budget is exhausted, it may end early even before the displayed date. Price adjustments aren’t guaranteed after a promotion ends.

## Doc 11 — Customer Support
Support channels: chat, email, phone. Live chat is usually fastest for order-specific issues. Provide your order ID and screenshots to speed resolution. We may ask to verify identity before discussing account details. Response times vary by region and volume; complex cases may require escalation. You can request callbacks when queues are long.

## Doc 12 — Mobile App
The app supports biometric sign-in and push notifications for order updates. Offline browsing of recently viewed items is available. Sensitive actions (like changing password or payout details) may require re-authentication. Permissions requested: notifications, camera (barcode scanning), and storage (caching). You can manage data and privacy settings from Account → Privacy.

## Doc 13 — API Overview
Developers authenticate with Bearer tokens over HTTPS. Rate limits apply; exceeding them returns HTTP 429 with Retry-After. Example endpoints: `/catalog/search?q=`, `/orders/{id}`, `/returns/{id}`. Webhooks can notify order status changes. Separate sandbox and production keys are required; never share tokens publicly.

## Doc 14 — Security & Privacy
We encrypt data in transit (TLS) and at rest for sensitive fields. Access to internal systems follows least-privilege and is logged. You can request data access or deletion from Account → Privacy; legal retention applies to order/tax records. We notify users of major security incidents per law and may require password resets after suspected compromise.

## Doc 15 — Shipping & Delivery
Shipping speeds include economy, standard, expedited, and same-day (select cities). International orders may incur customs duties, either prepaid at checkout or collected on delivery depending on destination. Signature may be required for high-value items. Undeliverable packages are usually returned and refunded minus shipping if the address was incorrect.

## Doc 16 — Fraud & Risk
We run automated and manual checks to protect buyers, sellers, and ShopLite from fraud. Orders may be placed on a temporary verification hold when signals such as mismatched billing/shipping, unusual purchase patterns, or repeated payment declines occur. During a hold, we do not ship or finalize charges. We may contact you to confirm identity or payment ownership (e.g., last four digits of card, recent transaction proof). If verification can’t be completed within a reasonable time, we cancel and release any authorization holds automatically. After successful verification, the order resumes normal processing and ships per the original delivery speed. To avoid holds: ensure billing matches your card issuer, use a single account for large purchases, and keep your phone/email reachable. We don’t disclose internal risk scores.

## Doc 17 — Accessibility
We aim to follow WCAG 2.1 AA where feasible. Keyboard navigation is supported on core flows (search, cart, checkout). Images include alt text; videos have captions when available. High-contrast mode and scalable fonts are supported in the mobile app. Report accessibility issues via Support; critical blockers are prioritized for fixes.

## Doc 18 — Legal & Compliance
Content and conduct must comply with applicable laws and our platform rules. **Acceptable Use:** prohibited items include illegal products, recalled goods, and items restricted by age or licensing. Listings and reviews must not include hate speech, threats, personal data of others, or deceptive claims. Age-restricted categories may require date-of-birth checks and adult-signature delivery. **UGC:** images/videos in reviews are allowed if they meet guidelines; we may remove UGC and enforce (warnings, takedowns, account restrictions) for violations. **Data & records:** certain order/tax records are retained for legal reasons even after account deletion; personal data not subject to retention is removed per policy. We respond to valid legal requests following due process; users can flag illegal or infringing content via Support.