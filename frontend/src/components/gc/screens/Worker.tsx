import type { VM } from "../vm";
import { s } from "../style";

/**
 * Worker profile — port of `GC Console HiFi M3.dc.html` template lines 320–481.
 *
 * Style strings are copied from the design character-for-character and passed
 * through `s()`; do not "tidy" them, or the port stops matching the canvas.
 */
export default function Worker({ v }: { v: VM }) {
  return (
    <>
      <button onClick={v.wpBack} style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#6750A4;background:transparent;border:0;cursor:pointer;padding:0;margin-bottom:12px")}>
        &larr; Worker register
      </button>

      <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:20px 22px;display:flex;gap:22px;align-items:flex-start;margin-bottom:14px")}>
        <span style={s("width:78px;height:78px;flex:none;border-radius:8px;background:#E6E0E9;border:6px solid #ECE6F0;outline:1px solid #CAC4D0;position:relative;overflow:hidden")}>
          <span style={s("position:absolute;left:50%;top:14px;transform:translateX(-50%);width:26px;height:26px;border-radius:50%;background:#AEA9B1")} />
          <span style={s("position:absolute;left:50%;top:46px;transform:translateX(-50%);width:52px;height:34px;border-radius:26px 26px 0 0;background:#AEA9B1")} />
        </span>
        <div style={s("flex:1;min-width:0")}>
          <div style={s("display:flex;align-items:baseline;gap:12px")}>
            <h2 style={s("font:400 28px/1.1 Roboto,system-ui,sans-serif;margin:0")}>{v.wpName}</h2>
            <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F")}>{v.wpId}</span>
          </div>
          <div style={s("display:flex;flex-wrap:wrap;gap:0 22px;margin-top:10px;font:400 14px/1.6 Roboto,system-ui,sans-serif;color:#49454F")}>
            <span>{v.wpCo}</span>
            <span>{v.wpRole}</span>
            <span>{v.wpNat}</span>
            <span>{v.wpSeen}</span>
          </div>
          <div style={s("display:flex;align-items:center;gap:8px;margin-top:12px")}>
            <span style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#79747E")}>Zones permitted</span>
            <span style={s("font:400 14px/1 Roboto,system-ui,sans-serif")}>{v.wpZones}</span>
          </div>
        </div>
        <div style={s("flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:12px")}>
          <div style={s(`display:flex;align-items:center;gap:8px;padding:7px 12px;border-radius:9999px;border:1px solid ${v.wpStC}`)}>
            <span style={s(`width:7px;height:7px;border-radius:50%;background:${v.wpStC}`)} />
            <span style={s(`font:400 14px/1 Roboto,system-ui,sans-serif;color:${v.wpStC}`)}>{v.wpStL}</span>
          </div>
          <div style={s("display:flex;gap:8px")}>
            <button onClick={v.wpPrint} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>
              Export record
            </button>
            <button onClick={v.wpAddTraining} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>
              Add training
            </button>
            <button onClick={v.wpBlock} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#B3261E;background:transparent;border:1px solid #B3261E;border-radius:9999px;padding:0 24px;cursor:pointer")}>
              Block access
            </button>
          </div>
        </div>
      </div>

      <div style={s("display:flex;gap:20px;border-bottom:1px solid #CAC4D0;margin-bottom:16px")}>
        {v.wpTabs.map((t, i) => (
          <button key={i} onClick={t.go} style={s(`padding:0 0 9px;background:transparent;border:0;border-bottom:2px solid ${t.bd};cursor:pointer;font:400 14px/1 Roboto,system-ui,sans-serif;color:${t.fg}`)}>
            {t.label}
          </button>
        ))}
      </div>

      {v.wt_overview && (
        <>
          <div style={s("display:grid;grid-template-columns:1.25fr 1fr;gap:14px")}>
            <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px")}>
              <div style={s("font:500 16px/1 Roboto,system-ui,sans-serif;margin-bottom:14px")}>Worker information</div>
              {v.wpFacts.map((f, i) => (
                <div key={i} style={s("display:flex;gap:16px;padding:8px 0;border-top:1px solid #E6E0E9")}>
                  <span style={s("width:168px;flex:none;font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F")}>{f.k}</span>
                  <span style={s("flex:1;font:400 14px/1.4 Roboto,system-ui,sans-serif")}>{f.v}</span>
                </div>
              ))}
            </div>
            <div style={s("display:flex;flex-direction:column;gap:14px")}>
              <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px")}>
                <div style={s("font:500 16px/1 Roboto,system-ui,sans-serif;margin-bottom:12px")}>Credentials at the gate</div>
                {v.wpCred.map((c, i) => (
                  <div key={i} style={s("padding:8px 0;border-top:1px solid #E6E0E9")}>
                    <span style={s("display:block;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F")}>{c.k}</span>
                    <span style={s("display:block;font:400 14px/1.4 Roboto,system-ui,sans-serif;margin-top:4px")}>{c.v}</span>
                  </div>
                ))}
              </div>
              <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px")}>
                <div style={s("font:500 16px/1 Roboto,system-ui,sans-serif;margin-bottom:12px")}>Documents</div>
                {v.wpDocs.map((d, i) => (
                  <div key={i} style={s("display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid #E6E0E9")}>
                    <span style={s("flex:1;font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{d.t}</span>
                    <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F")}>{d.exp}</span>
                    <span style={s(`width:66px;text-align:right;font:400 12px/1 Roboto,system-ui,sans-serif;color:${d.stc}`)}>{d.stl}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {v.wt_documents && (
        <>
          <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;overflow:hidden")}>
            <div style={s("display:grid;grid-template-columns:1.4fr 1fr .9fr 1fr .8fr 92px;padding:0 16px;background:#F7F2FA;border-bottom:1px solid #CAC4D0;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#49454F")}>
              <span style={s("padding:11px 8px 11px 0")}>Document</span>
              <span style={s("padding:11px 8px 11px 0")}>Number</span>
              <span style={s("padding:11px 8px 11px 0")}>Expiry</span>
              <span style={s("padding:11px 8px 11px 0")}>Issued by</span>
              <span style={s("padding:11px 8px 11px 0")}>Status</span>
              <span style={s("padding:11px 0;text-align:right")}>Scan</span>
            </div>
            {v.wpDocs.map((d, i) => (
              <div key={i} style={s("display:grid;grid-template-columns:1.4fr 1fr .9fr 1fr .8fr 92px;align-items:center;padding:0 16px;border-bottom:1px solid #E6E0E9")}>
                <span style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif;padding:12px 8px 12px 0")}>{d.t}</span>
                <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F;padding:12px 8px 12px 0")}>{d.no}</span>
                <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;padding:12px 8px 12px 0")}>{d.exp}</span>
                <span style={s("font:400 12px/1.3 Roboto,system-ui,sans-serif;color:#49454F;padding:12px 8px 12px 0")}>{d.prov}</span>
                <span style={s("display:flex;align-items:center;gap:6px;padding:12px 8px 12px 0")}>
                  <span style={s(`width:6px;height:6px;border-radius:50%;background:${d.stc}`)} />
                  <span style={s(`font:400 12px/1 Roboto,system-ui,sans-serif;color:${d.stc}`)}>{d.stl}</span>
                </span>
                <span style={s("text-align:right;padding:8px 0")}>
                  <button onClick={d.go} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 12px;cursor:pointer")}>
                    View
                  </button>
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {v.wt_training && (
        <>
          <div style={s("display:grid;grid-template-columns:repeat(3,1fr);gap:12px")}>
            {v.wpTraining.map((t, i) => (
              <div key={i} style={s(`background:#FEF7FF;border:1px solid #CAC4D0;border-left:2px solid ${t.bd};border-radius:12px;padding:14px 16px`)}>
                <div style={s("font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{t.t}</div>
                <div style={s("display:flex;align-items:baseline;gap:8px;margin-top:10px")}>
                  <span style={s(`font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:${t.stc}`)}>{t.stl}</span>
                  <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F")}>{t.exp}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {v.wt_access && (
        <>
          <div style={s("display:grid;grid-template-columns:1fr 1fr;gap:14px")}>
            <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px")}>
              <div style={s("font:500 16px/1 Roboto,system-ui,sans-serif;margin-bottom:6px")}>Zones permitted</div>
              <p style={s("font:400 12px/1.6 Roboto,system-ui,sans-serif;color:#49454F;margin:0 0 12px")}>Permission is granted here, but the gate still checks the zone&rsquo;s own minimum criteria at the moment of entry.</p>
              <div style={s("font:400 14px/1.8 Roboto,system-ui,sans-serif")}>{v.wpZones}</div>
            </div>
            <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px")}>
              <div style={s("font:500 16px/1 Roboto,system-ui,sans-serif;margin-bottom:12px")}>Credentials</div>
              {v.wpCred.map((c, i) => (
                <div key={i} style={s("padding:8px 0;border-top:1px solid #E6E0E9")}>
                  <span style={s("display:block;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F")}>{c.k}</span>
                  <span style={s("display:block;font:400 14px/1.4 Roboto,system-ui,sans-serif;margin-top:4px")}>{c.v}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {v.wt_hours && (
        <>
          <div style={s("display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px")}>
            {v.wpHours.map((h, i) => (
              <div key={i} style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:14px 16px")}>
                <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F")}>{h.k}</div>
                <div style={s(`font:400 32px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;margin:10px 0 6px;color:${h.c}`)}>{h.v}</div>
                <div style={s("font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F")}>{h.sub}</div>
              </div>
            ))}
          </div>
          <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:16px 18px")}>
            <div style={s("font:500 16px/1 Roboto,system-ui,sans-serif;margin-bottom:14px")}>This week, by day</div>
            {v.wpDays.map((d, i) => (
              <div key={i} style={s("display:flex;align-items:center;gap:14px;padding:6px 0")}>
                <span style={s("width:44px;flex:none;font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F")}>{d.d}</span>
                <span style={s("width:74px;flex:none;font:400 14px/1 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums")}>{d.h}</span>
                <span style={s("flex:1;height:8px;background:#E6E0E9;border-radius:4px;overflow:hidden")}>
                  <span style={s(`display:block;height:8px;background:#6750A4;width:${d.pct}`)} />
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {v.wt_violations && (
        <>
          <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px")}>
            {v.wpViol.map((vi, i) => (
              <div key={i} style={s("display:flex;gap:16px;padding:14px 18px;border-bottom:1px solid #E6E0E9")}>
                <span style={s("width:96px;flex:none;font:400 12px/1.4 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F")}>{vi.d}</span>
                <span style={s("flex:1")}>
                  <span style={s("display:block;font:400 14px/1.4 Roboto,system-ui,sans-serif")}>{vi.t}</span>
                  <span style={s("display:block;font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F;margin-top:3px")}>Recorded by {vi.by}</span>
                </span>
                <span style={s(`flex:none;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:${vi.c};border:1px solid ${vi.c};border-radius:8px;padding:5px 8px;align-self:flex-start`)}>{vi.lvl}</span>
              </div>
            ))}
            <div style={s("padding:12px 18px;font:400 12px/1.5 Roboto,system-ui,sans-serif;color:#49454F")}>Two of three. A third recorded violation blocks site access automatically and needs a GC administrator to lift it.</div>
          </div>
        </>
      )}

      {v.wt_timeline && (
        <>
          <div style={s("background:#FEF7FF;border:1px solid #CAC4D0;border-radius:12px;padding:6px 18px 14px")}>
            {v.wpTimeline.map((t, i) => (
              <div key={i} style={s("display:flex;gap:18px;padding:11px 0;border-bottom:1px solid #E6E0E9")}>
                <span style={s("width:118px;flex:none;font:400 12px/1.4 Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:#49454F")}>{t.t}</span>
                <span style={s("flex:1;font:400 14px/1.4 Roboto,system-ui,sans-serif")}>{t.e}</span>
                <span style={s("flex:none;font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F")}>{t.m}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {v.modalBlock && (
        <>
          <div onClick={v.closeModal} style={s("position:fixed;inset:0;background:rgba(0,0,0,.32);display:grid;place-items:center;z-index:60")}>
            <div onClick={v.stop} style={s("width:min(460px,92vw);background:#FEF7FF;border:1px solid #CAC4D0;border-radius:28px;box-shadow:0 12px 32px rgba(0,0,0,.3);padding:22px 24px;animation:fadeUp .16s ease")}>
              <div style={s("font:400 22px/1.15 Roboto,system-ui,sans-serif;margin-bottom:8px")}>Block access for {v.wpName}?</div>
              <p style={s("font:400 14px/1.6 Roboto,system-ui,sans-serif;color:#49454F;margin:0 0 16px")}>Every gate refuses the card from the moment you confirm. The worker stays on the register, and {v.wpCo} is notified with the reason you give.</p>
              <label style={s("display:block;margin-bottom:14px")}>
                <span style={s("display:block;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Reason recorded against your account</span>
                <textarea placeholder="e.g. Third safety violation &mdash; removed pending re-induction" style={s("width:100%;min-height:74px;padding:9px 11px;font:400 14px/1.5 Roboto,system-ui,sans-serif;background:transparent;border:1px solid #79747E;border-radius:4px;resize:vertical")} />
              </label>
              <div style={s("display:flex;justify-content:flex-end;gap:9px")}>
                <button onClick={v.closeModal} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>
                  Cancel
                </button>
                <button onClick={v.confirmBlock} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#B3261E;background:transparent;border:1px solid #B3261E;border-radius:9999px;padding:0 24px;cursor:pointer")}>
                  Block at every gate
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {v.modalTraining && (
        <>
          <div onClick={v.closeModal} style={s("position:fixed;inset:0;background:rgba(0,0,0,.32);display:grid;place-items:center;z-index:60")}>
            <div onClick={v.stop} style={s("width:min(500px,92vw);background:#FEF7FF;border:1px solid #CAC4D0;border-radius:28px;box-shadow:0 12px 32px rgba(0,0,0,.3);padding:22px 24px;animation:fadeUp .16s ease")}>
              <div style={s("font:400 22px/1.15 Roboto,system-ui,sans-serif;margin-bottom:16px")}>Add a training record</div>
              <div style={s("display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px")}>
                <label style={s("display:block")}>
                  <span style={s("display:block;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Course</span>
                  <select style={s("width:100%;min-height:38px;padding:7px 10px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:transparent;border:1px solid #79747E;border-radius:4px")}>
                    <option>Working at height</option>
                    <option>Confined space</option>
                    <option>Hot works</option>
                    <option>Electrical LV</option>
                  </select>
                </label>
                <label style={s("display:block")}>
                  <span style={s("display:block;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Expires</span>
                  <input defaultValue="04 Apr 2028" style={s("width:100%;min-height:38px;padding:7px 10px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:transparent;border:1px solid #79747E;border-radius:4px")} />
                </label>
                <label style={s("display:block")}>
                  <span style={s("display:block;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Provider</span>
                  <input defaultValue="Safe Arc Training" style={s("width:100%;min-height:38px;padding:7px 10px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:transparent;border:1px solid #79747E;border-radius:4px")} />
                </label>
                <label style={s("display:block")}>
                  <span style={s("display:block;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:6px")}>Certificate scan</span>
                  <span style={s("display:flex;align-items:center;justify-content:center;min-height:38px;font:400 12px/1 Roboto,system-ui,sans-serif;color:#49454F;border:1px dashed #CAC4D0;border-radius:12px")}>Drop a file</span>
                </label>
              </div>
              <div style={s("display:flex;justify-content:flex-end;gap:9px")}>
                <button onClick={v.closeModal} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:9999px;padding:0 24px;cursor:pointer")}>
                  Cancel
                </button>
                <button onClick={v.confirmTraining} style={s("display:inline-flex;align-items:center;justify-content:center;height:40px;font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#FFFFFF;background:#6750A4;border:0;border-radius:9999px;padding:0 24px;cursor:pointer")}>
                  Add record
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
