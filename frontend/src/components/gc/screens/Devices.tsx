import type { VM } from "../vm";
import { s } from "../style";

/**
 * Devices and connectivity — port of `GC Console HiFi M3.dc.html` template lines 734–762.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Devices({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px")}>
        {v.dvSummary.map((d, i) => (
          <div key={i} style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:14px 16px")}>
            <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F")}>{d.k}</div>
            <div style={s(`font:400 28px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;margin-top:10px;color:${d.c}`)}>{d.v}</div>
          </div>
        ))}
      </div>

      <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;overflow:hidden")}>
        <div style={s("display:grid;grid-template-columns:78px 1fr 1.2fr .8fr .9fr 96px 84px 92px;padding:0 16px;background:#F7F2FA;border-bottom:1px solid #CAC4D0;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>
          <span style={s("padding:11px 8px 11px 0")}>Device</span>
          <span style={s("padding:11px 8px 11px 0")}>Type</span>
          <span style={s("padding:11px 8px 11px 0")}>Location</span>
          <span style={s("padding:11px 8px 11px 0")}>Link</span>
          <span style={s("padding:11px 8px 11px 0")}>State</span>
          <span style={s("padding:11px 8px 11px 0;text-align:right")}>Buffered</span>
          <span style={s("padding:11px 8px 11px 0;text-align:right")}>Last sync</span>
          <span style={s("padding:11px 0;text-align:right")}>&nbsp;</span>
        </div>
        {v.dvRows.map((d, i) => (
          <div key={i} style={s("display:grid;grid-template-columns:78px 1fr 1.2fr .8fr .9fr 96px 84px 92px;align-items:center;padding:0 16px;border-bottom:1px solid #E6E0E9")}>
            <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;padding:12px 8px 12px 0")}>{d.id}</span>
            <span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif;padding:12px 8px 12px 0")}>{d.kind}</span>
            <span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:12px 8px 12px 0")}>{d.loc}</span>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:12px 8px 12px 0")}>{d.link}</span>
            <span style={s("display:flex;align-items:center;gap:6px;padding:12px 8px 12px 0")}>
              <span style={s(`width:6px;height:6px;border-radius:50%;flex:none;background:${d.stc}`)} />
              <span style={s(`font:400 12px/1.2 Roboto,system-ui,sans-serif;color:${d.stc}`)}>{d.stl}</span>
            </span>
            <span style={s(`text-align:right;font:400 14px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;padding:12px 8px 12px 0;color:${d.bufC}`)}>{d.buf}</span>
            <span style={s("text-align:right;font:400 12px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;padding:12px 8px 12px 0")}>{d.sync}</span>
            <span style={s("text-align:right;padding:8px 0")}>
              <button onClick={d.sync2} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 12px;cursor:pointer")}>
                Sync
              </button>
            </span>
          </div>
        ))}
        <div style={s("padding:12px 18px;font:400 12px/1.6 Roboto,system-ui,sans-serif;color:#49454F")}>
          A device on 4G still admits people &mdash; it holds the events and uploads them when the line returns. After 72 hours of buffer it stops admitting anyone.
        </div>
      </div>
    </>
  );
}
