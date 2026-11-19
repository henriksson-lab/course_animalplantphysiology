// How big can an animal be if O2 reaches its cells only by diffusion from the surface?
// A sphere (or a flat sheet) of tissue sits in air-saturated water (O2 0.27 mM) and uses
// O2 uniformly at the chosen metabolic rate. The steady-state O2 profile inside is the exact
// solution of D ∇²C = M with C = C0 at the surface; where it would fall below zero there is
// an anoxic core that uses nothing. Shown: a cross-section coloured by O2, the profile along a
// diameter, A/V, the diffusion time to the centre (t ≈ x²/2D, as on the slide) and the
// largest radius/half-thickness diffusion alone can supply: sqrt(6DC0/M) for a sphere,
// sqrt(2DC0/M) for a sheet. Auto-mounts on <div data-demo="a1-scaling">.
import { autoMount, htmlEl, presets, slider, svgEl, setAttrs, type Slider } from "../lib/ui";
import { axes, pathD, injectStyle, baseCss, keepTextFills } from "./plot";

const NAME = "a1-scaling";
const BLUE = "#267a91", RED = "#b64853", INK = "#243645", GOLD = "#b37a22";
const D = 2e-9;          // m² s⁻¹, O2 in water/tissue
const C0 = 0.27;         // mol m⁻³, air-saturated water at ~20 °C
const RATE = 1e-3 / 22.4 * 1e6 / 3600;   // (mL O2 g⁻¹ h⁻¹) → mol m⁻³ s⁻¹, tissue density 1 g cm⁻³

/** O2 (fraction of surface value) at normalised position u = r/R (0 centre, 1 surface). */
export function profile(sphere: boolean, Rm: number, M: number): { f: (u: number) => number; core: number } {
  const k = M / D;                          // mol m⁻⁵
  if (!sphere) {
    // slab half-thickness h: C = C0 − k/2 (h² − x²) unless an anoxic core |x| < xc
    const xc = Math.max(0, Rm - Math.sqrt(2 * C0 / k));
    return { core: xc / Rm, f: u => {
      const x = u * Rm;
      if (xc === 0) return Math.max(0, 1 - (k / 2) * (Rm * Rm - x * x) / C0);
      return x <= xc ? 0 : (k / 2) * (x - xc) ** 2 / C0;
    } };
  }
  // sphere: without a core, C = C0 − k/6 (R² − r²). With an anoxic core rc:
  // C = k/6 r² + A/r + B with A = k rc³/3, B = −k rc²/2, and C(R) = C0 fixes rc.
  if ((k / 6) * Rm * Rm <= C0) return { core: 0, f: u => 1 - (k / 6) * Rm * Rm * (1 - u * u) / C0 };
  const cAt = (rc: number, r: number) => (k / 6) * r * r + (k * rc ** 3 / 3) / r - (k / 2) * rc * rc;
  let lo = 0, hi = Rm;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (cAt(m, Rm) > C0) lo = m; else hi = m; }
  const rc = (lo + hi) / 2;
  return { core: rc / Rm, f: u => { const r = u * Rm; return r <= rc ? 0 : Math.max(0, cAt(rc, r) / C0); } };
}

/** O2 fraction (0–1) to a colour: dark slate (none) through to bright red (surface). */
function o2Colour(f: number): string {
  if (f <= 0) return "#2b2f36";
  const c0 = [70, 80, 125], c1 = [226, 70, 82];
  const t = Math.max(0, Math.min(1, f));
  const c = c0.map((v, i) => Math.round(v + (c1[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

const fmtLen = (m: number) => (m < 1e-3 ? `${(m * 1e6).toFixed(0)} µm` : m < 1e-2 ? `${(m * 1e3).toFixed(2)} mm` : `${(m * 1e3).toFixed(1)} mm`);
function fmtTime(s: number): string {
  if (s < 1) return `${s.toFixed(2)} s`;
  if (s < 120) return `${s.toFixed(0)} s`;
  if (s < 7200) return `${(s / 60).toFixed(0)} min`;
  return `${(s / 3600).toFixed(1)} h`;
}

function mount(host: HTMLElement): void {
  injectStyle(NAME + "-style", baseCss(NAME, 600));
  let sphere = true;
  let logR = Math.log10(0.5);       // radius or half-thickness in mm
  let logM = Math.log10(0.2);       // mL O2 g⁻¹ h⁻¹
  const W = 600, H = 520;
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "qb-plot", role: "img",
    "aria-label": "Oxygen inside an animal supplied only by diffusion" }, host);

  // Cross-section drawn at fixed size; the real size is in the label.
  const CX = 330, CY = 140, RD = 118, RINGS = 48;
  const shape = svgEl("g", {}, svg);
  const rings: SVGElement[] = [];
  const sizeLab = svgEl("text", { x: CX, y: CY + RD + 36, "text-anchor": "middle", class: "lab" }, svg);
  const coreLab = svgEl("text", { x: CX, y: CY + 7, "text-anchor": "middle", class: "lab", fill: "#fff", "font-weight": 700 }, svg);
  svgEl("text", { x: 20, y: 30, class: "note", fill: RED }, svg).textContent = "■ O₂ high";
  svgEl("text", { x: 20, y: 56, class: "note", fill: "rgb(70,80,125)" }, svg).textContent = "■ O₂ low";
  svgEl("text", { x: 20, y: 82, class: "note", fill: "#2b2f36" }, svg).textContent = "■ no O₂";

  const ax = axes(svg, { x0: 90, y0: 310, w: 480, h: 130, xmin: -1, xmax: 1, ymin: 0, ymax: 100,
    xticks: [-1, 0, 1], yticks: [0, 50, 100], xlabel: "Position across the animal",
    ylabel: "O₂ (%)", xfmt: v => (v === 0 ? "centre" : "surface") });
  const prof = svgEl("path", { fill: "none", stroke: RED, "stroke-width": 4 }, svg);

  const panel = htmlEl("div", "qb-panel", "", host);
  const shapeBtns = presets(panel, [
    { label: "Sphere", apply: () => { sphere = true; draw(); } },
    { label: "Flat sheet", apply: () => { sphere = false; draw(); } },
  ]);
  shapeBtns[0].classList.add("active");
  const slR: Slider = slider(panel, "Radius (mm)", -1.7, 1, 0.01, logR, v => { logR = v; draw(); },
    v => { const r = 10 ** v; return r < 1 ? r.toFixed(2) : r.toFixed(1); });
  const rName = slR.input.parentElement!.querySelector(".qb-slider-name") as HTMLElement;
  const slM: Slider = slider(panel, "O₂ use (mL g⁻¹ h⁻¹)", -1.3, 0.5, 0.01, logM, v => { logM = v; draw(); },
    v => (10 ** v).toFixed(2));
  const out = htmlEl("div", "qb-readout", "", panel);
  const big = htmlEl("div", "big", "", panel);
  const set = (sph: boolean, r: number, m: number) => {
    sphere = sph; logR = Math.log10(r); logM = Math.log10(m);
    slR.set(logR); slM.set(logM);
    shapeBtns.forEach((b, i) => b.classList.toggle("active", i === (sph ? 0 : 1)));
    draw();
  };
  presets(panel, [
    { label: "Reset", apply: () => set(true, 0.5, 0.2) },
    { label: "Amoeba", apply: () => set(true, 0.15, 0.2) },
    { label: "5 mm ball", apply: () => set(true, 5, 0.2) },
    { label: "Flatworm", apply: () => set(false, 0.15, 0.2) },
    { label: "Mouse tissue", apply: () => set(true, 0.5, 2.5) },
  ]);

  function draw(): void {
    const Rmm = 10 ** logR, Rm = Rmm * 1e-3, rate = 10 ** logM, M = rate * RATE;
    rName.textContent = sphere ? "Radius (mm)" : "Half-thickness (mm)";
    const p = profile(sphere, Rm, M);
    // cross-section
    shape.replaceChildren(); rings.length = 0;
    for (let i = 0; i < RINGS; i++) {
      const u = 1 - i / RINGS;                        // outer → inner
      const fill = o2Colour(p.f(u - 0.5 / RINGS));
      if (sphere) rings.push(svgEl("circle", { cx: CX, cy: CY, r: RD * u, fill }, shape));
      else rings.push(svgEl("rect", { x: CX - 270, width: 540, y: CY - RD * u, height: 2 * RD * u, fill }, shape));
    }
    svgEl(sphere ? "circle" : "rect", sphere ? { cx: CX, cy: CY, r: RD, fill: "none", stroke: INK, "stroke-width": 2 }
      : { x: CX - 270, width: 540, y: CY - RD, height: 2 * RD, fill: "none", stroke: INK, "stroke-width": 2 }, shape);
    sizeLab.textContent = sphere ? `Sphere, radius ${fmtLen(Rm)} (not to scale)` : `Sheet, ${fmtLen(2 * Rm)} thick (not to scale)`;
    sizeLab.setAttribute("y", String(CY + RD + 32));
    const coreVol = sphere ? p.core ** 3 : p.core;
    coreLab.textContent = p.core > 0.12 ? "anoxic core" : "";
    // profile
    const pts: [number, number][] = [];
    for (let i = 0; i <= 200; i++) { const s = -1 + 2 * i / 200; pts.push([ax.sx(s), ax.sy(100 * p.f(Math.abs(s)))]); }
    prof.setAttribute("d", pathD(pts));
    // numbers
    const av = sphere ? 3 / Rmm : 1 / Rmm;           // mm⁻¹
    const tCentre = Rm * Rm / (2 * D);
    const rMax = Math.sqrt((sphere ? 6 : 2) * D * C0 / M);
    out.textContent =
      `A/V                ${av < 10 ? av.toFixed(2) : av.toFixed(0)} mm⁻¹\n` +
      `Diffusion time to centre  ${fmtTime(tCentre)}\n` +
      `Largest ${sphere ? "radius" : "half-thickness"} by diffusion  ${fmtLen(rMax)}\n` +
      `O₂ at the centre   ${(100 * p.f(0)).toFixed(0)} % of surface`;
    big.textContent = p.core > 0 ? `${(100 * coreVol).toFixed(0)} % of the tissue gets no O₂`
      : "Every cell gets O₂";
    big.style.color = p.core > 0 ? RED : BLUE;
  }
  draw();
  keepTextFills(svg);
}

autoMount(NAME, mount);
