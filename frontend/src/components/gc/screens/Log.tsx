import type { VM } from "../vm";
import { s } from "../style";

/**
 * Access log — port of `GC Console HiFi M3.dc.html` template lines 1087–1122.
 */
export default function Log({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px")}>
        {v.lgCounts.map((c, i) => (
          <div key={i} style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:14px 16px")}>
            <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F")}>{c.k}</div>
            <div style={s(`font:400 28px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;margin-top:10px;color:${c.c}`)}>{c.v}</div>
          </div>
        ))}
      </div>

      <div style={s("display:flex;align-items:center;flex-wrap:nowrap;gap:14px;margin-bottom:14px")}>
        <input value={v.lgQ} onChange={v.lgSetQ} placeholder="Filter by name, contractor, device or reason" style={s("flex:1 1 240px;min-width:240px;max-width:340px;min-height:40px;padding:8px 12px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:#FEF7FF;border:1px solid #79747E;border-radius:4px")} />
        <div style={s("display:flex;gap:18px;border-bottom:1px solid #CAC4D0;align-self:stretch;align-items:flex-end;flex:1")}>
          {v.lgTabs.map((t, i) => (
            <button key={i} onClick={t.go} style={s(`padding:0 0 9px;background:transparent;border:0;border-bottom:2px solid ${t.bd};cursor:pointer;font:400 14px/1 Roboto,system-ui,sans-serif;color:${t.fg}`)}>{t.label}</button>
          ))}
        </div>
        <button onClick={v.lgExport} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>
          Export CSV
        </button>
      </div>

      <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
        <div style={s("display:grid;grid-template-columns:88px 1.5fr 1.2fr 1.3fr 74px 100px 1.4fr;padding:0 16px;background:#F7F2FA;border-bottom:1px solid #CAC4D0;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>
          <span style={s("padding:11px 8px 11px 0")}>Time</span>
          <span style={s("padding:11px 8px 11px 0")}>Person</span>
          <span style={s("padding:11px 8px 11px 0")}>Company</span>
          <span style={s("padding:11px 8px 11px 0")}>Device</span>
          <span style={s("padding:11px 8px 11px 0")}>Direction</span>
          <span style={s("padding:11px 8px 11px 0")}>Verdict</span>
          <span style={s("padding:11px 0")}>How &amp; why</span>
        </div>
        {v.lgRows.map((l, i) => (
          <div key={i} style={s(`display:grid;grid-template-columns:88px 1.5fr 1.2fr 1.3fr 74px 100px 1.4fr;align-items:center;padding:0 16px;border-bottom:1px solid #E6E0E9;background:${l.bg}`)}>
            <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F;padding:11px 8px 11px 0")}>{l.t}</span>
            <span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif;padding:11px 8px 11px 0")}>{l.n}</span>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:11px 8px 11px 0")}>{l.co}</span>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:11px 8px 11px 0")}>{l.dev}</span>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;padding:11px 8px 11px 0")}>{l.dir}</span>
            <span style={s(`font:400 12px/1.3 Roboto,system-ui,sans-serif;color:${l.c};padding:11px 8px 11px 0`)}>{l.res}</span>
            <span style={s("font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F;padding:11px 0")}>{l.note}</span>
          </div>
        ))}
      </div>
    </>
  );
}
