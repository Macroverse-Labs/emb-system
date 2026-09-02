import type { VM } from "../vm";
import { s } from "../style";

/**
 * Validation queue — port of `GC Console HiFi M3.dc.html` template lines 482–549.
 */
export default function Validation({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:grid;grid-template-columns:330px 1fr;gap:14px;align-items:start")}>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;overflow:hidden")}>
          <div style={s("padding:12px 16px;border-bottom:1px solid #CAC4D0")}>
            <div style={s("font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>{v.vqRemaining}</div>
            <div style={s("font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#79747E;margin-top:5px")}>{v.vqDoneN}</div>
          </div>
          {v.vqList.map((i, idx) => (
            <button key={idx} onClick={i.go} style={s(`width:100%;text-align:left;padding:12px 16px;border:0;border-bottom:1px solid #E6E0E9;cursor:pointer;background:${i.bg};box-shadow:${i.bar};opacity:${i.op}`)}>
              <div style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{i.w}</div>
              <div style={s("display:flex;align-items:baseline;gap:8px;margin-top:4px")}><span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F")}>{i.doc}</span><span style={s(`margin-left:auto;font:400 11px/1.3 Roboto,system-ui,sans-serif;color:${i.stc}`)}>{i.stl}</span></div>
              <div style={s("font:400 11px/1.3 Roboto,system-ui,sans-serif;color:#79747E;margin-top:3px")}>{i.co}</div>
            </button>
          ))}
          <div style={s("padding:11px 16px;font:400 11px/1.6 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E")}>j / k move &middot; a approve &middot; r reject</div>
        </div>
        {v.vqHasCur && (
          <>
            <div style={s("display:grid;grid-template-columns:1fr 340px;gap:14px;align-items:start")}>
              <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px")}>
                <div style={s("display:flex;align-items:baseline;gap:12px;margin-bottom:14px")}><span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>{v.vqDoc}</span><span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F")}>{v.vqSub}</span>
                  <span style={s("margin-left:auto;display:flex;gap:7px")}><button onClick={v.vqRotate} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#49454F;background:transparent;border:1px solid #CAC4D0;border-radius:9999px;padding:0 12px;cursor:pointer")}>Rotate</button><button onClick={v.vqZoom} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#49454F;background:transparent;border:1px solid #CAC4D0;border-radius:9999px;padding:0 12px;cursor:pointer")}>Full size</button></span>
                </div>
                <div style={s("aspect-ratio:1.42;background:#E6E0E9;border:6px solid #ECE6F0;outline:1px solid #CAC4D0;display:flex;flex-direction:column;justify-content:space-between;padding:20px 22px")}>
                  <div style={s("display:flex;gap:16px")}>
                    <div style={s("width:74px;height:92px;background:#CAC4D0")} />
                    <div style={s("flex:1;display:flex;flex-direction:column;gap:9px;padding-top:6px")}>
                      <div style={s("height:9px;width:62%;background:#CAC4D0")} /><div style={s("height:7px;width:44%;background:#CAC4D0")} /><div style={s("height:7px;width:52%;background:#CAC4D0")} /><div style={s("height:7px;width:36%;background:#CAC4D0")} />
                    </div>
                  </div>
                  <div style={s("display:flex;flex-direction:column;gap:7px")}><div style={s("height:7px;width:88%;background:#CAC4D0")} /><div style={s("height:11px;width:100%;background:#AEA9B1;letter-spacing:.3em")} /></div>
                </div>
                <div style={s("font:400 12px/1.5 Roboto,system-ui,sans-serif;color:#79747E;margin-top:10px")}>Uploaded scan &mdash; the original file is retained unaltered against the worker record.</div>
              </div>
              <div style={s("display:flex;flex-direction:column;gap:14px")}>
                <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px")}>
                  <div style={s("font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>Submitted by</div>
                  <div style={s("font:400 22px/1.2 Roboto,system-ui,sans-serif;margin:7px 0 3px")}>{v.vqW}</div>
                  <div style={s("font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F")}>{v.vqCo}</div>
                  <div style={s("height:1px;background:#CAC4D0;margin:14px 0")} />
                  {v.vqFields.map((f, i) => (
                    <div key={i} style={s("display:flex;gap:12px;padding:7px 0;border-top:1px solid #E6E0E9")}><span style={s("width:120px;flex:none;font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F")}>{f.k}</span><span style={s("flex:1;font:400 14px/1.4 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums")}>{f.v}</span></div>
                  ))}
                </div>
                <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px")}>
                  <div style={s("font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F;margin-bottom:10px")}>What the system noticed</div>
                  {v.vqFlags.map((f, i) => (
                    <div key={i} style={s("display:flex;gap:9px;padding:6px 0")}><span style={s(`width:4px;flex:none;align-self:stretch;background:${f.c}`)} /><span style={s(`font:400 14px/1.5 Roboto,system-ui,sans-serif;color:${f.c}`)}>{f.t}</span></div>
                  ))}
                </div>
                <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px;display:flex;flex-direction:column;gap:11px")}>
                  <label style={s("display:block")}><span style={s("display:block;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Rejection reason &mdash; sent to the contractor</span>
                    <select value={v.vqReason} onChange={v.vqSetReason} style={s("width:100%;min-height:38px;padding:7px 10px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:transparent;border:1px solid #79747E;border-radius:4px")}>
                      <option value="">Choose a reason&hellip;</option>
                      {v.vqReasons.map((r, i) => (<option key={i}>{r}</option>))}
                    </select>
                  </label>
                  <div style={s("display:flex;gap:9px")}>
                    <button onClick={v.vqApprove} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;flex:1;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>Approve</button>
                    <button onClick={v.vqReject} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#B3261E;background:transparent;border:1px solid #B3261E;border-radius:9999px;padding:0 24px;cursor:pointer")}>Reject</button>
                  </div>
                  <div style={s("font:400 12px/1.5 Roboto,system-ui,sans-serif;color:#79747E")}>Approving the last outstanding document clears the worker to book an induction slot.</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
