import type { VM } from "../vm";
import { s } from "../style";

/**
 * Visitor requests — port of `GC Console HiFi M3.dc.html` template lines 902–988.
 *
 * The design's two `<sc-for>` loops bind `as="v"`, which collides with this
 * component's `v` prop; the loop variable is `req` here.
 */
export default function VRequests({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:grid;grid-template-columns:1fr 340px;gap:14px;align-items:start")}>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;overflow:hidden")}>
          <div style={s("display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid #CAC4D0")}>
            <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>{v.vrMineN}</span>
            <button onClick={v.vrRaise} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;margin-left:auto;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>Raise a visit</button>
          </div>
          <div style={s("display:grid;grid-template-columns:1.4fr 1.2fr 1.1fr 1.2fr 1fr;padding:0 18px;background:#F7F2FA;border-bottom:1px solid #CAC4D0;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>
            <span style={s("padding:10px 8px 10px 0")}>Visitor</span><span style={s("padding:10px 8px 10px 0")}>Requested by</span><span style={s("padding:10px 8px 10px 0")}>Purpose</span><span style={s("padding:10px 8px 10px 0")}>Zones asked</span><span style={s("padding:10px 0")}>Window</span>
          </div>
          {v.vrMine.map((req, i) => (
            <button key={i} onClick={req.go} style={s(`width:100%;display:grid;grid-template-columns:1.4fr 1.2fr 1.1fr 1.2fr 1fr;align-items:center;padding:0 18px;border:0;border-bottom:1px solid #E6E0E9;cursor:pointer;text-align:left;background:${req.bg}`)}>
              <span style={s("padding:12px 8px 12px 0")}><span style={s("display:block;font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{req.vt}</span><span style={s("display:block;font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E;margin-top:3px")}>{req.kind}</span></span>
              <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:12px 8px 12px 0")}>{req.by}</span>
              <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:12px 8px 12px 0")}>{req.why}</span>
              <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;padding:12px 8px 12px 0")}>{req.zones}</span>
              <span style={s("padding:12px 0")}><span style={s("display:block;font:400 12px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums")}>{req.win}</span><span style={s("display:block;font:400 11px/1.3 Roboto,system-ui,sans-serif;color:#79747E;margin-top:3px")}>asked {req.age}</span></span>
            </button>
          ))}
          <div style={s("padding:10px 18px;background:#F7F2FA;border-top:1px solid #CAC4D0;border-bottom:1px solid #CAC4D0;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>{v.vrOthersN}</div>
          {v.vrOthers.map((req, i) => (
            <div key={i} style={s("display:grid;grid-template-columns:1.4fr 1.2fr 1.1fr 1.2fr 1fr;align-items:center;padding:0 18px;border-bottom:1px solid #E6E0E9;opacity:.65")}>
              <span style={s("padding:11px 8px 11px 0")}><span style={s("display:block;font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{req.vt}</span><span style={s("display:block;font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E;margin-top:3px")}>{req.kind}</span></span>
              <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;padding:11px 8px 11px 0")}>{req.by}</span>
              <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;padding:11px 8px 11px 0")}>{req.why}</span>
              <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;padding:11px 8px 11px 0")}>{req.zones}</span>
              <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;padding:11px 0")}>{req.win}</span>
            </div>
          ))}
        </div>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:18px 20px;display:flex;flex-direction:column;gap:16px")}>
          <div>
            <div style={s("display:flex;align-items:baseline;gap:10px")}><span style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E")}>Request</span><span style={s("margin-left:auto;font:400 12px/1 Roboto,system-ui,sans-serif;color:#6750A4")}>{v.vrCurAge}</span></div>
            <div style={s("font:400 22px/1.15 Roboto,system-ui,sans-serif;margin-top:8px")}>{v.vrCurName}</div>
            <div style={s("font:400 12px/1.5 Roboto,system-ui,sans-serif;color:#49454F;margin-top:6px")}>{v.vrCurBy} &middot; {v.vrCurWhy}</div>
          </div>
          <div style={s("height:1px;background:#CAC4D0")} />
          <div>
            <div style={s("font:400 12px/1.4 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:9px")}>Zones asked &mdash; tick only what you grant</div>
            {v.vrZones.map((z, i) => (
              <button key={i} onClick={z.go} style={s("width:100%;display:flex;align-items:center;gap:10px;padding:8px 0;background:transparent;border:0;border-top:1px solid #E6E0E9;cursor:pointer;text-align:left")}>
                <span style={s(`width:15px;height:15px;flex:none;border-radius:4px;display:flex;align-items:center;justify-content:center;font:400 11px/1 Roboto,system-ui,sans-serif;color:#FEF7FF;border:1px solid ${z.bd};background:${z.bg}`)}>{z.tick}</span>
                <span style={s(`flex:1;font:400 14px/1.3 Roboto,system-ui,sans-serif;color:${z.fg}`)}>{z.z}</span>
                <span style={s(`font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:${z.noteC}`)}>{z.note}</span>
              </button>
            ))}
          </div>
          <div>
            <div style={s("font:400 12px/1.4 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:8px")}>Window &mdash; trim it if you can</div>
            <div style={s("display:flex;gap:8px")}>
              <input value={v.vrFrom} readOnly style={s("flex:1;min-height:36px;padding:7px 10px;font:400 14px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;background:transparent;border:1px solid #79747E;border-radius:4px")} />
              <input value={v.vrTo} readOnly style={s("flex:1;min-height:36px;padding:7px 10px;font:400 14px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;background:transparent;border:1px solid #79747E;border-radius:4px")} />
            </div>
          </div>
          <div>
            <div style={s("font:400 12px/1.4 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:8px")}>Escort &mdash; required, no exceptions</div>
            <div style={s("display:flex;align-items:center;gap:9px;min-height:36px;padding:7px 10px;border:1px solid #CAC4D0;border-radius:12px")}><span style={s("width:20px;height:20px;flex:none;border-radius:50%;background:#E6E0E9")} /><span style={s("font:400 14px/1 Roboto,system-ui,sans-serif")}>A. Whitmore (me)</span></div>
          </div>
          <div style={s("border:1px dashed #CAC4D0;border-radius:12px;padding:11px 12px;font:400 12px/1.6 Roboto,system-ui,sans-serif;color:#49454F")}>On approval: a QR pass is texted to the visitor, the escort is notified, and the guards at the named gate see them on the expected list.</div>
          <div style={s("display:flex;gap:9px;margin-top:auto")}>
            <button onClick={v.vrApprove} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;flex:1;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>Approve &amp; send pass</button>
            <button onClick={v.vrDecline} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>Decline</button>
          </div>
        </div>
      </div>
      {v.vrModal && (
        <>
          <div onClick={v.closeAll} style={s("position:fixed;inset:0;background:rgba(0,0,0,.32);display:grid;place-items:center;z-index:60")}>
            <div onClick={v.stop} style={s("width:min(560px,92vw);background:#FEF7FF;border:1px solid #CAC4D0;border-radius:28px;box-shadow:0 12px 32px rgba(0,0,0,.3);padding:22px 24px;animation:fadeUp .16s ease")}>
              <div style={s("font:400 22px/1.15 Roboto,system-ui,sans-serif;margin-bottom:6px")}>Raise a visit</div>
              <p style={s("font:400 12px/1.6 Roboto,system-ui,sans-serif;color:#49454F;margin:0 0 16px")}>One form. The pass is a QR code by SMS and it expires with the window &mdash; there is nothing to hand back.</p>
              <div style={s("display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px")}>
                <label style={s("display:block")}><span style={s("display:block;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Visitor name</span><input placeholder="As it appears on their ID" style={s("width:100%;min-height:38px;padding:7px 10px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:transparent;border:1px solid #79747E;border-radius:4px")} /></label>
                <label style={s("display:block")}><span style={s("display:block;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Mobile for the pass</span><input placeholder="+60" style={s("width:100%;min-height:38px;padding:7px 10px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:transparent;border:1px solid #79747E;border-radius:4px")} /></label>
                <label style={s("display:block")}><span style={s("display:block;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Visitor type</span><select style={s("width:100%;min-height:38px;padding:7px 10px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:transparent;border:1px solid #79747E;border-radius:4px")}><option>Client</option><option>Consultant</option><option>Inspector</option><option>Supplier</option><option>Delivery driver</option></select></label>
                <label style={s("display:block")}><span style={s("display:block;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Escort (required)</span><select style={s("width:100%;min-height:38px;padding:7px 10px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:transparent;border:1px solid #79747E;border-radius:4px")}><option>A. Whitmore (me)</option><option>J. Menon</option><option>T. W. Ming</option></select></label>
                <label style={s("display:block")}><span style={s("display:block;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Zones</span><select style={s("width:100%;min-height:38px;padding:7px 10px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:transparent;border:1px solid #79747E;border-radius:4px")}><option>A Site</option><option>Site office</option><option>Laydown</option></select></label>
                <label style={s("display:block")}><span style={s("display:block;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Window</span><input value={"10:00 — 12:00"} readOnly style={s("width:100%;min-height:38px;padding:7px 10px;font:400 14px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;background:transparent;border:1px solid #79747E;border-radius:4px")} /></label>
              </div>
              <div style={s("display:flex;justify-content:flex-end;gap:9px")}>
                <button onClick={v.closeAll} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>Cancel</button>
                <button onClick={v.vrConfirmRaise} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>Create &amp; send pass</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
