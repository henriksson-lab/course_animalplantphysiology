// Soil–plant–air continuum. Auto-mounts on <div data-demo="p2-soilplantair">.
// Steady-state transpiration through a chain of hydraulic resistances:
//   vapour phase:  E = g_s · VPD / P_atm            (leaf at air temperature, 25 °C; inside air saturated)
//   liquid phase:  Ψ_leaf = Ψ_soil − E·(R_soil + R_root + R_stem + R_leaf) − 0.0098·height
//   stomata (optional ABA response): g_s = g_max · opening / (1 + (Ψ_leaf / −1.5)^6)
//   air:           Ψ_air = (RT / V̄w) · ln(RH) ≈ 137.6 · ln(RH) MPa
// E is solved by bisection (the stomatal feedback makes it implicit).
// Options: data-rh="50" (%), data-soil="-0.1" (MPa), data-height="1" (m).
import { autoMount, button, checkbox, htmlEl, presets, slider, svgEl, setAttrs } from "../lib/ui";

const NAME = "p2-soilplantair";

function injectStyle(): void {
  if (document.getElementById(NAME + "-style")) return;
  const s = document.createElement("style");
  s.id = NAME + "-style";
  s.textContent = `
.qb-demo[data-demo="${NAME}"] { flex-wrap: nowrap; gap: 20px; }
.qb-demo[data-demo="${NAME}"] .qb-plot { flex: 0 0 640px; width: 640px; max-width: 640px; }
.qb-demo[data-demo="${NAME}"] .qb-panel { flex: 1 1 470px; max-width: 490px; gap: .4em; }
.reveal .qb-demo[data-demo="${NAME}"] { font-size: 20px; }
.qb-demo[data-demo="${NAME}"] .qb-slider { grid-template-columns: 7.2em 1fr 4.4em; }
.qb-demo[data-demo="${NAME}"] .spa-E { font-size: 1.15em; font-weight: 700; color: #267a91; }
.qb-demo[data-demo="${NAME}"] .spa-warn { font-weight: 700; color: #b64853; min-height: 2.6em; }
.qb-demo[data-demo="${NAME}"] svg .lab { font-size: 20px; }
.qb-demo[data-demo="${NAME}"] svg .small { font-size: 18px; fill: var(--qb-muted); }
.qb-demo[data-demo="${NAME}"] svg .val { font-size: 19px; font-weight: 700; }
`;
  document.head.appendChild(s);
}

const C = { soil: "#b37a22", green: "#397646", blue: "#267a91", red: "#b64853", ink: "#243645", pale: "#eaf3f5" };
const fmt = (v: number, d = 2) => (Math.abs(v) < 0.005 ? 0 : v).toFixed(d).replace("-", "−");

const ESAT_25 = 3.169;          // kPa, saturation vapour pressure at 25 °C
const PATM = 101.3;             // kPa
const RT_VW = 8.314 * 298.15 / 18.0e-6 / 1e6;   // MPa, ≈ 137.7
const G_MAX = 0.4;              // mol m⁻² s⁻¹, fully open stomata
// Hydraulic resistances, MPa per (mmol m⁻² s⁻¹) of leaf area.
const R_ROOT = 0.04, R_STEM = 0.025, R_LEAF = 0.04;
const rSoil = (psiSoil: number) => 0.01 * Math.max(1, psiSoil / -0.1) ** 2;   // drying soil conducts far less

interface State { E: number; g: number; nodes: number[]; air: number; vpd: number }

function solve(rh: number, psiSoil: number, height: number, opening: number, aba: boolean): State {
  const vpd = ESAT_25 * (1 - rh);                  // kPa (leaf and air at 25 °C)
  const D = vpd / PATM;                            // mol mol⁻¹
  const Rs = rSoil(psiSoil);
  const leafPsi = (E: number) => psiSoil - E * (Rs + R_ROOT + R_STEM + R_LEAF) - 0.0098 * height;
  const gOf = (psiLeaf: number) => G_MAX * opening * (aba ? 1 / (1 + Math.pow(Math.max(0, psiLeaf / -1.5), 6)) : 1);
  const Emax = 1000 * G_MAX * opening * D;
  let lo = 0, hi = Emax;
  for (let i = 0; i < 60; i++) {
    const m = (lo + hi) / 2;
    if (1000 * gOf(leafPsi(m)) * D > m) lo = m; else hi = m;
  }
  const E = (lo + hi) / 2;
  const n0 = psiSoil;
  const n1 = n0 - E * Rs;                          // root surface
  const n2 = n1 - E * R_ROOT;                      // root xylem
  const n3 = n2 - E * R_STEM - 0.0098 * height;    // leaf xylem (at the top)
  const n4 = n3 - E * R_LEAF;                      // leaf cells
  return { E, g: gOf(n4), nodes: [n0, n1, n2, n3, n4], air: RT_VW * Math.log(Math.max(rh, 1e-6)), vpd };
}

function mount(host: HTMLElement): void {
  injectStyle();
  const rh0 = Number(host.dataset.rh ?? 50) / 100;
  const soil0 = Number(host.dataset.soil ?? -0.1);
  const h0 = Number(host.dataset.height ?? 1);
  let rh = rh0, soil = soil0, height = h0, opening = 1, aba = false;

  // ---------- SVG ----------
  const W = 640, H = 540;
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "qb-plot", role: "img",
    "aria-label": "Water potential along the path from soil to air, with the transpiration flux" });
  // Plant schematic on the left
  svgEl("rect", { x: 0, y: 0, width: 230, height: 120, fill: "#f2f7fa" }, svg);
  svgEl("rect", { x: 0, y: 400, width: 230, height: 140, fill: "#efe3d3" }, svg);
  const airLab = svgEl("text", { x: 115, y: 30, "text-anchor": "middle", class: "lab" }, svg);
  const airVal = svgEl("text", { x: 115, y: 58, "text-anchor": "middle", class: "val", fill: C.red }, svg);
  svgEl("text", { x: 115, y: 528, "text-anchor": "middle", class: "lab" }, svg).textContent = "Soil";
  const stem = svgEl("line", { x1: 115, y1: 410, x2: 115, y2: 170, stroke: C.green, "stroke-width": 10, "stroke-linecap": "round" }, svg);
  svgEl("path", { d: "M115 175 C 150 130 205 135 215 160 C 185 185 140 190 115 175 Z", fill: "#cfe5c8", stroke: C.green, "stroke-width": 3 }, svg);
  svgEl("path", { d: "M115 205 C 80 165 25 170 15 195 C 45 220 90 222 115 205 Z", fill: "#cfe5c8", stroke: C.green, "stroke-width": 3 }, svg);
  for (const d of ["M115 410 L70 470", "M115 410 L160 480", "M115 410 L112 505", "M90 445 L60 450", "M140 445 L175 440"])
    svgEl("path", { d, stroke: C.green, "stroke-width": 5, fill: "none", "stroke-linecap": "round" }, svg);
  // moving water in the stem (dash offset animated in proportion to E)
  const flow = svgEl("line", { x1: 115, y1: 405, x2: 115, y2: 178, stroke: C.blue, "stroke-width": 4, "stroke-dasharray": "8 10" }, svg);
  const vapour = svgEl("g", {}, svg);
  const puffs = [0, 1, 2].map(i => svgEl("text", { x: 185 + i * 12, y: 128 - i * 22, class: "lab", fill: C.blue }, vapour));
  puffs.forEach(p => (p.textContent = "~"));

  // Profile plot on the right
  const PX0 = 290, PX1 = 630, PY0 = 60, PY1 = 440, VMIN = -4, VMAX = 0;
  const yv = (v: number) => PY0 + (VMAX - Math.max(VMIN, Math.min(VMAX, v))) / (VMAX - VMIN) * (PY1 - PY0);
  const names = ["Soil", "Root\nsurface", "Root\nxylem", "Leaf\nxylem", "Leaf\ncells"];
  const xs = names.map((_, i) => PX0 + 40 + i * (PX1 - PX0 - 60) / 4);
  for (let v = 0; v >= VMIN - 1e-9; v -= 0.5) {
    svgEl("line", { x1: PX0, x2: PX1, y1: yv(v), y2: yv(v), class: Math.abs(v) < 1e-9 ? "axis" : "grid" }, svg);
    svgEl("text", { x: PX0 - 6, y: yv(v) + 6, "text-anchor": "end", class: "small" }, svg).textContent = fmt(v, 1);
  }
  svgEl("text", { x: PX0 - 40, y: 36, class: "lab" }, svg).textContent = "Ψ (MPa)";
  names.forEach((nm, i) => nm.split("\n").forEach((t, j) =>
    (svgEl("text", { x: xs[i], y: PY1 + 28 + j * 22, "text-anchor": "middle", class: "small" }, svg).textContent = t)));
  // wilting and cavitation reference lines
  svgEl("line", { x1: PX0, x2: PX1, y1: yv(-1.5), y2: yv(-1.5), stroke: C.red, "stroke-width": 1.5, "stroke-dasharray": "4 5" }, svg);
  svgEl("text", { x: PX0 + 4, y: yv(-1.5) + 22, class: "small" }, svg).textContent = "leaf wilts";
  const prof = svgEl("polyline", { fill: "none", stroke: C.blue, "stroke-width": 4 }, svg);
  const dots = xs.map(() => svgEl("circle", { r: 9, fill: C.blue, stroke: "#fff", "stroke-width": 2 }, svg));
  const vals = xs.map(() => svgEl("text", { "text-anchor": "middle", class: "val" }, svg));
  const offTxt = svgEl("text", { x: PX1, y: 36, "text-anchor": "end", class: "small" }, svg);

  // ---------- panel ----------
  const panel = htmlEl("div", "qb-panel");
  const pre = presets(panel, [
    { label: "Lecture", apply: () => setAll(0.5, -0.1, 1, 1, false) },
    { label: "Humid", apply: () => setAll(0.9, -0.1, 1, 1, false) },
    { label: "Dry soil", apply: () => setAll(0.5, -0.8, 1, 1, false) },
    { label: "Dry soil + ABA", apply: () => setAll(0.5, -0.8, 1, 1, true) },
    { label: "Redwood", apply: () => setAll(0.5, -0.1, 100, 1, true) },
  ]);
  const sRH = slider(panel, "Air humidity", 20, 100, 1, rh * 100, v => { rh = v / 100; draw(); }, v => v.toFixed(0) + " %");
  const sSoil = slider(panel, "Soil Ψ", -1.5, 0, 0.05, soil, v => { soil = v; draw(); }, v => fmt(v));
  const sH = slider(panel, "Plant height", 1, 110, 1, height, v => { height = v; draw(); }, v => v.toFixed(0) + " m");
  const sOpen = slider(panel, "Stomata open", 0, 100, 5, opening * 100, v => { opening = v / 100; draw(); }, v => v.toFixed(0) + " %");
  const cAba = checkbox(panel, "Stomata close as the leaf dries (ABA)", aba, v => { aba = v; draw(); });
  const Eout = htmlEl("div", "spa-E", "", panel);
  const ro = htmlEl("div", "qb-readout", "", panel);
  const warn = htmlEl("div", "spa-warn", "", panel);
  button(panel, "Reset", () => { setAll(rh0, soil0, h0, 1, false); pre.forEach(b => b.classList.remove("active")); });
  host.append(svg, panel);

  function setAll(r: number, s: number, h: number, o: number, a: boolean): void {
    rh = r; soil = s; height = h; opening = o; aba = a;
    sRH.set(r * 100); sSoil.set(s); sH.set(h); sOpen.set(o * 100); cAba.checked = a;
    draw();
  }

  let st = solve(rh, soil, height, opening, aba);
  function draw(): void {
    st = solve(rh, soil, height, opening, aba);
    airLab.textContent = `Air, ${Math.round(rh * 100)} % humidity`;
    airVal.textContent = rh >= 0.995 ? "Ψ ≈ 0 MPa" : `Ψ = ${fmt(st.air, 0)} MPa`;
    const pts = st.nodes.map((v, i) => `${xs[i]},${yv(v)}`).join(" ");
    prof.setAttribute("points", pts);
    st.nodes.forEach((v, i) => {
      setAttrs(dots[i], { cx: xs[i], cy: yv(v), fill: i === 0 ? C.soil : i === 4 ? C.green : C.blue });
      setAttrs(vals[i], { x: xs[i], y: yv(v) + (v < -3.5 ? (i % 2 ? -16 : -42) : 30) });
      vals[i].textContent = v < VMIN ? `${fmt(v, 1)} ↓` : fmt(v, 2);
    });
    offTxt.textContent = `air ${rh >= 0.995 ? "≈ 0" : fmt(st.air, 0)} MPa: off scale`;
    Eout.textContent = `Transpiration: ${st.E.toFixed(1)} mmol m⁻² s⁻¹`;
    ro.textContent =
      `stomatal conductance ${(st.g * 1000).toFixed(0)} mmol m⁻² s⁻¹\n` +
      `vapour pressure deficit ${st.vpd.toFixed(2)} kPa\n` +
      `gravity: −${(0.0098 * height).toFixed(2)} MPa over ${height.toFixed(0)} m`;
    const leaf = st.nodes[4], xyl = st.nodes[3];
    const w: string[] = [];
    if (soil <= -1.5) w.push("Soil at the permanent wilting point (−1.5 MPa).");
    if (xyl < -2.5) w.push("Xylem tension beyond −2.5 MPa: cavitation risk.");
    else if (leaf < -1.5) w.push("Leaf Ψ below −1.5 MPa: turgor lost, the leaf wilts.");
    if (st.E < 0.05 && rh < 0.995 && opening > 0) w.push("Stomata nearly shut: no water lost, no CO₂ gained.");
    warn.textContent = w.join(" ");
  }

  // animation of the water column: speed ∝ E
  let off = 0, last = performance.now();
  function frame(t: number): void {
    const dt = Math.min(0.1, (t - last) / 1000); last = t;
    if (svg.getBoundingClientRect().width > 0) {
      off = (off + st.E * 12 * dt) % 1000;
      flow.setAttribute("stroke-dashoffset", String(-off));
      const a = Math.min(1, st.E / 4);
      vapour.setAttribute("opacity", String(a));
      puffs.forEach((p, i) => p.setAttribute("y", String(128 - i * 22 - ((off * 0.6 + i * 7) % 14))));
    }
    requestAnimationFrame(frame);
  }
  draw();
  requestAnimationFrame(frame);
}

autoMount(NAME, mount);
