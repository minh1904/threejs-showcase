# Vendored: Toolcraft UI

`ui/` is vendored source copied from **[pixel-point/toolcraft](https://github.com/pixel-point/toolcraft)** (MIT).

| | |
|---|---|
| Upstream path | `starter/src/toolcraft/ui` |
| Commit | `01cf1f7256a19aa1498466137eb6c93db8384501` (2026-09-10) |
| License | MIT — see upstream `LICENSE.md` |

Toolcraft ships as a CLI scaffold (`npx @pixel-point/toolcraft create`) that generates a
standalone **Vite + TanStack Router** app. It is not published as an installable component
library, so there is no `npm update` path — this directory is a manual copy and upgrades mean
re-diffing against upstream.

The `ui/` folder was chosen because it is fully self-contained: zero imports outside itself,
no Vite-specific code, and only React + `@base-ui/react` + `cva`/`clsx`/`tailwind-merge` +
`@phosphor-icons/react` + `@dnd-kit/*` + `cmdk` + `sonner` + `react-resizable-panels`.

## Local divergences from upstream

Keep this list current — it is what makes a future re-diff tractable.

1. **`components/controls/font-picker/` deleted.** Not needed for a Three.js curriculum, and
   its `font-catalog.json` was 416 KB. The re-exports were removed from
   `components/controls/index.ts`.

2. **`components/primitives/button-variants.ts` added.** The `buttonVariants` cva was moved
   out of `button.tsx` (which is `"use client"`) into this plain module so React Server
   Components can call it — e.g. to style a `next/link` as a button. `button.tsx` now imports
   it. Without this split, Next's build fails with *"Attempted to call buttonVariants() from
   the server but buttonVariants is on the client."*

## Notes for Next.js

- Import components from `@/toolcraft/ui` (client) or, for RSC-safe class helpers,
  `@/toolcraft/ui/components/primitives/button-variants`.
- `styles.css` is imported by `src/app/globals.css` via a **relative** path — the `@/` TS alias
  does not resolve inside CSS `@import`.
- The runtime kernel (`starter/src/toolcraft/runtime`) was **not** vendored. Controls accept an
  optional `ControlChangeMeta` history argument that goes nowhere without it; they still work
  as ordinary controlled components.
- `src/toolcraft/**` is excluded from ESLint (see `eslint.config.mjs`) — upstream does not
  satisfy the React Compiler rules that `eslint-config-next` enables.
