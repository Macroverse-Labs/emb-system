import type {
  DocStatus,
  RuleValue,
  StatusStyle,
  TrainingRecord,
  Worker,
  WorkerDoc,
  WorkerRow,
  ZoneRow,
} from "@/lib/gc/types";
import type { GcState, ZoneCfg } from "./ctx";

/** Port of `workers()` — gives the positional worker tuples their field names. */
export function workers(rows: WorkerRow[]): Worker[] {
  return rows.map((w, i) => ({
    i,
    n: w[0],
    id: w[1],
    co: w[2],
    role: w[3],
    st: w[4],
    zones: w[5],
    on: w[6],
    seen: w[7],
    nat: w[8],
    rowId: w[9],
  }));
}

/** Port of `docsFor(w)` — the five documents every worker profile shows. */
export function docsFor(w: Worker): WorkerDoc[] {
  const bad = w.st === "expired" || w.st === "blocked";
  const soon = w.st === "expiring";
  const my = w.nat === "Malaysia";
  return [
    { t: "Passport / ID", no: "A" + (4820193 + w.i * 77), exp: "14 Mar 2029", st: "valid", prov: w.nat },
    {
      t: "CIDB green card",
      no: "GC-" + (8840000 + w.i * 131),
      exp: soon ? "29 Aug 2026" : "11 Jan 2028",
      st: soon ? "expiring" : "valid",
      prov: "CIDB",
    },
    {
      t: "Work visa",
      no: my ? "not required" : "WV-" + (2290000 + w.i * 53),
      exp: my ? "—" : bad ? "18 Aug 2026" : "30 Sep 2027",
      st: my ? "na" : bad ? "expired" : "valid",
      prov: "Immigration",
    },
    { t: "Safety induction", no: "IND-" + (5100 + w.i), exp: "12 Feb 2027", st: "valid", prov: "Emerald Builders" },
    {
      t: "Medical fitness",
      no: "MF-" + (7710 + w.i * 3),
      exp: soon ? "06 Sep 2026" : "22 Jun 2027",
      st: soon ? "expiring" : "valid",
      prov: "Panel clinic",
    },
  ];
}

/** Port of `trainingFor(w)` — which courses this worker holds, and for how long. */
export function trainingFor(w: Worker): TrainingRecord[] {
  const courses = [
    "Working at height",
    "Confined space",
    "Hot works",
    "Electrical LV",
    "Manual handling",
    "Lifting & slinging",
  ];
  return courses.map((t, i) => {
    const has = (w.i + i) % 3 !== 2;
    const soon = has && (w.i + i) % 5 === 1;
    return {
      t,
      st: has ? (soon ? "expiring" : "valid") : "none",
      exp: has ? (soon ? "11 Sep 2026" : "04 Apr 2028") : "—",
    };
  });
}

/** Port of `dst(k)` — label and colour for a document/training status. */
export function dst(k: DocStatus): StatusStyle {
  return {
    valid: { l: "Valid", c: "#146C2E" },
    expiring: { l: "Expiring", c: "#7A5900" },
    expired: { l: "Expired", c: "#B3261E" },
    na: { l: "Not required", c: "#79747E" },
    none: { l: "Not held", c: "#79747E" },
  }[k];
}

/** Port of `cfgFor(id)` — a zone's criteria, with any unsaved edits layered on top. */
export function cfgFor(state: GcState, zones: ZoneRow[], id: string): ZoneCfg {
  const edited = (state.zoneCfg || {})[id];
  const z = zones.find((z) => z[0] === id) || zones[0];
  const base: ZoneCfg = {
    fa: z[5],
    cap: id === "a3" ? "12" : id === "b2" ? "20" : "—",
    escort: id === "a3" || id === "b2",
    reqs:
      id === "a3"
        ? ["CIDB green card", "Site induction", "Electrical LV"]
        : id === "b2"
          ? ["CIDB green card", "Site induction", "Hot works", "Confined space"]
          : ["CIDB green card", "Site induction"],
  };
  return { ...base, ...edited };
}

export function ruleKey(z: string, r: string): string {
  return z + "|" + r;
}

/** Port of `ruleVal(z, r)` — the published zone x requirement matrix, plus edits. */
export function ruleVal(state: GcState, z: string, r: string): RuleValue {
  const edited = state.rules || {};
  const k = ruleKey(z, r);
  if (edited[k]) return edited[k];
  if (r === "CIDB green card" || r === "Site induction") return "req";
  if (z === "A3 Electrical" && r === "Electrical LV") return "req";
  if (z === "B2 Plant" && (r === "Hot works" || r === "Confined space")) return "req";
  if (z === "A2 Podium" && r === "Working at height") return "req";
  if (z === "Laydown" && r === "Lifting & slinging") return "opt";
  if (z === "B1 Basement" && r === "Confined space") return "opt";
  return "na";
}
