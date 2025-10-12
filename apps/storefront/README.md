# Storefront v1 — Week 4: Frontend at Lightspeed

Minimal, fast UI that completes: **Catalog → Product → Cart → Checkout (stub) → Order status** + an **Ask Support** slide-over constrained to `assistant/ground-truth.json` and `getOrderStatus()`.

## Quickstart

```bash
pnpm install
pnpm dev
```

## Build & Test

```bash
pnpm build
pnpm test
pnpm storybook
```

### Tech
- Vite + React + TypeScript
- Tailwind (utility-first)
- Zustand (cart store) with localStorage persistence
- Vitest + Testing Library
- Storybook for atoms/molecules/organisms

### Performance
- Lean deps, route-based code-splitting, lazy images
- Target cold load ≤ 200KB gzipped (ex images)
- Dev p95 route transitions < 250ms

### Env (optional model call)
Create `.env` (or see `.env.example`):
```
VITE_OPENAI_MODEL=gpt-4o-mini
OPENAI_API_KEY=
```

> If `OPENAI_API_KEY` is unset, the Support engine falls back to local keyword matching only.

### Accessibility
- Keyboard navigation for cart drawer and support panel
- Focus trapping in modals
- ARIA labels on form controls

### NPM Scripts
- `pnpm dev` — run dev server
- `pnpm build` — production build
- `pnpm test` — unit tests
- `pnpm storybook` — component docs

