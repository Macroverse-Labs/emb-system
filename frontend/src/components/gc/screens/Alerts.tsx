import type { VM } from "../vm";
import { s } from "../style";

/**
 * Alert centre — port of `GC Console HiFi M3.dc.html` template lines 550–569.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Alerts({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:flex;gap:18px;border-bottom:1px solid #CAC4D0;margin-bottom:14px")}>
        {v.alTabs.map((t, i) => (
          <button key={i} onClick={t.go} style={s(`display:flex;align-items:baseline;gap:6px;padding:0 0 9px;background:transparent;border:0;border-bottom:2px solid ${t.bd};cursor:pointer;font:400 14px/1 Roboto,system-ui,sans-serif;color:${t.fg}`)}><span>{t.label}</span><span style={s("font:400 11px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#79747E")}>{t.n}</span></button>
        ))}
        <button onClick={v.alResolveAll} style={s("margin-left:auto;padding:0 0 9px;background:transparent;border:0;cursor:pointer;font:400 12px/1 Roboto,system-ui,sans-serif;color:#6750A4")}>Clear all</button>
      </div>
      <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
        {v.alRows.map((a, i) => (
          <div key={i} onClick={a.go} style={s("display:flex;align-items:center;gap:14px;padding:13px 18px;border-bottom:1px solid #E6E0E9;cursor:pointer")}>
            <span style={s(`width:3px;align-self:stretch;flex:none;background:${a.c}`)} />
            <span style={s("width:78px;flex:none;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E")}>{a.kind}</span>
            <span style={s("flex:1;min-width:0")}><span style={s("display:block;font:400 14px/1.4 Roboto,system-ui,sans-serif")}>{a.t}</span><span style={s("display:block;font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F;margin-top:2px")}>{a.s}</span></span>
            <span style={s(`flex:none;font:400 12px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:${a.c};min-width:44px;text-align:right`)}>{a.n}</span>
            <span style={s("flex:none;display:flex;gap:7px")}><button onClick={a.snooze} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#49454F;background:transparent;border:1px solid #CAC4D0;border-radius:9999px;padding:0 12px;cursor:pointer")}>Snooze</button><button onClick={a.resolve} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 12px;cursor:pointer")}>Handled</button></span>
          </div>
        ))}
      </div>
    </>
  );
}
