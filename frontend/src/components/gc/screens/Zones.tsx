import type { VM } from "../vm";
import { s } from "../style";

/**
 * Zones &amp; criteria — port of `GC Console HiFi M3.dc.html` template lines 570–625.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Zones({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:grid;grid-template-columns:1fr 380px;gap:14px;align-items:start")}>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;overflow:hidden")}>
          <div style={s("display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #CAC4D0")}>
            <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>Zone hierarchy</span>
            <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#79747E")}>master &rarr; sub &rarr; sub-sub</span>
            <button onClick={v.znPlan} style={s("margin-left:auto;font:400 12px/1 Roboto,system-ui,sans-serif;color:#6750A4;background:transparent;border:0;cursor:pointer")}>Open plan layer &rarr;</button>
          </div>
          <div style={s("display:grid;grid-template-columns:1fr 120px 92px 82px;padding:0 16px;background:#F7F2FA;border-bottom:1px solid #CAC4D0;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>
            <span style={s("padding:10px 0")}>Zone</span><span style={s("padding:10px 0")}>Level</span><span style={s("padding:10px 0;text-align:right")}>Permitted</span><span style={s("padding:10px 0;text-align:right")}>Identity</span>
          </div>
          {v.znTree.map((z, i) => (
            <button key={i} onClick={z.go} style={s(`width:100%;display:grid;grid-template-columns:1fr 120px 92px 82px;align-items:center;border:0;border-bottom:1px solid #E6E0E9;cursor:pointer;text-align:left;padding-right:16px;background:${z.bg};box-shadow:${z.bar}`)}>
              <span style={s(`display:flex;align-items:center;gap:9px;padding:11px 0 11px ${z.pad}`)}><span style={s("width:6px;height:6px;flex:none;border:1px solid #79747E;border-radius:4px")} /><span style={s(`font-family:Roboto,system-ui,sans-serif;font-weight:${z.fw};font-size:${z.fs};line-height:1.3`)}>{z.n}</span></span>
              <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E")}>{z.kind}</span>
              <span style={s("text-align:right;font:400 14px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums")}>{z.pop}</span>
              <span style={s(`text-align:right;font:400 12px/1 Roboto,system-ui,sans-serif;color:${z.faC}`)}>{z.fa}</span>
            </button>
          ))}
          <div style={s("padding:12px 16px")}><button onClick={v.znAdd} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px dashed #6750A4;border-radius:9999px;padding:0 24px;cursor:pointer")}>+ Add a zone under this one</button></div>
        </div>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:18px 20px;display:flex;flex-direction:column;gap:16px")}>
          <div>
            <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E")}>{v.znKind}</div>
            <div style={s("font:400 24px/1.15 Roboto,system-ui,sans-serif;margin-top:7px")}>{v.znName}</div>
            <div style={s("display:flex;gap:18px;margin-top:8px;font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F")}><span>{v.znPop} permitted</span><span>Cap {v.znCap}</span></div>
          </div>
          <div style={s("height:1px;background:#CAC4D0")} />
          <div>
            <div style={s("font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F;margin-bottom:9px")}>Identity check at this zone</div>
            <div style={s("display:flex;gap:8px")}>
              {v.znFaOpts.map((f, i) => (
                <button key={i} onClick={f.go} style={s(`flex:1;padding:10px;border-radius:12px;cursor:pointer;text-align:left;color:${f.fg};border:1px solid ${f.bd};background:${f.bg}`)}><span style={s("display:block;font:400 14px/1.2 Roboto,system-ui,sans-serif")}>{f.label}</span><span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;margin-top:5px;opacity:.7")}>{f.sub}</span></button>
              ))}
            </div>
          </div>
          <div>
            <div style={s("font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F;margin-bottom:9px")}>Minimum criteria to enter</div>
            {v.znReqs.map((r, i) => (
              <button key={i} onClick={r.go} style={s("width:100%;display:flex;align-items:center;gap:10px;padding:7px 0;background:transparent;border:0;border-top:1px solid #E6E0E9;cursor:pointer;text-align:left")}>
                <span style={s(`width:15px;height:15px;flex:none;border-radius:4px;display:flex;align-items:center;justify-content:center;font:400 11px/1 Roboto,system-ui,sans-serif;color:#FEF7FF;border:1px solid ${r.bd};background:${r.bg}`)}>{r.tick}</span>
                <span style={s(`font:400 14px/1.3 Roboto,system-ui,sans-serif;color:${r.fg}`)}>{r.label}</span>
              </button>
            ))}
          </div>
          <div>
            <button onClick={v.znToggleEscort} style={s("width:100%;display:flex;align-items:center;gap:10px;padding:10px 0;background:transparent;border:0;border-top:1px solid #CAC4D0;cursor:pointer;text-align:left")}>
              <span style={s(`width:15px;height:15px;flex:none;border-radius:4px;display:flex;align-items:center;justify-content:center;font:400 11px/1 Roboto,system-ui,sans-serif;color:#FEF7FF;border:1px solid ${v.znEscortBd};background:${v.znEscortBg}`)}>{v.znEscortTick}</span>
              <span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{v.znEscort}</span>
            </button>
          </div>
          <button onClick={v.znSave} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>Save zone</button>
        </div>
      </div>
    </>
  );
}
