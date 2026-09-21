import type { VM } from "../vm";
import { s } from "@/components/gc/style";

/**
 * Leavers — port of `TC Console HiFi M3.dc.html` template lines 664–721.
 *
 * A last day, not a delete. "Mark a leaver" off-boards whoever is picked in the
 * "Who is leaving" chips — the design's own chip, reused — and the last-day field is
 * bound to state so a real date reaches `POST /tc/leavers`. Selecting a row in the
 * table instead shows that existing leaver's off-boarding checklist.
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Leavers({ v }: { v: VM }) {
  return (
    <>
      <div style={s("display:flex;align-items:center;gap:20px;border-bottom:1px solid #CAC4D0;margin-bottom:16px")}>
        {v.lvTabs.map((t, i) => (
          <button key={i} onClick={t.go} style={s(`padding:0 0 9px;background:transparent;border:0;border-bottom:2px solid ${t.bd};cursor:pointer;font:400 14px/1 Roboto,system-ui,sans-serif;color:${t.fg}`)}>{t.label}</button>
        ))}
        <button onClick={v.lvMark} style={s("margin-left:auto;margin-bottom:6px;display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>Mark a leaver</button>
      </div>
      <div style={s("display:grid;grid-template-columns:1fr 308px;gap:14px;align-items:start")}>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;overflow:hidden")}>
          <div style={s("display:grid;grid-template-columns:1.3fr .75fr 1.2fr .85fr .8fr 1fr;padding:0 16px;background:#F7F2FA;border-bottom:1px solid #CAC4D0;font:400 11px/1.3 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>
            <span style={s("padding:11px 8px 11px 0")}>WORKER</span>
            <span style={s("padding:11px 8px 11px 0")}>LAST DAY</span>
            <span style={s("padding:11px 8px 11px 0")}>REASON</span>
            <span style={s("padding:11px 8px 11px 0")}>CARD</span>
            <span style={s("padding:11px 8px 11px 0")}>FINAL HOURS</span>
            <span style={s("padding:11px 0")}>STATUS</span>
          </div>
          {v.lvRows.map((r, i) => (
            <button key={i} onClick={r.go} style={s(`width:100%;display:grid;grid-template-columns:1.3fr .75fr 1.2fr .85fr .8fr 1fr;align-items:center;padding:0 16px;border:0;border-bottom:1px solid #E6E0E9;cursor:pointer;text-align:left;background:${r.bg}`)}>
              <span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif;padding:11px 8px 11px 0")}>{r.n}</span>
              <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;padding:11px 8px 11px 0")}>{r.day}</span>
              <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:11px 8px 11px 0")}>{r.reason}</span>
              <span style={s(`font:400 12px/1.3 Roboto,system-ui,sans-serif;color:${r.cardC};padding:11px 8px 11px 0`)}>{r.card}</span>
              <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F;padding:11px 8px 11px 0")}>{r.hours}</span>
              <span style={s("padding:11px 0")}>
                <span style={s(`display:inline-flex;font:400 12px/1 Roboto,system-ui,sans-serif;padding:5px 10px;border-radius:8px;color:${r.stFg};background:${r.stBg}`)}>{r.st}</span>
              </span>
            </button>
          ))}
          {v.lvEmpty && (
            <div style={s("padding:20px 16px;font:400 13px/1.4 Roboto,system-ui,sans-serif;color:#79747E")}>{v.lvEmptyCopy}</div>
          )}
          <div style={s("padding:12px 16px;background:#F7F2FA;font:400 11px/1.4 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#79747E")}>THE GC IS NOTIFIED THE MOMENT A LAST DAY IS SET &mdash; NO SEPARATE EMAIL</div>
        </div>
        <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px")}>
          <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#79747E")}>OFF-BOARDING</div>
          <div style={s("font:400 20px/1.2 Roboto,system-ui,sans-serif;margin:10px 0 4px")}>{v.lvName}</div>
          <div style={s("font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F")}>{v.lvMeta}</div>
          <div style={s("margin-top:14px")}>
            <span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:8px")}>Who is leaving</span>
            <div style={s("display:flex;flex-wrap:wrap;gap:8px")}>
              {v.lvPick.map((p, i) => (
                <button key={i} onClick={p.go} style={s(`font:500 13px/1 Roboto,system-ui,sans-serif;height:32px;padding:0 14px;border-radius:8px;cursor:pointer;color:${p.fg};border:1px solid ${p.bd};background:${p.bg}`)}>{p.t}</button>
              ))}
            </div>
            {v.lvPickEmpty && (
              <div style={s("font:400 13px/1.4 Roboto,system-ui,sans-serif;color:#79747E")}>{v.lvPickEmptyCopy}</div>
            )}
          </div>
          <div style={s("margin-top:16px")}>
            <span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Last day on site</span>
            <input value={v.lvDay} onChange={v.lvSetDay} placeholder="28 Aug 2026" style={s("width:100%;min-height:40px;padding:8px 12px;font:400 14px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;background:#FEF7FF;border:1px solid #79747E;border-radius:4px")} />
          </div>
          <div style={s("margin-top:14px")}>
            <span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:8px")}>Reason</span>
            <div style={s("display:flex;flex-wrap:wrap;gap:8px")}>
              {v.lvReasons.map((r, i) => (
                <button key={i} onClick={r.go} style={s(`font:500 13px/1 Roboto,system-ui,sans-serif;height:32px;padding:0 14px;border-radius:8px;cursor:pointer;color:${r.fg};border:1px solid ${r.bd};background:${r.bg}`)}>{r.t}</button>
              ))}
            </div>
          </div>
          <div style={s("margin-top:16px")}>
            <span style={s("display:block;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Checklist</span>
            {v.lvChecks.map((c, i) => (
              <button key={i} onClick={c.go} style={s("width:100%;display:flex;align-items:center;gap:10px;padding:9px 0;border:0;border-bottom:1px solid #E6E0E9;background:transparent;cursor:pointer;text-align:left")}>
                <span style={s(`width:16px;height:16px;flex:none;border-radius:4px;display:flex;align-items:center;justify-content:center;font:400 11px/1 Roboto,system-ui,sans-serif;color:#FEF7FF;border:1px solid ${c.bd};background:${c.box}`)}>{c.tick}</span>
                <span style={s(`flex:1;font:400 13px/1.4 Roboto,system-ui,sans-serif;color:${c.fg}`)}>{c.t}</span>
              </button>
            ))}
          </div>
          <div style={s("background:#F9DEDC;border-radius:12px;padding:14px 16px;margin:16px 0")}>
            <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.06em;color:#410E0B")}>{v.lvWarnHead}</div>
            <div style={s("font:400 12px/1.5 Roboto,system-ui,sans-serif;color:#410E0B;margin-top:8px")}>{v.lvWarn}</div>
          </div>
          <button onClick={v.lvConfirm} style={s("width:100%;display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;cursor:pointer")}>Confirm off-boarding</button>
        </div>
      </div>
    </>
  );
}
