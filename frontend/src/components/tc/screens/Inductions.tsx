import type { VM } from "../vm";
import { s } from "@/components/gc/style";

/**
 * Inductions — port of `TC Console HiFi M3.dc.html` template lines 569–616.
 *
 * The design names the slot-row loop variable `row` and the cell `c`; both are kept.
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Inductions({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:grid;grid-template-columns:322px 1fr;gap:14px;align-items:start")}>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;overflow:hidden")}>
          <div style={s("padding:14px 16px 12px;border-bottom:1px solid #CAC4D0")}>
            <div style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>Cleared to book</div>
            <div style={s("font:400 11px/1.4 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E;margin-top:5px")}>DOCUMENTS VALIDATED BY THE GC &mdash; NOBODY ELSE APPEARS HERE</div>
          </div>
          {v.indCleared.map((c, i) => (
            <button key={i} onClick={c.pick} style={s(`width:100%;display:flex;align-items:center;gap:12px;padding:11px 16px;border:0;border-bottom:1px solid #E6E0E9;cursor:${c.cursor};text-align:left;background:${c.bg};opacity:${c.op}`)}>
              <span style={s(`width:16px;height:16px;flex:none;border-radius:4px;display:flex;align-items:center;justify-content:center;font:400 11px/1 Roboto,system-ui,sans-serif;color:#FEF7FF;border:1px solid ${c.bd};background:${c.box}`)}>{c.tick}</span>
              <span style={s("flex:1;min-width:0")}><span style={s("display:block;font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{c.n}</span><span style={s("display:block;font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E;margin-top:3px")}>{c.sub}</span></span>
            </button>
          ))}
          <div style={s("display:flex;align-items:center;gap:12px;padding:12px 16px;background:#F7F2FA")}>
            <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F")}>{v.indSelLabel}</span>
            <button onClick={v.indBook} style={s("margin-left:auto;display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 20px;cursor:pointer")}>Book selected</button>
          </div>
        </div>
        <div>
          <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px 18px")}>
            <div style={s("display:flex;align-items:baseline;gap:12px;margin-bottom:16px")}><span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>Available slots</span><span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F")}>week of 24 Aug &middot; capacity shown, not hidden behind a submit</span></div>
            <div style={s("display:grid;grid-template-columns:64px repeat(5,1fr);gap:8px;margin-bottom:8px")}>
              <span />
              {v.indDays.map((d, i) => (
                <span key={i} style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#49454F;text-align:center")}>{d.t}</span>
              ))}
            </div>
            {v.indRows.map((row, ri) => (
              <div key={ri} style={s("display:grid;grid-template-columns:64px repeat(5,1fr);gap:8px;margin-bottom:8px;align-items:stretch")}>
                <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F;align-self:center")}>{row.time}</span>
                {row.cells.map((c, ci) => (
                  <button key={ci} onClick={c.go} style={s(`min-height:78px;display:flex;flex-direction:column;justify-content:center;gap:6px;padding:10px 12px;border-radius:12px;cursor:${c.cursor};text-align:left;border:1px solid ${c.bd};background:${c.bg}`)}>
                    <span style={s(`font:500 13px/1 Roboto,system-ui,sans-serif;color:${c.fg}`)}>{c.label}</span>
                    <span style={s(`font:400 11px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:${c.subC}`)}>{c.sub}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px;margin-top:14px;display:flex;align-items:center;gap:18px")}>
            <div><div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#79747E")}>SELECTED SLOT</div><div style={s("font:400 18px/1.3 Roboto,system-ui,sans-serif;margin-top:8px")}>{v.indSlotLabel}</div></div>
            <div style={s("width:1px;height:44px;background:#CAC4D0")} />
            <div style={s("font:400 12px/1.5 Roboto,system-ui,sans-serif;color:#49454F;max-width:420px")}>Cards are issued at the end of the session and access starts then &mdash; not when you book.</div>
          </div>
        </div>
      </div>
    </>
  );
}
