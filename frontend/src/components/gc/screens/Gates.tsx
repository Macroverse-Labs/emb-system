import type { VM } from "../vm";
import { s } from "../style";

/**
 * Gate graph — port of `GC Console HiFi M3.dc.html` template lines 671–698.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Gates({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start")}>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
          <div style={s("padding:13px 18px;border-bottom:1px solid #CAC4D0")}>
            <span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>Perimeter &mdash; where people enter the project</span>
          </div>
          {v.ggGates.map((g, i) => (
            <button key={i} onClick={g.go} style={s("width:100%;display:flex;align-items:center;gap:14px;padding:14px 18px;background:transparent;border:0;border-bottom:1px solid #E6E0E9;cursor:pointer;text-align:left")}>
              <span style={s("width:44px;height:44px;flex:none;border:1px solid #CAC4D0;border-radius:8px;display:flex;align-items:center;justify-content:center;font:400 15px/1 Roboto,system-ui,sans-serif;color:#49454F")}>&#9974;</span>
              <span style={s("flex:1;min-width:0")}>
                <span style={s("display:block;font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{g.n}</span>
                <span style={s("display:block;font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F;margin-top:3px")}>{g.dev} &middot; {g.fa} &middot; to {g.zone}</span>
              </span>
              <span style={s("flex:none;text-align:right")}>
                <span style={s("display:block;font:400 22px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums")}>{g.in}</span>
                <span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E;margin-top:4px")}>in today</span>
              </span>
              <span style={s(`width:132px;flex:none;text-align:right;font:400 12px/1.3 Roboto,system-ui,sans-serif;color:${g.c}`)}>{g.st}</span>
            </button>
          ))}
        </div>

        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
          <div style={s("padding:13px 18px;border-bottom:1px solid #CAC4D0")}>
            <span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>Inner readers &mdash; zone to zone</span>
          </div>
          {v.ggInner.map((r, i) => (
            <div key={i} style={s("display:flex;align-items:center;gap:14px;padding:14px 18px;border-bottom:1px solid #E6E0E9")}>
              <span style={s("width:96px;flex:none;font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F")}>{r.from}</span>
              <span style={s("flex:none;font:400 12px/1 Roboto,system-ui,sans-serif;color:#6750A4")}>&rarr;</span>
              <span style={s("flex:1;min-width:0")}>
                <span style={s("display:block;font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{r.n}</span>
                <span style={s("display:block;font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;margin-top:3px")}>{r.fa}</span>
              </span>
              <span style={s("flex:none;font:400 14px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F")}>{r.pop} permitted</span>
            </div>
          ))}
          <div style={s("padding:13px 18px;font:400 12px/1.6 Roboto,system-ui,sans-serif;color:#49454F")}>
            This graph is generated from the devices, not drawn by hand. Add a reader and the path appears; remove it and the zone becomes unreachable.
          </div>
        </div>
      </div>
    </>
  );
}
