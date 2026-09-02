/**
 * Writes the design's dataset to the JSON the backend seeds from.
 *
 * `src/lib/gc/data.ts` is the single source: the frontend uses it as its offline
 * fallback and the backend seeds from this dump, so the two cannot drift.
 *
 *   node --experimental-strip-types scripts/dump-seed-data.mjs \
 *     ../backend/app/services/gc/seed_data.json
 */
import { writeFileSync } from "node:fs";
import { FIXTURE_DATA } from "../src/lib/gc/data.ts";

const out = process.argv[2] ?? "../backend/app/services/gc/seed_data.json";
writeFileSync(out, JSON.stringify(FIXTURE_DATA, null, 2) + "\n");
console.log(`Wrote ${Object.keys(FIXTURE_DATA).length} collections to ${out}`);
