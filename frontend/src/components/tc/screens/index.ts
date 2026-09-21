/**
 * The TC console's screen registry.
 *
 * Maps each `TcScreen` to the leaf component ported from that artboard of
 * `TC Console HiFi M3.dc.html`. `Console.tsx` mounts `SCREENS[state.screen]`;
 * every screen is presentational and reads only from the `VM`.
 *
 * Sibling of `src/components/gc/screens/index.ts`.
 */
import type { ReactNode } from "react";
import type { TcScreen } from "@/lib/tc/types";
import type { VM } from "../vm";
import AddWorker from "./AddWorker";
import Docs from "./Docs";
import Home from "./Home";
import Hours from "./Hours";
import Inactive from "./Inactive";
import Inductions from "./Inductions";
import Leavers from "./Leavers";
import SignIn from "./SignIn";
import Training from "./Training";
import Visitors from "./Visitors";
import Worker from "./Worker";
import Workers from "./Workers";

export const SCREENS: Record<TcScreen, (props: { v: VM }) => ReactNode> = {
  home: Home,
  workers: Workers,
  worker: Worker,
  add: AddWorker,
  docs: Docs,
  training: Training,
  hours: Hours,
  inductions: Inductions,
  inactive: Inactive,
  leavers: Leavers,
  visitors: Visitors,
  signin: SignIn,
};
