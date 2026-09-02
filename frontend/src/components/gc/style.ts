import type { CSSProperties } from "react";

const cache = new Map<string, CSSProperties>();

/**
 * Turns a CSS declaration string into a React style object.
 *
 * The GC console is a verbatim port of `GC Console HiFi M3.dc.html`, whose 1,209
 * elements each carry a `style="..."` string. Keeping those strings intact is what
 * makes the port mechanical and keeps it re-syncable against the design file, so
 * every screen passes its style through here instead of hand-written objects.
 *
 * No declaration in the design contains a nested `;` (checked across `font:`
 * shorthand, `box-shadow` and `color-mix()`), so splitting on `;` is safe.
 */
export function s(css: string): CSSProperties {
  const hit = cache.get(css);
  if (hit) return hit;
  const out: Record<string, string> = {};
  for (const decl of css.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const key = decl.slice(0, i).trim();
    if (!key) continue;
    // Custom properties keep their dashes; everything else camel-cases.
    out[key.startsWith("--") ? key : key.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] =
      decl.slice(i + 1).trim();
  }
  const style = out as CSSProperties;
  cache.set(css, style);
  return style;
}
