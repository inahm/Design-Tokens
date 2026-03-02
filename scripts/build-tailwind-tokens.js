#!/usr/bin/env node
/**
 * Compiles tokens.json into Tailwind theme extension and CSS variables.
 * Run: node scripts/build-tailwind-tokens.js
 * Output: tailwind.tokens.js, tokens.css
 */

const fs = require('fs');
const path = require('path');

const tokensPath = path.join(__dirname, '..', 'tokens.json');
const tailwindOutPath = path.join(__dirname, '..', 'tailwind.tokens.js');
const cssOutPath = path.join(__dirname, '..', 'tokens.css');

const raw = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));

// Keep typography.snapshot.web.desktop in sync with typography.scale.base (desktop = canonical base).
// Does NOT touch mobile/tablet snapshots or any iOS typography.
function syncTypographySnapshotsWithBase(json) {
  if (!json || typeof json !== 'object') return;
  const baseScale = json['typography.scale.base'];
  if (!baseScale || !baseScale.fontSize) return;

  const baseFontSizes = baseScale.fontSize;

  // Ensure snapshot container exists
  if (!json['typography.snapshot.web.desktop']) {
    json['typography.snapshot.web.desktop'] = {};
  }
  const desktopSnapshot = json['typography.snapshot.web.desktop'];
  if (!desktopSnapshot.fontSize) {
    desktopSnapshot.fontSize = {};
  }
  const desktopFontSizes = desktopSnapshot.fontSize;

  // Copy values from canonical base into desktop snapshot, per size key.
  for (const [key, entry] of Object.entries(baseFontSizes)) {
    if (!entry || typeof entry !== 'object' || entry.value === undefined) continue;
    if (!desktopFontSizes[key]) {
      desktopFontSizes[key] = {};
    }
    const target = desktopFontSizes[key];
    target.value = entry.value;
    // Preserve existing type if present; otherwise mirror base type or default to fontSizes.
    if (!target.type) {
      target.type = entry.type || 'fontSizes';
    }
  }
}

// Update in-memory JSON and write back to tokens.json so snapshots stay aligned with the base scale.
syncTypographySnapshotsWithBase(raw);
fs.writeFileSync(tokensPath, JSON.stringify(raw, null, 2) + '\n', 'utf8');

// Flatten token tree to path -> value (primitives + refs)
const primitives = {};
const refs = {};
const PREFIXES = ['', 'foundations.scale.base.', 'foundations.scale.web.base.', 'foundations.', 'typography.foundations.', 'typography.scale.base.', 'web.', 'ios.'];

function walk(obj, prefix = '') {
  if (!obj || typeof obj !== 'object') return;
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && 'value' in val) {
      const v = val.value;
      if (typeof v === 'string' && v.startsWith('{') && v.endsWith('}') && !Array.isArray(v)) {
        refs[path] = v.slice(1, -1).trim();
      } else if (typeof v === 'string' && !Array.isArray(v)) {
        primitives[path] = v;
      } else if (typeof v === 'number') {
        primitives[path] = v;
      } else if (Array.isArray(v)) {
        primitives[path] = val;
      }
    }
    if (val && typeof val === 'object' && !('value' in val) && !('type' in val)) {
      walk(val, path);
    } else if (val && typeof val === 'object' && ('value' in val || 'type' in val)) {
      walk(val, path);
    }
  }
}
walk(raw);

// Resolve a reference path (e.g. "layout.container.xl" or "spacing.xs") to final value
const resolvedCache = {};
function getResolved(refPath) {
  if (resolvedCache[refPath] !== undefined) return resolvedCache[refPath];
  for (const prefix of PREFIXES) {
    const full = prefix ? prefix + refPath : refPath;
    if (primitives[full] !== undefined && typeof primitives[full] !== 'object') {
      resolvedCache[refPath] = primitives[full];
      return primitives[full];
    }
    if (refs[full] !== undefined) {
      const out = getResolved(refs[full]);
      if (out !== undefined) {
        resolvedCache[refPath] = out;
        return out;
      }
    }
  }
  return undefined;
}

// Resolve a token value (string or number); if it's a ref "{...}", resolve it
function resolveVal(val) {
  if (typeof val === 'string' && val.startsWith('{') && val.endsWith('}')) {
    return getResolved(val.slice(1, -1).trim()) ?? val;
  }
  return val;
}

// Legacy: resolve a single reference like "{color.shadow.base}" for boxShadow etc.
function resolveRef(ref) {
  if (typeof ref !== 'string' || !ref.startsWith('{') || !ref.endsWith('}')) return null;
  return getResolved(ref.slice(1, -1).trim()) ?? null;
}

// Hex to rgba with opacity
function hexToRgba(hex, opacity = 1) {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${opacity})`;
}

// Build boxShadow string from token value array
function boxShadowCss(entry) {
  if (!entry || !entry.value || !Array.isArray(entry.value)) return null;
  const shadowBaseHex = primitives['foundations.color.shadow.base'] || '#0A0D12';
  const parts = entry.value.map((s) => {
    const opacity = parseFloat(s.opacity) ?? 1;
    const color = (s.color && resolveRef(s.color)) ? hexToRgba(resolveRef(s.color), opacity) : hexToRgba(shadowBaseHex, opacity);
    return `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${color}`;
  });
  return parts.join(', ');
}

// Flatten nested color object for Tailwind (foundations.color.*)
const foundations = raw.foundations || {};
const color = foundations.color || {};
const theme = {
  colors: {},
  borderRadius: {},
  borderWidth: {},
  boxShadow: {},
  zIndex: {},
  screens: {},
  transitionDuration: {},
  transitionTimingFunction: {},
  opacity: {},
  fontFamily: {},
  fontWeight: {},
  fontSize: {},
  lineHeight: {},
  letterSpacing: {},
  textTransform: {},
  textDecoration: {},
  spacing: {},
  maxWidth: {},
  width: {},
  ringWidth: {},
  ringColor: {},
};

function setColor(obj, key, value) {
  if (typeof value === 'string' && (value.startsWith('#') || value.startsWith('rgb'))) {
    theme.colors[key] = value;
  }
}

function flattenColors(obj, prefix = '') {
  if (!obj || typeof obj !== 'object') return;
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}-${k}` : k;
    if (v && typeof v === 'object' && v.value !== undefined && (v.type === 'color' || String(v.value).startsWith('#'))) {
      if (typeof v.value === 'string') theme.colors[key] = v.value;
    } else if (v && typeof v === 'object' && !v.value) {
      flattenColors(v, key);
    }
  }
}
flattenColors(color.core, 'core');
flattenColors(color.neutral, 'neutral');
flattenColors(color.primary, 'primary');
flattenColors(color.success, 'success');
flattenColors(color.warning, 'warning');
flattenColors(color.error, 'error');
theme.colors['shadow-base'] = (color.shadow && color.shadow.base && color.shadow.base.value) || '#0A0D12';
flattenColors(color.accessible, 'accessible');

// Radius
const radius = foundations.radius || {};
for (const [k, v] of Object.entries(radius)) {
  if (v && v.value) theme.borderRadius[k] = v.value;
}

// Border width
const borderWidth = foundations.borderWidth || {};
for (const [k, v] of Object.entries(borderWidth)) {
  if (v && v.value !== undefined) theme.borderWidth[k] = v.value;
}

// Box shadow (foundations.shadow)
const shadow = foundations.shadow || {};
const shadowBaseHex = theme.colors['shadow-base'] || '#0A0D12';
for (const [k, v] of Object.entries(shadow)) {
  if (v && v.value && Array.isArray(v.value)) {
    const parts = v.value.map((s) => {
      const opacity = parseFloat(s.opacity) ?? 0.1;
      const col = s.color && s.color.startsWith('{') ? shadowBaseHex : (s.color || shadowBaseHex);
      const r = parseInt(col.slice(1, 3), 16);
      const g = parseInt(col.slice(3, 5), 16);
      const b = parseInt(col.slice(5, 7), 16);
      return `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px rgba(${r},${g},${b},${opacity})`;
    });
    theme.boxShadow[k] = parts.join(', ');
  }
}

// Z-index
const zIndex = foundations['z-index'] || {};
for (const [k, v] of Object.entries(zIndex)) {
  if (v && v.value !== undefined) theme.zIndex[k] = v.value;
}

// Breakpoints -> screens
const breakpoints = foundations.breakpoints || {};
for (const [k, v] of Object.entries(breakpoints)) {
  if (v && v.value) theme.screens[k] = v.value;
}

// Duration
const duration = foundations.duration || {};
for (const [k, v] of Object.entries(duration)) {
  if (v && v.value !== undefined) theme.transitionDuration[k] = v.value;
}

// Easing
const easing = foundations.easing || {};
for (const [k, v] of Object.entries(easing)) {
  if (v && v.value) theme.transitionTimingFunction[k] = v.value;
}

// Opacity
const opacity = foundations.opacity || {};
for (const [k, v] of Object.entries(opacity)) {
  if (v && v.value !== undefined) theme.opacity[k] = String(v.value);
}

// Spacing from foundations.scale.base (fallback to legacy foundations.scale.web.base)
const scaleBase = raw['foundations.scale.base'] || raw['foundations.scale.web.base'] || {};
const spacingObj = scaleBase.spacing || {};
for (const [k, v] of Object.entries(spacingObj)) {
  if (v && v.value) theme.spacing[k] = v.value;
}

// Typography from typography.foundations and typography.scale.base
const typoFoundations = raw['typography.foundations'] || {};
const typoScale = raw['typography.scale.base'] || {};
const fontFamily = typoFoundations.fontFamily || {};
for (const [k, v] of Object.entries(fontFamily)) {
  if (v && v.value) theme.fontFamily[k] = [v.value, 'sans-serif'];
}
const fontWeight = typoFoundations.fontWeight || {};
for (const [k, v] of Object.entries(fontWeight)) {
  if (v && v.value !== undefined) theme.fontWeight[k] = v.value;
}
const fontSize = typoScale.fontSize || {};
for (const [k, v] of Object.entries(fontSize)) {
  if (v && v.value) theme.fontSize[k] = [v.value, { lineHeight: '1.5' }];
}
const lineHeight = typoFoundations.lineHeight || {};
for (const [k, v] of Object.entries(lineHeight)) {
  if (v && v.value) theme.lineHeight[k] = v.value;
}
const letterSpacing = typoFoundations.letterSpacing || {};
for (const [k, v] of Object.entries(letterSpacing)) {
  if (v && v.value) theme.letterSpacing[k] = v.value;
}

// textCase -> textTransform, textDecoration
const textCase = typoFoundations.textCase || {};
for (const [k, v] of Object.entries(textCase)) {
  if (v && v.value) theme.textTransform[k] = v.value;
}
const textDecoration = typoFoundations.textDecoration || {};
for (const [k, v] of Object.entries(textDecoration)) {
  if (v && v.value) theme.textDecoration[k] = v.value;
}

// Layout: container, lineLength, media, iconSize (from foundations.scale.base; fallback to legacy)
const scaleBaseLayout = ((raw['foundations.scale.base'] || raw['foundations.scale.web.base'] || {}).layout) || {};
const layoutContainer = scaleBaseLayout.container || {};
for (const [k, v] of Object.entries(layoutContainer)) {
  if (v && v.value) {
    const resolved = resolveVal(v.value);
    if (typeof resolved === 'string') theme.maxWidth[`container-${k}`] = resolved;
  }
}
const layoutLineLength = scaleBaseLayout.lineLength || {};
for (const [k, v] of Object.entries(layoutLineLength)) {
  if (v && v.value) {
    const resolved = resolveVal(v.value);
    if (typeof resolved === 'string') theme.maxWidth[`lineLength-${k}`] = resolved;
  }
}
const scaleBaseMedia = ((raw['foundations.scale.base'] || raw['foundations.scale.web.base'] || {}).media) || {};
for (const [k, v] of Object.entries(scaleBaseMedia)) {
  if (v && v.value) {
    const resolved = resolveVal(v.value);
    if (typeof resolved === 'string') theme.maxWidth[`media-${k}`] = resolved;
  }
}
const scaleBaseIconSize = ((raw['foundations.scale.base'] || raw['foundations.scale.web.base'] || {}).iconSize) || {};
for (const [k, v] of Object.entries(scaleBaseIconSize)) {
  if (v && v.value) {
    const resolved = resolveVal(v.value);
    if (typeof resolved === 'string') {
      if (!theme.width.icon) theme.width.icon = {};
      theme.width.icon[k] = resolved;
    }
  }
}

// Web semantics: layout (gap, padding, margin) -> spacing
const semanticsLayout = (raw.web && raw.web.layout) || {};
for (const group of ['gap', 'padding', 'margin']) {
  const obj = semanticsLayout[group] || {};
  for (const [k, v] of Object.entries(obj)) {
    if (v && v.value !== undefined) {
      const resolved = resolveVal(v.value);
      if (typeof resolved === 'string') theme.spacing[`${group}-${k}`] = resolved;
    }
  }
}

// Web semantics: focus ring -> ringWidth, ringColor
const focusRing = raw.web?.border?.focus?.ring?.accessible?.value;
if (focusRing && typeof focusRing === 'object') {
  if (focusRing.color) {
    const c = resolveVal(focusRing.color);
    if (typeof c === 'string') theme.ringColor.focus = c;
  }
  if (focusRing.width) {
    const w = resolveVal(focusRing.width);
    if (typeof w === 'string') theme.ringWidth.focus = w;
  }
}

// Web semantics: elevation -> boxShadow aliases (e.g. elevation.card -> shadow.sm)
const semanticsElevation = (raw.web && raw.web.elevation) || {};
for (const [k, v] of Object.entries(semanticsElevation)) {
  if (v && v.value && typeof v.value === 'string') {
    const refPath = v.value.slice(1, -1).trim(); // "shadow.sm" -> last part "sm"
    const shadowKey = refPath.split('.').pop();
    if (theme.boxShadow[shadowKey]) theme.boxShadow[k] = theme.boxShadow[shadowKey];
  }
}

// Web semantics: z-index aliases
const semanticsZIndex = (raw.web && raw.web['z-index']) || {};
for (const [k, v] of Object.entries(semanticsZIndex)) {
  if (v && v.value !== undefined) {
    const resolved = resolveVal(v.value);
    if (resolved !== undefined && resolved !== null) theme.zIndex[k] = String(resolved);
  }
}

// Web semantics: border.listSeparator (color for list/table dividers)
const listSeparator = raw.web?.border?.listSeparator;
if (listSeparator && listSeparator.value) {
  const resolved = resolveVal(listSeparator.value);
  if (typeof resolved === 'string') theme.colors.borderListSeparator = resolved;
}

// iOS token set (separate set so Token Studio can enable/disable for iOS vs web)
const semanticsIos = raw.ios || {};
const iosInteractive = semanticsIos.interactive || {};
const iosInset = semanticsIos.inset?.safeArea || {};
if (iosInteractive.minimumTouchTarget && iosInteractive.minimumTouchTarget.value) {
  const v = resolveVal(iosInteractive.minimumTouchTarget.value);
  if (v !== undefined) {
    theme.minWidth = theme.minWidth || {};
    theme.minWidth.iosTouchTarget = `${v}px`;
  }
}
for (const edge of ['top', 'bottom', 'left', 'right']) {
  const node = iosInset[edge];
  if (node && node.value !== undefined) {
    const v = resolveVal(node.value);
    if (v !== undefined) {
      const px = typeof v === 'string' ? `${v}px` : `${v}px`;
      theme.spacing[`iosSafeArea${edge.charAt(0).toUpperCase() + edge.slice(1)}`] = px;
    }
  }
}

// Remove empty sections
for (const key of Object.keys(theme)) {
  if (Object.keys(theme[key]).length === 0) delete theme[key];
}

const js = `/**
 * Tailwind theme tokens — generated from tokens.json
 * Do not edit by hand. Regenerate with: node scripts/build-tailwind-tokens.js
 */

module.exports = {
  theme: {
    extend: ${JSON.stringify(theme, null, 2)}
  }
};
`;

fs.writeFileSync(tailwindOutPath, js, 'utf8');
console.log('Wrote', tailwindOutPath);

// --- CSS variables output ---
const cssVars = [];
const toKebab = (s) => String(s).replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
const toCssVar = (name) => `--${toKebab(name)}`;

// Colors
for (const [key, value] of Object.entries(theme.colors)) {
  cssVars.push(`  ${toCssVar(`color-${key}`)}: ${value};`);
}

// Border radius
for (const [key, value] of Object.entries(theme.borderRadius || {})) {
  cssVars.push(`  ${toCssVar(`radius-${key}`)}: ${value};`);
}

// Border width
for (const [key, value] of Object.entries(theme.borderWidth || {})) {
  cssVars.push(`  ${toCssVar(`border-${key}`)}: ${value};`);
}

// Box shadow
for (const [key, value] of Object.entries(theme.boxShadow || {})) {
  cssVars.push(`  ${toCssVar(`shadow-${key}`)}: ${value};`);
}

// Z-index
for (const [key, value] of Object.entries(theme.zIndex || {})) {
  cssVars.push(`  ${toCssVar(`z-${key}`)}: ${value};`);
}

// Breakpoints (as custom props for use in media queries or JS)
for (const [key, value] of Object.entries(theme.screens || {})) {
  cssVars.push(`  ${toCssVar(`breakpoint-${key}`)}: ${value};`);
}

// Transition duration
for (const [key, value] of Object.entries(theme.transitionDuration || {})) {
  cssVars.push(`  ${toCssVar(`duration-${key}`)}: ${value};`);
}

// Easing (keys are already "linear", "ease-in", etc.)
for (const [key, value] of Object.entries(theme.transitionTimingFunction || {})) {
  cssVars.push(`  ${toCssVar(key)}: ${value};`);
}

// Opacity
for (const [key, value] of Object.entries(theme.opacity || {})) {
  cssVars.push(`  ${toCssVar(`opacity-${key}`)}: ${value};`);
}

// Spacing
for (const [key, value] of Object.entries(theme.spacing || {})) {
  cssVars.push(`  ${toCssVar(`spacing-${key}`)}: ${value};`);
}

// Font family (quote multi-word names)
for (const [key, value] of Object.entries(theme.fontFamily || {})) {
  const fontStack = Array.isArray(value) ? value : [value];
  const serialized = fontStack.map((f) => (typeof f === 'string' && f.includes(' ') ? `"${f}"` : f)).join(', ');
  cssVars.push(`  ${toCssVar(`font-family-${key}`)}: ${serialized};`);
}

// Font weight
for (const [key, value] of Object.entries(theme.fontWeight || {})) {
  cssVars.push(`  ${toCssVar(`font-weight-${key}`)}: ${value};`);
}

// Font size (Tailwind stores as [size, { lineHeight }]; emit size and optional line-height)
for (const [key, value] of Object.entries(theme.fontSize || {})) {
  const size = Array.isArray(value) ? value[0] : value;
  cssVars.push(`  ${toCssVar(`font-size-${key}`)}: ${size};`);
}

// Line height
for (const [key, value] of Object.entries(theme.lineHeight || {})) {
  cssVars.push(`  ${toCssVar(`line-height-${key}`)}: ${value};`);
}

// Letter spacing
for (const [key, value] of Object.entries(theme.letterSpacing || {})) {
  cssVars.push(`  ${toCssVar(`letter-spacing-${key}`)}: ${value};`);
}

// Text transform (textCase)
for (const [key, value] of Object.entries(theme.textTransform || {})) {
  cssVars.push(`  ${toCssVar(`text-transform-${key}`)}: ${value};`);
}

// Text decoration
for (const [key, value] of Object.entries(theme.textDecoration || {})) {
  cssVars.push(`  ${toCssVar(`text-decoration-${key}`)}: ${value};`);
}

// Max width (container, lineLength, media)
for (const [key, value] of Object.entries(theme.maxWidth || {})) {
  cssVars.push(`  ${toCssVar(`max-width-${key}`)}: ${value};`);
}

// Width (icon sizes)
if (theme.width && theme.width.icon) {
  for (const [key, value] of Object.entries(theme.width.icon)) {
    cssVars.push(`  ${toCssVar(`width-icon-${key}`)}: ${value};`);
  }
}

// Min width (e.g. iOS touch target)
for (const [key, value] of Object.entries(theme.minWidth || {})) {
  cssVars.push(`  ${toCssVar(`min-width-${key}`)}: ${value};`);
}

// Ring (focus)
for (const [key, value] of Object.entries(theme.ringWidth || {})) {
  cssVars.push(`  ${toCssVar(`ring-width-${key}`)}: ${value};`);
}
for (const [key, value] of Object.entries(theme.ringColor || {})) {
  cssVars.push(`  ${toCssVar(`ring-color-${key}`)}: ${value};`);
}

const css = `/**
 * Design tokens as CSS custom properties — generated from tokens.json
 * Do not edit by hand. Regenerate with: node scripts/build-tailwind-tokens.js
 */

:root {
${cssVars.join('\n')}
}
`;

fs.writeFileSync(cssOutPath, css, 'utf8');
console.log('Wrote', cssOutPath);

// Subframe-ready color export (paste into Subframe Theme → Import)
require('child_process').execSync('node scripts/export-subframe-colors.js', {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
});
