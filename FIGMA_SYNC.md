# Figma / Tokens Studio — sync checklist

The repo is correct: **display font = DM Sans** in `tokens.json` → **primitives/foundations.typography** → `fontFamily.display`.

**Reference paths:** Tokens Studio often can’t accept or display the full token path when linking (e.g. `typography.scale.base.fontSize.type-1`). The token source uses **short paths** for refs (e.g. `{fontSize.type-1}`, `{fontSize.xxs}`) so the plugin can resolve them when the right sets are enabled. Don’t change these to long paths in the JSON.

If Tokens Studio still shows "Google Sans" or variables don’t update in Figma, the plugin is not using this file. Use one of the options below, then run **Export to Figma** again.

---

## Option A: Token source = GitHub URL

1. In Tokens Studio, set the token source to this **raw file URL** (main branch):
   ```
   https://raw.githubusercontent.com/inahm/Design-Tokens/main/tokens.json
   ```
2. Click **Sync** / **Refresh** / **Pull** (whatever the plugin calls it) so it re-fetches the file.
3. Confirm **primitives/foundations.typography** → **display** shows **DM Sans**.
4. Run **Export → Export to Figma** (or “Export to native variables”).

---

## Option B: Token source = local file

1. In Tokens Studio, set the token source to a **local file**.
2. Choose the `tokens.json` inside your Design-Tokens repo (e.g. `…/Design-Tokens/tokens.json`).  
   If you’re not sure, in Terminal run: `cd` into the repo and run `pwd` — the path is `{that path}/tokens.json`.
3. **Re-import** or **re-open** the file in the plugin (or remove the source and add it again) so it’s not using a cached copy.
4. Confirm **display** = **DM Sans**, then **Export to Figma**.

---

## Still showing old values?

- Make sure you’re looking at the **token source** (the file), not the “Figma variables” view. The source should show DM Sans before export.
- If you use a **branch** other than `main`, replace `main` in the URL with your branch name.
- After export, add **DM Sans** to the Figma file (use it in a text layer once) so variables can apply it.
- **Variables not updating in Figma?** Sometimes the existing variable collection keeps old values. Try **deleting the variable collection in Figma** and re-exporting from Tokens Studio (Export to Figma) so it creates a fresh collection with the latest tokens. Re-apply variables to components if they were bound to the old collection.

---

## Getting blur tokens into Figma

Blur tokens use **dimension** type so they export as **Number** variables. When exporting to Figma:

1. In **Export to Figma**, enable **Number** (Variables). That’s what exports dimension/blur tokens.
2. Ensure the token set that contains your blur tokens (e.g. **Composition PRO**) is selected for export.
3. After export, in Figma the blur values live in the **Variables** panel as numbers (e.g. 16, 24, 32). To bind to **Background blur** → Blur: click the grid icon next to the blur value and pick the variable (you may need to search by scale name like **navBar**, **sheet**, or **overlay** rather than “blur”, depending on how the collection is named).

---

## Glass effects

**Color** (fill, stroke, highlight) live in **iOS color semantics** (colorSemantics/ios.light and colorSemantics/ios.dark):

- **Fill** → `surface.glass.background`
- **Stroke** → `surface.glass.stroke`
- **Highlight** → `surface.glass.highlight` — lighter edge for top/left (optional second stroke)

**Blur and shadow** (glass) live in **semantics/ios** as separate tokens — apply each to the layer in Figma:

- **Blur** → `glass.blur` (semantics/ios) — references {blur.lg}. Apply to Background blur (or Layer blur) on the layer.
- **Shadow** → `glass.shadow` (semantics/ios) — references {shadow.sm}. Apply to Drop shadow on the layer.

**Nuanced stroke (true glass edge):** Apply **stroke** as the main border, then add a second stroke (or inner path) with **highlight** — typically thinner and on the top/left where light would catch the edge.

**Important:** Tokens Studio applies the blur token as **Layer blur** in Figma. For a real glass look (blur what’s behind the layer), after applying the blur token:

1. Select the layer (frame/rectangle).
2. In the right panel, open **Effects**.
3. Change the blur effect from **Layer blur** to **Background blur**.

The token’s value (e.g. 16px) still applies; you’re only changing the effect type. Do this once per glass layer (or use a component that already has Background blur set).
