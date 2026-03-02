# Agentic design system — one source, many outputs

This repo is built so **one canonical design system** can drive many frameworks and tools. AI agents and humans can extend it without changing the source.

## Principles

1. **Single source of truth** — [tokens.json](tokens.json) is the only canonical definition. All colors, typography, spacing, radius, shadows, and semantics live there. Tools and code consume **exports**, not the raw JSON (except for tooling that reads it directly).

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

- **foundations** — Primitives: `foundations.color.*`, `foundations.radius.*`, `foundations.shadow.*`, `foundations.breakpoints.*`, etc. Raw values and scales (e.g. `foundations.scale.base.spacing.*`).
- **typography** — `typography.foundations` (font families, weights), `typography.scale.base` / `.mobile` / `.tablet` (sizes in rem), `typography.scale.fluid` (min/max for clamp). Semantics under `semantics.typography.*`: role-based names only (e.g. `heading.page`, `body.long`, `label.button`, `meta.caption`). Generic names (heading-1, body, caption) are **not** stored in the token source to avoid bloat and broken refs in token UIs; the mapping below is for adapters to use at export time.

**Generic typography mapping (for adapters only)** — Use when a tool expects “Heading 1” / “Body” / “Caption”:

| Generic name  | Map from (canonical semantic) |
|---------------|--------------------------------|
| Heading 1     | `semantics.typography.heading.page` |
| Heading 2     | `semantics.typography.heading.section` |
| Heading 3     | `semantics.typography.heading.subsection` |
| Body          | `semantics.typography.body.long` |
| Body bold     | `semantics.typography.label.button` |
| Caption       | `semantics.typography.meta.caption` |
| Caption bold  | `semantics.typography.meta.helper` |

- **color semantics** — `color.semantic.light.*` / `color.semantic.dark.*` (background, surface, text, border, etc.).
- **semantics.border.listSeparator** — Color for list/table row dividers. Use in Figma for separator strokes.
- **ios** — **Separate token set** (Token Studio: turn on for iOS, off for web). `ios.interactive.minimumTouchTarget` (44pt), `ios.inset.safeArea.top/bottom/left/right` (pt). Use in Figma for iOS frames; disable the **ios** set when designing web-only.
- **$themes** — Figma-oriented mapping of token sets to modes/collections.

Adding a new adapter: read this structure (and resolve references `{path.to.token}`), then write the target format. Prefer reusing the resolution logic in `build-tailwind-tokens.js` if the new format needs the same behavior.
