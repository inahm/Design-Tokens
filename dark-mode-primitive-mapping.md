# Dark mode primitive mapping

Reference for manually mapping **SemanticsColor.light** semantics to dark-mode primitives in Figma variables. Same semantic roles, suggested dark primitives (adjust to taste).

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

In Figma: create a **Dark** variable collection and map each semantic name above to the dark primitive in the right column.
