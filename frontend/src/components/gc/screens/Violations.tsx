import type { VM } from "../vm";
import { s } from "../style";

/**
 * Violations &amp; warnings — port of `GC Console HiFi M3.dc.html` template lines 834–873.
 *
 * The design names the `vlRows` loop variable `v`, which would shadow the view
 * model; it is `r` here.
 */
export default function Violations({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px")}>
        {v.vlLadder.map((l, i) => (
          <div key={i} style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:14px 16px;display:flex;gap:14px;align-items:flex-start")}>
            <span style={s(`font:400 36px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:${l.c}`)}>{l.n}</span>
            <span>
              <span style={s("display:block;font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{l.l}</span>
              <span style={s("display:block;font:400 12px/1.5 Roboto,system-ui,sans-serif;color:#49454F;margin-top:4px")}>{l.s}</span>
            </span>
          </div>
        ))}
      </div>

      <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
        <div style={s("display:flex;align-items:center;gap:12px;padding:13px 18px;border-bottom:1px solid #CAC4D0")}>
          <span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>Recorded violations</span>
          <button onClick={v.vlNew} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;margin-left:auto;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>
            Record a violation
          </button>
        </div>
        {v.vlRows.map((r, i) => (
          <div key={i} onClick={r.go} style={s("display:flex;align-items:center;gap:14px;padding:13px 18px;border-bottom:1px solid #E6E0E9;cursor:pointer")}>
            <span style={s("width:110px;flex:none;font:400 12px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F")}>{r.d}</span>
            <span style={s("width:180px;flex:none;min-width:0")}>
              <span style={s("display:block;font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{r.n}</span>
              <span style={s("display:block;font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;margin-top:2px")}>{r.co}</span>
            </span>
            <span style={s("flex:1;font:400 14px/1.4 Roboto,system-ui,sans-serif")}>{r.t}</span>
            <span style={s("width:120px;flex:none;font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F")}>{r.by}</span>
            <span style={s(`flex:none;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.05em;color:${r.c};border:1px solid ${r.c};border-radius:8px;padding:5px 8px`)}>{r.lvl}</span>
          </div>
        ))}
      </div>

      {v.vlModal && (
        <>
          <div onClick={v.closeAll} style={s("position:fixed;inset:0;background:rgba(0,0,0,.32);display:grid;place-items:center;z-index:60")}>
            <div onClick={v.stop} style={s("width:min(520px,92vw);background:#FEF7FF;border:1px solid #CAC4D0;border-radius:28px;box-shadow:0 12px 32px rgba(0,0,0,.3);padding:22px 24px;animation:fadeUp .16s ease")}>
              <div style={s("font:400 22px/1.15 Roboto,system-ui,sans-serif;margin-bottom:16px")}>Record a violation</div>
              <div style={s("display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px")}>
                <label style={s("display:block")}>
                  <span style={s("display:block;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Worker</span>
                  <input placeholder="Search by name or card" style={s("width:100%;min-height:38px;padding:7px 10px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:transparent;border:1px solid #79747E;border-radius:4px")} />
                </label>
                <label style={s("display:block")}>
                  <span style={s("display:block;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Category</span>
                  <select style={s("width:100%;min-height:38px;padding:7px 10px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:transparent;border:1px solid #79747E;border-radius:4px")}>
                    <option>PPE not worn</option>
                    <option>Unauthorised zone</option>
                    <option>Tailgating</option>
                    <option>Work without a permit</option>
                    <option>Smoking on site</option>
                  </select>
                </label>
              </div>
              <label style={s("display:block;margin-bottom:14px")}>
                <span style={s("display:block;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>What happened</span>
                <textarea style={s("width:100%;min-height:76px;padding:9px 11px;font:400 14px/1.5 Roboto,system-ui,sans-serif;background:transparent;border:1px solid #79747E;border-radius:4px;resize:vertical")} />
              </label>
              <div style={s("font:400 12px/1.6 Roboto,system-ui,sans-serif;color:#49454F;margin-bottom:16px")}>This worker has two recorded violations. A third blocks site access automatically.</div>
              <div style={s("display:flex;justify-content:flex-end;gap:9px")}>
                <button onClick={v.closeAll} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>
                  Cancel
                </button>
                <button onClick={v.vlConfirm} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>
                  Record violation
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
