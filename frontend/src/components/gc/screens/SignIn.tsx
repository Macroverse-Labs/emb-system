import type { VM } from "../vm";
import { s } from "../style";

/**
 * Sign in — port of `GC Console HiFi M3.dc.html` template lines 47–71.
 *
 * Not wrapped in the app shell: this screen renders its own full-height
 * two-column layout. The two inputs are the design's, made controlled so the
 * form actually signs in against `/api/v1/auth/login`; an error from that call
 * renders under the button. Style strings are copied from the design
 * character-for-character and passed through `s()`; do not "tidy" them, or the
 * port stops matching the canvas.
 */
export default function SignIn({ v }: { v: VM }) {
  return (
    <>
      <div style={s("height:100vh;display:flex;background:#F3EDF7")}>
        <div style={s("flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;padding:0 clamp(40px,7vw,110px)")}>
          <div style={s("font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#79747E")}>Emerald Builders &middot; Access Management</div>
          <h1 style={s("font:400 45px/1.05 Roboto,system-ui,sans-serif;letter-spacing:-.02em;margin:18px 0 10px")}>Sign in</h1>
          <p style={s("font:400 14px/1.6 Roboto,system-ui,sans-serif;color:#49454F;max-width:430px;margin:0 0 30px")}>Three doors, one page. Your role decides what opens: the general contractor console, a trade contractor account, or a guard tablet at a gate.</p>
          <div style={s("display:flex;flex-direction:column;gap:14px;max-width:400px")}>
            <label style={s("display:block")}>
              <span style={s("display:block;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:7px")}>Email</span>
              <input value={v.siEmail} onChange={v.siSetEmail} autoComplete="username" style={s("width:100%;min-height:42px;padding:8px 12px;font:400 14px/1.3 Roboto,system-ui,sans-serif;color:#1D1B20;background:#FEF7FF;border:1px solid #79747E;border-radius:4px")} />
            </label>
            <label style={s("display:block")}>
              <span style={s("display:block;font:400 12px/1 Roboto,system-ui,sans-serif;letter-spacing:.04em;color:#49454F;margin-bottom:7px")}>Password</span>
              <input type="password" value={v.siPassword} onChange={v.siSetPassword} autoComplete="current-password" onKeyDown={v.siKeyDown} style={s("width:100%;min-height:42px;padding:8px 12px;font:400 14px/1.3 Roboto,system-ui,sans-serif;background:#FEF7FF;border:1px solid #79747E;border-radius:4px")} />
            </label>
            <button onClick={v.signIn} style={s("margin-top:8px;min-height:44px;font:500 14.5px/1 Roboto,system-ui,sans-serif;letter-spacing:.03em;color:#FFFFFF;background:#6750A4;border:0;border-radius:12px;cursor:pointer")}>{v.siBusy ? "Signing in\u2026" : "Enter the GC console"}</button>
            {v.siError && (
              <div style={s("font:400 12px/1.4 Roboto,system-ui,sans-serif;color:#B3261E")}>{v.siError}</div>
            )}
            <div style={s("display:flex;gap:10px;margin-top:2px")}>
              <button onClick={v.signIn} style={s("flex:1;min-height:38px;font:500 12.5px/1 Roboto,system-ui,sans-serif;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:12px;cursor:pointer")}>Trade contractor</button>
              <button onClick={v.signIn} style={s("flex:1;min-height:38px;font:500 12.5px/1 Roboto,system-ui,sans-serif;color:#6750A4;background:transparent;border:1px solid #79747E;border-radius:12px;cursor:pointer")}>Guard tablet</button>
            </div>
          </div>
        </div>
        <div style={s("width:44%;flex:none;background:#141218;color:#E6E0E9;display:flex;flex-direction:column;justify-content:flex-end;padding:56px 52px")}>
          <div style={s("font:400 57px/1 Roboto,system-ui,sans-serif;color:rgba(182,130,53,.28);font-variant-numeric:tabular-nums")}>1A</div>
          <div style={s("height:1px;background:#49454F;margin:26px 0 22px")} />
          <div style={s("font:400 28px/1.15 Roboto,system-ui,sans-serif")}>Emerald Bay &mdash; Block A</div>
          <p style={s("font:400 14px/1.7 Roboto,system-ui,sans-serif;color:#CAC5CD;max-width:320px;margin:12px 0 0")}>2,418 workers on the register. 14 gates. Every entry, exit and refusal recorded against a named person.</p>
        </div>
      </div>
    </>
  );
}
