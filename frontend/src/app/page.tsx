import type { Metadata } from "next";
import GcApp from "@/components/gc/GcApp";
import type { Screen } from "@/lib/gc/types";

export const metadata: Metadata = {
  title: "GC console — Emerald Builders",
  description: "Access management for Emerald Bay Block A",
};

/**
 * The GC console, and the app's front door.
 *
 * One route: the design's whole navigation model is `state.screen`, and the command
 * palette and `g`-prefixed shortcuts jump between screens without a page transition.
 * `?s=<screen>` keeps individual screens linkable.
 */
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ s?: string; project?: string }>;
}) {
  const { s, project } = await searchParams;
  return <GcApp startScreen={s as Screen | undefined} project={project} />;
}
