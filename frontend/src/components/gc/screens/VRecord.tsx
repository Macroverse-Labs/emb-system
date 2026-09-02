import type { VM } from "../vm";
import { s } from "../style";

/**
 * Visit record — port of `GC Console HiFi M3.dc.html` template lines 1021–1042.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function VRecord({ v }: { v: VM }) {
  return (
    <>
      <button onClick={v.vrecBack} style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#6750A4;background:transparent;border:0;cursor:pointer;padding:0;margin-bottom:12px")}>&larr; Visitors today</button>
      <div style={s("display:grid;grid-template-columns:1fr 1.1fr;gap:14px;align-items:start")}>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:18px 20px")}>
          <div style={s("display:flex;align-items:baseline;gap:12px;margin-bottom:14px")}><span style={s("font:400 24px/1.15 Roboto,system-ui,sans-serif")}>Zulhilmi Aziz</span><span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#B3261E;border:1px solid #B3261E;border-radius:8px;padding:4px 7px")}>Overstayed</span></div>
          {v.vrecFacts.map((f, i) => (
            <div key={i} style={s("display:flex;gap:14px;padding:9px 0;border-top:1px solid #E6E0E9")}><span style={s("width:132px;flex:none;font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F")}>{f.k}</span><span style={s("flex:1;font:400 14px/1.4 Roboto,system-ui,sans-serif")}>{f.v}</span></div>
          ))}
          <button onClick={v.vrecClose} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;margin-top:16px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#B3261E;background:transparent;border:1px solid #B3261E;border-radius:9999px;padding:0 24px;cursor:pointer")}>Close the visit manually</button>
        </div>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:6px 20px 16px")}>
          <div style={s("font:500 16px/1 Roboto,system-ui,sans-serif;padding:14px 0 4px")}>Everything that happened</div>
          {v.vrecEvents.map((e, i) => (
            <div key={i} style={s("display:flex;gap:16px;padding:11px 0;border-top:1px solid #E6E0E9")}>
              <span style={s("width:118px;flex:none;font:400 12px/1.4 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F")}>{e.t}</span>
              <span style={s("flex:1")}><span style={s("display:block;font:400 14px/1.4 Roboto,system-ui,sans-serif")}>{e.e}</span><span style={s("display:block;font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F;margin-top:3px")}>{e.m}</span></span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
