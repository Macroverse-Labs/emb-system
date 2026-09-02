"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FIXTURE_DATA, type GcData } from "@/lib/gc/data";
import type { MoveRow, Role, Screen } from "@/lib/gc/types";
import { s } from "./style";
import { buildVM, type GcCtx, type GcState, INITIAL_STATE } from "./vm";

/**
 * Roboto and the Material Symbols Outlined ligature font, as the design loads them.
 * React hoists these into <head> from wherever they render, so the console carries
 * them itself and the rest of the app is unaffected.
 *
 * They stay as <link> rather than next/font because the ported style strings name the
 * families literally (`font-family:'Material Symbols Outlined'`) and next/font rewrites
 * them to hashed names. The lint rule disabled below is a Pages Router rule about
 * `_document.js`, which the App Router does not have.
 */
/* eslint-disable @next/next/no-page-custom-font */
const Fonts = () => (
  <>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link
      href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
      rel="stylesheet"
    />
  </>
);
/* eslint-enable @next/next/no-page-custom-font */

/** Used when the console runs standalone on the design's fixtures. */
const OFFLINE_AUTH: GcCtx["auth"] = { signIn: async () => {}, signOut: () => {} };
import { SCREENS } from "./screens";
import "./gc.css";

/** `g` then one of these jumps straight to a screen, as in the design. */
const GOTO: Record<string, Screen> = {
  d: "dashboard", w: "workers", v: "validation", a: "alerts", z: "zones",
  l: "log", r: "rules", u: "users", c: "companies", p: "plan", i: "vrequests",
};

/**
 * The GC console — port of the app shell in `GC Console HiFi M3.dc.html`
 * (template lines 114–199 and 1307–1334) plus the `DCLogic` lifecycle:
 * `componentDidMount`, `pulse`, `key`, `go` and `toast`.
 *
 * One client component holding the whole `state` bag, exactly as the design does.
 * The screens are leaf components that read the assembled view-model.
 */
export default function Console({
  role = "GC administrator" as Role,
  startScreen,
  data = FIXTURE_DATA,
  auth = OFFLINE_AUTH,
  actions,
  live,
  notice,
}: {
  role?: Role;
  startScreen?: Screen;
  data?: GcData;
  auth?: GcCtx["auth"];
  actions?: GcCtx["actions"];
  /** Polled for the turnstile ticker. Omitted, the design's simulated ticker runs. */
  live?: () => Promise<{ clock: string; onSite: number; moves: MoveRow[] }>;
  /** Shown in the toast area when the console is running on fixtures. */
  notice?: string | null;
}) {
  const [state, setState] = useState<GcState>(() =>
    startScreen && startScreen !== "dashboard" ? { ...INITIAL_STATE, screen: startScreen } : INITIAL_STATE,
  );

  const set = useCallback((patch: Partial<GcState>) => setState((prev) => ({ ...prev, ...patch })), []);

  const toast = useCallback((msg: string) => set({ toast: msg }), [set]);

  const go = useCallback(
    (screen: Screen, extra?: Partial<GcState>) =>
      set({ screen, palette: false, pq: "", drawer: null, modal: null, sel: [], openGroup: null, ...extra }),
    [set],
  );

  // Deep-linkable without giving each screen its own route: the design's whole
  // navigation model is `state.screen`, and the palette and g-shortcuts depend on it.
  useEffect(() => {
    window.history.replaceState(null, "", state.screen === "dashboard" ? "/" : `/?s=${state.screen}`);
  }, [state.screen]);

  // Toast clears itself 2.6s after the last one, as in the design's `toast()`.
  useEffect(() => {
    if (!state.toast) return;
    const t = setTimeout(() => set({ toast: null }), 2600);
    return () => clearTimeout(t);
  }, [state.toast, set]);

  /* ---- live turnstile ticker (port of `pulse()`) ---- */
  useEffect(() => {
    if (!live) return;
    // Real movements, on the design's own 3.2s cadence.
    const timer = setInterval(() => {
      void live()
        .then(({ clock, onSite, moves }) =>
          setState((prev) => ({
            ...prev,
            tick: prev.tick + 1,
            clock,
            onSite,
            moves: moves.map((m) => ({ t: m[0], n: m[1], g: m[2], d: m[3] })),
          })),
        )
        .catch(() => undefined);
    }, 3200);
    return () => clearInterval(timer);
  }, [live]);

  useEffect(() => {
    if (live) return;
    const timer = setInterval(() => {
      setState((prev) => {
        const moves = (prev.moves || data.moves.map((m) => ({ t: m[0], n: m[1], g: m[2], d: m[3] }))).slice();
        const t = "08:" + String(41 + (prev.tick % 18)).padStart(2, "0");
        const n = data.tickerNames[(prev.tick * 3) % data.tickerNames.length];
        const g = data.tickerGates[(prev.tick * 5) % data.tickerGates.length];
        const d: "in" | "out" = prev.tick % 4 === 3 ? "out" : "in";
        moves.unshift({ t, n, g, d });
        return {
          ...prev,
          tick: prev.tick + 1,
          moves: moves.slice(0, 7),
          clock: t,
          onSite: prev.onSite + (d === "in" ? 1 : -1),
        };
      });
    }, 3200);
    return () => clearInterval(timer);
  }, [data, live]);

  /* ---- keyboard (port of `key(e)`) ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setState((p) => ({ ...p, palette: !p.palette, pq: "" }));
        return;
      }
      if (e.key === "Escape") {
        set({ palette: false, modal: null, drawer: null });
        return;
      }
      const target = e.target as HTMLElement | null;
      if (target && /input|textarea|select/i.test(target.tagName)) return;
      const k = e.key.toLowerCase();

      setState((p) => {
        if (p.keyBuf === "g") {
          if (GOTO[k]) {
            e.preventDefault();
            return { ...p, screen: GOTO[k], palette: false, pq: "", drawer: null, modal: null, sel: [], openGroup: null, keyBuf: "" };
          }
          return { ...p, keyBuf: "" };
        }
        if (k === "g") return { ...p, keyBuf: "g" };
        return p;
      });
      if (k === "g") {
        setTimeout(() => set({ keyBuf: "" }), 1200);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [set]);

  // Without an API the console still demonstrates every flow: the mutation is skipped
  // and the design's own wording is shown instead of the server's.
  const offlineActions = useMemo<GcCtx["actions"]>(
    () => ({ live: false, run: (_call, offlineMessage) => toast(offlineMessage) }),
    [toast],
  );
  const act = actions ?? offlineActions;

  const v = useMemo(
    () => buildVM({ s: state, set, go, toast, role, data, auth, actions: act }),
    [state, set, go, toast, role, data, auth, act],
  );

  // The validation queue's j/k/a/r shortcuts need the view-model's decide actions,
  // so they hang off the assembled `v` rather than the raw state.
  useEffect(() => {
    if (state.screen !== "validation") return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /input|textarea|select/i.test(target.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === "j") set({ vqIdx: Math.min(data.submissions.length - 1, state.vqIdx + 1) });
      if (k === "k") set({ vqIdx: Math.max(0, state.vqIdx - 1) });
      if (k === "a") v.vqApprove();
      if (k === "r") v.vqReject();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.screen, state.vqIdx, set, v, data.submissions.length]);

  // The offline notice is not state — it renders in the toast slot whenever the
  // console has nothing more recent of its own to say.
  const banner = state.toast ?? notice ?? null;

  const Screen = SCREENS[state.screen];

  if (state.screen === "signin" || state.screen === "tvboard") {
    return (
      <div className="gc-root">
        <Fonts />
        <Screen v={v} />
      </div>
    );
  }

  return (
    <div className="gc-root">
      <Fonts />
      <div style={s("height:100vh;display:flex;overflow:hidden;background:#F3EDF7")}>
        <div style={s("width:288px;flex:none;background:#FEF7FF;display:flex;flex-direction:column;overflow:hidden;border-right:1px solid #CAC4D0")}>
          <div style={s("padding:20px 18px 16px;border-bottom:1px solid #CAC4D0")}>
            <div style={s("font:500 22px/1.75 Roboto,system-ui,sans-serif;letter-spacing:0;color:#1D1B20")}>EMB</div>
            <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-top:7px")}>Access management</div>
          </div>

          <div style={s("padding:14px 14px 12px;position:relative;z-index:40")}>
            <button onClick={v.openProjects} className="gc-hover-surface" style={s("width:100%;display:flex;align-items:center;gap:9px;padding:8px 10px;background:transparent;border:1px solid #79747E;border-radius:9999px;cursor:pointer;text-align:left")}>
              <span style={s("width:24px;height:24px;flex:none;border:0;border-radius:9999px;display:flex;align-items:center;justify-content:center;font:500 11px/1 Roboto,system-ui,sans-serif;background:#E8DEF8;color:#1D192B")}>{v.projBadge}</span>
              <span style={s("flex:1;min-width:0")}>
                <span style={s("display:block;font:400 14px/1.2 Roboto,system-ui,sans-serif;color:#1D1B20;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{v.projName}</span>
                <span style={s("display:block;font:400 11px/1.2 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-top:3px")}>{v.projCode}</span>
              </span>
              <span style={s("font:400 11px/1 Roboto,system-ui,sans-serif;color:#49454F")}>{v.projChev}</span>
            </button>
            {v.projOpen && (
              <>
                <div onClick={v.closeProjects} style={s("position:fixed;inset:0;z-index:1")} />
                <div style={s("position:absolute;top:calc(100% - 4px);left:14px;right:14px;z-index:2;background:#F7F2FA;border-radius:12px;padding:8px 0;box-shadow:0 4px 8px 3px rgba(0,0,0,.15),0 1px 3px rgba(0,0,0,.3)")}>
                  <div style={s("padding:6px 16px 8px;font:500 11px/16px Roboto,system-ui,sans-serif;letter-spacing:.09em;text-transform:uppercase;color:#79747E")}>Projects on this account</div>
                  {v.projItems.map((p, i) => (
                    <button key={i} onClick={p.go} className="gc-hover-brighten" style={s(`width:100%;display:flex;align-items:center;gap:12px;padding:8px 14px 8px 12px;border:0;background:${p.bg};cursor:pointer;text-align:left`)}>
                      <span style={s(`width:28px;height:28px;flex:none;border-radius:9999px;display:flex;align-items:center;justify-content:center;font:500 11px/1 Roboto,system-ui,sans-serif;background:${p.badgeBg};color:${p.badgeFg}`)}>{p.badge}</span>
                      <span style={s("flex:1;min-width:0")}>
                        <span style={s(`display:block;font:${p.fw} 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#1D1B20;white-space:nowrap;overflow:hidden;text-overflow:ellipsis`)}>{p.name}</span>
                        <span style={s("display:block;font:400 11px/1.4 Roboto,system-ui,sans-serif;color:#49454F;margin-top:2px")}>{p.code} &middot; {p.meta}</span>
                      </span>
                      <span className="gc-icon" style={s("width:20px;flex:none;font-family:'Material Symbols Outlined';font-size:20px;line-height:20px;color:#6750A4")}>{p.tick}</span>
                    </button>
                  ))}
                  <div style={s("height:1px;background:#CAC4D0;margin:8px 0")} />
                  <button onClick={v.closeProjects} className="gc-hover-menu" style={s("width:100%;display:flex;align-items:center;gap:12px;padding:10px 14px 10px 12px;border:0;background:transparent;cursor:pointer;text-align:left;font:400 14px/20px Roboto,system-ui,sans-serif;color:#49454F")}>
                    <span className="gc-icon" style={s("width:28px;flex:none;text-align:center;font-family:'Material Symbols Outlined';font-size:20px;line-height:20px;color:#49454F")}>settings</span>
                    <span>Manage projects</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <div style={s("flex:1;overflow:auto;padding:4px 10px 14px")}>
            {v.navGroups.map((g, gi) => (
              <div key={gi} style={s(`margin-bottom:4px;border-radius:16px;padding-bottom:2px;background:${g.wrapBg}`)}>
                {g.isStatic && (
                  <div style={s("padding:12px 16px 4px;font:500 11px/16px Roboto,system-ui,sans-serif;letter-spacing:.09em;text-transform:uppercase;color:#79747E")}>{g.label}</div>
                )}
                {g.isGroup && (
                  <button onClick={g.toggle} style={s(`width:100%;height:56px;display:flex;align-items:center;gap:12px;padding:0 16px;background:transparent;border:0;border-radius:9999px;text-align:left;cursor:${g.cursor}`)}>
                    <span className="gc-icon" style={s(`width:24px;height:24px;flex:none;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Outlined';font-size:22px;line-height:22px;color:${g.headC}`)}>{g.gicon}</span>
                    <span style={s(`flex:1;font:${g.headW} 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:${g.headC}`)}>{g.label}</span>
                    <span style={s("font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;color:#49454F")}>{g.n}</span>
                    <span className="gc-icon" style={s("width:24px;height:24px;flex:none;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Outlined';font-size:24px;line-height:24px;color:#49454F")}>{g.chev}</span>
                  </button>
                )}
                {g.open && (
                  <div style={s(`margin:${g.kidMargin};padding-left:${g.kidPad};border-left:1px solid ${g.railC}`)}>
                    {g.items.map((it, ii) => (
                      <button key={ii} onClick={it.go} style={s(`width:100%;height:48px;display:flex;align-items:center;gap:12px;padding:0 16px;margin-bottom:2px;border:0;border-radius:9999px;cursor:pointer;text-align:left;font:${it.fw} 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;background:${it.bg};color:${it.fg}`)}>
                        <span className="gc-icon" style={s(`width:24px;height:24px;flex:none;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Outlined';font-size:24px;line-height:24px;font-weight:400;font-variation-settings:'FILL' ${it.fill};color:${it.iconC}`)}>{it.icon}</span>
                        <span style={s("flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{it.label}</span>
                        <span style={s(`font:500 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;font-variant-numeric:tabular-nums;color:${it.badgeFg};background:${it.badgeBg}`)}>{it.badge}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={s("padding:12px 14px 16px;border-top:1px solid #CAC4D0;display:flex;align-items:center;gap:10px")}>
            <span style={s("width:30px;height:30px;flex:none;border-radius:50%;background:#E6E0E9;position:relative;overflow:hidden")}>
              <span style={s("position:absolute;left:50%;top:7px;transform:translateX(-50%);width:10px;height:10px;border-radius:50%;background:#AEA9B1")} />
              <span style={s("position:absolute;left:50%;top:19px;transform:translateX(-50%);width:20px;height:14px;border-radius:10px 10px 0 0;background:#AEA9B1")} />
            </span>
            <span style={s("flex:1;min-width:0")}>
              <span style={s("display:block;font:400 14px/1.2 Roboto,system-ui,sans-serif;color:#1D1B20")}>A. Whitmore</span>
              <span style={s("display:block;font:400 11px/1.2 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-top:3px")}>{v.roleLabel}</span>
            </span>
            <button onClick={v.signOut} title="Sign out" style={s("width:24px;height:24px;flex:none;background:transparent;border:0;border-radius:9999px;color:#49454F;cursor:pointer;font:400 12px/1 Roboto,system-ui,sans-serif")}>&#8617;</button>
          </div>
        </div>

        <div style={s("flex:1;min-width:0;display:flex;flex-direction:column")}>
          <div style={s("flex:none;height:64px;display:flex;align-items:center;gap:18px;padding:0 24px;background:#F3EDF7;border-bottom:1px solid #CAC4D0")}>
            <div style={s("flex:none")}>
              <h1 style={s("font:400 22px/1.75 Roboto,system-ui,sans-serif;letter-spacing:0;margin:0;white-space:nowrap")}>{v.title}</h1>
            </div>
            {v.hasSubtitle && (
              <div style={s("font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F;max-width:420px;min-width:0;padding-left:18px;border-left:1px solid #CAC4D0")}>{v.subtitle}</div>
            )}
            <div style={s("margin-left:auto;display:flex;align-items:center;gap:10px")}>
              <button onClick={v.openPalette} style={s("display:flex;align-items:center;gap:10px;min-width:260px;height:40px;padding:0 16px;background:#ECE6F0;border:0;border-radius:9999px;cursor:pointer;font:400 14px/1 Roboto,system-ui,sans-serif;color:#49454F;text-align:left")}>
                <span style={s("flex:1")}>Search workers, zones, gates</span>
                <span style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;border:1px solid #CAC4D0;border-radius:8px;padding:2px 5px")}>&#8984;K</span>
              </button>
              <button onClick={v.goAlerts} style={s("position:relative;width:40px;height:40px;background:transparent;border:0;border-radius:9999px;cursor:pointer;font:400 18px/1 Roboto,system-ui,sans-serif;color:#49454F")}>
                &#9788;
                <span style={s("position:absolute;top:-6px;right:-6px;min-width:17px;height:17px;border-radius:9999px;background:#B3261E;color:#FEF7FF;font:400 9.5px/17px Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums")}>{v.alertCount}</span>
              </button>
            </div>
          </div>

          <div style={s("flex:1;overflow:auto;padding:22px 26px 40px")}>
            <Screen v={v} />
          </div>
        </div>

        {v.paletteOpen && (
          <div onClick={v.closeAll} style={s("position:fixed;inset:0;background:rgba(0,0,0,.32);display:flex;align-items:flex-start;justify-content:center;padding-top:12vh;z-index:60")}>
            <div onClick={v.stop} style={s("width:min(620px,92vw);background:#FEF7FF;border:1px solid #CAC4D0;border-radius:28px;box-shadow:0 12px 32px rgba(0,0,0,.3);overflow:hidden;animation:fadeUp .16s ease")}>
              <input value={v.pq} onChange={v.setPq} placeholder="Jump to a screen, a worker, a gate&hellip;" autoFocus style={s("width:100%;padding:16px 18px;font:400 16px/1.2 Roboto,system-ui,sans-serif;background:transparent;border:0;border-bottom:1px solid #CAC4D0;color:#1D1B20")} />
              <div style={s("max-height:46vh;overflow:auto;padding:6px 0")}>
                {v.pResults.map((r, i) => (
                  <button key={i} onClick={r.go} style={s("width:100%;display:flex;align-items:center;gap:12px;padding:9px 18px;background:transparent;border:0;cursor:pointer;text-align:left")}>
                    <span style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.1em;color:#79747E;width:74px;flex:none")}>{r.kind}</span>
                    <span style={s("flex:1;font:400 14px/1.3 Roboto,system-ui,sans-serif")}>{r.label}</span>
                    <span style={s("font:400 12px/1 Roboto,system-ui,sans-serif;color:#79747E")}>{r.hint}</span>
                  </button>
                ))}
              </div>
              <div style={s("display:flex;gap:16px;padding:10px 18px;border-top:1px solid #CAC4D0;font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E")}>
                <span>&crarr; open</span><span>g then d &middot; dashboard</span><span>g then w &middot; workers</span><span>g then v &middot; validation</span><span>esc close</span>
              </div>
            </div>
          </div>
        )}

        {banner && (
          <div style={s("position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:70;display:flex;align-items:center;gap:12px;padding:11px 16px;background:#322F35;color:#F3EDF7;border-radius:12px;box-shadow:0 12px 32px rgba(0,0,0,.32);font:400 14px/1.3 Roboto,system-ui,sans-serif;animation:fadeUp .18s ease")}>
            <span style={s("width:5px;height:5px;border-radius:50%;background:#D0BCFF")} />
            <span>{banner}</span>
          </div>
        )}
      </div>
    </div>
  );
}
