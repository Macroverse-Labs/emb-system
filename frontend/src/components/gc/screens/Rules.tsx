import type { VM } from "../vm";
import { s } from "../style";

/**
 * Access rules — port of `GC Console HiFi M3.dc.html` template lines 699–733.
 */
export default function Rules({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px")}>
        {v.arThresholds.map((t, i) => (
          <div key={i} style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:14px 16px")}>
            <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F")}>{t.k}</div>
            <div style={s("font:400 28px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;margin:10px 0 7px")}>{t.v}</div>
            <div style={s("font:400 12px/1.5 Roboto,system-ui,sans-serif;color:#49454F")}>{t.sub}</div>
          </div>
        ))}
      </div>

      <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;overflow:hidden")}>
        <div style={s("display:flex;align-items:center;gap:12px;padding:13px 18px;border-bottom:1px solid #CAC4D0")}>
          <span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>Zone &times; requirement</span>
          <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F")}>click a cell to cycle: required &rarr; advisory &rarr; not applicable</span>
          <button onClick={v.arReset} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;margin-left:auto;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#49454F;background:transparent;border:1px solid #CAC4D0;border-radius:9999px;padding:0 12px;cursor:pointer")}>
            Revert
          </button>
          <button onClick={v.arSave} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>
            Publish rules
          </button>
        </div>
        <div style={s("display:grid;grid-template-columns:168px repeat(7,1fr);background:#F7F2FA;border-bottom:1px solid #CAC4D0")}>
          <span style={s("padding:11px 16px;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>Zone</span>
          {v.arMatrixCols.map((c, i) => (
            <span key={i} style={s("padding:11px 8px;font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;text-align:center")}>{c}</span>
          ))}
        </div>
        {v.arRows.map((r, i) => (
          <div key={i} style={s("display:grid;grid-template-columns:168px repeat(7,1fr);border-bottom:1px solid #E6E0E9")}>
            <span style={s("padding:12px 16px;font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{r.z}</span>
            {r.cells.map((c, j) => (
              <button key={j} onClick={c.go} title={c.title} style={s(`border:0;border-left:1px solid #E6E0E9;cursor:pointer;font:400 16px/1 Roboto,system-ui,sans-serif;padding:10px 0;color:${c.c};background:${c.bg}`)}>{c.l}</button>
            ))}
          </div>
        ))}
        <div style={s("display:flex;gap:22px;padding:12px 18px;font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F")}>
          <span style={s("color:#6750A4")}>&#9679; required &mdash; refused at the reader</span>
          <span>&#9675; advisory &mdash; warning only</span>
          <span style={s("color:#79747E")}>&middot; not applicable</span>
        </div>
      </div>
    </>
  );
}
