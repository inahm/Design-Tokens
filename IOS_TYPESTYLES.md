# iOS typography scale (Figma + SwiftUI)

Use **typography.scale.ios** in Token Studio when designing for iOS so type sizes in Figma match what ships in the app (pt-based, aligned to Dynamic Type defaults).

---

## When to use

- **Figma:** Enable the **typography.scale.ios** set (and **ios** set for touch/safe area) when designing iOS frames. Your semantic styles (heading.page, body.long, etc.) will resolve to the pt values below. Disable both when designing web.
- **SwiftUI:** Use these sizes when implementing type from the design system (or map semantics to Dynamic Type; see DESIGN_SYSTEM.md).

---

## Scale (typography.scale.ios)

| Token       | Value (pt) | Use / Dynamic Type |
|------------|------------|---------------------|
| fontSize.xxs | 11 | Caption 2 |
| fontSize.xs  | 12 | Caption 1 |
| fontSize.sm  | 16 | Callout / Subhead |
| fontSize.md  | 17 | Body |
| fontSize.lg  | 20 | Title 3 |
| fontSize.xl  | 22 | Title 2 |
| fontSize.2xl | 24 | Title 2 large |
| fontSize.3xl | 28 | Title 1 |
| fontSize.4xl | 34 | Large Title |

Semantics unchanged: `heading.page` → 3xl (28pt), `body.long` → md (17pt), `meta.caption` → xs (12pt), etc. Font family and weight still come from **typography.foundations** (Inter, DM Sans).
