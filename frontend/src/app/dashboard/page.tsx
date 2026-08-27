"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getToken, removeToken } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  is_active: boolean;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      router.push("/login");
      return;
    }

    apiFetch<User>("/api/v1/auth/me")
      .then(setUser)
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load user");
        removeToken();
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    removeToken();
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-red-600">{error}</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4 rounded-lg border p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        {user && (
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-medium">Status:</span>{" "}
              {user.is_active ? "Active" : "Inactive"}
            </p>
          </div>
        )}
        <div className="flex gap-3 pt-2">
          <Link
            href="/"
            className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Home
          </Link>
          <button
            onClick={handleLogout}
            className="rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
          >
            Log out
          </button>
        </div>
      </div>
    </main>
  );
}
