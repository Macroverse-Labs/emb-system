"use client";

import { useCallback, useEffect, useState } from "react";
import { getToken, removeToken, setToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { getBootstrap, type TcBootstrap } from "./api";
import { FIXTURE_DATA, type TcData } from "./data";
import type { TcMeta } from "./types";

interface Me {
  id: string;
  email: string;
  is_active: boolean;
  role?: string;
  full_name?: string;
}

export interface TcSession {
  /** null while the token is being checked; false when signed out. */
  authed: boolean | null;
  data: TcData;
  meta: TcMeta | null;
  /** The signed-in user's role, so the app can bounce non-contractors. */
  role: string | null;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  reload: () => void;
}

/**
 * Loads the TC console's data for the signed-in contractor.
 *
 * Falls back to the design's own fixtures whenever the API is unreachable, so the
 * console still demonstrates every screen rather than showing an error page — the
 * point of the POC is the console, not the connection.
 */
export function useTcData(project?: string): TcSession {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [boot, setBoot] = useState<TcBootstrap | null>(null);
  const [role, setRole] = useState<string | null>(null);
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
        const me = await apiFetch<Me>("/api/v1/auth/me");
        if (cancelled) return;
        setRole(me.role ?? null);
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

  const signIn = useCallback(async (email: string, password: string) => {
    const { access_token } = await apiFetch<{ access_token: string }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(access_token);
    setNonce((n) => n + 1);
  }, []);

  const signOut = useCallback(() => {
    removeToken();
    setBoot(null);
    setRole(null);
    setAuthed(false);
  }, []);

  return {
    authed,
    data: boot ?? FIXTURE_DATA,
    meta: boot?.meta ?? null,
    role,
    error,
    signIn,
    signOut,
    reload: () => setNonce((n) => n + 1),
  };
}
