import type { VM } from "../vm";
import { s } from "../style";

/**
 * Worker register — port of `GC Console HiFi M3.dc.html` template lines 271–319.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Workers({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:flex;align-items:center;flex-wrap:nowrap;gap:12px;margin-bottom:14px")}>
        <div style={s("position:relative;flex:1 1 240px;min-width:240px;max-width:320px")}><input value={v.wkQ} onChange={v.wkSetQ} placeholder="Name, worker ID, contractor or trade" style={s("width:100%;min-height:40px;padding:8px 12px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:#FEF7FF;border:1px solid #79747E;border-radius:4px;color:#1D1B20")} /></div>
        <div style={s("display:flex;gap:8px;flex-wrap:wrap;flex:1 1 auto;min-width:0")}>
          {v.wkFilters.map((f, i) => (
            <button key={i} onClick={f.go} style={s(`font:500 14px/1 Roboto,system-ui,sans-serif;letter-spacing:.007em;height:32px;padding:0 16px;border-radius:8px;cursor:pointer;color:${f.fg};border:1px solid ${f.bd};background:${f.bg}`)}>{f.label}</button>
          ))}
        </div>
        <button onClick={v.wkAdd} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;flex:none;margin-left:auto;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>New worker</button>
      </div>
      <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;overflow:hidden")}>
        <div style={s("display:flex;align-items:center;gap:12px;padding:11px 16px;border-bottom:1px solid #CAC4D0")}>
          <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F")}>{v.wkCount}</span>
          <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#79747E")}>{v.wkTotal}</span>
          <button onClick={v.wkClear} style={s("margin-left:auto;font:400 12px/1 Roboto,system-ui,sans-serif;color:#6750A4;background:transparent;border:0;cursor:pointer")}>Reset filters</button>
        </div>
        <div style={s("display:grid;grid-template-columns:36px 1.7fr 1.15fr 1fr 1.3fr .9fr .8fr;align-items:center;padding:0 16px;background:#F7F2FA;border-bottom:1px solid #CAC4D0")}>
          <button onClick={v.wkSelAll} style={s("width:15px;height:15px;border:1px solid #79747E;border-radius:4px;background:transparent;cursor:pointer;font:400 11px/1 Roboto,system-ui,sans-serif;color:#6750A4;display:flex;align-items:center;justify-content:center")}>{v.wkAllTick}</button>
          {v.wkCols.map((c, i) => (
            <button key={i} onClick={c.go} style={s(`display:flex;align-items:center;gap:5px;padding:10px 8px 10px 0;background:transparent;border:0;cursor:pointer;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;text-align:left;color:${c.fg}`)}><span>{c.label}</span><span style={s("color:#6750A4")}>{c.caret}</span></button>
          ))}
        </div>
        {v.wkRows.map((r, i) => (
          <div key={i} onClick={r.go} style={s(`display:grid;grid-template-columns:36px 1.7fr 1.15fr 1fr 1.3fr .9fr .8fr;align-items:center;padding:0 16px;border-bottom:1px solid #E6E0E9;cursor:pointer;background:${r.bg}`)}>
            <button onClick={r.pick} style={s(`width:15px;height:15px;border-radius:4px;cursor:pointer;font:400 11px/1 Roboto,system-ui,sans-serif;color:#FEF7FF;display:flex;align-items:center;justify-content:center;border:1px solid ${r.bd};background:${r.box}`)}>{r.tick}</button>
            <span style={s("display:flex;align-items:center;gap:10px;padding:10px 8px 10px 0;min-width:0")}>
              <span style={s("width:28px;height:28px;flex:none;border-radius:50%;background:#E6E0E9;position:relative;overflow:hidden")}><span style={s("position:absolute;left:50%;top:6px;transform:translateX(-50%);width:9px;height:9px;border-radius:50%;background:#AEA9B1")} /><span style={s("position:absolute;left:50%;top:17px;transform:translateX(-50%);width:18px;height:12px;border-radius:9px 9px 0 0;background:#AEA9B1")} /></span>
              <span style={s("min-width:0")}><span style={s("display:block;font:400 14px/1.3 Roboto,system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{r.n}</span><span style={s("display:block;font:400 11px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#79747E;margin-top:2px")}>{r.id}</span></span>
            </span>
            <span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif;padding:10px 8px 10px 0")}>{r.co}</span>
            <span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:10px 8px 10px 0")}>{r.role}</span>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:10px 8px 10px 0")}>{r.zones}</span>
            <span style={s("display:flex;align-items:center;gap:6px;padding:10px 8px 10px 0")}><span style={s(`width:6px;height:6px;border-radius:50%;flex:none;background:${r.stc}`)} /><span style={s(`font:400 12px/1.3 Roboto,system-ui,sans-serif;color:${r.stc}`)}>{r.stl}</span></span>
            <span style={s("padding:10px 0")}><span style={s("display:block;font:400 12px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums")}>{r.seen}</span><span style={s(`display:block;font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.04em;margin-top:2px;color:${r.onC}`)}>{r.onSite}</span></span>
          </div>
        ))}
      </div>
      {v.hasSel && (
        <>
          <div style={s("position:sticky;bottom:0;margin-top:14px;display:flex;align-items:center;gap:12px;padding:12px 16px;background:#322F35;border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.3)")}>
            <span style={s("font:400 14px/1 Roboto,system-ui,sans-serif;color:#F3EDF7")}>{v.wkSelLabel}</span>
            <div style={s("width:1px;height:18px;background:#49454F")} />
            <button onClick={v.wkBulkZones} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#D0BCFF;background:transparent;border:1px solid #D0BCFF;border-radius:9999px;padding:0 24px;cursor:pointer")}>Assign zones</button>
            <button onClick={v.wkBulkBlock} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#F3EDF7;background:transparent;border:1px solid #938F99;border-radius:9999px;padding:0 24px;cursor:pointer")}>Block access</button>
            <button onClick={v.wkBulkExport} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#F3EDF7;background:transparent;border:1px solid #938F99;border-radius:9999px;padding:0 24px;cursor:pointer")}>Export CSV</button>
            <button onClick={v.wkClearSel} style={s("margin-left:auto;font:400 12px/1 Roboto,system-ui,sans-serif;color:#CAC5CD;background:transparent;border:0;cursor:pointer")}>Clear selection</button>
          </div>
        </>
      )}
    </>
  );
}
