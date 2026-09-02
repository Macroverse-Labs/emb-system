import type { VM } from "../vm";
import { s } from "../style";

/**
 * Reports — port of `GC Console HiFi M3.dc.html` template lines 1123–1138.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Reports({ v }: { v: VM }) {
  return (
    <>
      <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
        <div style={s("display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid #CAC4D0")}><span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>Schedules</span><span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F")}>a report nobody has to remember to run</span><button onClick={v.rpNew} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;margin-left:auto;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>New schedule</button></div>
        {v.rpSchedules.map((r, i) => (
          <div key={i} onClick={r.go} style={s("display:grid;grid-template-columns:1.5fr 1.1fr .8fr 1.8fr 1.1fr 92px;align-items:center;padding:0 18px;border-bottom:1px solid #E6E0E9;cursor:pointer")}>
            <span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif;padding:14px 8px 14px 0")}>{r.n}</span>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:14px 8px 14px 0")}>{r.when}</span>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:14px 8px 14px 0")}>{r.fmt}</span>
            <span style={s("font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F;padding:14px 8px 14px 0")}>{r.to}</span>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:14px 8px 14px 0")}>{r.last}</span>
            <span style={s("text-align:right;padding:8px 0")}><button onClick={r.run} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 12px;cursor:pointer")}>Run now</button></span>
          </div>
        ))}
      </div>
    </>
  );
}
