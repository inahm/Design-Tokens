# Dark mode primitive mapping

Reference for mapping **semantic color tokens** from light to dark. The tables below describe how `color.semantic.light` (light mode) relates to `color.semantic.dark` (dark mode) values, which are exported to Figma as variables in a single `SemanticColors` collection with `light` and `dark` modes.

---

## Background

| Semantic           | Light primitive      | Dark primitive                    |
|--------------------|----------------------|-----------------------------------|
| background.canvas  | color.core.white     | color.core.ink or color.neutral.900 |
| background.subtle  | color.neutral.100    | color.neutral.800 or 900         |

---

## Surface

| Semantic          | Light primitive      | Dark primitive              |
|-------------------|----------------------|-----------------------------|
| surface.default   | color.core.white     | color.neutral.900 or 800     |
| surface.raised    | color.neutral.100    | color.neutral.800 or 700     |
| surface.inverse   | color.core.ink       | color.core.white            |

---

## Border

| Semantic          | Light primitive    | Dark primitive                 |
|-------------------|--------------------|--------------------------------|
| border.subtle     | color.neutral.200  | color.neutral.700             |
| border.default    | color.neutral.300  | color.neutral.600             |
| border.strong     | color.neutral.400  | color.neutral.500             |
| border.critical   | color.error.400    | color.error.500 (or keep 400)  |

---

## Text

| Semantic                         | Light primitive        | Dark primitive                    |
|----------------------------------|------------------------|-----------------------------------|
| text.primary                     | color.core.ink         | color.core.white or color.neutral.50 |
| text.secondary                   | color.neutral.600      | color.neutral.300 or 400          |
| text.muted                       | color.neutral.400      | color.neutral.500                 |
| text.disabled                    | color.neutral.400      | color.neutral.500                 |
| text.inverse                     | color.core.white       | color.core.ink                   |
| text.onAccent                    | color.core.white       | color.core.white (unchanged)     |
| text.critical                    | color.error.700        | color.error.400 (lighter on dark) |
| text.success                     | color.success.700      | color.success.400                |
| text.warning                     | color.warning.700      | color.warning.400                |
| text.link.accessible.default     | color.accessible.link  | same or slightly lighter        |
| text.link.accessible.hover      | color.accessible.linkHover | same or slightly lighter    |
| text.link.accessible.visited    | color.accessible.linkVisited | same or slightly lighter  |

---

## Icon

| Semantic       | Light primitive    | Dark primitive           |
|----------------|--------------------|--------------------------|
| icon.default   | color.neutral.600  | color.neutral.300 or 400 |
| icon.muted     | color.neutral.400  | color.neutral.500        |
| icon.inverse   | color.core.white   | color.core.ink          |
| icon.critical  | color.error.600    | color.error.400         |
| icon.success   | color.success.600  | color.success.400       |
| icon.warning   | color.warning.600   | color.warning.400       |

---

## Action – primary

| Semantic     | Light primitive    | Dark primitive              |
|--------------|--------------------|-----------------------------|
| background   | color.core.brand    | color.core.brand           |
| hover        | color.primary.700   | color.primary.600 or 500    |
| active       | color.primary.800   | color.primary.700           |
| text         | color.core.white   | color.core.white           |
| border       | color.core.brand   | color.core.brand           |

---

## Action – secondary

| Semantic   | Light primitive   | Dark primitive                 |
|------------|-------------------|--------------------------------|
| background | color.neutral.50  | color.neutral.700 or 800       |
| hover      | color.neutral.100 | color.neutral.600             |
| active     | color.neutral.200 | color.neutral.500             |
| text       | color.core.ink    | color.core.white or color.neutral.50 |
| border     | color.neutral.300 | color.neutral.600             |

---

## Action – danger

| Semantic   | Light primitive   | Dark primitive           |
|------------|-------------------|--------------------------|
| background | color.error.600   | color.error.500 or 600   |
| hover      | color.error.700   | color.error.600          |
| active     | color.error.800   | color.error.700          |
| text       | color.neutral.50 | color.core.white         |
| border     | color.error.600   | color.error.500 or 600   |

---

## Status (success / warning / error)

| Semantic   | Light primitive       | Dark primitive                          |
|------------|------------------------|-----------------------------------------|
| background | color.[status].50     | color.neutral.800 or status.900/950     |
| border     | color.[status].200    | color.[status].600 or 700               |
| text       | color.[status].700    | color.[status].400 or 300               |
| icon       | color.[status].600    | color.[status].400 or 300               |

*(Replace `[status]` with `success`, `warning`, or `error`.)*

---

## Figma export and verification

- **Theme Group → Variable Collection**: In Tokens Studio, the Theme Group `SemanticColors` exports as a Figma Variable collection also named `SemanticColors`.
- **Themes → Modes**: The Themes `light` and `dark` inside `SemanticColors` export as the `light` and `dark` modes in that collection.
- **Token sets**:
  - `color.semantic.light` is enabled for the `light` theme.
  - `color.semantic.dark` is enabled for the `dark` theme.
  - Shared primitives live in `foundations.color` and are enabled for both.

**To export and check the variables in Figma:**

1. Open the Tokens Studio plugin in your Figma file.
2. Go to **Export → Styles & Variables → Export Styles & Variables** (see the Tokens Studio docs for details: `https://docs.tokens.studio/figma/export/themes`).
3. In **Export Options**, choose to export **Variables** (Styles optional).
4. On the **Themes** step, select the Theme Group **SemanticColors** and include both Themes: **light** and **dark**.
5. Run **Export to Figma**.
6. In Figma, open the **Variables** panel:
   - Find the collection **SemanticColors**.
   - Confirm it has exactly two modes: **light** and **dark**.
   - Check that variables like `background.canvas`, `surface.default`, `text.primary`, etc. change correctly when you switch between the light and dark modes, following the mappings in the tables above.
