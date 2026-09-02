import type { VM } from "../vm";
import { s } from "../style";

/**
 * Visitor policy — port of `GC Console HiFi M3.dc.html` template lines 1063–1086.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function VPolicy({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:grid;grid-template-columns:1.3fr 1fr;gap:14px;align-items:start")}>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
          <div style={s("display:flex;align-items:center;gap:12px;padding:14px 18px;border-bottom:1px solid #CAC4D0")}>
            <span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>Rules that govern every visit</span>
            <button onClick={v.vpSave} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;margin-left:auto;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>Save policy</button>
          </div>
          {v.vpToggles.map((t, i) => (
            <div key={i} style={s("display:flex;align-items:flex-start;gap:14px;padding:14px 18px;border-bottom:1px solid #E6E0E9")}>
              <span style={s("flex:1")}><span style={s("display:block;font:400 14px/1.4 Roboto,system-ui,sans-serif")}>{t.l}</span><span style={s("display:block;font:400 12px/1.5 Roboto,system-ui,sans-serif;color:#49454F;margin-top:4px")}>{t.s}</span></span>
              <button onClick={t.go} style={s(`flex:none;position:relative;width:44px;height:22px;border-radius:11px;border:0;cursor:pointer;background:${t.bg}`)}><span style={s(`position:absolute;top:2px;left:${t.dot};width:18px;height:18px;border-radius:50%;background:#FEF7FF;transition:left .14s ease`)} /></button>
              <span style={s("width:26px;flex:none;font:400 11px/22px Roboto,system-ui,sans-serif;color:#49454F")}>{t.on}</span>
            </div>
          ))}
        </div>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
          <div style={s("padding:14px 18px;border-bottom:1px solid #CAC4D0")}><span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>Limits</span></div>
          {v.vpLimits.map((l, i) => (
            <div key={i} style={s("display:flex;align-items:center;gap:14px;padding:14px 18px;border-bottom:1px solid #E6E0E9")}>
              <span style={s("flex:1")}><span style={s("display:block;font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{l.k}</span><span style={s("display:block;font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F;margin-top:3px")}>{l.sub}</span></span>
              <span style={s("font:400 22px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums")}>{l.v}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
