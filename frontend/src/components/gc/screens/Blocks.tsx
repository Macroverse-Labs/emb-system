import type { VM } from "../vm";
import { s } from "../style";

/**
 * Blocks and reinstatement — port of `GC Console HiFi M3.dc.html` template lines 874–901.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Blocks({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px")}>
        {v.blCounts.map((b, i) => (
          <div key={i} style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:14px 16px")}>
            <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F")}>{b.k}</div>
            <div style={s(`font:400 28px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;margin-top:10px;color:${b.c}`)}>{b.v}</div>
          </div>
        ))}
      </div>

      <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
        <div style={s("display:grid;grid-template-columns:1.4fr 1.1fr 96px 1.5fr 88px 1.3fr 104px;padding:0 16px;background:#F7F2FA;border-bottom:1px solid #CAC4D0;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>
          <span style={s("padding:11px 8px 11px 0")}>Worker</span>
          <span style={s("padding:11px 8px 11px 0")}>Contractor</span>
          <span style={s("padding:11px 8px 11px 0")}>Origin</span>
          <span style={s("padding:11px 8px 11px 0")}>Reason</span>
          <span style={s("padding:11px 8px 11px 0")}>Since</span>
          <span style={s("padding:11px 8px 11px 0")}>Way back</span>
          <span style={s("padding:11px 0;text-align:right")}>&nbsp;</span>
        </div>
        {v.blRows.map((b, i) => (
          <div key={i} onClick={b.go} style={s("display:grid;grid-template-columns:1.4fr 1.1fr 96px 1.5fr 88px 1.3fr 104px;align-items:center;padding:0 16px;border-bottom:1px solid #E6E0E9;cursor:pointer")}>
            <span style={s("display:flex;align-items:center;gap:9px;padding:12px 8px 12px 0")}>
              <span style={s(`width:6px;height:6px;flex:none;border-radius:50%;background:${b.c}`)} />
              <span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{b.n}</span>
            </span>
            <span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:12px 8px 12px 0")}>{b.co}</span>
            <span style={s("padding:12px 8px 12px 0")}>
              <span style={s(`font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;border:1px solid ${b.kindBd};border-radius:8px;padding:4px 7px`)}>{b.kind}</span>
            </span>
            <span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif;padding:12px 8px 12px 0")}>{b.why}</span>
            <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F;padding:12px 8px 12px 0")}>{b.when}</span>
            <span style={s("font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F;padding:12px 8px 12px 0")}>{b.route}</span>
            <span style={s("text-align:right;padding:8px 0")}>
              <button onClick={b.lift} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 12px;cursor:pointer")}>
                Reinstate
              </button>
            </span>
          </div>
        ))}
        <div style={s("padding:12px 18px;font:400 12px/1.6 Roboto,system-ui,sans-serif;color:#49454F")}>
          An automatic block lifts itself the moment its cause is cleared &mdash; a valid document, a confirmed active worker. A manual block needs a named person to lift it.
        </div>
      </div>
    </>
  );
}
