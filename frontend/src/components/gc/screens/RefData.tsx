import type { VM } from "../vm";
import { s } from "../style";

/**
 * Reference data — port of `GC Console HiFi M3.dc.html` template lines 1248–1258.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function RefData({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:grid;grid-template-columns:repeat(2,1fr);gap:12px")}>
        {v.rdRows.map((r, i) => (
          <button key={i} onClick={r.go} style={s("text-align:left;background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px;cursor:pointer")}>
            <span style={s("display:flex;align-items:baseline;gap:10px")}><span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>{r.k}</span><span style={s("margin-left:auto;font:400 12px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#79747E")}>{r.n} values</span></span>
            <span style={s("display:block;font:400 12px/1.7 Roboto,system-ui,sans-serif;color:#49454F;margin-top:9px")}>{r.v}</span>
          </button>
        ))}
      </div>
    </>
  );
}
