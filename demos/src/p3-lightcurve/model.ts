// Leaf photosynthesis model for the P3 light-response demo.
// C3: Farquhar-von Caemmerer-Berry with Bernacchi et al. (2001) temperature functions,
//     Ci = 0.7 Ca (0.35 Ca with stomata nearly closed). Rubisco-limited and light (RuBP-regeneration)-limited rates; the smaller wins.
// C4: no photorespiration (CO2 is concentrated in the bundle sheath), but 5 instead of 3 ATP
//     per CO2, so a lower light-limited yield per electron; PEP carboxylase saturates at low CO2;
//     a cold-sensitive maximum rate (Collatz-style). Ci = 0.4 Ca (0.2 Ca closed).
// Numbers are typical textbook values for a sun leaf at 21% O2.

const R = 8.314e-3; // kJ mol-1 K-1
const arr = (k25: number, ea: number, T: number) => k25 * Math.exp((ea * (T - 25)) / (R * 298.15 * (T + 273.15)));
/** Rate falls off above `hi` (enzyme inactivation). */
const hot = (T: number, hi: number) => 1 / (1 + Math.exp(0.35 * (T - hi)));

export type Pathway = "C3" | "C4";
export interface Leaf { pathway: Pathway; co2: number; temp: number; closed: boolean }

export interface Rates {
  net: number;      // net CO2 uptake, µmol m-2 s-1 (what a gas-exchange instrument measures)
  gross: number;    // net + dark respiration
  rd: number;       // mitochondrial (dark) respiration
  photoresp: number;// CO2 released by photorespiration (0.5 per oxygenation)
  voc: number;      // oxygenations per carboxylation
  limit: "light" | "Rubisco" | "CO2 supply" | "enzyme capacity";
}

export function rd(leaf: Leaf): number {
  return 1.2 * Math.pow(2, (leaf.temp - 25) / 10);
}

export function rates(I: number, leaf: Leaf): Rates {
  const T = leaf.temp, Rd = rd(leaf);
  if (leaf.pathway === "C3") {
    const ci = (leaf.closed ? 0.35 : 0.7) * leaf.co2;
    const gs = arr(42.75, 37.83, T);                 // CO2 compensation point without Rd (ppm)
    const kc = arr(404.9, 79.43, T), ko = arr(278.4, 36.38, T); // ppm, mmol mol-1
    const vcmax = arr(70, 65.33, T) * hot(T, 41);
    const jmax = arr(130, 43.5, T) * hot(T, 38);
    const alpha = 0.3, theta = 0.7;                   // electrons per incident photon; curvature
    const b = alpha * I + jmax;
    const J = (b - Math.sqrt(Math.max(b * b - 4 * theta * alpha * I * jmax, 0))) / (2 * theta);
    const ac = (vcmax * (ci - gs)) / (ci + kc * (1 + 210 / ko));
    const aj = (J * (ci - gs)) / (4 * ci + 8 * gs);
    const a = Math.min(ac, aj);                       // = Vc - 0.5 Vo
    const voc = (2 * gs) / ci;
    const vc = a / (1 - gs / ci);
    const pr = Math.max(0, 0.5 * voc * vc);
    return { net: a - Rd, gross: a, rd: Rd, photoresp: pr, voc, limit: aj < ac ? "light" : "Rubisco" };
  }
  const ci = (leaf.closed ? 0.2 : 0.4) * leaf.co2;
  const vmax = 45 * Math.pow(2, (T - 25) / 10) * hot(T, 42) / (1 + Math.exp(0.3 * (14 - T)));
  const aj = (0.3 * I) / 5.6 * 0.96;                  // ~5.6 electrons-equivalent per CO2, a few % leak
  const ap = 0.2 * ci;                                // PEP carboxylase, CO2-limited
  const a = Math.min(vmax, aj, ap);
  const limit = a === aj ? "light" : a === ap ? "CO2 supply" : "enzyme capacity";
  return { net: a - Rd, gross: a, rd: Rd, photoresp: 0.02 * a, voc: 0.02, limit };
}

/** Light compensation point (µmol photons m-2 s-1), or null if net never reaches zero. */
export function compensation(leaf: Leaf, max = 2000): number | null {
  if (rates(max, leaf).net <= 0) return null;
  let lo = 0, hi = max;
  for (let k = 0; k < 40; k++) {
    const m = (lo + hi) / 2;
    if (rates(m, leaf).net > 0) hi = m; else lo = m;
  }
  return (lo + hi) / 2;
}
