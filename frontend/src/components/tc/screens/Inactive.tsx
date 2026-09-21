import type { VM } from "../vm";
import { s } from "@/components/gc/style";

/**
 * Inactive workers — port of `TC Console HiFi M3.dc.html` template lines 617–663.
 *
 * The 31-day clock before it fires: three counters, the register of who is close,
 * and the one panel where the contractor says what is actually going on.
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Inactive({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:grid;grid-template-columns:1fr 300px;gap:14px;align-items:start")}>
        <div>
          <div style={s("display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:14px")}>
            {v.iaStats.map((st, i) => (
              <div key={i} style={s(`background:#FEF7FF;border:1px solid ${st.bd};border-radius:12px;padding:16px 18px`)}>
                <div style={s(`font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:${st.c}`)}>{st.k}</div>
                <div style={s(`font:400 36px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;margin:12px 0 8px;color:${st.c}`)}>{st.v}</div>
                <div style={s("font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F")}>{st.sub}</div>
              </div>
            ))}
          </div>
          <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;overflow:hidden")}>
            <div style={s("display:grid;grid-template-columns:36px 1.5fr .8fr .55fr .8fr 1fr;padding:0 16px;background:#F7F2FA;border-bottom:1px solid #CAC4D0;font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F;align-items:center")}>
              <span />
              <span style={s("padding:11px 8px 11px 0")}>WORKER</span>
              <span style={s("padding:11px 8px 11px 0")}>LAST BADGE</span>
              <span style={s("padding:11px 8px 11px 0")}>DAYS</span>
              <span style={s("padding:11px 8px 11px 0")}>BLOCKS</span>
              <span style={s("padding:11px 0")}>STATUS</span>
            </div>
            {v.iaRows.map((r, i) => (
              <div key={i} style={s(`display:grid;grid-template-columns:36px 1.5fr .8fr .55fr .8fr 1fr;align-items:center;padding:0 16px;border-bottom:1px solid #E6E0E9;background:${r.bg}`)}>
                <button onClick={r.pick} style={s(`width:15px;height:15px;border-radius:4px;cursor:pointer;font:400 11px/1 Roboto,system-ui,sans-serif;color:#FEF7FF;display:flex;align-items:center;justify-content:center;border:1px solid ${r.bd};background:${r.box}`)}>{r.tick}</button>
                <span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif;padding:11px 8px 11px 0")}>{r.n}</span>
                <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F;padding:11px 8px 11px 0")}>{r.last}</span>
                <span style={s(`font:400 14px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:${r.dc};padding:11px 8px 11px 0`)}>{r.days}</span>
                <span style={s(`font:400 12px/1.3 Roboto,system-ui,sans-serif;color:${r.dc};padding:11px 8px 11px 0`)}>{r.blocks}</span>
                <span style={s("padding:11px 0")}>
                  <span style={s(`display:inline-flex;font:400 12px/1 Roboto,system-ui,sans-serif;padding:5px 10px;border-radius:8px;color:${r.stFg};background:${r.stBg}`)}>{r.st}</span>
                </span>
              </div>
            ))}
            {v.iaEmpty && (
              <div style={s("padding:20px 16px;font:400 13px/1.4 Roboto,system-ui,sans-serif;color:#79747E")}>{v.iaEmptyCopy}</div>
            )}
            <div style={s("padding:12px 16px;background:#F7F2FA;font:400 11px/1.4 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#79747E")}>AT 31 DAYS THE CARD IS BLOCKED AUTOMATICALLY &mdash; ONLY THE GC CAN REINSTATE IT</div>
          </div>
        </div>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px")}>
          <div style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>{v.iaSelLabel}</div>
          <div style={s("font:400 11px/1.4 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E;margin:8px 0 14px")}>WHAT DO YOU WANT TO SAY?</div>
          {v.iaChoices.map((c, i) => (
            <button key={i} onClick={c.go} style={s(`width:100%;display:flex;gap:12px;align-items:flex-start;padding:12px;margin-bottom:8px;border-radius:12px;cursor:pointer;text-align:left;border:1px solid ${c.bd};background:${c.bg}`)}>
              <span style={s(`width:16px;height:16px;flex:none;margin-top:2px;border-radius:50%;border:2px solid ${c.ring};display:flex;align-items:center;justify-content:center`)}>
                <span style={s(`width:8px;height:8px;border-radius:50%;background:${c.dot}`)} />
              </span>
              <span style={s("flex:1;min-width:0")}>
                <span style={s("display:block;font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{c.t}</span>
                <span style={s("display:block;font:400 11px/1.4 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E;margin-top:4px")}>{c.s}</span>
              </span>
            </button>
          ))}
          <div style={s("background:#F9DEDC;border-radius:12px;padding:14px 16px;margin:14px 0")}>
            <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#410E0B")}>DOING NOTHING IS A DECISION</div>
            <div style={s("font:400 12px/1.5 Roboto,system-ui,sans-serif;color:#410E0B;margin-top:8px")}>Three of these cards block tonight at 23:59.</div>
          </div>
          <button onClick={v.iaApply} style={s("width:100%;display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;cursor:pointer")}>{v.iaApplyLabel}</button>
        </div>
      </div>
    </>
  );
}
