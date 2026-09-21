"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTcData } from "@/lib/tc/useTcData";
import type { TcCtx } from "@/components/tc/vm";
import type { TcScreen } from "@/lib/tc/types";
import Console from "./Console";

/** The only role this console is for; anyone else belongs in the GC console. */
const TC_ROLE = "Trade contractor";

/**
 * Binds the TC console to the API: loads `/tc/bootstrap` for the signed-in
 * contractor and hands the payload and real sign-in/out to `Console`.
 *
 * Auth is checked in-component rather than in middleware because the token lives in
 * localStorage, following the pattern already used by `src/app/dashboard/page.tsx`.
 */
export default function TcApp({
  startScreen,
  project,
}: {
  startScreen?: TcScreen;
  project?: string;
}) {
  const router = useRouter();
  const session = useTcData(project);
  const [result, setResult] = useState<string | null>(null);

  // A signed-in user who is not a trade contractor has no business here.
  const wrongRole = session.authed === true && session.role !== null && session.role !== TC_ROLE;
  useEffect(() => {
    if (wrongRole) router.replace("/");
  }, [wrongRole, router]);

  const run = useCallback<TcCtx["actions"]["run"]>(
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
  const actions = useMemo<TcCtx["actions"]>(() => ({ live: !!session.authed, run }), [session.authed, run]);

  // One frame while the localStorage token is checked. Painted in the console's own
  // surface colour so there is no white flash before either screen appears.
  if (session.authed === null || wrongRole) {
    return <div className="gc-root" style={{ height: "100vh", background: "#F3EDF7" }} />;
  }

  return (
    <Console
      startScreen={session.authed ? startScreen : "signin"}
      data={session.data}
      meta={session.meta}
      auth={{ signIn: session.signIn, signOut: session.signOut }}
      actions={actions}
      notice={
        result ??
        (session.authed && session.error
          ? `Showing the reference dataset — the API is unreachable (${session.error})`
          : null)
      }
    />
  );
}
