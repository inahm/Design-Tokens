## Design Tokens

This repo’s `tokens.json` defines a **responsive, theme‑able design system** used in Figma (via Tokens Studio) and in code. It is built as an **agentic, multi-framework** system: one source of truth, many exported formats. See [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) for architecture and how to add new adapters (e.g. another framework or tool).

### Token architecture

- **Foundations**
  - **`foundations`**: raw primitives – color ramps, radius, border width, shadows, z‑index, breakpoints, duration, easing, opacity, typography foundations (font families, weights, line heights, letter spacing, text case, decoration).
  - **`foundations.scale.web.base`**: desktop layout scale – container widths, line length, icon sizes, media sizes, and spacing in `rem` for web / large viewports.
  - **`foundations.scale.web.mobile` / `foundations.scale.web.tablet`**: responsive web layout/spacing scales for mobile and tablet.
- **Typography scales**
  - **`typography.foundations`**: font families and weights shared across breakpoints.
  - **`typography.scale.base`**: canonical desktop type scale (`xxs–4xl` in `rem`).
  - **`typography.scale.mobile` / `typography.scale.tablet`**: breakpoint‑specific type scales that shrink on smaller viewports.
  - **`typography.scale.fluid`**: min/max `rem` for each size step to drive `clamp()` in code.
- **Web semantics**
  - **`semantics.typography.*`**: roles like `heading.page`, `body.long`, `label.button`, composed from foundations + scales. For tools that expect generic names (e.g. Subframe’s “Heading 1”, “Body”, “Caption”), the mapping is documented in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)—adapters map at export time; no duplicate aliases in the token source.
  - **`color.semantic.light` / `color.semantic.dark`**: light/dark roles for background, surface, border, text, icons, actions, and status.
- **Themes**
  - `$themes` map token sets to Figma variable collections/modes (e.g. light/dark colors, desktop/mobile/tablet type scales).

### Responsive scale logic (REM)

- All sizes use `rem` so they respect user zoom (`1rem` assumed as `16px`).
- **Desktop (base)**: uses the **max** value for each step (typography and spacing).
- **Mobile**:
  - Typographic sizes use tuned **smaller “min” values** per step instead of one flat percentage.
  - Spacing for `md–4xl` is roughly **75% of desktop** (e.g. `1rem → 0.75rem`, `6rem → 4.5rem`).
- **Tablet**: always the **midpoint in `rem`** between mobile and desktop for that step:
  - \( tablet = (mobile + desktop) / 2 \)
- **Fluid tokens** (`typography.scale.fluid` and the fluid spacing reference) expose these **min/max** pairs so code can use `clamp(minRem, preferred, maxRem)`.

### How to work with this system

- **In Figma / Tokens Studio**
  - Enable the relevant token sets for the theme: foundations → `foundations.scale.*` → `typography.*` → semantics → color semantics.
  - Apply **semantic tokens** (typography + color) to components; avoid hard‑wiring primitives in UI.
- **In Subframe**
  - Use [SUBFRAME.md](SUBFRAME.md) to import color tokens from `subframe-colors.css` into a Subframe theme, build UI there, and sync to your app (optionally with [tailwind.tokens.js](tailwind.tokens.js) or [tokens.css](tokens.css)).
- **In code**
  - Treat `foundations` and `*.scale.*` as the **source of truth** for scale values.
  - Use the min/max pairs from fluid tokens to generate responsive `clamp()` for type and spacing.
  - Map semantic tokens (typography + color) to component props so themes and future rebrands flow automatically.
  - **Breakpoints and scale mapping:** `foundations.breakpoints` (xs/sm/md/lg/xl) define media-query widths; `$metadata.scaleByBreakpoint` describes which scale (mobile / tablet / base) applies at which breakpoint.
  - **Icon size:** `semantics.icon.size.*` resolves to `iconSize` from the **base** scale (see `$metadata.iconSizeResolution`).

