import { Fragment } from "react";
import type { VM } from "../vm";
import { s } from "../style";

/**
 * Live dashboard — port of `GC Console HiFi M3.dc.html` template lines 201–269.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Dashboard({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:flex;align-items:center;gap:12px;margin-bottom:16px")}>
        <span style={s("display:flex;align-items:center;gap:7px;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>
          <span style={s("width:6px;height:6px;border-radius:50%;background:#146C2E")} />
          Live &middot; updated {v.agoLabel}
        </span>
        <div style={s("flex:1;height:1px;background:#CAC4D0")} />
        <button onClick={v.goTv} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>
          Reception board
        </button>
        <button onClick={v.goTiles} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>
          Edit layout
        </button>
      </div>

      <div style={s("display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:14px")}>
        {v.tiles.map((t, i) => (
          <div key={i} style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px 18px")}>
            <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F")}>{t.k}</div>
            <div style={s("display:flex;align-items:baseline;gap:9px;margin:12px 0 8px")}>
              <span style={s(`font:400 45px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:${t.c}`)}>{t.v}</span>
              <span style={s(`font:400 12px/1 Roboto,system-ui,sans-serif;color:${t.dc}`)}>{t.delta}</span>
            </div>
            <div style={s("height:3px;background:#E6E0E9;border-radius:4px;overflow:hidden")}>
              <div style={s(`height:3px;background:${t.c};width:${t.pct}`)} />
            </div>
            <div style={s("font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F;margin-top:9px")}>{t.sub}</div>
          </div>
        ))}
      </div>

      <div style={s("display:grid;grid-template-columns:1.5fr 1fr;gap:14px")}>
        <div style={s("display:flex;flex-direction:column;gap:14px")}>
          <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px 18px")}>
            <div style={s("display:flex;align-items:baseline;gap:12px;margin-bottom:16px")}>
              <span style={s("font:400 16px/1 Roboto,system-ui,sans-serif;font-weight:600")}>Turnstile traffic today</span>
              <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F")}>entries by hour &middot; all gates</span>
              <span style={s("margin-left:auto;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E")}>Peak 06:00&ndash;07:00</span>
            </div>
            <div style={s("display:flex;align-items:flex-end;gap:6px;height:132px")}>
              {v.hourBars.map((h, i) => (
                <div key={i} style={s("flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end")}>
                  <div style={s(`width:100%;background:${h.c};height:${h.pct};border-radius:4px`)} />
                  <span style={s("font:400 11px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#79747E")}>{h.l}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
            <div style={s("display:flex;align-items:baseline;gap:12px;padding:14px 18px 12px;border-bottom:1px solid #CAC4D0")}>
              <span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>On site by contractor</span>
              <span style={s("margin-left:auto;font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F")}>on site / on register</span>
            </div>
            {v.coBars.map((c, i) => (
              <button key={i} onClick={c.go} style={s("width:100%;display:flex;align-items:center;gap:14px;padding:10px 18px;background:transparent;border:0;border-top:1px solid #E6E0E9;cursor:pointer;text-align:left")}>
                <span style={s("width:172px;flex:none;font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{c.n}</span>
                <span style={s("flex:1;height:8px;background:#E6E0E9;border-radius:4px;overflow:hidden")}>
                  <span style={s(`display:block;height:8px;background:${c.c};width:${c.pct}`)} />
                </span>
                <span style={s("width:88px;flex:none;text-align:right;font:400 14px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F")}>{c.ratio}</span>
                <span style={s(`width:78px;flex:none;text-align:right;font:400 12px/1 Roboto,system-ui,sans-serif;color:${c.flagC}`)}>{c.flag}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={s("display:flex;flex-direction:column;gap:14px")}>
          <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
            <div style={s("display:flex;align-items:baseline;gap:10px;padding:14px 16px 12px;border-bottom:1px solid #CAC4D0")}>
              <span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>Needs a decision</span>
              <button onClick={v.goAlerts} style={s("margin-left:auto;font:400 12px/1 Roboto,system-ui,sans-serif;color:#6750A4;background:transparent;border:0;cursor:pointer")}>
                All alerts &rarr;
              </button>
            </div>
            {v.dashAlerts.map((a, i) => (
              <button key={i} onClick={a.go} style={s("width:100%;display:flex;align-items:flex-start;gap:10px;padding:11px 16px;background:transparent;border:0;border-top:1px solid #E6E0E9;cursor:pointer;text-align:left")}>
                <span style={s(`width:3px;align-self:stretch;flex:none;background:${a.c}`)} />
                <span style={s("flex:1;min-width:0")}>
                  <span style={s("display:block;font:400 14px/1.4 Roboto,system-ui,sans-serif")}>{a.t}</span>
                  <span style={s("display:block;font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F;margin-top:2px")}>{a.s}</span>
                </span>
                <span style={s(`flex:none;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:${a.c};border:1px solid ${a.c};border-radius:8px;padding:3px 6px`)}>{a.n}</span>
              </button>
            ))}
          </div>

          <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
            <div style={s("display:flex;align-items:baseline;gap:10px;padding:14px 16px 12px;border-bottom:1px solid #CAC4D0")}>
              <span style={s("font:500 16px/1 Roboto,system-ui,sans-serif")}>Live movements</span>
              <button onClick={v.goLog} style={s("margin-left:auto;font:400 12px/1 Roboto,system-ui,sans-serif;color:#6750A4;background:transparent;border:0;cursor:pointer")}>
                Access log &rarr;
              </button>
            </div>
            <div style={s("padding:4px 0")}>
              {v.moves.map((m, i) => (
                <Fragment key={i}>
                  <div style={s("display:flex;align-items:center;gap:10px;padding:7px 16px;font:400 12px/1.3 Roboto,system-ui,sans-serif")}>
                    <span style={s("font-variant-numeric:tabular-nums;color:#79747E;width:42px;flex:none")}>{m.t}</span>
                    <span style={s("flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{m.n}</span>
                    <span style={s("font:400 11px/1 Roboto,system-ui,sans-serif;color:#49454F")}>{m.g}</span>
                    <span style={s(`width:34px;flex:none;text-align:right;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:${m.c}`)}>{m.d}</span>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
