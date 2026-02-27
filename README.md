## Design Tokens

This repo’s `tokens.json` defines a **responsive, theme‑able design system** used in Figma (via Tokens Studio) and in code.

### Token architecture

- **Foundations**
  - **`foundations`**: raw primitives – color ramps, radius, border width, shadows, z‑index, typography foundations (font families, weights, line heights, letter spacing, text case, decoration).
  - **`foundations.scale.base`**: desktop layout scale – container widths, line length, icon sizes, media sizes, and spacing in `rem`.
  - **`foundations.scale.mobile` / `foundations.scale.tablet`**: responsive layout/spacing scales for mobile and tablet.
- **Typography scales**
  - **`typography.foundations`**: font families and weights shared across breakpoints.
  - **`typography.scale.base`**: canonical desktop type scale (`xxs–4xl` in `rem`).
  - **`typography.scale.mobile` / `typography.scale.tablet`**: breakpoint‑specific type scales that shrink on smaller viewports.
  - **`typography.scale.fluid`**: min/max `rem` for each size step to drive `clamp()` in code.
- **Semantics**
  - **`semantics.typography.*`**: roles like `heading.page`, `body.long`, `label.button`, composed from foundations + scales.
  - **`semantics.layout.*`**: layout roles for gap, padding, margin, and responsive containers (see below).
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

### Responsive containers

- **Semantic container roles**
  - **`semantics.layout.container.page`**: primary page container.
  - **`semantics.layout.container.section`**: section‑level content container.
  - **`semantics.layout.container.narrow`**: narrow content column.
  - **`semantics.layout.container.fullSpan`**: full‑bleed container across the available viewport.
- **Desktop / tablet mappings**
  - `page` → `{layout.container.xl}` (1440px in the base scale).
  - `section` → `{layout.container.lg}` (1024px).
  - `narrow` → `{layout.container.sm}` (640px).
  - `fullSpan` → `100%`.
- **Mobile behavior**
  - Mobile uses `foundations.scale.mobile.layout.container` for the underlying widths, but the mental model is: **if the requested width is wider than the viewport, it behaves as a full‑span container inside the mobile canvas**.
  - Practically, a layout using `container.page` (desktop 1440px) on a small screen will render as a **single full‑span column**.
- **Recommended code pattern (using fluid container min/max)**

  ```css
  :root {
    /* These would be wired from tokens at build time */
    --layout-container-min: 392px;  /* {layout.container.xs} */
    --layout-container-max: 1440px; /* {layout.container.xl} */
  }

  .container-page {
    max-width: clamp(
      var(--layout-container-min),
      100vw,
      var(--layout-container-max)
    );
    margin-inline: auto;
    padding-inline: var(--semantics-layout-padding-page, 3rem);
  }

  .container-section {
    max-width: min(100vw, 1024px); /* {layout.container.lg} */
    margin-inline: auto;
  }

  .container-fullSpan {
    width: 100vw;
    margin-inline: calc(50% - 50vw); /* true full‑bleed when needed */
  }
  ```

  - On desktop, this caps the page container between your `xs` and `xl` layout widths.
  - On mobile, because `100vw` is smaller than `--layout-container-max`, the same tokenized `container-page` effectively collapses to the full mobile width.

### How to work with this system

- **In Figma / Tokens Studio**
  - Enable the relevant token sets for the theme: foundations → `foundations.scale.*` → `typography.*` → semantics → color semantics.
  - Apply **semantic tokens** (typography + color) to components; avoid hard‑wiring primitives in UI.
- **In code**
  - Treat `foundations` and `*.scale.*` as the **source of truth** for scale values.
  - Use the min/max pairs from fluid tokens to generate responsive `clamp()` for type and spacing.
  - Map semantic tokens (typography + color) to component props so themes and future rebrands flow automatically.

