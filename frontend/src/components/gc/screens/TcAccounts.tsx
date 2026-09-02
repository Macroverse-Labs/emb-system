import type { VM } from "../vm";
import { s } from "../style";

/**
 * Contractor accounts — port of `GC Console HiFi M3.dc.html` template lines 1228–1247.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function TcAccounts({ v }: { v: VM }) {
  return (
    <>
      <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
        <div style={s("display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid #CAC4D0")}><span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>Trade contractor logins</span><span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F")}>they upload; they never validate</span><button onClick={v.tcNew} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;margin-left:auto;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>Issue a login</button></div>
        <div style={s("display:grid;grid-template-columns:1.4fr 1.1fr 1.5fr 1.6fr 1fr 74px 104px;padding:0 18px;background:#F7F2FA;border-bottom:1px solid #CAC4D0;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>
          <span style={s("padding:11px 8px 11px 0")}>Company</span><span style={s("padding:11px 8px 11px 0")}>Account holder</span><span style={s("padding:11px 8px 11px 0")}>Email</span><span style={s("padding:11px 8px 11px 0")}>Standing</span><span style={s("padding:11px 8px 11px 0")}>Last sign-in</span><span style={s("padding:11px 8px 11px 0;text-align:right")}>Users</span><span style={s("padding:11px 0;text-align:right")}>&nbsp;</span>
        </div>
        {v.tcRows.map((t, i) => (
          <div key={i} style={s("display:grid;grid-template-columns:1.4fr 1.1fr 1.5fr 1.6fr 1fr 74px 104px;align-items:center;padding:0 18px;border-bottom:1px solid #E6E0E9")}>
            <span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif;padding:12px 8px 12px 0")}>{t.co}</span>
            <span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif;padding:12px 8px 12px 0")}>{t.who}</span>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:12px 8px 12px 0")}>{t.email}</span>
            <span style={s("display:flex;align-items:center;gap:7px;padding:12px 8px 12px 0")}><span style={s(`width:6px;height:6px;flex:none;border-radius:50%;background:${t.c}`)} /><span style={s(`font:400 12px/1.3 Roboto,system-ui,sans-serif;color:${t.c}`)}>{t.st}</span></span>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F;padding:12px 8px 12px 0")}>{t.seen}</span>
            <span style={s("text-align:right;font:400 14px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;padding:12px 8px 12px 0")}>{t.users}</span>
            <span style={s("text-align:right;padding:8px 0")}><button onClick={t.doAct} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 12px;cursor:pointer")}>{t.act}</button></span>
          </div>
        ))}
      </div>
    </>
  );
}
