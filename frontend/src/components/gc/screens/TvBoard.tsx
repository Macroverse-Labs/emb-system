import type { VM } from "../vm";
import { s } from "../style";

/**
 * Reception board — port of `GC Console HiFi M3.dc.html` template lines 72–112.
 *
 * Not wrapped in the app shell: this screen renders its own full-height dark
 * layout. Style strings are copied from the design character-for-character and
 * passed through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function TvBoard({ v }: { v: VM }) {
  return (
    <div style={s("height:100vh;background:#141218;color:#E6E0E9;display:flex;flex-direction:column;padding:38px 46px 32px;gap:26px")}>
      <div style={s("display:flex;align-items:baseline;gap:20px;padding-bottom:20px;border-bottom:1px solid #49454F")}>
        <div style={s("font:400 36px/1 Roboto,system-ui,sans-serif;letter-spacing:.01em")}>Emerald Bay &mdash; Block A</div>
        <div style={s("font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#CAC5CD")}>Live site occupancy</div>
        <div style={s("margin-left:auto;font:400 28px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#D0BCFF")}>{v.clock}</div>
        <button onClick={v.exitTv} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#CAC5CD;background:transparent;border:1px solid #938F99;border-radius:9999px;padding:0 24px;cursor:pointer")}>
          Exit board
        </button>
      </div>

      <div style={s("display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#49454F")}>
        {v.tvTiles.map((t, i) => (
          <div key={i} style={s("background:#322F35;padding:24px 26px 26px")}>
            <div style={s("font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#CAC5CD")}>{t.k}</div>
            <div style={s(`font:400 57px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;margin:14px 0 6px;color:${t.c}`)}>{t.v}</div>
            <div style={s("font:400 14px/1.4 Roboto,system-ui,sans-serif;color:#CAC5CD")}>{t.sub}</div>
          </div>
        ))}
      </div>

      <div style={s("flex:1;display:grid;grid-template-columns:1.35fr 1fr;gap:34px;min-height:0")}>
        <div style={s("display:flex;flex-direction:column;gap:14px;min-height:0")}>
          <div style={s("font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#CAC5CD")}>On site by contractor</div>
          {v.coBars.map((c, i) => (
            <div key={i} style={s("display:flex;align-items:center;gap:16px")}>
              <div style={s("width:200px;flex:none;font:400 19px/1.3 Roboto,system-ui,sans-serif")}>{c.n}</div>
              <div style={s("flex:1;height:16px;background:#322F35")}>
                <div style={s(`height:16px;background:#6750A4;width:${c.pct}`)} />
              </div>
              <div style={s("width:64px;flex:none;text-align:right;font:400 24px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums")}>{c.on}</div>
            </div>
          ))}
        </div>

        <div style={s("display:flex;flex-direction:column;gap:14px;border-left:1px solid #49454F;padding-left:34px;min-height:0")}>
          <div style={s("font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#CAC5CD")}>Documentation &mdash; needs attention</div>
          <div style={s("display:flex;align-items:baseline;gap:14px")}>
            <span style={s("font:400 57px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#D0BCFF")}>18</span>
            <span style={s("font:400 16px/1.4 Roboto,system-ui,sans-serif;color:#CAC5CD")}>expiring inside 14 days</span>
          </div>
          <div style={s("display:flex;align-items:baseline;gap:14px")}>
            <span style={s("font:400 57px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#F2B8B5")}>6</span>
            <span style={s("font:400 16px/1.4 Roboto,system-ui,sans-serif;color:#CAC5CD")}>expired &mdash; access blocked at the gate</span>
          </div>
          <div style={s("height:1px;background:#49454F;margin:6px 0")} />
          <div style={s("font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#CAC5CD")}>Last movements</div>
          {v.tvMoves.map((m, i) => (
            <div key={i} style={s("display:flex;align-items:baseline;gap:12px;font:400 16px/1.5 Roboto,system-ui,sans-serif;color:#E6E0E9")}>
              <span style={s("font-variant-numeric:tabular-nums;color:#CAC5CD")}>{m.t}</span>
              <span style={s("flex:1")}>{m.n}</span>
              <span style={s(`color:${m.c}`)}>{m.d}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
