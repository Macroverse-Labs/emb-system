import type { Metadata } from "next";
import TcApp from "@/components/tc/TcApp";
import type { TcScreen } from "@/lib/tc/types";

export const metadata: Metadata = {
  title: "TC console — Sinar Electrical",
  description: "Workers, documents and inductions for Emerald Bay Block A",
};

/**
 * The trade contractor console.
 *
 * One route: the design's whole navigation model is `state.screen`, so screens jump
 * without a page transition. `?s=<screen>` keeps individual screens linkable.
 */
export default async function TcPage({
  searchParams,
}: {
  searchParams: Promise<{ s?: string; project?: string }>;
}) {
  const { s, project } = await searchParams;
  return <TcApp startScreen={s as TcScreen | undefined} project={project} />;
}
