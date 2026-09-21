import type { VM } from "../vm";
import { s } from "@/components/gc/style";

/**
 * Add a worker — port of `TC Console HiFi M3.dc.html` template lines 302–381.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 *
 * The form steps' inputs are controlled by `state.awFields` (keyed by `AWKEYS` in
 * `vm/vm1.ts`), which is what the draft saves and what the final submit maps onto
 * `WorkerIn`. Step 3 is the upload step: its inputs belong to documents that are
 * posted separately, once the worker exists, so they stay uncontrolled.
 */
export default function AddWorker({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:flex;align-items:center;gap:12px;margin-bottom:14px")}>
        <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F")}>{v.awStepLabel}</span>
        <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;padding:5px 12px;border-radius:8px;background:#E8DEF8;color:#1D192B")}>Draft saved 2 min ago</span>
        <div style={s("flex:1")} />
        <button onClick={v.awSave} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>Save &amp; close</button>
      </div>
      <div style={s("display:grid;grid-template-columns:266px 1fr;gap:14px;align-items:start")}>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:14px 10px")}>
          {v.awSteps.map((stp, i) => (
            <button key={i} onClick={stp.go} style={s(`width:100%;display:flex;gap:12px;align-items:flex-start;padding:10px 12px;border:0;border-radius:12px;cursor:pointer;text-align:left;background:${stp.bg}`)}>
              <span style={s(`width:24px;height:24px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;font:500 12px/1 Roboto,system-ui,sans-serif;background:${stp.dotBg};color:${stp.dotFg};border:1px solid ${stp.dotBd}`)}>{stp.num}</span>
              <span style={s("flex:1;min-width:0")}><span style={s(`display:block;font:${stp.fw} 14px/1.3 Roboto,system-ui,sans-serif;color:${stp.fg}`)}>{stp.label}</span><span style={s("display:block;font:400 11px/1.4 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E;margin-top:3px")}>{stp.sub}</span></span>
            </button>
          ))}
          <div style={s("margin:10px 12px 2px;padding-top:12px;border-top:1px solid #E6E0E9;font:400 12px/1.5 Roboto,system-ui,sans-serif;color:#49454F")}>Every step saves as a draft. Contractors chase documents for days &mdash; resume any time.</div>
        </div>
        <div>
          {v.awDocsStep && (
            <>
              <div style={s("display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px")}>
                <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px")}>
                  <div style={s("display:flex;align-items:center;gap:10px")}><span style={s("font:500 14px/1 Roboto,system-ui,sans-serif")}>Passport / ID</span><span style={s("margin-left:auto;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#49454F;border:1px solid #CAC4D0;border-radius:8px;padding:4px 8px")}>REQUIRED</span></div>
                  <button onClick={v.awDrop} style={s("width:100%;margin:14px 0;height:96px;border:1px dashed #79747E;border-radius:12px;background:#F7F2FA;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px")}>
                    <span style={s("font-family:'Material Symbols Outlined';font-size:24px;line-height:1;color:#6750A4")}>upload_file</span>
                    <span style={s("font:400 13px/1 Roboto,system-ui,sans-serif;color:#1D1B20")}>Drop the scan or photograph</span>
                    <span style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E")}>PDF or JPG &middot; max 10 MB</span>
                  </button>
                  <div style={s("display:flex;gap:10px")}>
                    <label style={s("flex:1")}><span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Document number</span><input placeholder="A4128866" style={s("width:100%;min-height:40px;padding:8px 12px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:#FEF7FF;border:1px solid #79747E;border-radius:4px")} /></label>
                    <label style={s("width:120px")}><span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Expiry</span><input placeholder="2031-04-12" style={s("width:100%;min-height:40px;padding:8px 12px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:#FEF7FF;border:1px solid #79747E;border-radius:4px")} /></label>
                  </div>
                  <label style={s("display:block;margin-top:12px")}><span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Country of issue</span><input defaultValue="Bangladesh" style={s("width:100%;min-height:40px;padding:8px 12px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:#FEF7FF;border:1px solid #79747E;border-radius:4px")} /></label>
                </div>
                <div style={s("background:#FEF7FF;border:1px solid #6750A4;border-radius:12px;padding:16px 18px")}>
                  <div style={s("display:flex;align-items:center;gap:10px")}><span style={s("font:500 14px/1 Roboto,system-ui,sans-serif;color:#6750A4")}>Work visa</span><span style={s("margin-left:auto;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#1D192B;background:#E8DEF8;border-radius:8px;padding:4px 8px")}>REQUIRED</span></div>
                  <div style={s("display:flex;align-items:center;gap:12px;margin:14px 0;padding:12px 14px;background:#F7F2FA;border-radius:12px")}>
                    <span style={s("font-family:'Material Symbols Outlined';font-size:22px;line-height:1;color:#49454F")}>description</span>
                    <span style={s("flex:1;min-width:0")}><span style={s("display:block;font:400 13px/1.3 Roboto,system-ui,sans-serif")}>visa-scan.pdf</span><span style={s("display:block;font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E;margin-top:3px")}>UPLOADED &middot; AWAITING GC VALIDATION</span></span>
                    <button onClick={v.awRemove} style={s("width:32px;height:32px;flex:none;border:0;border-radius:9999px;background:transparent;cursor:pointer;font-family:'Material Symbols Outlined';font-size:20px;line-height:1;color:#49454F")}>close</button>
                  </div>
                  <div style={s("display:flex;gap:10px")}>
                    <label style={s("flex:1")}><span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Visa number</span><input defaultValue="WV-2291884" style={s("width:100%;min-height:40px;padding:8px 12px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:#FEF7FF;border:1px solid #79747E;border-radius:4px")} /></label>
                    <label style={s("width:120px")}><span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Expiry</span><input defaultValue="2028-06-30" style={s("width:100%;min-height:40px;padding:8px 12px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:#FEF7FF;border:1px solid #79747E;border-radius:4px")} /></label>
                  </div>
                  <div style={s("font:400 12px/1.5 Roboto,system-ui,sans-serif;color:#49454F;margin-top:12px")}>Shown only because the passport country of issue is not Malaysia.</div>
                </div>
              </div>
              <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px")}>
                <div style={s("display:flex;align-items:center;gap:10px")}><span style={s("font:500 14px/1 Roboto,system-ui,sans-serif")}>Trade accreditation &mdash; CIDB</span><span style={s("margin-left:auto;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#49454F;border:1px solid #CAC4D0;border-radius:8px;padding:4px 8px")}>REQUIRED FOR THIS ROLE</span></div>
                <div style={s("display:flex;gap:14px;margin-top:14px")}>
                  <button onClick={v.awDrop} style={s("flex:1;height:78px;border:1px dashed #79747E;border-radius:12px;background:#F7F2FA;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font:400 13px/1 Roboto,system-ui,sans-serif;color:#1D1B20")}><span style={s("font-family:'Material Symbols Outlined';font-size:22px;line-height:1;color:#6750A4")}>upload_file</span>Drop the certificate</button>
                  <div style={s("width:280px;display:flex;flex-direction:column;gap:10px")}>
                    <input placeholder="Certificate number" style={s("width:100%;min-height:34px;padding:6px 12px;font:400 13px/1.3 Roboto,system-ui,sans-serif;background:#FEF7FF;border:1px solid #79747E;border-radius:4px")} />
                    <input placeholder="Expiry" style={s("width:100%;min-height:34px;padding:6px 12px;font:400 13px/1.3 Roboto,system-ui,sans-serif;background:#FEF7FF;border:1px solid #79747E;border-radius:4px")} />
                  </div>
                </div>
              </div>
            </>
          )}
          {v.awFormStep && (
            <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:18px 20px 22px")}>
              <div style={s("font:500 16px/1 Roboto,system-ui,sans-serif;margin-bottom:16px")}>{v.awStepTitle}</div>
              <div style={s("display:grid;grid-template-columns:1fr 1fr;gap:14px")}>
                {v.awFields.map((f) => (
                  <label key={v.awStepTitle + f.k} style={s("display:block")}><span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>{f.k}</span><input value={f.v} onChange={f.set} placeholder={f.ph} style={s("width:100%;min-height:40px;padding:8px 12px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:#FEF7FF;border:1px solid #79747E;border-radius:4px")} /></label>
                ))}
              </div>
              <div style={s("font:400 12px/1.5 Roboto,system-ui,sans-serif;color:#49454F;margin-top:18px;padding-top:14px;border-top:1px solid #E6E0E9")}>{v.awStepNote}</div>
            </div>
          )}
          <div style={s("display:flex;align-items:center;gap:14px;margin-top:14px")}>
            <span style={s("font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F")}>{v.awFoot}</span>
            <div style={s("margin-left:auto;display:flex;gap:10px")}>
              <button onClick={v.awBack} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>Back</button>
              <button onClick={v.awNext} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>{v.awNextLabel}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
