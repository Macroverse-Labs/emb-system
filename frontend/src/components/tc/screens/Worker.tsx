import type { VM } from "../vm";
import { s } from "@/components/gc/style";

/**
 * Worker record — port of `TC Console HiFi M3.dc.html` template lines 195–301.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Worker({ v }: { v: VM }) {
  // Only reachable from a register row, so an empty register means there is no record
  // to draw at all — say so rather than render a card full of blanks.
  if (v.wpEmpty) {
    return <div style={s("padding:20px 0;font:400 13px/1.4 Roboto,system-ui,sans-serif;color:#79747E")}>{v.wpEmptyCopy}</div>;
  }
  return (
    <>
      <button onClick={v.goWorkers} style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#6750A4;background:transparent;border:0;cursor:pointer;padding:0;margin-bottom:12px")}>&larr; My workers</button>
      <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:20px 22px;display:flex;gap:22px;align-items:flex-start;margin-bottom:14px")}>
        <span style={s("width:78px;height:96px;flex:none;border-radius:8px;background:#E6E0E9;border:6px solid #ECE6F0;outline:1px solid #CAC4D0;position:relative;overflow:hidden")}><span style={s("position:absolute;left:50%;top:18px;transform:translateX(-50%);width:26px;height:26px;border-radius:50%;background:#AEA9B1")} /><span style={s("position:absolute;left:50%;top:52px;transform:translateX(-50%);width:52px;height:34px;border-radius:26px 26px 0 0;background:#AEA9B1")} /></span>
        <div style={s("flex:1;min-width:0")}>
          <div style={s("display:flex;align-items:baseline;gap:12px")}><h2 style={s("font:400 28px/1.1 Roboto,system-ui,sans-serif;margin:0")}>{v.wpName}</h2><span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F")}>{v.wpId}</span></div>
          <div style={s("display:flex;flex-wrap:wrap;gap:0 22px;margin-top:10px;font:400 14px/1.6 Roboto,system-ui,sans-serif;color:#49454F")}><span>{v.wpRole}</span><span>{v.wpEmp}</span><span>{v.wpProj}</span><span>{v.wpSeen}</span></div>
          <div style={s("display:flex;align-items:center;gap:8px;margin-top:12px;flex-wrap:wrap")}>
            <span style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#79747E")}>ZONES &mdash; SET BY GC</span>
            {v.wpZones.map((z, i) => (
              <span key={i} style={s(`font:400 12px/1 Roboto,system-ui,sans-serif;padding:5px 10px;border-radius:8px;color:${z.fg};background:${z.bg};border:1px solid ${z.bd}`)}>{z.t}</span>
            ))}
          </div>
        </div>
        <div style={s("flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:12px")}>
          <div style={s(`display:flex;align-items:center;gap:8px;padding:7px 12px;border-radius:9999px;border:1px solid ${v.wpStC}`)}><span style={s(`width:7px;height:7px;border-radius:50%;background:${v.wpStC}`)} /><span style={s(`font:400 14px/1 Roboto,system-ui,sans-serif;color:${v.wpStC}`)}>{v.wpStL}</span></div>
          <div style={s("display:flex;gap:8px")}>
            <button onClick={v.wpWithdraw} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>Withdraw access</button>
            <button onClick={v.wpLeaver} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>Mark as leaver</button>
          </div>
        </div>
      </div>
      <div style={s("display:grid;grid-template-columns:270px 1fr;gap:14px;align-items:start")}>
        <div style={s("display:flex;flex-direction:column;gap:14px")}>
          <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px")}>
            <div style={s("font:500 16px/1 Roboto,system-ui,sans-serif;margin-bottom:12px")}>Worker information</div>
            {v.wpFacts.map((f, i) => (
              <div key={i} style={s("display:flex;gap:12px;padding:8px 0;border-top:1px solid #E6E0E9")}><span style={s("width:104px;flex:none;font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F")}>{f.k}</span><span style={s("flex:1;font:400 13px/1.4 Roboto,system-ui,sans-serif")}>{f.v}</span></div>
            ))}
          </div>
          <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px")}>
            <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#79747E")}>VIOLATIONS &mdash; RECORDED BY GC</div>
            <div style={s("font:400 24px/1 Roboto,system-ui,sans-serif;margin:12px 0 6px")}>1 of 3 warnings</div>
            <div style={s("font:400 12px/1.5 Roboto,system-ui,sans-serif;color:#49454F")}>No high-visibility vest in Zone B &middot; 20 Aug 2026. You can read it; only the GC can add or withdraw one.</div>
          </div>
        </div>
        <div>
          <div style={s("display:flex;gap:20px;border-bottom:1px solid #CAC4D0;margin-bottom:16px")}>
            {v.wpTabs.map((t, i) => (
              <button key={i} onClick={t.go} style={s(`padding:0 0 9px;background:transparent;border:0;border-bottom:2px solid ${t.bd};cursor:pointer;font:400 14px/1 Roboto,system-ui,sans-serif;color:${t.fg}`)}>{t.label}</button>
            ))}
          </div>
          {v.wt_documents && (
            <>
              <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;overflow:hidden;margin-bottom:14px")}>
                <div style={s("display:grid;grid-template-columns:1.4fr 1fr .9fr 1fr 104px;padding:0 16px;background:#F7F2FA;border-bottom:1px solid #CAC4D0;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>
                  <span style={s("padding:11px 8px 11px 0")}>DOCUMENT</span><span style={s("padding:11px 8px 11px 0")}>NUMBER</span><span style={s("padding:11px 8px 11px 0")}>EXPIRY</span><span style={s("padding:11px 8px 11px 0")}>STATE</span><span style={s("padding:11px 0;text-align:right")}>YOURS</span>
                </div>
                {v.wpDocs.map((d, i) => (
                  <div key={i} style={s(`display:grid;grid-template-columns:1.4fr 1fr .9fr 1fr 104px;align-items:center;padding:0 16px;border-bottom:1px solid #E6E0E9;background:${d.bg}`)}>
                    <span style={s(`font:400 14px/1.3 Roboto,system-ui,sans-serif;padding:12px 8px 12px 0;color:${d.tc}`)}>{d.t}</span>
                    <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F;padding:12px 8px 12px 0")}>{d.no}</span>
                    <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;padding:12px 8px 12px 0")}>{d.exp}</span>
                    <span style={s("padding:12px 8px 12px 0")}><span style={s(`display:inline-flex;align-items:center;gap:6px;font:400 12px/1.3 Roboto,system-ui,sans-serif;color:${d.stc}`)}><span style={s(`width:6px;height:6px;border-radius:50%;background:${d.stc}`)} />{d.stl}</span></span>
                    <span style={s("text-align:right;padding:8px 0")}><button onClick={d.go} style={s(`height:32px;padding:0 14px;border-radius:8px;font:500 13px/1 Roboto,system-ui,sans-serif;color:${d.btnFg};background:transparent;border:1px solid ${d.btnBd};cursor:pointer`)}>{d.action}</button></span>
                  </div>
                ))}
              </div>
              <div style={s("background:#FEF7FF;border:1px solid #B3261E;border-radius:12px;padding:16px 18px")}>
                <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#B3261E")}>WHY THE WORK VISA WAS REJECTED &mdash; GC COMPLIANCE, 21 AUG</div>
                <div style={s("font:400 14px/1.6 Roboto,system-ui,sans-serif;margin:10px 0 14px;max-width:640px")}>Scan is cropped; the expiry line and the holder&rsquo;s name are not both legible in one image.</div>
                <div style={s("display:flex;align-items:center;gap:14px")}><button onClick={v.goDocs} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>Upload replacement</button><span style={s("font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F")}>Re-validation is usually within one working day. You can edit uploads and contact details &mdash; zones, training records and violations are GC-owned.</span></div>
              </div>
            </>
          )}
          {v.wt_training && (
            <div style={s("display:grid;grid-template-columns:repeat(2,1fr);gap:12px")}>
              {v.wpTraining.map((t, i) => (
                <div key={i} style={s(`background:#FEF7FF;border:1px solid #CAC4D0;border-left:3px solid ${t.bd};border-radius:12px;padding:14px 16px`)}>
                  <div style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{t.t}</div>
                  <div style={s("display:flex;align-items:baseline;gap:8px;margin-top:10px")}><span style={s(`font:400 12px/1 Roboto,system-ui,sans-serif;color:${t.stc}`)}>{t.stl}</span><span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F")}>{t.exp}</span></div>
                  <div style={s("font:400 11px/1.4 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E;margin-top:8px")}>{t.zone}</div>
                </div>
              ))}
            </div>
          )}
          {v.wt_hours && (
            <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px 20px")}>
              <div style={s("display:flex;align-items:baseline;gap:12px;margin-bottom:18px")}><span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>Week of 24 Aug</span><span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F")}>from badge in / out, not timesheets</span><span style={s("margin-left:auto;font:400 24px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#7A5900")}>{v.wpWeek}</span></div>
              <div style={s("display:flex;align-items:flex-end;gap:10px;height:140px")}>
                {v.wpDays.map((d, i) => (
                  <div key={i} style={s("flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;height:100%;justify-content:flex-end")}>
                    <span style={s("font:400 11px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F")}>{d.h}</span>
                    <div style={s(`width:100%;border-radius:4px;background:${d.c};height:${d.pct}`)} />
                    <span style={s("font:400 11px/1 Roboto,system-ui,sans-serif;color:#79747E")}>{d.d}</span>
                  </div>
                ))}
              </div>
              <div style={s("display:flex;gap:26px;margin-top:20px;padding-top:16px;border-top:1px solid #E6E0E9")}>
                {v.wpHourFacts.map((h, i) => (
                  <div key={i}><div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#79747E")}>{h.k}</div><div style={s(`font:400 22px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;margin:8px 0 4px;color:${h.c}`)}>{h.v}</div><div style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F")}>{h.sub}</div></div>
                ))}
              </div>
            </div>
          )}
          {v.wt_history && (
            <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:6px 18px 14px")}>
              {v.wpTimeline.map((e, i) => (
                <div key={i} style={s("display:flex;gap:16px;padding:12px 0;border-bottom:1px solid #E6E0E9")}>
                  <span style={s("width:120px;flex:none;font:400 12px/1.4 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F")}>{e.t}</span>
                  <span style={s("flex:1;min-width:0")}><span style={s("display:block;font:400 14px/1.4 Roboto,system-ui,sans-serif")}>{e.e}</span><span style={s("display:block;font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#79747E;margin-top:2px")}>{e.m}</span></span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
