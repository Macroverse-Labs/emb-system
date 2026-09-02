import type { VM } from "../vm";
import { s } from "../style";

/**
 * System-change audit — port of `GC Console HiFi M3.dc.html` template lines 1176–1194.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Audit({ v }: { v: VM }) {
  return (
    <>
      <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
        <div style={s("display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid #CAC4D0")}><span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>Every change to the rules</span><span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F")}>append-only &middot; retained seven years</span><button onClick={v.auExport} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;margin-left:auto;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>Export extract</button></div>
        <div style={s("display:grid;grid-template-columns:1.1fr 1fr 1.2fr 1.5fr 1fr 1fr;padding:0 18px;background:#F7F2FA;border-bottom:1px solid #CAC4D0;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>
          <span style={s("padding:11px 8px 11px 0")}>When</span><span style={s("padding:11px 8px 11px 0")}>Who</span><span style={s("padding:11px 8px 11px 0")}>Change</span><span style={s("padding:11px 8px 11px 0")}>Object</span><span style={s("padding:11px 8px 11px 0")}>From</span><span style={s("padding:11px 0")}>To</span>
        </div>
        {v.auRows.map((a, i) => (
          <div key={i} style={s("display:grid;grid-template-columns:1.1fr 1fr 1.2fr 1.5fr 1fr 1fr;align-items:center;padding:0 18px;border-bottom:1px solid #E6E0E9")}>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F;padding:12px 8px 12px 0")}>{a.t}</span>
            <span style={s("padding:12px 8px 12px 0")}><span style={s(`display:block;font:400 14px/1.3 Roboto,system-ui,sans-serif;color:${a.whoC}`)}>{a.who}</span><span style={s("display:block;font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E;margin-top:2px")}>{a.role}</span></span>
            <span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif;padding:12px 8px 12px 0")}>{a.what}</span>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:12px 8px 12px 0")}>{a.obj}</span>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:12px 8px 12px 0")}>{a.from}</span>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#6750A4;padding:12px 0")}>{a.to}</span>
          </div>
        ))}
      </div>
    </>
  );
}
