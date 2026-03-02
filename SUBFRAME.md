# Using your design tokens in Subframe

Use your tokens to style Subframe, build UI there, then pull that UI into your app.

---

## What you need

1. **A Subframe account and project** — [app.subframe.com](https://app.subframe.com)
2. **The color export from this repo** — the file `subframe-colors.css` in this folder

---

## Step 1: Get your colors into Subframe

1. Open [app.subframe.com](https://app.subframe.com) and go to your project.
2. Open **Theme** (top menu or press **Cmd+K** and type “Theme”).
3. In Theme, go to **Colors**.
4. Subframe won’t let you import into the built-in palettes. So:
   - Click **New palette** and name it (e.g. **Primary**).
   - Click that palette, then click **Import**.
5. Open `subframe-colors.css` in this repo. Copy **only the variable lines** (the lines that look like `--color-primary-100: #EDE9FE`). Do **not** copy the comments or `:root {`.
   - **Easiest:** Copy the whole “ALL COLORS” block (the first block of variables in the file) and paste into Import.
   - **Or** copy one section at a time: first the “PRIMARY only” block into a palette named Primary, then “NEUTRAL only” into a new palette named Neutral, etc.
6. Click **Import** in Subframe. Your colors are now in the theme.

Extra colors like “shadow-base” or “accessible-link” can be added the same way: Theme → Colors → **Import** in the “Individual color tokens” area, then paste the matching lines from `subframe-colors.css`.

---

## Step 2: Build your UI in Subframe

Create your components and pages in Subframe. They will use the theme you just set up (your imported colors).

---

## Step 3: Pull the UI into your app

1. In your **app** folder (e.g. your Next.js project), run once:
   ```bash
   npx @subframe/cli@latest init
   ```
   (You need Tailwind installed in that app already.)

2. Whenever you want to update the UI from Subframe, run:
   ```bash
   npx @subframe/cli@latest sync --all
   ```
   That downloads your theme and components (usually into something like `src/ui`).

---

## If you change your tokens later

- Regenerate the color file from this repo:
  ```bash
  node scripts/build-tailwind-tokens.js
  ```
  That updates `subframe-colors.css`. Then in Subframe, go back to Theme → Colors and re-import (or add a new palette and import the new colors).

---

## Typography mapping

Subframe uses names like “Heading 1”, “Body”, “Caption”. In this repo those are **aliases** under `semantics.typography.generic` in [tokens.json](tokens.json): `heading-1` → `heading.page`, `body` → `body.long`, `caption` → `meta.caption`, etc. So when you set styles in Subframe, you’re effectively using the same semantics; the mapping is documented in [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).

## Round corners, fonts, spacing

Subframe can’t import those from a CSS file. You can either:

- Set them by hand in Subframe’s Theme (Corners, Typography, etc.), using the values from `tokens.json` or `tokens.css` as a reference, or  
- Leave Subframe’s defaults and, in your app, extend Tailwind with this repo’s `tailwind.tokens.js` or load `tokens.css` so your own code uses the full token system.
