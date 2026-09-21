import type { VM } from "../vm";
import { s } from "@/components/gc/style";

/**
 * Documents queue — port of `TC Console HiFi M3.dc.html` template lines 382–471.
 *
 * The two confirm fields are `defaultValue` keyed on their own value, as in the
 * design: nothing is bound behind them, and moving to another queue item has to
 * reset them. Style strings are copied from the design character-for-character and
 * passed through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Docs({ v }: { v: VM }) {
  // The whole screen is one open card plus its queue; with nothing in the queue there
  // is no card to open, so the empty line stands in for all three panes.
  if (v.dqEmpty) {
    return <div style={s("padding:20px 0;font:400 13px/1.4 Roboto,system-ui,sans-serif;color:#79747E")}>{v.dqEmptyCopy}</div>;
  }
  return (
    <>
      <div style={s("display:flex;align-items:center;gap:12px;margin-bottom:14px")}>
        <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;padding:6px 12px;border-radius:8px;background:#F9DEDC;color:#410E0B")}>6 need action</span>
        <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F")}>rejected first, then expiring, then already blocked &mdash; five more sit with the GC</span>
        <div style={s("flex:1")} />
        <button onClick={v.dqBulk} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>Bulk upload</button>
      </div>
      <div style={s("display:grid;grid-template-columns:330px 1fr 288px;gap:14px;align-items:start")}>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;overflow:hidden")}>
          {v.dqGroups.map((g, gi) => (
            <div key={gi}>
              <div style={s(`padding:10px 16px;background:${g.bg};border-bottom:1px solid #CAC4D0;font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:${g.c}`)}>{g.label}</div>
              {g.items.map((i, ii) => (
                <button key={ii} onClick={i.go} style={s(`width:100%;display:flex;align-items:center;gap:12px;padding:11px 16px;border:0;border-bottom:1px solid #E6E0E9;cursor:pointer;text-align:left;background:${i.bg}`)}>
                  <span style={s(`width:3px;align-self:stretch;flex:none;border-radius:2px;background:${i.rail}`)} />
                  <span style={s("flex:1;min-width:0")}><span style={s("display:block;font:400 14px/1.3 Roboto,system-ui,sans-serif;color:#1D1B20")}>{i.n}</span><span style={s("display:block;font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E;margin-top:3px")}>{i.d}</span></span>
                  <span style={s(`flex:none;font:400 12px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:${i.c}`)}>{i.when}</span>
                </button>
              ))}
            </div>
          ))}
          <div style={s("padding:12px 16px;background:#F7F2FA;font:400 11px/1.4 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#79747E")}>5 MORE AWAITING GC VALIDATION &mdash; NOTHING FOR YOU TO DO</div>
        </div>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;overflow:hidden")}>
          <div style={s("display:flex;align-items:center;gap:12px;padding:13px 18px;border-bottom:1px solid #CAC4D0")}>
            <span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>{v.dqName}</span>
            <span style={s(`font:400 12px/1 Roboto,system-ui,sans-serif;padding:5px 10px;border-radius:8px;color:${v.dqStFg};background:${v.dqStBg}`)}>{v.dqSt}</span>
            <span style={s("margin-left:auto;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#79747E")}>{v.dqMeta}</span>
          </div>
          <div style={s("padding:18px")}>
            <div style={s("background:#F9DEDC;border-radius:12px;padding:14px 16px;margin-bottom:16px")}>
              <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#410E0B")}>{v.dqReasonHead}</div>
              <div style={s("font:500 15px/1.5 Roboto,system-ui,sans-serif;color:#410E0B;margin-top:10px;max-width:620px")}>{v.dqReason}</div>
              <div style={s("display:flex;gap:8px;flex-wrap:wrap;margin-top:12px")}>
                {v.dqTags.map((g, i) => (
                  <span key={i} style={s(`font:400 12px/1 Roboto,system-ui,sans-serif;padding:5px 10px;border-radius:8px;color:${g.fg};background:${g.bg};border:1px solid ${g.bd}`)}>{g.t}</span>
                ))}
              </div>
            </div>
            <div style={s("display:grid;grid-template-columns:1fr 250px;gap:16px")}>
              <div>
                <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#79747E;margin-bottom:10px")}>WHAT WAS UPLOADED &middot; ATTEMPT 1</div>
                <div style={s("height:250px;border-radius:12px;background:#ECE6F0 repeating-linear-gradient(45deg,rgba(103,80,164,.06) 0 10px,transparent 10px 20px);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:8px;padding:16px;border:1px solid #CAC4D0")}>
                  <span style={s("font:400 11px/1.4 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#49454F;font-family:ui-monospace,Menlo,monospace")}>{v.dqFile}</span>
                  <span style={s("font:400 11px/1.4 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#B3261E;font-family:ui-monospace,Menlo,monospace")}>CROPPED AT THE BOTTOM EDGE</span>
                </div>
              </div>
              <div style={s("display:flex;flex-direction:column;gap:12px")}>
                <button onClick={v.dqDrop} style={s("height:118px;border:1px dashed #79747E;border-radius:12px;background:#F7F2FA;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px")}>
                  <span style={s("font-family:'Material Symbols Outlined';font-size:24px;line-height:1;color:#6750A4")}>upload_file</span>
                  <span style={s("font:400 13px/1 Roboto,system-ui,sans-serif;color:#1D1B20")}>Drop the new scan</span>
                  <span style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E")}>PDF or JPG &middot; max 10 MB</span>
                </button>
                <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#79747E")}>CONFIRM WHILE YOU RE-UPLOAD</div>
                <input key={v.dqNo} defaultValue={v.dqNo} style={s("width:100%;min-height:38px;padding:8px 12px;font:400 13px/1.3 Roboto,system-ui,sans-serif;background:#FEF7FF;border:1px solid #79747E;border-radius:4px")} />
                <input key={v.dqExp} defaultValue={v.dqExp} style={s("width:100%;min-height:38px;padding:8px 12px;font:400 13px/1.3 Roboto,system-ui,sans-serif;background:#FEF7FF;border:1px solid #79747E;border-radius:4px")} />
                <div style={s("font:400 12px/1.5 Roboto,system-ui,sans-serif;color:#49454F")}>Fields keep the last values &mdash; only the scan was wrong.</div>
              </div>
            </div>
            <div style={s("display:flex;align-items:center;gap:10px;margin-top:18px;padding-top:16px;border-top:1px solid #E6E0E9")}>
              <span style={s("font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F")}>J / K moves through the queue</span>
              <div style={s("margin-left:auto;display:flex;gap:10px")}>
                <button onClick={v.dqSkip} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>Skip</button>
                <button onClick={v.dqSubmit} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>Re-upload &amp; resubmit</button>
              </div>
            </div>
          </div>
        </div>
        <div style={s("display:flex;flex-direction:column;gap:14px")}>
          <div style={s("background:#FEF7FF;border:1px solid #B3261E;border-radius:12px;padding:16px 18px")}>
            <div style={s("font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#B3261E")}>{v.dqClockHead}</div>
            <div style={s("height:8px;border-radius:4px;background:#E6E0E9;overflow:hidden;margin:12px 0 10px")}><div style={s(`height:8px;background:#B3261E;width:${v.dqClockPct}`)} /></div>
            <div style={s("font:400 12px/1.5 Roboto,system-ui,sans-serif;color:#49454F")}>Set when the GC rejected it. At zero the worker&rsquo;s access is blocked automatically.</div>
          </div>
          <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px")}>
            <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#79747E")}>WHAT THIS BLOCKS TODAY</div>
            {v.dqBlocks.map((b, i) => (
              <div key={i} style={s("display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #E6E0E9")}><span style={s(`width:7px;height:7px;border-radius:50%;flex:none;background:${b.c}`)} /><span style={s(`font:400 13px/1.4 Roboto,system-ui,sans-serif;color:${b.fg}`)}>{b.t}</span></div>
            ))}
          </div>
          <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px")}>
            <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#79747E;margin-bottom:6px")}>HISTORY</div>
            {v.dqHistory.map((h, i) => (
              <div key={i} style={s("display:flex;gap:12px;padding:9px 0;border-top:1px solid #E6E0E9")}><span style={s(`width:7px;height:7px;flex:none;border-radius:50%;margin-top:6px;background:${h.c}`)} /><span style={s("flex:1;min-width:0")}><span style={s("display:block;font:400 13px/1.4 Roboto,system-ui,sans-serif")}>{h.t}</span><span style={s("display:block;font:400 11px/1.4 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E;margin-top:2px")}>{h.m}</span></span></div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
