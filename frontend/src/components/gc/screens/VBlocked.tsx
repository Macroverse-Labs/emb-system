import type { VM } from "../vm";
import { s } from "../style";

/**
 * Repeat &amp; blocked visitors — port of `GC Console HiFi M3.dc.html` template
 * lines 1043–1062. The design's loop variable is `v`; renamed to `b` here so it
 * does not shadow the `v` view-model prop.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function VBlocked({ v }: { v: VM }) {
  return (
    <>
      <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
        <div style={s("display:grid;grid-template-columns:1.4fr 1fr 1.2fr 84px 1.3fr 1.3fr 112px;padding:0 16px;background:#F7F2FA;border-bottom:1px solid #CAC4D0;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>
          <span style={s("padding:11px 8px 11px 0")}>Visitor</span><span style={s("padding:11px 8px 11px 0")}>Type</span><span style={s("padding:11px 8px 11px 0")}>Company</span><span style={s("padding:11px 8px 11px 0;text-align:right")}>Visits</span><span style={s("padding:11px 8px 11px 0")}>Last incident</span><span style={s("padding:11px 8px 11px 0")}>Standing</span><span style={s("padding:11px 0;text-align:right")}>&nbsp;</span>
        </div>
        {v.vbRows.map((b, i) => (
          <div key={i} style={s("display:grid;grid-template-columns:1.4fr 1fr 1.2fr 84px 1.3fr 1.3fr 112px;align-items:center;padding:0 16px;border-bottom:1px solid #E6E0E9")}>
            <span style={s("display:flex;align-items:center;gap:9px;padding:12px 8px 12px 0")}><span style={s(`width:6px;height:6px;flex:none;border-radius:50%;background:${b.c}`)} /><span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{b.n}</span></span>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:12px 8px 12px 0")}>{b.kind}</span>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;padding:12px 8px 12px 0")}>{b.co}</span>
            <span style={s("text-align:right;font:400 14px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;padding:12px 8px 12px 0")}>{b.visits}</span>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:12px 8px 12px 0")}>{b.last}</span>
            <span style={s(`font:400 12px/1.3 Roboto,system-ui,sans-serif;color:${b.c};padding:12px 8px 12px 0`)}>{b.st}</span>
            <span style={s("text-align:right;padding:8px 0")}><button onClick={b.doAct} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 12px;cursor:pointer")}>{b.act}</button></span>
          </div>
        ))}
        <div style={s("padding:12px 18px;font:400 12px/1.6 Roboto,system-ui,sans-serif;color:#49454F")}>A repeat visitor is a convenience, not a standing permission &mdash; every visit is still granted one at a time, by a host, with a window.</div>
      </div>
    </>
  );
}
