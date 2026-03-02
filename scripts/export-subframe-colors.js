#!/usr/bin/env node
/**
 * Exports color tokens from tokens.css in Subframe-ready format.
 * Output: subframe-colors.css — copy one block at a time into Subframe Theme → Import.
 * Run: node scripts/export-subframe-colors.js (or via build-tailwind-tokens.js)
 */

const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'tokens.css');
const outPath = path.join(__dirname, '..', 'subframe-colors.css');

const css = fs.readFileSync(cssPath, 'utf8');

// Match --color-*: value; (value = hex, rgb, or hsl)
const colorVarRe = /^\s*(--color-[^:]+:\s*#[0-9A-Fa-f]{3,8}|--color-[^:]+:\s*rgb\([^)]+\)|--color-[^:]+:\s*hsl\([^)]+\))\s*;?\s*$/gm;
const lines = [];
let m;
while ((m = colorVarRe.exec(css)) !== null) {
  const line = m[1].trim();
  if (line) lines.push(line);
}

// Group by palette (e.g. primary, neutral, success, warning, error = scale; rest = individual)
const byPalette = {};
for (const line of lines) {
  const name = line.split(':')[0].trim();
  const rest = name.replace('--color-', '');
  const palette = rest.split('-').filter((s) => !/^\d+$/.test(s)).join('-') || rest;
  if (!byPalette[palette]) byPalette[palette] = [];
  byPalette[palette].push(line);
}

const header = `/**
 * Subframe Theme → Import tokens
 * Copy ONE block below (only the variable lines, not the comment).
 * In Subframe: New palette → name it to match the section → Import → paste → Import.
 */

`;

const stackPalettes = [
  { key: 'primary', label: 'PRIMARY' },
  { key: 'neutral', label: 'NEUTRAL' },
  { key: 'success', label: 'SUCCESS' },
  { key: 'warning', label: 'WARNING' },
  { key: 'error', label: 'ERROR' },
];

const out = [header];

for (const { key, label } of stackPalettes) {
  if (!byPalette[key]) continue;
  const palLines = byPalette[key];
  const paletteName = label.charAt(0) + label.slice(1).toLowerCase();
  out.push(`/* ─── ${label} ─── Create palette "${paletteName}", then Import and paste the lines below ─── */`);
  out.push(...palLines);
  out.push('');
}

// Individual tokens: any palette that isn't one of the five scale palettes above
const scaleKeys = new Set(stackPalettes.map((p) => p.key));
const individualLines = [];
for (const key of Object.keys(byPalette)) {
  if (scaleKeys.has(key)) continue;
  individualLines.push(...byPalette[key]);
}

if (individualLines.length) {
  out.push('/* ─── INDIVIDUAL TOKENS ─── Import in "Individual color tokens" (one block or split as needed) ─── */');
  out.push(...individualLines);
  out.push('');
}

fs.writeFileSync(outPath, out.join('\n'), 'utf8');
console.log('Wrote', path.relative(process.cwd(), outPath));
