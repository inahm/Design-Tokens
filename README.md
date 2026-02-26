## Design Tokens

This repo defines design tokens in a single `tokens.json` file, split into **Primitives** (raw values) and **Semantics** (role-based aliases).

### Primitives

- **Core colors (fixed “identity” colors)**
  - **`color.core.white`**: canonical UI white (`#FFFFFF`), used for canvas and surfaces.
  - **`color.core.ink`**: canonical dark text/surface color (`#0F172A`), used for primary text and inverse surfaces.
  - **`color.core.brand`**: canonical brand color (`#7C3AED`), used for primary actions and key brand moments.
- **Color scales**
  - **`color.neutral.0–950`**: neutral ramp, including **`neutral.0` = `#FFFFFF`** for pure white.
  - **`color.primary.50–950`**: brand purple ramp (used for hover/active, accent backgrounds, etc.).
  - **`color.success` / `color.warning` / `color.error`**: status ramps.
- **Accessible colors**
  - **`color.accessible.link`**: base blue link color.
  - **`color.accessible.linkHover`** / **`linkVisited`**: hover and visited link blues.
  - **`color.accessible.focusRing`**: blue focus outline color.

**Guidance:**
- Use **core colors** when you mean “the” main white/dark/brand.
- Use **scales** (`neutral.*`, `primary.*`, etc.) when you need a specific step in a ramp (borders, subtle backgrounds, hover states, etc.).

### Semantics

Semantic tokens live under `Semantics` and describe **usage**, not specific hex values.

- **Background**
  - **`Semantics.color.background.canvas`** → `{color.core.white}`
  - **`Semantics.color.background.subtle`** → `{color.neutral.100}`
- **Surface**
  - **`Semantics.color.surface.default`** → `{color.core.white}`
  - **`Semantics.color.surface.raised`** → `{color.neutral.100}`
  - **`Semantics.color.surface.inverse`** → `{color.core.ink}`
- **Border**
  - **`Semantics.color.border.subtle/default/strong`** → neutral scale steps.
  - **`Semantics.color.border.critical`** → error scale.
- **Text**
  - **`Semantics.color.text.primary`** → `{color.core.ink}`
  - **`Semantics.color.text.inverse`** / **`onAccent`** → `{color.core.white}`
  - **`Semantics.color.text.secondary/muted/disabled`** → neutral scale steps.
  - **`Semantics.color.text.link.accessible.*`** → `color.accessible.*` (blue link colors, independent of brand purple).
- **Icon**
  - Icons mostly mirror text roles (`default`, `muted`, `inverse`, status).
- **Action**
  - **`Semantics.color.action.primary.background` / `border`** → `{color.core.brand}`
  - **`Semantics.color.action.primary.text`** → `{color.core.white}`
  - **`Semantics.color.action.secondary.*`** → neutral scale for outline/ghost styles.
  - **`Semantics.color.action.danger.*`** → error scale.
- **Status**
  - **`Semantics.color.status.success/warning/error.*`** → their respective ramps for banners/toasts.
- **Focus**
  - **`Semantics.border.focus.ring.accessible`** uses `{color.accessible.focusRing}` so focus stays consistently blue.

### Responsive (token set)

A separate set **`Responsive`** holds viewport-based typography ranges so **Primitives** stays the single canonical scale and **Semantics** stays role-based.

- **`Responsive.fontSize.*`** — for each scale step (`xxs` … `4xl`), **`min`** (mobile, ~392px) and **`max`** (desktop, ~1440px). Use with `clamp(min, preferred, max)` or Webflow fluid type.
- **`Responsive.scale.*`** — for each spacing step (`xs` … `4xl`), **`min`** (tighter on mobile) and **`max`** (desktop, references **`Primitives.scale.*`**). Use with `clamp()` or responsive spacing in Webflow so layout breathes more on large viewports.
- **`Responsive.layout.container`** — **`min`** (→ `layout.container.xs`, 392px), **`max`** (→ `layout.container.xl`, 1440px). For fluid max-width: `clamp(min, 100%, max)`.
- **`Responsive.layout.lineLength`** — **`min`** (→ `layout.lineLength.sm`, 60ch), **`max`** (→ `layout.lineLength.lg`, 80ch). For fluid reading width.
- **`max`** (and layout min/max) reference **Primitives** so one source of truth.
- Set order: **Primitives** → **Responsive** → **Semantics**.

Examples: body long → `Responsive.fontSize.md.min` / `.max`. Section padding → `Responsive.scale.xl.min` / `.max`. Page container → `Responsive.layout.container.min` / `.max`.

### Working with tokens

- When adding new components:
  - Prefer **semantic tokens** first (e.g. `Semantics.color.text.secondary`, `Semantics.color.action.primary.background`).
  - If a semantic does not exist yet, define it in `Semantics` and point it at **core** or a **scale** value.
- When updating brand:
  - Change **`color.core.brand`** to update primary actions and major brand moments.
  - Adjust **`color.primary.*`** if you want a new purple ramp for hovers, tints, etc.
- When updating neutrals:
  - Use **`neutral.0`** for pure white, and **`color.core.white`** for the canonical UI white.
  - Adjust neutral scale steps for borders/surfaces without changing `core.ink` unless you want to shift the main text color.

