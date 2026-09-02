"use client";

import { useCallback, useEffect, useState } from "react";
import { getToken, removeToken, setToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { type Bootstrap, getBootstrap } from "./api";
import { FIXTURE_DATA, type GcData } from "./data";
import type { Role } from "./types";

interface Me {
  id: string;
  email: string;
  is_active: boolean;
  role?: Role;
  full_name?: string;
}

export interface GcSession {
  /** null while the token is being checked; false when signed out. */
  authed: boolean | null;
  data: GcData;
  meta: Bootstrap["meta"] | null;
  role: Role;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  reload: () => void;
}

/**
 * Loads the console's data for the signed-in user.
 *
 * Falls back to the design's own fixtures whenever the API is unreachable, so the
 * console still demonstrates every screen rather than showing an error page — the
 * point of the POC is the console, not the connection.
 */
export function useGcData(project?: string): GcSession {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [boot, setBoot] = useState<Bootstrap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const load = useCallback(async () => {
    try {
      const payload = await getBootstrap(project);
      setBoot(payload);
      setError(null);
    } catch (e) {
      // Keep the fixtures on screen; say why the numbers are not live.
      setError(e instanceof Error ? e.message : "Could not reach the API");
    }
  }, [project]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!getToken()) {
        if (!cancelled) setAuthed(false);
        return;
      }
      try {
        await apiFetch<Me>("/api/v1/auth/me");
        if (cancelled) return;
        setAuthed(true);
        await load();
      } catch {
        if (cancelled) return;
        removeToken();
        setAuthed(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load, nonce]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { access_token } = await apiFetch<{ access_token: string }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(access_token);
      setNonce((n) => n + 1);
    },
    [],
  );

  const signOut = useCallback(() => {
    removeToken();
    setBoot(null);
    setAuthed(false);
  }, []);

  return {
    authed,
    data: boot ?? FIXTURE_DATA,
    meta: boot?.meta ?? null,
    role: boot?.meta.role ?? "GC administrator",
    error,
    signIn,
    signOut,
    reload: () => setNonce((n) => n + 1),
  };
}
