import type { VM } from "../vm";
import { s } from "@/components/gc/style";

/**
 * Training records — port of `TC Console HiFi M3.dc.html` template lines 472–524.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Training({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:flex;align-items:center;gap:12px;margin-bottom:14px")}>
        <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;padding:6px 12px;border-radius:8px;background:#F9DEDC;color:#410E0B")}>2 gaps blocking zone access</span>
        <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F")}>certificates you upload are validated by the GC before they count</span>
        <div style={s("flex:1")} />
        <button onClick={v.trExport} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>Export CSV</button>
        <button onClick={v.trUpload} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>Upload certificate</button>
      </div>
      <div style={s("display:grid;grid-template-columns:1fr 300px;gap:14px;align-items:start")}>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;overflow:hidden")}>
          <div style={s("display:grid;grid-template-columns:1.4fr repeat(5,1fr);padding:0 16px;background:#F7F2FA;border-bottom:1px solid #CAC4D0")}>
            <span style={s("font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F;padding:11px 8px 11px 0")}>WORKER</span>
            {v.trCols.map((c, i) => (
              <span key={i} style={s("font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#49454F;padding:11px 6px;text-align:center")}>{c.t}</span>
            ))}
          </div>
          {v.trRows.map((r, ri) => (
            <div key={ri} style={s("display:grid;grid-template-columns:1.4fr repeat(5,1fr);align-items:center;padding:0 16px;border-bottom:1px solid #E6E0E9")}>
              <span style={s("display:flex;align-items:center;gap:10px;padding:10px 8px 10px 0;min-width:0")}>
                <span style={s("width:26px;height:26px;flex:none;border-radius:50%;background:#E6E0E9;position:relative;overflow:hidden")}><span style={s("position:absolute;left:50%;top:6px;transform:translateX(-50%);width:8px;height:8px;border-radius:50%;background:#AEA9B1")} /><span style={s("position:absolute;left:50%;top:16px;transform:translateX(-50%);width:16px;height:11px;border-radius:8px 8px 0 0;background:#AEA9B1")} /></span>
                <span style={s("min-width:0")}><span style={s("display:block;font:400 14px/1.3 Roboto,system-ui,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{r.n}</span><span style={s("display:block;font:400 11px/1.3 Roboto,system-ui,sans-serif;color:#79747E;margin-top:2px")}>{r.role}</span></span>
              </span>
              {r.cells.map((c, ci) => (
                <span key={ci} style={s(`display:flex;align-items:center;justify-content:center;gap:6px;padding:10px 6px;font:400 11px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:${c.fg};background:${c.bg}`)}><span style={s(`width:7px;height:7px;border-radius:2px;flex:none;background:${c.dot}`)} />{c.v}</span>
              ))}
            </div>
          ))}
          {v.trEmpty && (
            <div style={s("padding:20px 16px;font:400 13px/1.4 Roboto,system-ui,sans-serif;color:#79747E")}>{v.trEmptyCopy}</div>
          )}
          <div style={s("display:flex;align-items:center;gap:20px;padding:12px 16px;background:#F7F2FA")}>
            <span style={s("display:flex;align-items:center;gap:7px;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#49454F")}><span style={s("width:7px;height:7px;border-radius:2px;background:#146C2E")} />HELD &middot; EXPIRY SHOWN</span>
            <span style={s("display:flex;align-items:center;gap:7px;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#49454F")}><span style={s("width:7px;height:7px;border-radius:2px;background:#B3261E")} />EXPIRING OR EXPIRED</span>
            <span style={s("display:flex;align-items:center;gap:7px;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#49454F")}><span style={s("width:7px;height:7px;border-radius:2px;background:#CAC4D0")} />NOT HELD</span>
          </div>
        </div>
        <div style={s("display:flex;flex-direction:column;gap:14px")}>
          <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px")}>
            <div style={s("font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#79747E;margin-bottom:4px")}>WHAT EACH ZONE DEMANDS &mdash; SET BY GC</div>
            {v.trZones.map((z, i) => (
              <div key={i} style={s("padding:12px 0;border-top:1px solid #E6E0E9")}>
                <div style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{z.n}</div>
                <div style={s("font:400 11px/1.4 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E;margin-top:4px")}>{z.req}</div>
                <div style={s(`font:400 12px/1.4 Roboto,system-ui,sans-serif;color:${z.c};margin-top:6px`)}>{z.gap}</div>
              </div>
            ))}
          </div>
          <div style={s("background:#F7F2FA;border-radius:12px;padding:16px 18px")}>
            <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#79747E")}>BOOK EXTERNAL TRAINING?</div>
            <div style={s("font:400 13px/1.5 Roboto,system-ui,sans-serif;color:#49454F;margin-top:8px")}>The GC publishes course dates alongside induction slots.</div>
            <button onClick={v.goInductions} style={s("margin-top:12px;height:32px;padding:0 14px;border-radius:8px;font:500 13px/1 Roboto,system-ui,sans-serif;color:#6750A4;background:transparent;border:1px solid #79747E;cursor:pointer")}>Open inductions</button>
          </div>
        </div>
      </div>
    </>
  );
}
