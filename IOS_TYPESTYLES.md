# iOS typography scale (Figma + SwiftUI)

Use **typography.scale.ios** (iPhone) or **typography.scale.ios.tablet** (iPad) in Token Studio when designing for iOS so type sizes in Figma match what ships in the app (pt-based). Same pattern as web: one scale per context.

---

## When to use

- **Figma:** Enable **ios** (touch/safe area) plus:
  - **typography.scale.ios** for **iPhone** frames.
  - **typography.scale.ios.tablet** for **iPad** frames (enable instead of or after `.ios`; later set wins so tablet overrides iPhone when both are on).
- **SwiftUI:** Use the scale that matches the device/size class when implementing type.

---

## iPhone (typography.scale.ios)

| Token       | Value (pt) |
|------------|------------|
| fontSize.xxs | 11 |
| fontSize.xs  | 12 |
| fontSize.sm  | 16 |
| fontSize.md  | 17 |
| fontSize.lg  | 20 |
| fontSize.xl  | 22 |
| fontSize.2xl | 24 |
| fontSize.3xl | 28 |
| fontSize.4xl | 34 |

---

## iPad (typography.scale.ios.tablet)

| Token       | Value (pt) |
|------------|------------|
| fontSize.xxs | 12 |
| fontSize.xs  | 13 |
| fontSize.sm  | 17 |
| fontSize.md  | 19 |
| fontSize.lg  | 22 |
| fontSize.xl  | 25 |
| fontSize.2xl | 28 |
| fontSize.3xl | 32 |
| fontSize.4xl | 40 |

Semantics unchanged: same token names (e.g. `heading.page` → 3xl, `body.long` → md); only the resolved pt value changes by scale. Font family and weight from **typography.foundations** (Inter, DM Sans).
