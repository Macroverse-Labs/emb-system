import type { VM } from "../vm";
import { s } from "../style";

/**
 * Company profiles — port of `GC Console HiFi M3.dc.html` template lines 763–808.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Companies({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:flex;align-items:center;gap:12px;margin-bottom:14px")}>
        <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F")}>Eight companies on the project &middot; a worker inherits their contractor&rsquo;s defaults</span>
        <button onClick={v.coNew} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;margin-left:auto;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>New company</button>
      </div>
      <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;overflow:hidden")}>
        <div style={s("display:grid;grid-template-columns:1.5fr 1.2fr 1fr 84px 84px 1fr 100px;padding:0 16px;background:#F7F2FA;border-bottom:1px solid #CAC4D0;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>
          <span style={s("padding:11px 8px 11px 0")}>Company</span><span style={s("padding:11px 8px 11px 0")}>Package</span><span style={s("padding:11px 8px 11px 0")}>Relationship</span><span style={s("padding:11px 8px 11px 0;text-align:right")}>Register</span><span style={s("padding:11px 8px 11px 0;text-align:right")}>On site</span><span style={s("padding:11px 8px 11px 0")}>Insurance</span><span style={s("padding:11px 0;text-align:right")}>Flag</span>
        </div>
        {v.coRows.map((c, i) => (
          <div key={i} onClick={c.go} style={s(`display:grid;grid-template-columns:1.5fr 1.2fr 1fr 84px 84px 1fr 100px;align-items:center;padding:0 16px;border-bottom:1px solid #E6E0E9;cursor:pointer;background:${c.bg}`)}>
            <span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif;padding:13px 8px 13px 0")}>{c.n}</span>
            <span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:13px 8px 13px 0")}>{c.trade}</span>
            <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:13px 8px 13px 0")}>{c.kind}</span>
            <span style={s("text-align:right;font:400 14px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;padding:13px 8px 13px 0")}>{c.reg}</span>
            <span style={s("text-align:right;font:400 14px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;padding:13px 8px 13px 0")}>{c.on}</span>
            <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F;padding:13px 8px 13px 0")}>{c.ins}</span>
            <span style={s(`text-align:right;font:400 12px/1.3 Roboto,system-ui,sans-serif;padding:13px 0;color:${c.flagC}`)}>{c.flag}</span>
          </div>
        ))}
      </div>
      {v.coDrawer && (
        <>
          <div onClick={v.coClose} style={s("position:fixed;inset:0;background:rgba(0,0,0,.32);z-index:55")}>
            <div onClick={v.stop} style={s("position:absolute;top:0;right:0;bottom:0;width:min(440px,94vw);background:#FEF7FF;border-left:1px solid #CAC4D0;box-shadow:-12px 0 32px rgba(0,0,0,.15);padding:24px 26px;display:flex;flex-direction:column;gap:18px;overflow:auto")}>
              <div>
                <div style={s("display:flex;align-items:flex-start;gap:12px")}>
                  <div style={s("flex:1")}><div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E")}>{v.coKind}</div><div style={s("font:400 28px/1.15 Roboto,system-ui,sans-serif;margin-top:8px")}>{v.coName}</div><div style={s("font:400 14px/1.4 Roboto,system-ui,sans-serif;color:#49454F;margin-top:6px")}>{v.coTrade}</div></div>
                  <button onClick={v.coClose} style={s("width:28px;height:28px;flex:none;background:transparent;border:1px solid #CAC4D0;border-radius:9999px;cursor:pointer;font:400 14px/1 Roboto,system-ui,sans-serif;color:#49454F")}>&times;</button>
                </div>
              </div>
              <div style={s("display:flex;gap:26px;padding:14px 0;border-top:1px solid #CAC4D0;border-bottom:1px solid #CAC4D0")}>
                <span><span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#79747E")}>On register</span><span style={s("display:block;font:400 24px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;margin-top:7px")}>{v.coReg}</span></span>
                <span><span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#79747E")}>On site now</span><span style={s("display:block;font:400 24px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;margin-top:7px")}>{v.coOn}</span></span>
                <span><span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#79747E")}>Main contact</span><span style={s("display:block;font:400 14px/1.3 Roboto,system-ui,sans-serif;margin-top:10px")}>{v.coContact}</span></span>
              </div>
              <div>
                <div style={s("font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F;margin-bottom:8px")}>Defaults inherited by every worker</div>
                {v.coDefaults.map((d, i) => (
                  <div key={i} style={s("display:flex;gap:14px;padding:9px 0;border-top:1px solid #E6E0E9")}><span style={s("width:150px;flex:none;font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F")}>{d.k}</span><span style={s("flex:1;font:400 14px/1.4 Roboto,system-ui,sans-serif")}>{d.v}</span></div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
