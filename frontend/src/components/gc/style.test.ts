/**
 * Run with: pnpm exec tsx src/components/gc/style.test.ts
 * (or `node --experimental-strip-types`). No test framework — one assert-based check
 * that fails loudly if the CSS-string parser regresses.
 */
import assert from "node:assert/strict";
import { s } from "./style.ts";

// camel-casing, trimming, and numeric/keyword values
assert.deepEqual(s("display:flex;align-items:center"), { display: "flex", alignItems: "center" });

// values containing colons and commas (font shorthand with a line-height)
assert.deepEqual(s("font:400 12px/1 Roboto,system-ui,sans-serif"), {
  font: "400 12px/1 Roboto,system-ui,sans-serif",
});

// multi-part box-shadow — commas must not be treated as separators
assert.deepEqual(s("box-shadow:0 4px 8px 3px rgba(0,0,0,.15),0 1px 3px rgba(0,0,0,.3)"), {
  boxShadow: "0 4px 8px 3px rgba(0,0,0,.15),0 1px 3px rgba(0,0,0,.3)",
});

// color-mix() as used by the zone plan shapes
assert.deepEqual(s("background:color-mix(in srgb, #6750A4 12%, transparent)"), {
  background: "color-mix(in srgb, #6750A4 12%, transparent)",
});

// custom properties keep their leading dashes
assert.deepEqual(s("--md-sys-color-primary:#6750A4"), { "--md-sys-color-primary": "#6750A4" });

// vendor-ish and trailing semicolons / empty fragments
assert.deepEqual(s("color:#fff;;"), { color: "#fff" });

// cache returns the identical object so React sees a stable style reference
assert.equal(s("color:#fff"), s("color:#fff"));

console.log("style.ts: all checks passed");
