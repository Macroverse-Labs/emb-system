import type { VM } from "../vm";
import { s } from "../style";

/**
 * Inductions — port of `GC Console HiFi M3.dc.html` template lines 809–833.
 *
 * The design names the session loop variable `s`, which would shadow the `s()`
 * style helper; it is `sess` here. Style strings are otherwise copied from the
 * design character-for-character and passed through `s()`; do not "tidy" them,
 * or the port stops matching the canvas.
 */
export default function Inductions({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:grid;grid-template-columns:1.15fr 1fr;gap:14px;align-items:start")}>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
          <div style={s("display:flex;align-items:center;gap:12px;padding:13px 18px;border-bottom:1px solid #CAC4D0")}>
            <span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>Sessions</span>
            <button onClick={v.inNew} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;margin-left:auto;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>New session</button>
          </div>
          {v.inSessions.map((sess, i) => (
            <button key={i} onClick={sess.go} style={s("width:100%;display:flex;align-items:center;gap:14px;padding:14px 18px;background:transparent;border:0;border-bottom:1px solid #E6E0E9;cursor:pointer;text-align:left")}>
              <span style={s("flex:1;min-width:0")}>
                <span style={s("display:flex;align-items:baseline;gap:10px")}>
                  <span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{sess.when}</span>
                  <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#79747E")}>{sess.id}</span>
                </span>
                <span style={s("display:block;font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F;margin-top:4px")}>{sess.where} &middot; {sess.by}</span>
              </span>
              <span style={s("width:120px;flex:none")}>
                <span style={s("display:flex;justify-content:space-between;font:400 12px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F")}>
                  <span>{sess.booked} booked</span>
                  <span>{sess.cap}</span>
                </span>
                <span style={s("display:block;height:6px;background:#E6E0E9;border-radius:4px;margin-top:6px;overflow:hidden")}>
                  <span style={s(`display:block;height:6px;background:#6750A4;width:${sess.pct}`)} />
                </span>
              </span>
              <span style={s(`width:88px;flex:none;text-align:right;font:400 12px/1.3 Roboto,system-ui,sans-serif;color:${sess.stc}`)}>{sess.stl}</span>
            </button>
          ))}
        </div>

        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
          <div style={s("padding:13px 18px;border-bottom:1px solid #CAC4D0")}>
            <span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>IND-91 &middot; attendance</span>
            <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F;margin-left:10px")}>card and face enrolled in the same sitting</span>
          </div>
          {v.inAttend.map((a, i) => (
            <div key={i} style={s("display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid #E6E0E9")}>
              <span style={s("width:26px;height:26px;flex:none;border-radius:50%;background:#E6E0E9;position:relative;overflow:hidden")}>
                <span style={s("position:absolute;left:50%;top:5px;transform:translateX(-50%);width:9px;height:9px;border-radius:50%;background:#AEA9B1")} />
                <span style={s("position:absolute;left:50%;top:16px;transform:translateX(-50%);width:17px;height:11px;border-radius:9px 9px 0 0;background:#AEA9B1")} />
              </span>
              <span style={s("flex:1;min-width:0")}>
                <span style={s("display:block;font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{a.n}</span>
                <span style={s("display:block;font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;margin-top:2px")}>{a.co}</span>
              </span>
              <span style={s(`flex:none;font:400 12px/1.3 Roboto,system-ui,sans-serif;color:${a.c}`)}>{a.st}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
