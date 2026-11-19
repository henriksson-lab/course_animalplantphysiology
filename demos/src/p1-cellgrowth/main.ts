// Growth of a walled cell (Lockhart 1965). Auto-mounts on <div data-demo="p1-cellgrowth">.
//   relative growth rate  r = (1/L) dL/dt = φ · (P − Y)   if P > Y, else 0
//   P  turgor pressure (MPa), Y  wall yield threshold (MPa), φ  wall extensibility (MPa⁻¹ h⁻¹).
// Turgor is held constant (water uptake keeps pace with growth). Wall loosening (expansins at
// low wall pH, e.g. after auxin) raises φ and lowers Y. Parameters can change during a run.
// Options: data-p="0.6" data-y="0.3" data-phi="0.6" (initial values).
import { autoMount, button, htmlEl, presets, slider, svgEl, setAttrs } from "../lib/ui";

const NAME = "p1-cellgrowth";

function injectStyle(): void {
  if (document.getElementById(NAME + "-style")) return;
  const s = document.createElement("style");
  s.id = NAME + "-style";
  s.textContent = `
.qb-demo[data-demo="${NAME}"] { flex-wrap: nowrap; gap: 20px; }
.qb-demo[data-demo="${NAME}"] .qb-plot { flex: 0 0 660px; width: 660px; max-width: 660px; }
.qb-demo[data-demo="${NAME}"] .qb-panel { flex: 1 1 440px; max-width: 470px; gap: .45em; }
.reveal .qb-demo[data-demo="${NAME}"] { font-size: 20px; }
.qb-demo[data-demo="${NAME}"] .qb-slider { grid-template-columns: 9.4em 1fr 3.6em; }
.qb-demo[data-demo="${NAME}"] .cg-rate { font-size: 1.15em; font-weight: 700; color: #397646; }
.qb-demo[data-demo="${NAME}"] svg .lab { font-size: 20px; }
.qb-demo[data-demo="${NAME}"] svg .small { font-size: 18px; fill: var(--qb-muted); }
`;
  document.head.appendChild(s);
}

const C = { wall: "#397646", cyto: "#e2eedf", vac: "#d8eaf0", blue: "#267a91", red: "#b64853", gold: "#b37a22", ink: "#243645" };
const L0 = 20, LMAX = 400, TMAX = 8;   // µm, µm, h

function mount(host: HTMLElement): void {
  injectStyle();
  const P0 = Number(host.dataset.p ?? 0.6), Y0 = Number(host.dataset.y ?? 0.3), F0 = Number(host.dataset.phi ?? 1.0);
  let P = P0, Y = Y0, phi = F0;
  const rate = () => Math.max(0, phi * (P - Y));

  // ---------- SVG ----------
  const W = 660, H = 540;
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "qb-plot", role: "img",
    "aria-label": "A growing plant cell and a plot of its length against time" });
  const XC = 20, SC = 1.5;             // cell left edge, px per µm
  const CY = 70, CH = 64;             // cell centre and height
  const clipId = `${NAME}-clip-${Math.random().toString(36).slice(2, 7)}`;
  const clip = svgEl("clipPath", { id: clipId }, svgEl("defs", {}, svg));
  const clipR = svgEl("rect", { x: XC, y: CY - CH / 2, height: CH, rx: 12 }, clip);
  const cellWall = svgEl("rect", { x: XC, y: CY - CH / 2, height: CH, rx: 12, fill: C.cyto, stroke: C.wall, "stroke-width": 6 }, svg);
  const vac = svgEl("rect", { x: XC + 12, y: CY - CH / 2 + 12, height: CH - 24, rx: 8, fill: C.vac, stroke: C.blue, "stroke-width": 2 }, svg);
  const hoops = svgEl("g", { "clip-path": `url(#${clipId})` }, svg);
  for (let x = XC + 8; x < XC + LMAX * SC + 20; x += 10)
    svgEl("line", { x1: x, x2: x, y1: CY - CH / 2, y2: CY + CH / 2, stroke: C.wall, "stroke-width": 2, opacity: 0.55 }, hoops);
  const tArrow = svgEl("path", { fill: C.red }, svg);
  const lenTxt = svgEl("text", { x: XC, y: CY + CH / 2 + 30, class: "lab" }, svg);
  svgEl("line", { x1: W - 20 - 50 * SC, x2: W - 20, y1: 20, y2: 20, stroke: C.ink, "stroke-width": 4 }, svg);
  svgEl("text", { x: W - 20 - 25 * SC, y: 44, "text-anchor": "middle", class: "small" }, svg).textContent = "50 µm";

  // plot
  const PX0 = 70, PX1 = 640, PY0 = 195, PY1 = 480;
  const xt = (t: number) => PX0 + (t / TMAX) * (PX1 - PX0);
  const yl = (l: number) => PY1 - (Math.min(l, LMAX) / LMAX) * (PY1 - PY0);
  for (let t = 0; t <= TMAX; t += 1) {
    svgEl("line", { x1: xt(t), x2: xt(t), y1: PY0, y2: PY1, class: t === 0 ? "axis" : "grid" }, svg);
    svgEl("text", { x: xt(t), y: PY1 + 24, "text-anchor": "middle", class: "small" }, svg).textContent = String(t);
  }
  for (let l = 0; l <= LMAX; l += 100) {
    svgEl("line", { x1: PX0, x2: PX1, y1: yl(l), y2: yl(l), class: l === 0 ? "axis" : "grid" }, svg);
    svgEl("text", { x: PX0 - 8, y: yl(l) + 6, "text-anchor": "end", class: "small" }, svg).textContent = String(l);
  }
  svgEl("text", { x: (PX0 + PX1) / 2, y: PY1 + 52, "text-anchor": "middle", class: "lab" }, svg).textContent = "time (h)";
  svgEl("text", { x: PX0 - 60, y: PY0 - 14, class: "lab" }, svg).textContent = "cell length (µm)";
  const ghosts = svgEl("g", {}, svg);
  const curve = svgEl("polyline", { fill: "none", stroke: C.wall, "stroke-width": 4 }, svg);
  const dot = svgEl("circle", { r: 8, fill: C.wall, stroke: "#fff", "stroke-width": 2 }, svg);

  // ---------- panel ----------
  const panel = htmlEl("div", "qb-panel");
  const pre = presets(panel, [
    { label: "Growing", apply: () => setAll(0.6, 0.3, 1.0) },
    { label: "Stiff wall: P < Y", apply: () => setAll(0.6, 0.7, 1.0) },
    { label: "Acid growth (auxin)", apply: () => setAll(0.6, 0.2, 1.5) },
    { label: "Low turgor", apply: () => setAll(0.35, 0.3, 1.0) },
  ]);
  const sP = slider(panel, "Turgor P", 0, 1, 0.05, P, v => { P = v; info(); }, v => v.toFixed(2));
  const sY = slider(panel, "Yield threshold Y", 0, 1, 0.05, Y, v => { Y = v; info(); }, v => v.toFixed(2));
  const sF = slider(panel, "Extensibility φ", 0, 2, 0.1, phi, v => { phi = v; info(); }, v => v.toFixed(1));
  const rateEl = htmlEl("div", "cg-rate", "", panel);
  const ro = htmlEl("div", "qb-readout", "", panel);
  const btns = htmlEl("div", "qb-presets", "", panel);
  const playBtn = button(btns, "▶ Grow for 8 h", () => (running ? pause() : play()));
  button(btns, "Reset", () => {
    pause(); setAll(P0, Y0, F0); pre.forEach(b => b.classList.remove("active"));
    ghosts.replaceChildren(); restart();
  });
  htmlEl("div", "qb-note", "P and Y in MPa, φ in MPa⁻¹ h⁻¹. Change a slider while the cell grows: loosening the wall mid-run bends the curve.", panel);
  host.append(svg, panel);

  function setAll(p: number, y: number, f: number): void {
    P = p; Y = y; phi = f; sP.set(p); sY.set(y); sF.set(f); info();
  }

  // ---------- simulation ----------
  let t = 0, L = L0, pts: [number, number][] = [[0, L0]];
  let running = false, raf = 0, last = 0;
  function restart(): void { t = 0; L = L0; pts = [[0, L0]]; draw(); }
  function play(): void {
    if (t >= TMAX - 1e-9) {
      // keep the finished run as a grey ghost, then start again
      if (pts.length > 1) {
        const g = svgEl("polyline", { fill: "none", stroke: "#aaa", "stroke-width": 3, "stroke-dasharray": "6 5",
          points: pts.map(([a, b]) => `${xt(a)},${yl(b)}`).join(" ") }, ghosts);
        while (ghosts.childNodes.length > 3) ghosts.removeChild(ghosts.firstChild!);
        void g;
      }
      restart();
    }
    running = true; playBtn.textContent = "❚❚ Pause"; last = performance.now();
    raf = requestAnimationFrame(step);
  }
  function pause(): void { running = false; cancelAnimationFrame(raf); playBtn.textContent = t >= TMAX - 1e-9 ? "▶ Grow again" : "▶ Grow for 8 h"; }
  function step(now: number): void {
    const dt = Math.min(0.1, (now - last) / 1000) * 1.0;   // 1 h of model time per second
    last = now;
    const h = Math.min(dt, TMAX - t);
    L *= Math.exp(rate() * h);
    t += h;
    pts.push([t, L]);
    draw();
    if (t >= TMAX - 1e-9) { pause(); return; }
    raf = requestAnimationFrame(step);
  }

  function info(): void {
    const r = rate();
    rateEl.textContent = r > 0 ? `Growth rate r = ${r.toFixed(2)} h⁻¹` : "No growth: P ≤ Y";
    rateEl.style.color = r > 0 ? C.wall : C.red;
    ro.textContent =
      `r = φ × (P − Y)\n  = ${phi.toFixed(1)} × (${P.toFixed(2)} − ${Y.toFixed(2)})\n` +
      (r > 0 ? `  = ${r.toFixed(2)} h⁻¹: length doubles every ${(Math.LN2 / r).toFixed(1)} h` : `  = 0: turgor does not exceed the yield threshold`);
    draw();
  }

  function draw(): void {
    const w = Math.min(L, LMAX + 10) * SC;
    setAttrs(cellWall, { width: w }); setAttrs(clipR, { width: w });
    setAttrs(vac, { width: Math.max(4, w - 24) });
    // turgor arrows: pressing on the end walls, size ∝ P
    const a = 6 + 14 * P, xe = XC + w - 16;
    tArrow.setAttribute("d", P > 0.02 && w > 70
      ? `M ${xe - 10 - a} ${CY - 3} L ${xe - 10} ${CY - 3} L ${xe - 10} ${CY - 9} L ${xe} ${CY} L ${xe - 10} ${CY + 9} L ${xe - 10} ${CY + 3} L ${xe - 10 - a} ${CY + 3} Z`
      : "");
    lenTxt.textContent = `length ${L.toFixed(0)} µm   (t = ${t.toFixed(1)} h)` + (L > LMAX ? "  off scale" : "");
    curve.setAttribute("points", pts.map(([a2, b]) => `${xt(a2)},${yl(b)}`).join(" "));
    setAttrs(dot, { cx: xt(t), cy: yl(L) });
  }

  info();
  restart();
}

autoMount(NAME, mount);
