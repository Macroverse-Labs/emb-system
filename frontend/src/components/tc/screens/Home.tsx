import type { VM } from "../vm";
import { s } from "@/components/gc/style";

/**
 * Home — port of `TC Console HiFi M3.dc.html` template lines 100–143.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Home({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:flex;align-items:center;gap:12px;margin-bottom:16px")}>
        <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>EVERY ROW NAMES THE CONSEQUENCE AND WHEN IT LANDS</span>
        <div style={s("flex:1;height:1px;background:#CAC4D0")} />
        <button onClick={v.goInductions} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>Book inductions</button>
        <button onClick={v.goAdd} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>Add a worker</button>
      </div>
      <div style={s("display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:14px")}>
        {v.hmTiles.map((t, i) => (
          <div key={i} style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px 18px")}>
            <div style={s("font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F")}>{t.k}</div>
            <div style={s(`font:400 45px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;margin:12px 0 10px;color:${t.c}`)}>{t.v}</div>
            <div style={s("height:3px;background:#E6E0E9;border-radius:4px;overflow:hidden")}><div style={s(`height:3px;background:${t.c};width:${t.pct}`)} /></div>
            <div style={s("font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F;margin-top:9px")}>{t.sub}</div>
          </div>
        ))}
      </div>
      <div style={s("display:grid;grid-template-columns:1.45fr 1fr;gap:14px;align-items:start")}>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
          <div style={s("display:flex;align-items:baseline;gap:10px;padding:14px 18px 12px;border-bottom:1px solid #CAC4D0")}><span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>Needs your action</span><span style={s("margin-left:auto;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#79747E")}>SOONEST CONSEQUENCE FIRST</span></div>
          {v.hmQueue.map((q, i) => (
            <button key={i} onClick={q.go} style={s("width:100%;display:flex;align-items:center;gap:14px;padding:12px 18px;background:transparent;border:0;border-top:1px solid #E6E0E9;cursor:pointer;text-align:left")}>
              <span style={s(`width:3px;align-self:stretch;flex:none;border-radius:2px;background:${q.c}`)} />
              <span style={s("flex:1;min-width:0")}><span style={s("display:block;font:400 14px/1.4 Roboto,system-ui,sans-serif;color:#1D1B20")}>{q.t}</span><span style={s("display:block;font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F;margin-top:2px")}>{q.s}</span></span>
              <span style={s("flex:none;font:500 13px/1 Roboto,system-ui,sans-serif;color:#6750A4;border:1px solid #CAC4D0;border-radius:8px;padding:7px 12px")}>{q.a}</span>
              <span style={s(`width:70px;flex:none;text-align:right;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:${q.c}`)}>{q.w}</span>
            </button>
          ))}
        </div>
        {v.showNotices && (
          <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
            <div style={s("display:flex;align-items:baseline;gap:10px;padding:14px 16px 12px;border-bottom:1px solid #CAC4D0")}><span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>From the GC</span><span style={s("margin-left:auto;font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F")}>nothing for you to do</span></div>
            {v.hmGc.map((n, i) => (
              <div key={i} style={s("display:flex;align-items:flex-start;gap:10px;padding:11px 16px;border-top:1px solid #E6E0E9")}>
                <span style={s("flex:1;min-width:0")}><span style={s("display:block;font:400 14px/1.4 Roboto,system-ui,sans-serif")}>{n.t}</span><span style={s("display:block;font:400 11px/1.4 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E;margin-top:3px")}>{n.s}</span></span>
                <span style={s("flex:none;font:400 12px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#79747E")}>{n.ago}</span>
              </div>
            ))}
            <div style={s("padding:11px 16px;border-top:1px solid #CAC4D0;font:400 11px/1.4 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#79747E")}>EVERY ITEM HERE ALSO ARRIVED BY EMAIL</div>
          </div>
        )}
      </div>
    </>
  );
}
