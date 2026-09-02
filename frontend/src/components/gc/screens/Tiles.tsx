import type { VM } from "../vm";
import { s } from "../style";

/**
 * Dashboard layout — port of `GC Console HiFi M3.dc.html` template lines 1279–1336.
 */
export default function Tiles({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start")}>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
          <div style={s("display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid #CAC4D0")}><span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>Tiles, in order</span><button onClick={v.tlBack} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;margin-left:auto;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>Cancel</button><button onClick={v.tlSave} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>Save layout</button></div>
          {v.tlRows.map((t, i) => (
            <div key={i} style={s("display:flex;align-items:center;gap:10px;padding:11px 18px;border-bottom:1px solid #E6E0E9")}>
              <span style={s("flex:1;font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{t.n}</span>
              <span style={s(`width:56px;flex:none;font:400 12px/1 Roboto,system-ui,sans-serif;color:${t.c}`)}>{t.on}</span>
              <button onClick={t.toggle} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#49454F;background:transparent;border:1px solid #CAC4D0;border-radius:9999px;padding:0 12px;cursor:pointer")}>Switch</button>
              <button onClick={t.up} style={s("width:26px;height:26px;font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F;background:transparent;border:1px solid #CAC4D0;border-radius:9999px;cursor:pointer")}>&uarr;</button>
              <button onClick={t.down} style={s("width:26px;height:26px;font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F;background:transparent;border:1px solid #CAC4D0;border-radius:9999px;cursor:pointer")}>&darr;</button>
            </div>
          ))}
        </div>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:18px 20px")}>
          <div style={s("font:500 16px/1 Roboto,system-ui,sans-serif;margin-bottom:8px")}>The same layout drives the reception board</div>
          <p style={s("font:400 14px/1.7 Roboto,system-ui,sans-serif;color:#49454F;margin:0 0 16px")}>Hidden tiles disappear from both. The board takes the first four figure tiles at full height, then the two charts &mdash; nothing else fits at four metres.</p>
          <div style={s("display:grid;grid-template-columns:repeat(2,1fr);gap:10px")}>
            {v.tlRows.map((t, i) => (
              <div key={i} style={s(`border:1px dashed #CAC4D0;border-radius:8px;padding:12px 13px;font:400 12px/1.4 Roboto,system-ui,sans-serif;color:${t.c}`)}>{t.n}</div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
