import type { VM } from "../vm";
import { s } from "../style";

/**
 * Notifications — port of `GC Console HiFi M3.dc.html` template lines 1259–1278.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Notifications({ v }: { v: VM }) {
  return (
    <>
      <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;overflow:hidden")}>
        <div style={s("display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid #CAC4D0")}><span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>Who hears it, and on what</span><span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F")}>click a channel to switch it</span><button onClick={v.nfSave} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;margin-left:auto;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>Save</button></div>
        <div style={s("display:grid;grid-template-columns:1.4fr 1.2fr 1.5fr repeat(3,78px);background:#F7F2FA;border-bottom:1px solid #CAC4D0;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>
          <span style={s("padding:11px 18px")}>Event</span><span style={s("padding:11px 8px")}>When</span><span style={s("padding:11px 8px")}>Recipients</span>
          {v.nfChannels.map((c, i) => (
            <span key={i} style={s("padding:11px 0;text-align:center")}>{c}</span>
          ))}
        </div>
        {v.nfRows.map((n, i) => (
          <div key={i} style={s("display:grid;grid-template-columns:1.4fr 1.2fr 1.5fr repeat(3,78px);align-items:center;border-bottom:1px solid #E6E0E9")}>
            <span style={s("padding:11px 18px;font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{n.ev}</span>
            <span style={s("padding:11px 8px;font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F")}>{n.when}</span>
            <span style={s("padding:11px 8px;font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F")}>{n.who}</span>
            {n.cells.map((c, j) => (
              <button key={j} onClick={c.go} style={s(`border:0;border-left:1px solid #E6E0E9;cursor:pointer;font:400 14px/1 Roboto,system-ui,sans-serif;padding:10px 0;color:${c.c};background:${c.bg}`)}>{c.mark}</button>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
