import type { VM } from "../vm";
import { s } from "../style";

/**
 * Users &amp; access rights — port of `GC Console HiFi M3.dc.html` template lines 1195–1227.
 */
export default function Users({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:grid;grid-template-columns:1fr 1.15fr;gap:14px;align-items:start")}>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
          <div style={s("display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid #CAC4D0")}>
            <span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>People with a login</span>
            <button onClick={v.usInvite} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;margin-left:auto;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>
              Invite
            </button>
          </div>
          {v.usRows.map((u, i) => (
            <button key={i} onClick={u.go} style={s("width:100%;display:flex;align-items:center;gap:12px;padding:13px 18px;background:transparent;border:0;border-bottom:1px solid #E6E0E9;cursor:pointer;text-align:left")}>
              <span style={s("width:28px;height:28px;flex:none;border-radius:50%;background:#E6E0E9;position:relative;overflow:hidden")}>
                <span style={s("position:absolute;left:50%;top:6px;transform:translateX(-50%);width:9px;height:9px;border-radius:50%;background:#AEA9B1")} />
                <span style={s("position:absolute;left:50%;top:17px;transform:translateX(-50%);width:18px;height:12px;border-radius:9px 9px 0 0;background:#AEA9B1")} />
              </span>
              <span style={s("flex:1;min-width:0")}>
                <span style={s("display:block;font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{u.n}</span>
                <span style={s("display:block;font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;margin-top:2px")}>{u.co}</span>
              </span>
              <span style={s(`font:400 12px/1.3 Roboto,system-ui,sans-serif;color:${u.roleC}`)}>{u.role}</span>
              <span style={s("width:96px;flex:none;text-align:right;font:400 12px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#79747E")}>{u.seen}</span>
            </button>
          ))}
        </div>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;overflow:hidden")}>
          <div style={s("display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid #CAC4D0")}>
            <span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>What each role may do</span>
            <button onClick={v.usSave} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;margin-left:auto;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>
              Save rights
            </button>
          </div>
          <div style={s("display:grid;grid-template-columns:1.5fr repeat(4,1fr);background:#F7F2FA;border-bottom:1px solid #CAC4D0")}>
            <span style={s("padding:11px 18px;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>Capability</span>
            {v.usRoles.map((r, i) => (
              <span key={i} style={s("padding:11px 6px;font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;text-align:center")}>{r}</span>
            ))}
          </div>
          {v.usGrid.map((g, i) => (
            <div key={i} style={s("display:grid;grid-template-columns:1.5fr repeat(4,1fr);border-bottom:1px solid #E6E0E9")}>
              <span style={s("padding:11px 18px;font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{g.cap}</span>
              {g.cells.map((c, j) => (
                <button key={j} onClick={c.go} style={s(`border:0;border-left:1px solid #E6E0E9;cursor:pointer;font:400 14px/1 Roboto,system-ui,sans-serif;padding:9px 0;color:${c.c};background:${c.bg}`)}>{c.mark}</button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
