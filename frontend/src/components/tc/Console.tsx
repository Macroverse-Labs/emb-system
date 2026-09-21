"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FIXTURE_DATA, type TcData } from "@/lib/tc/data";
import type { TcMeta, TcScreen } from "@/lib/tc/types";
import { s } from "@/components/gc/style";
import { buildVM, type TcCtx, type TcState, INITIAL_STATE } from "./vm";
import { SCREENS } from "./screens";
import "@/components/gc/gc.css";

/** Every screen lives under this one route; `?s=` keeps them linkable. */
const basePath = "/tc";

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
const OFFLINE_AUTH: TcCtx["auth"] = { signIn: async () => {}, signOut: () => {} };

/**
 * The TC (trade contractor) console — port of the app shell in
 * `TC Console HiFi M3.dc.html` plus the `DCLogic` lifecycle: `go` and `toast`.
 *
 * One client component holding the whole `state` bag, exactly as the design does.
 * The screens are leaf components that read the assembled view-model.
 */
export default function Console({
  startScreen,
  data = FIXTURE_DATA,
  meta = null,
  auth = OFFLINE_AUTH,
  actions,
  notice,
}: {
  startScreen?: TcScreen;
  data?: TcData;
  meta?: TcMeta | null;
  auth?: TcCtx["auth"];
  actions?: TcCtx["actions"];
  /** Shown in the toast area when the console is running on fixtures. */
  notice?: string | null;
}) {
  const [state, setState] = useState<TcState>(() =>
    startScreen && startScreen !== "home" ? { ...INITIAL_STATE, screen: startScreen } : INITIAL_STATE,
  );

  const set = useCallback((patch: Partial<TcState>) => setState((prev) => ({ ...prev, ...patch })), []);

  const toast = useCallback((msg: string) => set({ toast: msg }), [set]);

  // The design's `go(screen, extra)`: clears the selection and shuts the switcher.
  const go = useCallback(
    (screen: TcScreen, extra?: Partial<TcState>) => set({ screen, sel: [], projOpen: false, ...extra }),
    [set],
  );

  // Deep-linkable without giving each screen its own route: the design's whole
  // navigation model is `state.screen`.
  useEffect(() => {
    window.history.replaceState(
      null,
      "",
      state.screen === "home" ? basePath : `${basePath}?s=${state.screen}`,
    );
  }, [state.screen]);

  // Toast clears itself 3.2s after the last one, as in the design's `toast()`.
  useEffect(() => {
    if (!state.toast) return;
    const t = setTimeout(() => set({ toast: null }), 3200);
    return () => clearTimeout(t);
  }, [state.toast, set]);

  // Without an API the console still demonstrates every flow: the mutation is skipped
  // and the design's own wording is shown instead of the server's.
  const offlineActions = useMemo<TcCtx["actions"]>(
    () => ({ live: false, run: (_call, offlineMessage) => toast(offlineMessage) }),
    [toast],
  );
  const act = actions ?? offlineActions;

  const v = useMemo(
    () => buildVM({ s: state, set, go, toast, data, meta, auth, actions: act }),
    [state, set, go, toast, data, meta, auth, act],
  );

  // The offline notice is not state — it renders in the toast slot whenever the
  // console has nothing more recent of its own to say.
  const banner = state.toast ?? notice ?? null;

  const Screen = SCREENS[state.screen];

  if (state.screen === "signin") {
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
            <div style={s("font:500 22px/1.75 Roboto,system-ui,sans-serif;color:#1D1B20")}>{v.company}</div>
            <div style={s("font:400 11px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-top:7px")}>Trade contractor account</div>
          </div>

          <div style={s("padding:14px 14px 12px;position:relative;z-index:40")}>
            <button onClick={v.openProjects} className="gc-hover-surface" style={s("width:100%;display:flex;align-items:center;gap:9px;padding:8px 10px;background:transparent;border:1px solid #79747E;border-radius:9999px;cursor:pointer;text-align:left")}>
              <span style={s("width:24px;height:24px;flex:none;border-radius:9999px;display:flex;align-items:center;justify-content:center;font:500 11px/1 Roboto,system-ui,sans-serif;background:#E8DEF8;color:#1D192B")}>{v.projBadge}</span>
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
                  <div style={s("padding:6px 16px 8px;font:500 11px/16px Roboto,system-ui,sans-serif;letter-spacing:.09em;text-transform:uppercase;color:#79747E")}>Projects you are engaged on</div>
                  {v.projItems.map((p, i) => (
                    <button key={i} onClick={p.go} className="gc-hover-brighten" style={s(`width:100%;display:flex;align-items:center;gap:12px;padding:8px 14px 8px 12px;border:0;background:${p.bg};cursor:pointer;text-align:left`)}>
                      <span style={s(`width:28px;height:28px;flex:none;border-radius:9999px;display:flex;align-items:center;justify-content:center;font:500 11px/1 Roboto,system-ui,sans-serif;background:${p.badgeBg};color:${p.badgeFg}`)}>{p.badge}</span>
                      <span style={s("flex:1;min-width:0")}>
                        <span style={s(`display:block;font:${p.fw} 14px/20px Roboto,system-ui,sans-serif;color:#1D1B20;white-space:nowrap;overflow:hidden;text-overflow:ellipsis`)}>{p.name}</span>
                        <span style={s("display:block;font:400 11px/1.4 Roboto,system-ui,sans-serif;color:#49454F;margin-top:2px")}>{p.code} &middot; {p.meta}</span>
                      </span>
                      <span className="gc-icon" style={s("width:20px;flex:none;font-family:'Material Symbols Outlined';font-size:20px;line-height:20px;color:#6750A4")}>{p.tick}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={s("flex:1;overflow:auto;padding:4px 10px 14px")}>
            {v.navGroups.map((g, gi) => (
              <div key={gi} style={s("margin-bottom:6px")}>
                <div style={s("padding:12px 16px 4px;font:500 11px/16px Roboto,system-ui,sans-serif;letter-spacing:.09em;text-transform:uppercase;color:#79747E")}>{g.label}</div>
                {g.items.map((it, ii) => (
                  <button key={ii} onClick={it.go} style={s(`width:100%;height:48px;display:flex;align-items:center;gap:12px;padding:0 16px;margin-bottom:2px;border:0;border-radius:9999px;cursor:pointer;text-align:left;font:${it.fw} 14px/20px Roboto,system-ui,sans-serif;letter-spacing:.00625rem;background:${it.bg};color:${it.fg}`)}>
                    <span className="gc-icon" style={s(`width:24px;height:24px;flex:none;display:flex;align-items:center;justify-content:center;font-family:'Material Symbols Outlined';font-size:24px;line-height:24px;font-variation-settings:'FILL' ${it.fill};color:${it.iconC}`)}>{it.icon}</span>
                    <span style={s("flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{it.label}</span>
                    <span style={s(`font:500 14px/20px Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums;color:${it.badgeFg}`)}>{it.badge}</span>
                  </button>
                ))}
              </div>
            ))}
            {v.showGuard && (
              <div style={s("margin:10px 6px 0;padding:12px 14px;background:#F7F2FA;border-radius:12px")}>
                <div style={s("font:500 11px/16px Roboto,system-ui,sans-serif;letter-spacing:.09em;text-transform:uppercase;color:#79747E")}>Owned by the GC</div>
                <div style={s("display:flex;flex-direction:column;gap:6px;margin-top:8px")}>
                  {v.guardItems.map((q, qi) => (
                    <span key={qi} style={s("font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F")}>{q.t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={s("padding:12px 14px 16px;border-top:1px solid #CAC4D0;display:flex;align-items:center;gap:10px")}>
            <span style={s("width:30px;height:30px;flex:none;border-radius:50%;background:#E6E0E9;position:relative;overflow:hidden")}>
              <span style={s("position:absolute;left:50%;top:7px;transform:translateX(-50%);width:10px;height:10px;border-radius:50%;background:#AEA9B1")} />
              <span style={s("position:absolute;left:50%;top:19px;transform:translateX(-50%);width:20px;height:14px;border-radius:10px 10px 0 0;background:#AEA9B1")} />
            </span>
            <span style={s("flex:1;min-width:0")}>
              <span style={s("display:block;font:400 14px/1.2 Roboto,system-ui,sans-serif;color:#1D1B20")}>R. Idris</span>
              <span style={s("display:block;font:400 11px/1.2 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-top:3px")}>TC administrator</span>
            </span>
            <button onClick={v.signOut} title="Sign out" style={s("width:24px;height:24px;flex:none;background:transparent;border:0;border-radius:9999px;color:#49454F;cursor:pointer;font:400 12px/1 Roboto,system-ui,sans-serif")}>&#8617;</button>
          </div>
        </div>

        <div style={s("flex:1;min-width:0;display:flex;flex-direction:column")}>
          <div style={s("flex:none;height:64px;display:flex;align-items:center;gap:18px;padding:0 24px;background:#F3EDF7;border-bottom:1px solid #CAC4D0")}>
            <h1 style={s("flex:none;font:400 22px/1.75 Roboto,system-ui,sans-serif;margin:0;white-space:nowrap")}>{v.title}</h1>
            <div style={s("font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#49454F;max-width:460px;min-width:0;padding-left:18px;border-left:1px solid #CAC4D0")}>{v.subtitle}</div>
            <div style={s("margin-left:auto;display:flex;align-items:center;gap:10px")}>
              <span style={s("display:flex;align-items:center;gap:7px;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F")}>
                <span style={s("width:6px;height:6px;border-radius:50%;background:#146C2E")} />Synced 2 min ago
              </span>
              <button onClick={v.goHome} className="gc-icon" style={s("position:relative;width:40px;height:40px;background:transparent;border:0;border-radius:9999px;cursor:pointer;font-family:'Material Symbols Outlined';font-size:22px;line-height:1;color:#49454F")}>
                notifications
                <span style={s("position:absolute;top:-4px;right:-4px;min-width:17px;height:17px;border-radius:9999px;background:#B3261E;color:#FEF7FF;font:400 9.5px/17px Roboto,system-ui,sans-serif;font-variant-numeric:tabular-nums")}>{v.notifCount}</span>
              </button>
            </div>
          </div>

          <div style={s("flex:1;overflow:auto;padding:22px 26px 40px")}>
            <Screen v={v} />
          </div>
        </div>

        {banner && (
          <div style={s("position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:80;max-width:640px;display:flex;align-items:center;gap:16px;padding:14px 16px 14px 20px;background:#322F35;border-radius:4px;box-shadow:0 4px 8px 3px rgba(0,0,0,.15),0 1px 3px rgba(0,0,0,.3)")}>
            <span style={s("font:400 14px/1.4 Roboto,system-ui,sans-serif;color:#F5EFF7")}>{banner}</span>
            <button onClick={v.closeToast} style={s("flex:none;font:500 14px/1 Roboto,system-ui,sans-serif;color:#D0BCFF;background:transparent;border:0;cursor:pointer")}>Dismiss</button>
          </div>
        )}
      </div>
    </div>
  );
}
