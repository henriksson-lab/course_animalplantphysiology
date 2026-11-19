// Drought and stomata: ABA closes stomata; less water is lost, but less CO2 enters and the leaf warms.
// Model (per m² leaf, steady state, approximate):
//   gs = gmax / (1 + (ABA / K)^2)                     stomatal conductance to water, mol m⁻² s⁻¹
//   E  = gs · VPD / P                                  transpiration, mol m⁻² s⁻¹ (P = 101.3 kPa)
//   A  = (Ca − Γ) / (1.6 / gs + 1 / k)                 CO2 uptake: diffusion in series with carboxylation
//   ΔT = (Rn − λE) / (cp · gH)                         leaf minus air temperature (energy balance)
// Since A saturates in gs but E is proportional to gs, partial closure raises water-use efficiency A/E.
//
// <div data-demo="p5-stomata" data-aba="0" data-vpd="2"></div>
import { autoMount, button, htmlEl, presets, slider, svgEl, setAttrs, scale } from "../lib/ui";

const NAME = "p5-stomata";
const W = 720, H = 520;
const GMAX = 0.5, K = 1, CA = 420, GAMMA = 50, KC = 0.1, P = 101.3;
const RN = 400, LAMBDA = 44000, CP = 29.3, GH = 1.5;
const ABAMAX = 5;

const CSS = `
.reveal .qb-demo[data-demo="${NAME}"] { flex-wrap: nowrap; gap: 24px; }
.qb-demo[data-demo="${NAME}"] .qb-plot { flex: 0 1 ${W}px; max-width: ${W}px; }
.qb-demo[data-demo="${NAME}"] .qb-panel { flex: 1 1 400px; max-width: 420px; }
[data-demo="${NAME}"] svg .tick { font-size: 18px; fill: var(--qb-muted); }
[data-demo="${NAME}"] svg .lab { font-size: 20px; }
[data-demo="${NAME}"] svg .gc { fill: #dbe9d3; stroke: #397646; stroke-width: 3; }
[data-demo="${NAME}"] svg .pore { fill: #2f3d48; }
[data-demo="${NAME}"] svg .cp { fill: #397646; }
[data-demo="${NAME}"] svg .eline { fill: none; stroke: var(--qb-c1); stroke-width: 4; }
[data-demo="${NAME}"] svg .aline { fill: none; stroke: var(--qb-c3); stroke-width: 4; }
[data-demo="${NAME}"] svg .wline { fill: none; stroke: var(--qb-c4); stroke-width: 3; stroke-dasharray: 8 6; }
[data-demo="${NAME}"] svg .now { stroke: var(--qb-fg); stroke-width: 2; stroke-dasharray: 4 4; }
[data-demo="${NAME}"] svg .elab { font-size: 19px; fill: var(--qb-c1); font-weight: 600; }
[data-demo="${NAME}"] svg .alab { font-size: 19px; fill: var(--qb-c3); font-weight: 600; }
[data-demo="${NAME}"] svg .wlab { font-size: 19px; fill: var(--qb-c4); font-weight: 600; }
[data-demo="${NAME}"] .p5s-tab { display: grid; grid-template-columns: auto auto auto; gap: .15em .5em; font-size: 19px;
  background: var(--qb-panel); border-radius: 6px; padding: .45em .6em; }
[data-demo="${NAME}"] .p5s-tab b { font-variant-numeric: tabular-nums; text-align: right; }
[data-demo="${NAME}"] .p5s-tab i { font-style: normal; color: var(--qb-muted); font-size: 17px; align-self: center; }
`;

function injectCss(): void {
  if (document.getElementById(NAME + "-style")) return;
  const s = document.createElement("style");
  s.id = NAME + "-style";
  s.textContent = CSS;
  document.head.appendChild(s);
}

function model(aba: number, vpd: number) {
  const gs = GMAX / (1 + (aba / K) ** 2);
  const E = gs * vpd / P;                                  // mol m-2 s-1
  const A = (CA - GAMMA) / (1.6 / gs + 1 / KC);            // umol m-2 s-1
  const dT = (RN - LAMBDA * E) / (CP * GH);
  return { gs, E, A, dT, wue: A / (E * 1000) };            // umol CO2 per mmol H2O
}

function mount(host: HTMLElement): void {
  injectCss();
  const aba0 = Number(host.dataset.aba ?? 0), vpd0 = Number(host.dataset.vpd ?? 2);
  let aba = aba0, vpd = vpd0;

  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "qb-plot", role: "img",
    "aria-label": "A stoma that closes with ABA, and curves of water loss and CO2 uptake against ABA" });

  // ---- stoma (left top)
  const SX = 130, SY = 170;
  svgEl("text", { x: SX, y: 30, "text-anchor": "middle", class: "lab" }, svg).textContent = "Stoma";
  const gcL = svgEl("path", { class: "gc" }, svg), gcR = svgEl("path", { class: "gc" }, svg);
  const pore = svgEl("ellipse", { cx: SX, cy: SY, rx: 20, ry: 70, class: "pore" }, svg);
  const cps = [-1, 1].flatMap(s => [-45, 0, 45].map(dy => svgEl("circle", { r: 6, class: "cp", "data-s": s, "data-dy": dy }, svg)));
  const stomaLab = svgEl("text", { x: SX, y: SY + 130, "text-anchor": "middle", class: "lab" }, svg);

  function drawStoma(open: number): void {          // open 0..1
    const w = 2 + 24 * open, bulge = 50 + 12 * open;
    const half = (s: number) => {
      const xi = SX + s * w, xo = SX + s * (w + bulge);
      return `M${SX} ${SY - 95} C${xo} ${SY - 95} ${xo} ${SY + 95} ${SX} ${SY + 95} C${xi + s * 4} ${SY + 60} ${xi} ${SY + 30} ${xi} ${SY} C${xi} ${SY - 30} ${xi + s * 4} ${SY - 60} ${SX} ${SY - 95} Z`;
    };
    gcL.setAttribute("d", half(-1)); gcR.setAttribute("d", half(1));
    setAttrs(pore, { rx: Math.max(1, w - 2), ry: 60 + 8 * open });
    for (const c of cps) {
      const s = Number(c.getAttribute("data-s")), dy = Number(c.getAttribute("data-dy"));
      setAttrs(c, { cx: SX + s * (w + bulge * 0.5 - Math.abs(dy) * 0.25), cy: SY + dy });
    }
    stomaLab.textContent = open > 0.6 ? "open" : open > 0.2 ? "partly closed" : "closed";
  }

  // ---- curves vs ABA (right)
  const X0 = 300, X1 = W - 20, Y0 = 50, Y1 = 420;
  const x = scale(0, ABAMAX, X0, X1), y = scale(0, 1, Y1, Y0);
  const gAx = svgEl("g", {}, svg);
  for (const v of [0, 0.25, 0.5, 0.75, 1]) {
    svgEl("line", { x1: X0, x2: X1, y1: y(v), y2: y(v), class: v === 0 ? "axis" : "grid" }, gAx);
    svgEl("text", { x: X0 - 8, y: y(v) + 6, "text-anchor": "end", class: "tick" }, gAx).textContent = `${Math.round(v * 100)}%`;
  }
  for (let v = 0; v <= ABAMAX; v++) svgEl("text", { x: x(v), y: Y1 + 26, "text-anchor": "middle", class: "tick" }, gAx).textContent = String(v);
  svgEl("line", { x1: X0, x2: X0, y1: Y0, y2: Y1, class: "axis" }, gAx);
  svgEl("text", { x: (X0 + X1) / 2, y: Y1 + 58, "text-anchor": "middle", class: "lab" }, gAx).textContent = "ABA in guard cells (relative)";
  svgEl("text", { x: (X0 + X1) / 2, y: 30, "text-anchor": "middle", class: "lab" }, gAx).textContent = "% of the fully open value";
  const eLine = svgEl("path", { class: "eline" }, svg), aLine = svgEl("path", { class: "aline" }, svg), wLine = svgEl("path", { class: "wline" }, svg);
  const now = svgEl("line", { y1: Y0, y2: Y1, class: "now" }, svg);
  const eLab = svgEl("text", { class: "elab" }, svg), aLab = svgEl("text", { class: "alab" }, svg), wLab = svgEl("text", { class: "wlab" }, svg);
  const eDot = svgEl("circle", { r: 8, fill: "var(--qb-c1)" }, svg), aDot = svgEl("circle", { r: 8, fill: "var(--qb-c3)" }, svg);

  // ---- panel
  const panel = htmlEl("div", "qb-panel");
  const pre = presets(panel, [
    { label: "Well watered", apply: () => set(0, vpd) },
    { label: "Mild drought", apply: () => set(1, vpd) },
    { label: "Severe drought", apply: () => set(4, vpd) },
  ]);
  const sAba = slider(panel, "ABA", 0, ABAMAX, 0.1, aba, v => { aba = v; clearPre(); draw(); });
  const sVpd = slider(panel, "Air dryness (kPa)", 0.5, 4, 0.1, vpd, v => { vpd = v; draw(); });
  const tab = htmlEl("div", "p5s-tab", "", panel);
  htmlEl("div", "qb-note", "Leaf in full sun, light wind; values are approximate.", panel);
  button(htmlEl("div", "", "", panel), "Reset", () => { clearPre(); sVpd.set(vpd0); set(aba0, vpd0); });

  function clearPre(): void { pre.forEach(b => b.classList.remove("active")); }
  function set(a: number, v: number): void { aba = a; vpd = v; sAba.set(a); draw(); }

  function draw(): void {
    const ref = model(0, vpd), m = model(aba, vpd);
    const n = 100, pts = Array.from({ length: n + 1 }, (_, i) => ABAMAX * i / n);
    const wueMax = model(ABAMAX, vpd).wue;
    const line = (f: (a: number) => number) => pts.map((a, i) => `${i ? "L" : "M"}${x(a).toFixed(1)} ${y(f(a)).toFixed(1)}`).join("");
    eLine.setAttribute("d", line(a => model(a, vpd).E / ref.E));
    aLine.setAttribute("d", line(a => model(a, vpd).A / ref.A));
    wLine.setAttribute("d", line(a => model(a, vpd).wue / wueMax));
    setAttrs(now, { x1: x(aba), x2: x(aba) });
    setAttrs(eDot, { cx: x(aba), cy: y(m.E / ref.E) });
    setAttrs(aDot, { cx: x(aba), cy: y(m.A / ref.A) });
    setAttrs(eLab, { x: x(1.25), y: y(model(1.25, vpd).E / ref.E) - 12 }); eLab.textContent = "water loss";
    setAttrs(aLab, { x: x(2.1), y: y(model(2.1, vpd).A / ref.A) - 12 }); aLab.textContent = "CO₂ uptake";
    setAttrs(wLab, { x: x(3.2), y: y(model(3.2, vpd).wue / wueMax) + 30 }); wLab.textContent = "CO₂ per water";
    drawStoma(m.gs / GMAX);
    tab.innerHTML =
      `<span>Conductance</span><b>${m.gs.toFixed(2)}</b><i>mol m⁻² s⁻¹</i>` +
      `<span>Water loss</span><b>${(m.E * 1000).toFixed(1)}</b><i>mmol m⁻² s⁻¹</i>` +
      `<span>CO₂ uptake</span><b>${m.A.toFixed(1)}</b><i>µmol m⁻² s⁻¹</i>` +
      `<span>CO₂ per water</span><b>${m.wue.toFixed(1)}</b><i>µmol / mmol</i>` +
      `<span>Leaf − air</span><b>${m.dT >= 0 ? "+" : "−"}${Math.abs(m.dT).toFixed(1)}</b><i>°C</i>`;
  }

  host.append(svg, panel);
  draw();
}

autoMount(NAME, mount);
