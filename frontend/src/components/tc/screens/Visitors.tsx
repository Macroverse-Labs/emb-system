import type { VM } from "../vm";
import { s } from "@/components/gc/style";

/**
 * Visitor requests — port of `TC Console HiFi M3.dc.html` template lines 722–780.
 *
 * An ask, not a grant: the form raises a request and the list shows what the GC host
 * decided. Nothing here approves anything. Every field the backend's `RequestPayload`
 * accepts is bound to state and sent by `vrSend`; the mobile field is the exception,
 * see below. Style strings are copied from the design character-for-character and
 * passed through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Visitors({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:flex;align-items:center;gap:20px;border-bottom:1px solid #CAC4D0;margin-bottom:16px")}>
        {v.vrTabs.map((t, i) => (
          <button key={i} onClick={t.go} style={s(`padding:0 0 9px;background:transparent;border:0;border-bottom:2px solid ${t.bd};cursor:pointer;font:400 14px/1 Roboto,system-ui,sans-serif;color:${t.fg}`)}>{t.label}</button>
        ))}
        <span style={s("margin-left:auto;margin-bottom:9px;font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F")}>You may ask; only a GC host grants &mdash; and may trim the zones or the hours</span>
      </div>
      <div style={s("display:grid;grid-template-columns:1fr 330px;gap:14px;align-items:start")}>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;overflow:hidden")}>
          <div style={s("display:grid;grid-template-columns:1.2fr .9fr 1fr .8fr 1.4fr;padding:0 16px;background:#F7F2FA;border-bottom:1px solid #CAC4D0;font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>
            <span style={s("padding:11px 8px 11px 0")}>VISITOR</span>
            <span style={s("padding:11px 8px 11px 0")}>PURPOSE</span>
            <span style={s("padding:11px 8px 11px 0")}>ASKED FOR</span>
            <span style={s("padding:11px 8px 11px 0")}>GC HOST</span>
            <span style={s("padding:11px 0")}>OUTCOME</span>
          </div>
          {v.vrRows.map((r, i) => (
            <div key={i} style={s(`display:grid;grid-template-columns:1.2fr .9fr 1fr .8fr 1.4fr;align-items:center;padding:0 16px;border-bottom:1px solid #E6E0E9;background:${r.bg}`)}>
              <span style={s("padding:11px 8px 11px 0")}>
                <span style={s("display:block;font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{r.n}</span>
                <span style={s("display:block;font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E;margin-top:3px")}>{r.co}</span>
              </span>
              <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:11px 8px 11px 0")}>{r.purpose}</span>
              <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;padding:11px 8px 11px 0")}>{r.when}</span>
              <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;padding:11px 8px 11px 0")}>{r.host}</span>
              <span style={s("padding:11px 0")}>
                <span style={s(`display:block;font:400 12px/1.3 Roboto,system-ui,sans-serif;color:${r.outC}`)}>{r.out}</span>
                <span style={s("display:block;font:400 11px/1.4 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E;margin-top:3px")}>{r.note}</span>
              </span>
            </div>
          ))}
          {v.vrEmpty && (
            <div style={s("padding:20px 16px;font:400 13px/1.4 Roboto,system-ui,sans-serif;color:#79747E")}>{v.vrEmptyCopy}</div>
          )}
          <div style={s("padding:12px 16px;background:#F7F2FA;font:400 11px/1.4 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#79747E")}>YOU SEE YOUR OWN REQUESTS AND THEIR DECISIONS &mdash; NOT THE PROJECT&rsquo;S VISITOR REGISTER</div>
        </div>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px")}>
          <div style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>New request</div>
          <div style={s("display:flex;flex-direction:column;gap:12px;margin-top:14px")}>
            <label style={s("display:block")}><span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Name</span><input value={v.vrName} onChange={v.vrSetName} placeholder="Visitor name" style={s("width:100%;min-height:40px;padding:8px 12px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:#FEF7FF;border:1px solid #79747E;border-radius:4px")} /></label>
            <label style={s("display:block")}><span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Company</span><input value={v.vrCompany} onChange={v.vrSetCompany} placeholder="Their employer" style={s("width:100%;min-height:40px;padding:8px 12px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:#FEF7FF;border:1px solid #79747E;border-radius:4px")} /></label>
            {/* ponytail: unbound and unsent — `VisitRequest` has no mobile column and
                `RequestPayload` is extra="forbid", so sending it is a 422. Add the
                column, then bind this like the fields above. */}
            <label style={s("display:block")}><span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Mobile &mdash; the GC texts the pass here</span><input placeholder="+60"style={s("width:100%;min-height:40px;padding:8px 12px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:#FEF7FF;border:1px solid #79747E;border-radius:4px")} /></label>
            <label style={s("display:block")}><span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Why they need to come</span><textarea value={v.vrPurpose} onChange={v.vrSetPurpose} placeholder="Rebar sample inspection" style={s("width:100%;min-height:64px;padding:8px 12px;font:400 14px/1.4 Roboto,system-ui,sans-serif;background:#FEF7FF;border:1px solid #79747E;border-radius:4px;resize:vertical")} /></label>
            <div>
              <span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:8px")}>Where and when you are asking for</span>
              <div style={s("display:flex;flex-wrap:wrap;gap:8px")}>
                {v.vrZones.map((z, i) => (
                  <button key={i} onClick={z.go} style={s(`font:500 13px/1 Roboto,system-ui,sans-serif;height:32px;padding:0 14px;border-radius:8px;cursor:pointer;color:${z.fg};border:1px solid ${z.bd};background:${z.bg}`)}>{z.t}</button>
                ))}
              </div>
            </div>
            <div style={s("display:flex;gap:10px")}>
              <input value={v.vrDay} onChange={v.vrSetDay} style={s("flex:1;min-height:40px;padding:8px 12px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:#FEF7FF;border:1px solid #79747E;border-radius:4px")} />
              <input value={v.vrWindow} onChange={v.vrSetWindow} style={s("flex:1;min-height:40px;padding:8px 12px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:#FEF7FF;border:1px solid #79747E;border-radius:4px")} />
            </div>
            <label style={s("display:block")}><span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>GC host you are asking</span><input value={v.vrHost} onChange={v.vrSetHost} style={s("width:100%;min-height:40px;padding:8px 12px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:#FEF7FF;border:1px solid #79747E;border-radius:4px")} /></label>
          </div>
          <div style={s("background:#F7F2FA;border-radius:12px;padding:14px 16px;margin:14px 0")}>
            <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#79747E")}>WHAT HAPPENS NEXT</div>
            <div style={s("font:400 12px/1.5 Roboto,system-ui,sans-serif;color:#49454F;margin-top:8px")}>The host may cut the zones or the hours, and must name an escort. If they decline, the reason appears in your list.</div>
          </div>
          <button onClick={v.vrSend} style={s("width:100%;display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;cursor:pointer")}>Send request</button>
        </div>
      </div>
    </>
  );
}
