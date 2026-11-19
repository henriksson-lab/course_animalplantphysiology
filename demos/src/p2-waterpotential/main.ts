// A plant cell in a solution. Auto-mounts on <div data-demo="p2-waterpotential">.
// The cell starts flaccid (protoplast volume V = V0, Ψp = 0) and exchanges water with
// the solution until its Ψ equals the solution's Ψ.
//   Ψs(V) = Ψs0 · V0 / V              (solutes diluted or concentrated by water)
//   Ψp(V) = ε (V / V0 − 1) for V > V0, else 0  (the wall pushes back only when stretched)
//   dV/dt ∝ Ψsolution − Ψcell         (water moves to lower Ψ)
// Options: data-sap="-0.6" (Ψs0, MPa), data-out="0" (solution Ψ, MPa), data-eps="10" (MPa).
import { autoMount, button, htmlEl, presets, slider, svgEl, setAttrs } from "../lib/ui";

const NAME = "p2-waterpotential";

function injectStyle(): void {
  if (document.getElementById(NAME + "-style")) return;
  const s = document.createElement("style");
  s.id = NAME + "-style";
  s.textContent = `
.qb-demo[data-demo="${NAME}"] { flex-wrap: nowrap; gap: 20px; }
.qb-demo[data-demo="${NAME}"] .qb-plot { flex: 0 0 650px; width: 650px; max-width: 650px; }
.qb-demo[data-demo="${NAME}"] .qb-panel { flex: 1 1 420px; max-width: 470px; gap: .45em; }
.reveal .qb-demo[data-demo="${NAME}"] { font-size: 20px; }
.qb-demo[data-demo="${NAME}"] .qb-slider { grid-template-columns: 9.2em 1fr 4.2em; }
.qb-demo[data-demo="${NAME}"] .wp-state { font-size: 1.15em; font-weight: 700; }
.qb-demo[data-demo="${NAME}"] svg .lab { font-size: 20px; }
.qb-demo[data-demo="${NAME}"] svg .small { font-size: 18px; fill: var(--qb-muted); }
.qb-demo[data-demo="${NAME}"] svg .big { font-size: 22px; font-weight: 700; }
`;
  document.head.appendChild(s);
}

const C = { wall: "#397646", cyto: "#e2eedf", vac: "#d8eaf0", vacEdge: "#267a91", gold: "#b37a22",
  green: "#397646", blue: "#267a91", red: "#b64853", ink: "#243645" };

const fmt = (v: number, d = 2) => (Math.abs(v) < 0.005 ? 0 : v).toFixed(d).replace("-", "−");

function mount(host: HTMLElement): void {
  injectStyle();
  const sap0 = Number(host.dataset.sap ?? -0.6);
  const out0 = Number(host.dataset.out ?? 0);
  const eps0 = Number(host.dataset.eps ?? 10);
  let sap = sap0, out = out0, eps = eps0;
  let V = 1;          // protoplast volume relative to V0 (incipient plasmolysis)

  const psiS = (v: number) => sap / v;
  const psiP = (v: number) => (v > 1 ? eps * (v - 1) : 0);
  const psiCell = (v: number) => psiS(v) + psiP(v);
  /** Equilibrium volume: Ψcell(V) = out (Ψcell increases monotonically with V). */
  function vEq(): number {
    let lo = 0.2, hi = 3;
    for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (psiCell(m) < out) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }

  // ---------- SVG ----------
  const W = 650, H = 540;
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "qb-plot", role: "img",
    "aria-label": "A plant cell in a beaker of solution, with bars for its water potential components" });
  const beaker = svgEl("rect", { x: 10, y: 60, width: 370, height: 400, rx: 18, stroke: "#8aa", "stroke-width": 3 }, svg);
  const solLab = svgEl("text", { x: 195, y: 45, "text-anchor": "middle", class: "lab" }, svg);
  const CX = 195, CY = 260, W0 = 250, H0 = 200;   // wall interior at V = V0
  const wall = svgEl("rect", { rx: 26, fill: "none", stroke: C.wall, "stroke-width": 10 }, svg);
  const proto = svgEl("rect", { rx: 22, fill: C.cyto, stroke: C.green, "stroke-width": 2.5 }, svg);
  const vac = svgEl("rect", { rx: 18, fill: C.vac, stroke: C.vacEdge, "stroke-width": 2 }, svg);
  const vacLab = svgEl("text", { x: CX, y: CY + 8, "text-anchor": "middle", class: "lab", fill: C.blue }, svg);
  vacLab.textContent = "vacuole";
  const arrows: SVGPathElement[] = [];
  const arrowG = svgEl("g", {}, svg);
  for (let k = 0; k < 4; k++) arrows.push(svgEl("path", { fill: C.blue }, arrowG));
  const stateTxt = svgEl("text", { x: 195, y: 500, "text-anchor": "middle", class: "big" }, svg);
  const volTxt = svgEl("text", { x: 195, y: 528, "text-anchor": "middle", class: "small" }, svg);

  // Bars: Ψs, Ψp, Ψcell and a line for the solution.
  const BX = 410, BW = 230, Y0 = 70, Y1 = 470, VMAX = 1.0, VMIN = -2.0;
  const yv = (v: number) => Y0 + (VMAX - Math.max(VMIN, Math.min(VMAX, v))) / (VMAX - VMIN) * (Y1 - Y0);
  const bg = svgEl("g", {}, svg);
  for (let v = VMIN; v <= VMAX + 1e-9; v += 0.5) {
    svgEl("line", { x1: BX + 40, x2: BX + BW, y1: yv(v), y2: yv(v), class: Math.abs(v) < 1e-9 ? "axis" : "grid" }, bg);
    svgEl("text", { x: BX + 34, y: yv(v) + 6, "text-anchor": "end", class: "small" }, bg).textContent = fmt(v, 1);
  }
  svgEl("text", { x: BX + 10, y: 45, class: "lab" }, bg).textContent = "Ψ (MPa)";
  svgEl("text", { x: BX + BW, y: 45, "text-anchor": "end", class: "lab", fill: C.red }, bg).textContent = "– – solution";
  const bars = [C.gold, C.green, C.blue].map(col => svgEl("rect", { width: 46, fill: col }, svg));
  const barX = [BX + 52, BX + 112, BX + 172];
  ["Ψs", "Ψp", "Ψ"].forEach((t, i) => {
    const e = svgEl("text", { x: barX[i] + 23, y: Y1 + 28, "text-anchor": "middle", class: "lab", fill: [C.gold, C.green, C.blue][i] }, svg);
    e.textContent = t; e.setAttribute("font-weight", "700");
  });
  const outLine = svgEl("line", { x1: BX + 44, x2: BX + BW, stroke: C.red, "stroke-width": 4, "stroke-dasharray": "10 6" }, svg);

  // ---------- panel ----------
  const panel = htmlEl("div", "qb-panel");
  const pre = presets(panel, [
    { label: "Pure water", apply: () => setCase(-0.6, 0) },
    { label: "−0.6 MPa", apply: () => setCase(-0.6, -0.6) },
    { label: "−0.8 MPa", apply: () => setCase(-0.6, -0.8) },
    { label: "Saline soil", apply: () => setCase(-0.4, -0.6) },
  ]);
  const sSap = slider(panel, "Cell sap Ψs", -1.5, -0.2, 0.05, sap, v => { sap = v; run(); }, v => fmt(v));
  const sOut = slider(panel, "Solution Ψ", -1.5, 0, 0.05, out, v => { out = v; run(); }, v => fmt(v));
  const sEps = slider(panel, "Wall stiffness ε", 2, 40, 1, eps, v => { eps = v; run(); }, v => v.toFixed(0) + " MPa");
  const ro = htmlEl("div", "qb-readout", "", panel);
  const state = htmlEl("div", "wp-state", "", panel);
  const btns = htmlEl("div", "qb-presets", "", panel);
  button(btns, "Place a flaccid cell in the solution", () => { V = 1; run(); });
  button(btns, "Reset", () => {
    sap = sap0; out = out0; eps = eps0; sSap.set(sap); sOut.set(out); sEps.set(eps);
    pre.forEach(b => b.classList.remove("active")); V = 1; run();
  });
  htmlEl("div", "qb-note", "Cell sap Ψs is measured at the flaccid volume V₀. The cell starts flaccid; water then flows until Ψ inside equals Ψ outside.", panel);
  host.append(svg, panel);

  function setCase(s: number, o: number): void {
    sap = s; out = o; sSap.set(s); sOut.set(o); V = 1; run();
  }

  // ---------- animation ----------
  let raf = 0, last = 0;
  function run(): void {
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(step); }
    draw();
  }
  function step(t: number): void {
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    const target = vEq();
    V += (target - V) * Math.min(1, 2.5 * dt);
    if (Math.abs(target - V) < 2e-4) V = target;
    draw();
    raf = Math.abs(target - V) > 0 ? requestAnimationFrame(step) : 0;
  }

  function draw(): void {
    const s = psiS(V), p = psiP(V), c = s + p;
    const flux = out - c;                         // > 0: water enters
    // solution colour: darker gold with more solute
    const k = Math.min(1, -out / 1.5);
    beaker.setAttribute("fill", `rgb(${Math.round(240 - 20 * k)},${Math.round(247 - 45 * k)},${Math.round(250 - 110 * k)})`);
    solLab.textContent = `Solution: Ψ = ${fmt(out)} MPa`;
    // geometry (2-D picture: area ∝ volume, so lengths ∝ √V)
    const fw = Math.sqrt(Math.max(V, 1));
    const ww = W0 * fw, wh = H0 * fw;
    setAttrs(wall, { x: CX - ww / 2, y: CY - wh / 2, width: ww, height: wh });
    const fp = Math.sqrt(V);
    const pw = W0 * fp - 10, ph = H0 * fp - 10;
    setAttrs(proto, { x: CX - pw / 2, y: CY - ph / 2, width: pw, height: ph, rx: V < 1 ? 60 * (1 - V) * 4 + 22 : 22 });
    setAttrs(vac, { x: CX - pw / 2 + 22, y: CY - ph / 2 + 22, width: pw - 44, height: ph - 44, rx: V < 1 ? 60 * (1 - V) * 4 + 18 : 18 });
    // water arrows across the membrane
    const mag = Math.min(1, Math.abs(flux) / 0.4);
    const show = Math.abs(flux) > 0.01;
    const inward = flux > 0;
    const pos: [number, number, number][] = [
      [CX - ww / 2 - 28, CY, 0], [CX + ww / 2 + 28, CY, Math.PI], [CX, CY - wh / 2 - 28, Math.PI / 2], [CX, CY + wh / 2 + 28, -Math.PI / 2]];
    arrows.forEach((a, i) => {
      const [x, y, ang] = pos[i];
      const L = 18 + 22 * mag, hw = 6 + 6 * mag;
      const dir = inward ? ang : ang + Math.PI;
      const ux = Math.cos(dir), uy = Math.sin(dir);
      const tx = x + (inward ? 1 : 1) * ux * L / 2, ty = y + uy * L / 2;
      const bx = x - ux * L / 2, by = y - uy * L / 2;
      const px = -uy, py = ux;
      a.setAttribute("d", `M ${bx + px * hw / 2.5} ${by + py * hw / 2.5} L ${tx - ux * 12 + px * hw / 2.5} ${ty - uy * 12 + py * hw / 2.5} L ${tx - ux * 12 + px * hw} ${ty - uy * 12 + py * hw} L ${tx} ${ty} L ${tx - ux * 12 - px * hw} ${ty - uy * 12 - py * hw} L ${tx - ux * 12 - px * hw / 2.5} ${ty - uy * 12 - py * hw / 2.5} L ${bx - px * hw / 2.5} ${by - py * hw / 2.5} Z`);
      a.setAttribute("opacity", show ? String(0.35 + 0.65 * mag) : "0");
    });
    // bars
    const z = yv(0);
    [s, p, c].forEach((v, i) => {
      const y = yv(v);
      setAttrs(bars[i], { x: barX[i], y: Math.min(y, z), height: Math.max(1, Math.abs(y - z)) });
    });
    setAttrs(outLine, { y1: yv(out), y2: yv(out) });
    // state
    let st: string, col: string;
    if (V < 0.998) { st = "Plasmolysed: pulled from wall"; col = C.red; }
    else if (p < 0.02) { st = "Flaccid: Ψp = 0"; col = C.gold; }
    else { st = "Turgid: wall pushes back"; col = C.green; }
    stateTxt.textContent = st; stateTxt.setAttribute("fill", col);
    volTxt.textContent = `protoplast volume ${V.toFixed(2)} × V₀`;
    const moving = Math.abs(flux) > 0.005;
    ro.textContent =
      `Ψs = ${fmt(sap)} × V₀/V = ${fmt(s)} MPa\n` +
      `Ψp = ${fmt(p)} MPa\n` +
      `Ψcell = Ψs + Ψp = ${fmt(c)} MPa\n` +
      `Ψsolution = ${fmt(out)} MPa`;
    state.textContent = !moving ? "Equilibrium: no net water flow"
      : flux > 0 ? `Water flows IN  (${fmt(out)} > ${fmt(c)})` : `Water flows OUT  (${fmt(c)} > ${fmt(out)})`;
    state.style.color = !moving ? C.ink : C.blue;
  }

  draw();
}

autoMount(NAME, mount);
