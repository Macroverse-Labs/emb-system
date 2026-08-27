import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight">emb-system</h1>
      <p className="max-w-md text-lg text-gray-600">
        A Next.js + FastAPI scaffold with PostgreSQL, Redis, Celery, JWT auth,
        and Mailtrap email testing.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-md bg-foreground px-5 py-2.5 text-background hover:opacity-90"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="rounded-md border px-5 py-2.5 hover:bg-gray-50"
        >
          Sign up
        </Link>
      </div>
    </main>
  );
}
