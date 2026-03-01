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

// Flatten token tree to path -> value (primitives only)
const primitives = {};
function walk(obj, prefix = '') {
  if (!obj || typeof obj !== 'object') return;
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && 'value' in val) {
      const v = val.value;
      if (typeof v === 'string' && !v.startsWith('{') && !Array.isArray(v)) {
        primitives[path] = v;
      } else if (typeof v === 'number') {
        primitives[path] = v;
      } else if (Array.isArray(v)) {
        // boxShadow etc. – handle in theme builder
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

// Resolve a single reference like "{color.shadow.base}"
function resolveRef(ref) {
  if (typeof ref !== 'string' || !ref.startsWith('{') || !ref.endsWith('}')) return null;
  const path = ref.slice(1, -1).trim();
  return primitives[path] ?? null;
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
  spacing: {},
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

// Spacing from foundations.scale.base
const scaleBase = raw['foundations.scale.base'] || {};
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
