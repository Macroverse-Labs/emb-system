import type { VM } from "../vm";
import { s } from "../style";

/**
 * Zone plan layer — port of `GC Console HiFi M3.dc.html` template lines 626–670.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Plan({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:flex;align-items:center;gap:10px;margin-bottom:14px")}>
        <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>Level</span>
        <div style={s("display:flex;gap:6px")}>
          {v.plLevels.map((l, i) => (
            <button key={i} onClick={l.go} style={s(`font:400 12px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;padding:7px 12px;border-radius:12px;cursor:pointer;color:${l.fg};border:1px solid ${l.bd};background:${l.bg}`)}>{l.label}</button>
          ))}
        </div>
        <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#79747E;margin-left:8px")}>Drag on the drawing to cut a new zone shape</span>
        <button onClick={v.plUpload} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;margin-left:auto;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>Replace drawing</button>
        <button onClick={v.plReset} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>Revert</button>
        <button onClick={v.plSave} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>Save layer</button>
      </div>
      <div style={s("display:grid;grid-template-columns:1fr 300px;gap:14px;align-items:start")}>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:14px")}>
          <div onMouseDown={v.plDown} onMouseMove={v.plMove} onMouseUp={v.plUp} style={s("position:relative;aspect-ratio:1.7;background:#F7F2FA;border:1px solid #CAC4D0;cursor:crosshair;overflow:hidden;user-select:none")}>
            <div style={s("position:absolute;inset:0;background:linear-gradient(90deg,#F7F2FA 1px,transparent 1px) 0 0/40px 40px,linear-gradient(#F7F2FA 1px,transparent 1px) 0 0/40px 40px")} />
            <div style={s("position:absolute;left:6%;top:8%;right:8%;bottom:10%;border:1.5px solid #79747E")} />
            <div style={s("position:absolute;left:6%;top:44%;width:52%;height:1.5px;background:#CAC4D0")} />
            <div style={s("position:absolute;left:46%;top:8%;width:1.5px;height:36%;background:#CAC4D0")} />
            <div style={s("position:absolute;left:14px;bottom:12px;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E")}>Level {v.plLevel} &middot; general arrangement, rev C</div>
            {v.plShapes.map((sh, i) => (
              <div key={i} onClick={sh.go} style={s(`position:absolute;left:${sh.left};top:${sh.top};width:${sh.w};height:${sh.h};border:1.5px solid ${sh.c};background:${sh.bg};display:flex;align-items:flex-start;justify-content:flex-start;padding:6px 8px;cursor:pointer`)}>
                <span style={s(`font:400 12px/1.2 Roboto,system-ui,sans-serif;color:${sh.c};background:#FEF7FF;padding:2px 5px`)}>{sh.n}</span>
              </div>
            ))}
            {v.plDrawing && (
              <>
                <div style={s(`position:absolute;left:${v.plDx};top:${v.plDy};width:${v.plDw};height:${v.plDh};border:1.5px dashed #6750A4;background:#E8DEF8`)} />
              </>
            )}
          </div>
        </div>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
          <div style={s("padding:13px 16px;border-bottom:1px solid #CAC4D0;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>Shapes on this level</div>
          {v.plList.map((p, i) => (
            <div key={i} onClick={p.go} style={s(`display:flex;align-items:center;gap:10px;padding:11px 16px;border-bottom:1px solid #E6E0E9;cursor:pointer;background:${p.bg}`)}>
              <span style={s(`width:9px;height:9px;flex:none;border:1.5px solid ${p.c}`)} />
              <span style={s("flex:1;min-width:0")}><span style={s("display:block;font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{p.n}</span><span style={s("display:block;font:400 11px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#79747E;margin-top:2px")}>{p.area}</span></span>
              <button onClick={p.del} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#49454F;background:transparent;border:1px solid #CAC4D0;border-radius:9999px;padding:0 12px;cursor:pointer")}>Remove</button>
            </div>
          ))}
          <div style={s("padding:12px 16px;font:400 12px/1.6 Roboto,system-ui,sans-serif;color:#49454F")}>A shape is only a drawing. Access still comes from the zone&rsquo;s own criteria and the readers bound to it.</div>
        </div>
      </div>
    </>
  );
}
