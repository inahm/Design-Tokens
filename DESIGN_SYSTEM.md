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
  - `foundations.scale.base.*` — canonical desktop baseline. **Primitive naming**: prefix + number; **use 0 only when the value is 0**. Spacing: `space-0`…`space-10` (space-0 = 0, then 0.25rem…8rem). Container/lineLength/media/iconSize have no zero value, so they start at 1: `container-1`…`container-6`, `lineLength-1`…`lineLength-3`, `media-1`…`media-3`, `iconSize-1`…`iconSize-4`. Viewport sets use t-shirt/semantic names and reference these primitives.
  - `foundations.scale.web.desktop.*` — **aliased to base** via references; uses t-shirt names (xs, sm, md, …) and points at base (e.g. `spacing.xs` → `{foundations.scale.base.spacing.space-1}`).
  - `foundations.scale.web.mobile.*` / `.web.tablet.*` — web layout scales for small / medium viewports, derived from the base scale (spacing ~0.75× base on mobile, ~midpoint on tablet).
  - `foundations.scale.ios.mobile.*` / `.ios.tablet.*` — iOS-specific layout scales for iPhone / iPad (containers, line lengths, media sizes, spacing, icon sizes). Use these when designing **native** iOS layouts so you can tune spacing separately from web while keeping the same semantic naming.

### Scale foundations (layout + spacing)

- **Base primitive nomenclature** — Prefix + number; **0 only when value is 0**. Spacing: `space-0`…`space-10` (space-0 = 0). Container/lineLength/media/iconSize start at 1: `container-1`…`container-6`, `lineLength-1`…`lineLength-3`, `media-1`…`media-3`, `iconSize-1`…`iconSize-4`. Viewport sets use t-shirt/semantic names and reference base.
- **Mapping** — Build script maps base → Tailwind/CSS: spacing space-0→0, space-1…space-10→xs…5xl; container-1…container-6 → xs, sm, md, lg, xl, fullSpan; lineLength-1…3 → sm, md, lg; media-1…3 → thumbnail, card, hero; iconSize-1…4 → sm, md, lg, xl.
- **Web desktop** — `foundations.scale.web.desktop` is reference-only; every value points at base via **short refs** (e.g. `{spacing.space-1}`, `{layout.container.container-1}`, `{media.media-1}`, `{iconSize.iconSize-1}`) so Tokens Studio can accept them. Resolve via `foundations.scale.base.` prefix. Exports and Tailwind read base and output t-shirt names.
- **Web mobile / tablet** — Spacing is scaled down from base (mobile ~0.75×, tablet between mobile and base). Layout (containers, line length, media, icon size) is tuned per viewport; spacing ladder keeps the same keys so semantics stay consistent.
- **iOS scales** — Same structure as web (layout, media, iconSize, spacing), with values tuned for native. Spacing is also monotonic per scale.
- **typography (canonical)** — `typography.foundations` (font families, weights), `typography.scale.base` (type scale in rem), and `typography.scale.fluid` (min/max for clamp). Base uses the same **prefix + number** convention: `fontSize.type-1`…`type-9` (no type-0; no zero size). Build script maps type-1…type-9 → xxs…4xl for Tailwind; snapshots use t-shirt names and ref or derive from base. Web semantics under `web.typography.*`; generic names (heading-1, body, caption) are adapter-only.

### Typography snapshots, fluid scale, and canonical

- **Canonical type scale** — `typography.scale.base.fontSize` uses **type-1…type-9** (0.563rem … 5.61rem). Same rule as other scales: **0 only when value is 0**; type sizes start at 1.
- **Typography scale web desktop** — `typography.scale.web.desktop` holds **t-shirt names** (xxs, xs, sm, …) as **refs** to base `type-1`…`type-9`, same pattern as `foundations.scale.web.desktop`. Use in Figma for desktop type scale; values resolve from base so they can’t drift.
- **Figma rendering snapshots** — Where applicable, snapshots **map back to the numeric primitive scale** (type-1…type-9). `typography.snapshot.web.desktop` uses refs like `{fontSize.type-1}`…`{fontSize.type-9}` (xxs→type-1 … 4xl→type-9) so the chain stays single-source. Tablet/mobile snapshots keep **computed** values (~0.9×, ~0.8× base) since they don’t match a single primitive. iOS snapshots are left untouched. Edit only the base scale; re-run the build to sync.

**Fluid scale for code (`clamp()`)**

- `typography.scale.fluid.fontSize.*` (t-shirt keys): **max** maps back to the primitive scale (`{fontSize.type-1}`…`{fontSize.type-9}`); **min** stays computed (mobile-scale rem). Build script writes min from base and writes max as refs so fluid stays single-source.
- Code can map to `clamp(minRem, preferred, maxRem)` using `foundations.breakpoints`.

**Rules (flow of truth):**

- Canonical tokens flow **one-way → snapshots → fluid** (for min/max ranges).
- Never design against canonical tokens in Figma; use the appropriate `typography.snapshot.*` set for the frame’s platform + viewport.
- Never ship snapshot tokens to production code; exports and adapters should read from `typography.scale.base` / `typography.scale.fluid` and `web.typography.*` / `ios.typography.*` instead.
- If values drift, update canonical first, then regenerate snapshots + fluid scale via `build-tailwind-tokens.js`.

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

- **color semantics** — `color.semantic.light.*` / `color.semantic.dark.*` (background, surface, text, border, etc.), including `color.semantic.[light|dark].border.listSeparator` for list/table row dividers. Use in Figma for separator strokes. Border color lives only in color semantics; `semantics.web` has border focus ring only, not border color.
- **ios** — **Separate token set** (Token Studio: turn on for iOS, off for web). `ios.interactive.minimumTouchTarget` (44pt), `ios.inset.safeArea.top/bottom/left/right` (pt). Use in Figma for iOS frames; disable the **ios** set when designing web-only.
- **typography.snapshot.ios.phone / .ios.tablet** — **Separate token sets** (Token Studio: enable with **ios** for iPhone/iPad). `fontSize.*` in pt (11–40). See [IOS_TYPESTYLES.md](IOS_TYPESTYLES.md).
- **$themes** — Figma-oriented mapping of token sets to modes/collections.

Adding a new adapter: read this structure (and resolve references `{path.to.token}`), then write the target format. Prefer reusing the resolution logic in `build-tailwind-tokens.js` if the new format needs the same behavior.
