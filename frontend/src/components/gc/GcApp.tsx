"use client";

import { useCallback, useMemo, useState } from "react";
import { getLive } from "@/lib/gc/api";
import { useGcData } from "@/lib/gc/useGcData";
import type { GcCtx } from "@/components/gc/vm";
import type { Screen } from "@/lib/gc/types";
import Console from "./Console";

/**
 * Binds the console to the API: loads `/gc/bootstrap` for the signed-in user and
 * hands the payload, their role, and real sign-in/out to `Console`.
 *
 * Auth is checked in-component rather than in middleware because the token lives in
 * localStorage, following the pattern already used by `src/app/dashboard/page.tsx`.
 */
export default function GcApp({
  startScreen,
  project,
}: {
  startScreen?: Screen;
  project?: string;
}) {
  const session = useGcData(project);
  const [result, setResult] = useState<string | null>(null);

  const run = useCallback<GcCtx["actions"]["run"]>(
    (call, offlineMessage) => {
      if (!session.authed) {
        setResult(offlineMessage);
        return;
      }
      void call()
        .then((res) => {
          setResult(res.message);
          session.reload();
        })
        .catch((e: unknown) => setResult(e instanceof Error ? e.message : "That did not go through"));
    },
    [session],
  );
  const actions = useMemo<GcCtx["actions"]>(() => ({ live: !!session.authed, run }), [session.authed, run]);
  // Only poll once the API has actually answered; on fixtures the simulated ticker runs.
  const live = useCallback(() => getLive(project), [project]);

  // One frame while the localStorage token is checked. Painted in the console's own
  // surface colour so there is no white flash before either screen appears.
  if (session.authed === null) {
    return <div className="gc-root" style={{ height: "100vh", background: "#F3EDF7" }} />;
  }

  return (
    <Console
      startScreen={session.authed ? startScreen : "signin"}
      role={session.role}
      data={session.data}
      auth={{ signIn: session.signIn, signOut: session.signOut }}
      actions={actions}
      live={session.authed && !session.error ? live : undefined}
      notice={
        result ??
        (session.authed && session.error
          ? `Showing the reference dataset \u2014 the API is unreachable (${session.error})`
          : null)
      }
    />
  );
}
