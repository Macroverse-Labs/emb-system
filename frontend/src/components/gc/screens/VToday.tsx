import type { VM } from "../vm";
import { s } from "../style";

/**
 * Visitors today — port of `GC Console HiFi M3.dc.html` template lines 989–1020.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function VToday({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px")}>
        {v.vtCounts.map((c, i) => (
          <div key={i} style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:14px 16px")}>
            <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F")}>{c.k}</div>
            <div style={s(`font:400 28px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;margin-top:10px;color:${c.c}`)}>{c.v}</div>
          </div>
        ))}
      </div>

      <div style={s("display:flex;gap:18px;border-bottom:1px solid #CAC4D0;margin-bottom:14px")}>
        {v.vtTabs.map((t, i) => (
          <button key={i} onClick={t.go} style={s(`display:flex;align-items:baseline;gap:6px;padding:0 0 9px;background:transparent;border:0;border-bottom:2px solid ${t.bd};cursor:pointer;font:400 14px/1 Roboto,system-ui,sans-serif;color:${t.fg}`)}>
            <span>{t.label}</span>
            <span style={s("font:400 11px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#79747E")}>{t.n}</span>
          </button>
        ))}
      </div>

      <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
        <div style={s("display:grid;grid-template-columns:1.4fr 1fr 1fr 1.2fr 1fr .9fr 104px;padding:0 16px;background:#F7F2FA;border-bottom:1px solid #CAC4D0;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>
          <span style={s("padding:11px 8px 11px 0")}>Visitor</span>
          <span style={s("padding:11px 8px 11px 0")}>Type</span>
          <span style={s("padding:11px 8px 11px 0")}>Host</span>
          <span style={s("padding:11px 8px 11px 0")}>Zones granted</span>
          <span style={s("padding:11px 8px 11px 0")}>Window</span>
          <span style={s("padding:11px 8px 11px 0")}>State</span>
          <span style={s("padding:11px 0;text-align:right")}>&nbsp;</span>
        </div>
        {v.vtRows.map((r, i) => (
          <div key={i} onClick={r.go} style={s("display:grid;grid-template-columns:1.4fr 1fr 1fr 1.2fr 1fr .9fr 104px;align-items:center;padding:0 16px;border-bottom:1px solid #E6E0E9;cursor:pointer")}>
            <span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif;padding:12px 8px 12px 0")}>{r.n}</span>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:12px 8px 12px 0")}>{r.kind}</span>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;padding:12px 8px 12px 0")}>{r.host}</span>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:12px 8px 12px 0")}>{r.zones}</span>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;padding:12px 8px 12px 0")}>{r.win}</span>
            <span style={s("display:flex;align-items:center;gap:6px;padding:12px 8px 12px 0")}>
              <span style={s(`width:6px;height:6px;flex:none;border-radius:50%;background:${r.stc}`)} />
              <span style={s(`font:400 12px/1.2 Roboto,system-ui,sans-serif;color:${r.stc}`)}>{r.stl}</span>
            </span>
            <span style={s("text-align:right;padding:8px 0")}>
              <button onClick={r.doAct} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 12px;cursor:pointer")}>
                {r.act}
              </button>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
