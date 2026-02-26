# Breaks, type scale & min/max (copy-paste reference)

**Temp doc — extracted from tokens. Safe to delete. Does not affect tokens.json.**

---

## Breakpoints (container widths)

| Token   | Value   |
|---------|---------|
| xs      | 392px   |
| sm      | 640px   |
| md      | 768px   |
| lg      | 1024px  |
| xl      | 1440px  |

---

## Line length (reading width)

| Token | Value |
|-------|-------|
| sm     | 60ch   |
| md     | 72ch   |
| lg     | 80ch   |

---

## Text size scale (primitives)

| Token | Value    | ~px (16px root) |
|-------|----------|------------------|
| xxs   | 0.563rem | 9px              |
| xs    | 0.75rem  | 12px             |
| sm    | 1rem     | 16px             |
| md    | 1.333rem | 21px             |
| lg    | 1.777rem | 28px             |
| xl    | 2.369rem | 38px             |
| 2xl   | 3.157rem | 51px             |
| 3xl   | 4.209rem | 67px             |
| 4xl   | 5.61rem  | 90px             |

---

## Responsive font size — min / max (fluid type)

Use for clamp() or Webflow fluid type (min = mobile ~392px, max = desktop ~1440px).

| Scale | min       | max       |
|-------|-----------|-----------|
| xxs   | 0.688rem  | 0.563rem  |
| xs    | 0.688rem  | 0.75rem   |
| sm    | 1rem      | 1rem      |
| md    | 1rem      | 1.333rem  |
| lg    | 1.5rem    | 1.777rem  |
| xl    | 1.75rem   | 2.369rem  |
| 2xl   | 2rem      | 3.157rem  |
| 3xl   | 2.5rem    | 4.209rem  |
| 4xl   | 3rem      | 5.61rem   |

---

## Plain values only (no tables)

**Breakpoints:** 392px · 640px · 768px · 1024px · 1440px

**Type scale:** 0.563rem · 0.75rem · 1rem · 1.333rem · 1.777rem · 2.369rem · 3.157rem · 4.209rem · 5.61rem

**Font size min (mobile):** 0.688rem · 0.688rem · 1rem · 1rem · 1.5rem · 1.75rem · 2rem · 2.5rem · 3rem

**Font size max (desktop):** 0.563rem · 0.75rem · 1rem · 1.333rem · 1.777rem · 2.369rem · 3.157rem · 4.209rem · 5.61rem
