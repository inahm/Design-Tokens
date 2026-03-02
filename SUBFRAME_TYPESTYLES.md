# Typography spec for Subframe

Use these values in **Subframe → Theme → Typography**. Edit each text style to match your tokens (1rem = 16px).

---

## Map to Subframe’s default styles

| Subframe style | Your token | Font family | Weight | Size (px) | Line height (px) | Letter spacing |
|----------------|------------|-------------|--------|-----------|------------------|----------------|
| **Heading 1** | heading.page | DM Sans | 500 | 67 | 101 | 0% |
| **Heading 2** | heading.section | DM Sans | 500 | 51 | 77 | 0% |
| **Heading 3** | heading.subsection | Inter | 600 | 28 | 42 | 0% |
| **Body** | body.long | Inter | 400 | 21 | 36 | 0% |
| **Body Bold** | label.button | Inter | 600 | 16 | 19 | 0% |
| **Caption** | meta.caption | Inter | 400 | 12 | 18 | 0% |
| **Caption Bold** | meta.helper | Inter | 400 | 12 | 20 | 0% |

**Note:** DM Sans is available in Subframe and Figma (Google Fonts). Select it as the font for Heading 1–2 in Theme → Typography.

---

## All your typography semantics (full list)

If you want to add more styles in Subframe or need values for something not in the table above:

| Token | Font | Weight | Size | Line height | Letter spacing |
|-------|------|--------|------|-------------|----------------|
| heading.page | DM Sans | 500 | 67px (3xl) | 150% | 0% |
| heading.section | DM Sans | 500 | 51px (2xl) | 150% | 0% |
| heading.subsection | Inter | 600 | 28px (lg) | 150% | 0% |
| body.long | Inter | 400 | 21px (md) | 170% | 0% |
| body.short | Inter | 400 | 16px (sm) | 150% | 0% |
| body.secondary | Inter | 400 | 16px (sm) | 150% | 0% |
| label.button | Inter | 600 | 16px (sm) | 120% | 0% |
| label.input | Inter | 500 | 12px (xs) | 150% | 0% |
| text.link | Inter | 500 | 16px (sm) | 150% | 0% |
| text.navbar | Inter | 500 | 16px (sm) | 150% | 0% |
| text.tooltip | Inter | 400 | 12px (xs) | 150% | 0% |
| meta.caption | Inter | 400 | 12px (xs) | 150% | 0% |
| meta.helper | Inter | 400 | 12px (xs) | 170% | 0% |
| meta.error | Inter | 500 | 12px (xs) | 150% | 0% |
| meta.metric | DM Sans | 700 | 51px (2xl) | 120% | -2% |
| meta.eyebrow | Inter | 600 | 12px (xs) | 150% | 2%, uppercase |

**Line height** in Subframe is in px; your tokens use %. Approximate px from your scale: 150% of size → 1.5× size in px; 120% → 1.2×; 170% → 1.7×.

**Letter spacing:** 0% ≈ 0em, -2% ≈ -0.02em, 2% ≈ 0.02em. Use Subframe’s letter-spacing control (often in em) if it doesn’t accept %.
