import type { VM } from "../vm";
import { s } from "@/components/gc/style";

/**
 * Hours &amp; days — port of `TC Console HiFi M3.dc.html` template lines 525–568.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Hours({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:flex;align-items:center;gap:12px;margin-bottom:14px")}>
        <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;padding:6px 12px;border-radius:8px;background:#E8DEF8;color:#1D192B")}>Week of 24 Aug</span>
        <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F")}>hours come from badge in / out &mdash; a day counts once the worker badges in</span>
        <div style={s("flex:1")} />
        <button onClick={v.hrExport} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>Export CSV</button>
      </div>
      <div style={s("display:grid;grid-template-columns:1fr 306px;gap:14px;align-items:start")}>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;overflow:hidden")}>
          <div style={s("display:grid;grid-template-columns:1.35fr .8fr 200px 150px 96px;padding:0 16px;background:#F7F2FA;border-bottom:1px solid #CAC4D0;font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>
            <span style={s("padding:11px 8px 11px 0")}>WORKER</span><span style={s("padding:11px 8px 11px 0")}>TRADE</span><span style={s("padding:11px 8px 11px 0")}>HOURS THIS WEEK &middot; CAP 60</span><span style={s("padding:11px 8px 11px 0")}>CONSECUTIVE DAYS</span><span style={s("padding:11px 0;text-align:right")}>NOTIFIED</span>
          </div>
          {v.hrRows.map((r, i) => (
            <div key={i} style={s(`display:grid;grid-template-columns:1.35fr .8fr 200px 150px 96px;align-items:center;padding:0 16px;border-bottom:1px solid #E6E0E9;background:${r.bg}`)}>
              <span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif;padding:11px 8px 11px 0")}>{r.n}</span>
              <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:11px 8px 11px 0")}>{r.role}</span>
              <span style={s("display:flex;align-items:center;gap:10px;padding:11px 8px 11px 0")}><span style={s("flex:1;height:8px;border-radius:4px;background:#E6E0E9;overflow:hidden")}><span style={s(`display:block;height:8px;background:${r.barC};width:${r.pct}`)} /></span><span style={s(`width:52px;flex:none;font:400 12px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:${r.barC}`)}>{r.ratio}</span></span>
              <span style={s("padding:11px 8px 11px 0")}><span style={s(`display:inline-flex;font:400 12px/1 Roboto,system-ui,sans-serif;padding:5px 10px;border-radius:8px;color:${r.dayFg};background:${r.dayBg}`)}>{r.days}</span></span>
              <span style={s("text-align:right;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#79747E;padding:11px 0")}>{r.notified}</span>
            </div>
          ))}
          {v.hrEmpty && (
            <div style={s("padding:20px 16px;font:400 13px/1.4 Roboto,system-ui,sans-serif;color:#79747E")}>{v.hrEmptyCopy}</div>
          )}
        </div>
        <div style={s("display:flex;flex-direction:column;gap:14px")}>
          <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px")}>
            <div style={s("font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#79747E")}>THRESHOLDS &mdash; SET BY GC, NOT EDITABLE</div>
            {v.hrThresholds.map((t, i) => (
              <div key={i} style={s("display:flex;align-items:baseline;gap:12px;padding:11px 0;border-top:1px solid #E6E0E9;margin-top:8px")}><span style={s("flex:1;font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F")}>{t.k}</span><span style={s("font:400 22px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums")}>{t.v}</span></div>
            ))}
          </div>
          <div style={s("background:#FEF7FF;border:1px solid #B3261E;border-radius:12px;padding:16px 18px")}>
            <div style={s("font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#B3261E")}>AUTO-BLOCK PREVIEW</div>
            <div style={s("font:400 14px/1.6 Roboto,system-ui,sans-serif;margin:10px 0 14px")}>2 workers will be blocked at the gate on <strong style={s("font-weight:500")}>Fri 28 Aug</strong> unless they rest a day.</div>
            <button onClick={v.hrPlan} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;width:100%;font:500 14px/20px Roboto,system-ui,sans-serif;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;cursor:pointer")}>Plan rest days</button>
          </div>
          <div style={s("background:#F7F2FA;border-radius:12px;padding:16px 18px")}>
            <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#79747E")}>CARD INACTIVITY</div>
            <div style={s("font:400 22px/1 Roboto,system-ui,sans-serif;margin:10px 0 6px")}>4 workers</div>
            <div style={s("font:400 12px/1.5 Roboto,system-ui,sans-serif;color:#49454F")}>Unused 31 days &mdash; access is withdrawn automatically.</div>
            <button onClick={v.goInactive} style={s("margin-top:12px;height:32px;padding:0 14px;border-radius:8px;font:500 13px/1 Roboto,system-ui,sans-serif;color:#6750A4;background:transparent;border:1px solid #79747E;cursor:pointer")}>Review them</button>
          </div>
        </div>
      </div>
    </>
  );
}
