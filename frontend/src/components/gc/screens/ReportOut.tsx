import { Fragment } from "react";
import type { VM } from "../vm";
import { s } from "../style";

/**
 * Report output — port of `GC Console HiFi M3.dc.html` template lines 1139–1175.
 *
 * The row loop emits eight bare grid cells, so it uses a keyed `Fragment` to
 * stay a direct child of the grid.
 */
export default function ReportOut({ v }: { v: VM }) {
  return (
    <>
      <button onClick={v.roBack} style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#6750A4;background:transparent;border:0;cursor:pointer;padding:0;margin-bottom:12px")}>
        &larr; Reports
      </button>
      <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:28px 32px 30px;max-width:1000px")}>
        <div style={s("display:flex;align-items:flex-end;gap:16px;padding-bottom:18px;border-bottom:1px solid #CAC4D0")}>
          <div style={s("flex:1")}>
            <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E")}>Emerald Bay Block A &middot; EMB1A</div>
            <div style={s("font:400 28px/1.1 Roboto,system-ui,sans-serif;margin-top:9px")}>Daily attendance</div>
          </div>
          <div style={s("text-align:right;font:400 12px/1.6 Roboto,system-ui,sans-serif;color:#49454F")}>
            Monday 25 August 2026<br />Generated 06:30 &middot; scheduled
          </div>
          <button onClick={v.roDownload} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>
            Download
          </button>
        </div>
        <div style={s("display:grid;grid-template-columns:1.6fr 90px 90px 90px 90px 90px 90px 90px;margin-top:6px")}>
          <span style={s("padding:12px 8px 12px 0;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F;border-bottom:1px solid #CAC4D0")}>Contractor</span>
          <span style={s("padding:12px 8px;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;text-align:right;border-bottom:1px solid #CAC4D0")}>Register</span>
          <span style={s("padding:12px 8px;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;text-align:right;border-bottom:1px solid #CAC4D0")}>On site</span>
          <span style={s("padding:12px 8px;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;text-align:right;border-bottom:1px solid #CAC4D0")}>Attended</span>
          <span style={s("padding:12px 8px;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;text-align:right;border-bottom:1px solid #CAC4D0")}>Expiring</span>
          <span style={s("padding:12px 8px;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;text-align:right;border-bottom:1px solid #CAC4D0")}>Blocked</span>
          <span style={s("padding:12px 8px;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;text-align:right;border-bottom:1px solid #CAC4D0")}>First in</span>
          <span style={s("padding:12px 0 12px 8px;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;text-align:right;border-bottom:1px solid #CAC4D0")}>Last out</span>
          {v.roRows.map((r, i) => (
            <Fragment key={i}>
              <span style={s("padding:11px 8px 11px 0;font:400 14px/1.3 Roboto,system-ui,sans-serif;border-bottom:1px solid #E6E0E9")}>{r.co}</span>
              <span style={s("padding:11px 8px;font:400 14px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;text-align:right;border-bottom:1px solid #E6E0E9")}>{r.reg}</span>
              <span style={s("padding:11px 8px;font:400 14px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;text-align:right;border-bottom:1px solid #E6E0E9")}>{r.on}</span>
              <span style={s("padding:11px 8px;font:400 14px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;text-align:right;border-bottom:1px solid #E6E0E9")}>{r.att}</span>
              <span style={s(`padding:11px 8px;font:400 14px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;text-align:right;border-bottom:1px solid #E6E0E9;color:${r.expC}`)}>{r.exp}</span>
              <span style={s(`padding:11px 8px;font:400 14px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;text-align:right;border-bottom:1px solid #E6E0E9;color:${r.blkC}`)}>{r.blk}</span>
              <span style={s("padding:11px 8px;font:400 14px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;text-align:right;border-bottom:1px solid #E6E0E9")}>{r.first}</span>
              <span style={s("padding:11px 0 11px 8px;font:400 14px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;text-align:right;border-bottom:1px solid #E6E0E9")}>{r.last}</span>
            </Fragment>
          ))}
        </div>
        <div style={s("display:flex;gap:34px;margin-top:22px;padding-top:16px;border-top:1px solid #CAC4D0")}>
          <span>
            <span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E")}>Total on site</span>
            <span style={s("display:block;font:400 32px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;margin-top:8px")}>1,132</span>
          </span>
          <span>
            <span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E")}>Attendance rate</span>
            <span style={s("display:block;font:400 32px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;margin-top:8px")}>62%</span>
          </span>
          <span>
            <span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E")}>Refused entries</span>
            <span style={s("display:block;font:400 32px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;margin-top:8px")}>38</span>
          </span>
          <span style={s("flex:1;align-self:flex-end;text-align:right;font:400 12px/1.6 Roboto,system-ui,sans-serif;color:#79747E")}>
            Figures are taken from turnstile events, not from timesheets.<br />Buffered events from devices on 4G are included once uploaded.
          </span>
        </div>
      </div>
    </>
  );
}
