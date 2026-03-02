# Agentic design system — one source, many outputs

This repo is built so **one canonical design system** can drive many frameworks and tools. AI agents and humans can extend it without changing the source.

## Principles

1. **Single source of truth** — [tokens.json](tokens.json) is the only canonical definition. All colors, typography, spacing, radius, shadows, and semantics (per platform) live there. Tools and code consume **exports**, not the raw JSON (except for tooling that reads it directly).

2. **Semantic names stay at source** — We keep names like `heading.page`, `body.long`, `label.button`, `color.semantic.light.background`. Each **adapter** (Figma, Subframe, Tailwind, etc.) maps these to whatever that tool expects (e.g. Subframe’s Heading 1, or Tailwind’s `text-heading-page`). We don’t rename semantics to match one tool.

3. **Export, don’t duplicate** — Frameworks get their format from scripts in [scripts/](scripts/). Adding a new framework = adding a new export script that reads `tokens.json` and writes that format. No second source of truth.

4. **Agent-friendly** — Structure is documented (see [README](README.md) and this file). Agents can: read `tokens.json`, run `node scripts/build-tailwind-tokens.js` (or another script), and know where outputs go. To support a new tool, add a script and document it here.

## Current outputs (adapters)

| Output | Purpose | Script |
|--------|---------|--------|
| [tokens.css](tokens.css) | CSS custom properties for any web stack | `build-tailwind-tokens.js` |
| [tailwind.tokens.js](tailwind.tokens.js) | Tailwind v3 theme extension (colors, spacing, typography, radius, shadows, etc.) | `build-tailwind-tokens.js` |
| [subframe-colors.css](subframe-colors.css) | Subframe Theme → Import (color palettes + individual tokens) | `export-subframe-colors.js` (runs via build script) |

Figma uses Tokens Studio with token sets that align with `tokens.json` (sync or manual). Subframe theme can also be updated via MCP `edit_theme` with a description derived from these tokens.

## Token structure (for agents)

- **foundations** — Primitives: `foundations.color.*`, `foundations.radius.*`, `foundations.shadow.*`, `foundations.breakpoints.*`, etc. Raw values and layout/spacing scales:
  - `foundations.scale.base.*` — canonical desktop / large viewport baseline (containers, line lengths, media sizes, spacing, icon sizes).
  - `foundations.scale.web.mobile.*` / `.web.tablet.*` — web layout scales for small / medium viewports, derived from the base scale.
  - `foundations.scale.ios.mobile.*` / `.ios.tablet.*` — iOS-specific layout scales for iPhone / iPad (containers, line lengths, media sizes, spacing, icon sizes). Use these when designing **native** iOS layouts so you can tune spacing separately from web while keeping the same semantic naming.
- **typography (canonical)** — `typography.foundations` (font families, weights), `typography.scale.base` (sizes in rem for desktop reference), and `typography.scale.fluid` (min/max for clamp). Enable with **ios** set in Token Studio for pixel-perfect Figma; use `.ios` for iPhone frames, `.ios.tablet` for iPad. Web semantics under `web.typography.*`: role-based names only (e.g. `heading.page`, `body.long`, `label.button`, `meta.caption`). Generic names (heading-1, body, caption) are **not** stored in the token source to avoid bloat and broken refs in token UIs; the mapping below is for adapters to use at export time.

### Typography snapshots vs canonical

- **Canonical scale** — `typography.scale.base` (desktop reference) and `typography.scale.fluid`:
  - Define the **true type system**: hierarchy, ratios, and intended emphasis for code and Swift/SwiftUI.
- **Figma rendering snapshots** — `typography.snapshot.*`:
  - Web snapshots:
    - `typography.snapshot.web.mobile`
    - `typography.snapshot.web.tablet`
    - `typography.snapshot.web.desktop` (numerically 1:1 with canonical desktop)
  - iOS snapshots:
    - `typography.snapshot.ios.phone` (iPhone, pt)
    - `typography.snapshot.ios.tablet` (iPad, pt)
  - Exist **only** so Figma layouts render pixel-accurate values (Figma can’t render `clamp()`).
  - Are **derived from canonical scale** and must never be edited directly; treat them as evaluated outputs at specific contexts.

**Rules:**

- Canonical tokens flow **one-way → snapshots**.
- Never design against canonical tokens in Figma; use the appropriate `typography.snapshot.*` set for the frame’s platform + viewport.
- Never ship snapshot tokens to production code; exports and adapters should read from `typography.scale.base` / `typography.scale.fluid` and `web.typography.*` / `ios.typography.*` instead.
- If values drift, update canonical first, then regenerate or re-alias the snapshots.

**Generic typography mapping (for adapters only)** — Use when a tool expects “Heading 1” / “Body” / “Caption”:

| Generic name  | Map from (canonical semantic) |
|---------------|--------------------------------|
| Heading 1     | `web.typography.heading.page` |
| Heading 2     | `web.typography.heading.section` |
| Heading 3     | `web.typography.heading.subsection` |
| Body          | `web.typography.body.long` |
| Body bold     | `web.typography.label.button` |
| Caption       | `web.typography.meta.caption` |
| Caption bold  | `web.typography.meta.helper` |

- **color semantics** — `color.semantic.light.*` / `color.semantic.dark.*` (background, surface, text, border, etc.), including `color.semantic.[light|dark].border.listSeparator` for list/table row dividers. Use in Figma for separator strokes (and optionally via `web.border.listSeparator` alias on web).
- **ios** — **Separate token set** (Token Studio: turn on for iOS, off for web). `ios.interactive.minimumTouchTarget` (44pt), `ios.inset.safeArea.top/bottom/left/right` (pt). Use in Figma for iOS frames; disable the **ios** set when designing web-only.
- **typography.snapshot.ios.phone / .ios.tablet** — **Separate token sets** (Token Studio: enable with **ios** for iPhone/iPad). `fontSize.*` in pt (11–40). See [IOS_TYPESTYLES.md](IOS_TYPESTYLES.md).
- **$themes** — Figma-oriented mapping of token sets to modes/collections.

Adding a new adapter: read this structure (and resolve references `{path.to.token}`), then write the target format. Prefer reusing the resolution logic in `build-tailwind-tokens.js` if the new format needs the same behavior.
