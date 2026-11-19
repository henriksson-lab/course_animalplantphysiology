// Countercurrent versus co-current exchange along a gill lamella.
// Water enters at 20 kPa (left end), blood enters at 2 kPa: at the right end for
// countercurrent, at the left end for co-current. Each stream's PO2 changes in proportion to
// the local water–blood difference; the "exchanger size" sets how much is transferred
// (NTU = conductance / water capacity rate) and the slider sets blood flow relative to water
// flow (capacity-rate ratio). Profiles are the exact solutions of the two linear ODEs.
// Simplification for teaching: O2 carried by blood is treated as linear in PO2.
// Auto-mounts on <div data-demo="a3-countercurrent">. Optional data-mode="counter|co".
import { autoMount, htmlEl, presets, slider, svgEl, setAttrs, type Slider } from "../lib/ui";
import { axes, pathD, injectStyle, baseCss, keepTextFills } from "../a1-scaling/plot";

const NAME = "a3-countercurrent";
const BLUE = "#267a91", RED = "#b64853", INK = "#243645";
const W_IN = 20, B_IN = 2, NPTS = 81;

/** PO2 profiles of water (flowing +x) and blood, x in [0,1]. */
export function profiles(counter: boolean, ntu: number, ratio: number): { w: number[]; b: number[] } {
  const kw = ntu, kb = ntu / ratio;          // UA/Cw and UA/Cb
  const w: number[] = [], b: number[] = [];
  if (!counter) {
    const a = kw + kb;                         // D' = -a D, D0 = 18
    const D0 = W_IN - B_IN;
    for (let i = 0; i < NPTS; i++) {
      const x = i / (NPTS - 1), g = a > 1e-9 ? (1 - Math.exp(-a * x)) / a : x;
      w.push(W_IN - kw * D0 * g); b.push(B_IN + kb * D0 * g);
    }
  } else {
    const a = kw - kb;                         // blood flows -x: D' = -(kw - kb) D
    const g1 = Math.abs(a) > 1e-9 ? (1 - Math.exp(-a)) / a : 1;
    const D0 = (W_IN - B_IN) / (kw * g1 + Math.exp(-a));
    for (let i = 0; i < NPTS; i++) {
      const x = i / (NPTS - 1), g = Math.abs(a) > 1e-9 ? (1 - Math.exp(-a * x)) / a : x;
      const wx = W_IN - kw * D0 * g;
      w.push(wx); b.push(wx - D0 * Math.exp(-a * x));
    }
  }
  return { w, b };
}

/** PO2 (0–20 kPa) to a colour from dark slate (low) to bright red (high). */
function po2Colour(p: number): string {
  const t = Math.max(0, Math.min(1, p / 20));
  const c0 = [61, 79, 122], c1 = [226, 64, 80];
  const c = c0.map((v, i) => Math.round(v + (c1[i] - v) * t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function mount(host: HTMLElement): void {
  injectStyle(NAME + "-style", baseCss(NAME, 640) + `
[data-demo="${NAME}"] svg .curve { fill: none; stroke-width: 4; }
[data-demo="${NAME}"] svg .ghost { fill: none; stroke-width: 2.5; stroke-dasharray: 7 6; opacity: .55; }
[data-demo="${NAME}"] svg .band-lab { font-size: 18px; fill: #fff; font-weight: 700; }
`);
  let counter = host.dataset.mode !== "co";
  let ntu = 5, ratio = 1, ghost = true;
  const W = 640, H = 500;
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "qb-plot", role: "img",
    "aria-label": "PO2 of water and blood along a gill lamella" }, host);

  // Schematic lamella: two bands made of coloured segments.
  const X0 = 82, XW = 535, SEG = 40;
  const bandW = svgEl("g", {}, svg), bandB = svgEl("g", {}, svg);
  const segW: SVGRectElement[] = [], segB: SVGRectElement[] = [];
  for (let i = 0; i < SEG; i++) {
    const x = X0 + XW * i / SEG;
    segW.push(svgEl("rect", { x, y: 10, width: XW / SEG + 0.6, height: 38 }, bandW));
    segB.push(svgEl("rect", { x, y: 56, width: XW / SEG + 0.6, height: 38 }, bandB));
  }
  const labW = svgEl("text", { x: X0 + XW / 2, y: 36, "text-anchor": "middle", class: "band-lab" }, svg);
  const labB = svgEl("text", { x: X0 + XW / 2, y: 82, "text-anchor": "middle", class: "band-lab" }, svg);
  svgEl("text", { x: X0 - 8, y: 36, "text-anchor": "end", class: "note", fill: BLUE }, svg).textContent = "Water";
  svgEl("text", { x: X0 - 8, y: 82, "text-anchor": "end", class: "note", fill: RED }, svg).textContent = "Blood";

  const ax = axes(svg, { x0: X0, y0: 128, w: XW, h: 290, xmin: 0, xmax: 1, ymin: 0, ymax: 22,
    xticks: [0, 0.25, 0.5, 0.75, 1], yticks: [0, 5, 10, 15, 20], xlabel: "Position along the lamella",
    ylabel: "PO₂ (kPa)", xfmt: v => (v === 0 ? "start" : v === 1 ? "end" : "") });
  const gap = svgEl("path", { fill: "#fff4df", stroke: "none" }, svg);
  const ghW = svgEl("path", { class: "ghost", stroke: BLUE }, svg);
  const ghB = svgEl("path", { class: "ghost", stroke: RED }, svg);
  const cW = svgEl("path", { class: "curve", stroke: BLUE }, svg);
  const cB = svgEl("path", { class: "curve", stroke: RED }, svg);
  const outDot = svgEl("circle", { r: 9, fill: RED, stroke: "#fff", "stroke-width": 2 }, svg);
  // keep the curves above the grid but below the dot
  svg.appendChild(outDot);

  const panel = htmlEl("div", "qb-panel", "", host);
  const modeBtns = presets(panel, [
    { label: "Countercurrent", apply: () => { counter = true; draw(); } },
    { label: "Co-current", apply: () => { counter = false; draw(); } },
  ]);
  modeBtns[counter ? 0 : 1].classList.add("active");
  const slN: Slider = slider(panel, "Exchanger size", 0.5, 10, 0.5, ntu, v => { ntu = v; draw(); });
  const slR: Slider = slider(panel, "Blood ÷ water flow", 0.25, 4, 0.05, ratio, v => { ratio = v; draw(); },
    v => v.toFixed(2));
  const out = htmlEl("div", "qb-readout", "", panel);
  const big = htmlEl("div", "big", "", panel);
  const lab = htmlEl("label", "qb-check", "", panel);
  const cb = htmlEl("input", "", "", lab); cb.type = "checkbox"; cb.checked = ghost;
  cb.addEventListener("change", () => { ghost = cb.checked; cb.blur(); draw(); });
  lab.append(" Show the other arrangement (dashed)");
  presets(panel, [{ label: "Reset", apply: () => {
    counter = true; ntu = 5; ratio = 1; slN.set(ntu); slR.set(ratio);
    modeBtns.forEach((b, i) => b.classList.toggle("active", i === 0)); draw();
  } }]);

  const line = (v: number[]) => pathD(v.map((p, i) => [ax.sx(i / (NPTS - 1)), ax.sy(p)]));

  function draw(): void {
    const { w, b } = profiles(counter, ntu, ratio);
    const other = profiles(!counter, ntu, ratio);
    cW.setAttribute("d", line(w)); cB.setAttribute("d", line(b));
    ghW.setAttribute("d", ghost ? line(other.w) : ""); ghB.setAttribute("d", ghost ? line(other.b) : "");
    const top = w.map((p, i) => [ax.sx(i / (NPTS - 1)), ax.sy(p)] as [number, number]);
    const bot = b.map((p, i) => [ax.sx(i / (NPTS - 1)), ax.sy(p)] as [number, number]).reverse();
    gap.setAttribute("d", pathD(top.concat(bot)) + "Z");
    for (let i = 0; i < SEG; i++) {
      const k = Math.round((i + 0.5) / SEG * (NPTS - 1));
      segW[i].setAttribute("fill", po2Colour(w[k]));
      segB[i].setAttribute("fill", po2Colour(b[k]));
    }
    labW.textContent = "water  →  →  →";
    labB.textContent = counter ? "←  ←  ←  blood" : "blood  →  →  →";
    const bOut = counter ? b[0] : b[NPTS - 1], wOut = w[NPTS - 1];
    const xo = counter ? 0 : 1;
    setAttrs(outDot, { cx: ax.sx(xo), cy: ax.sy(bOut) });
    const mean = (v: number[]) => v.reduce((a, c) => a + c, 0) / v.length;
    const gapMean = mean(w.map((p, i) => p - b[i]));
    out.textContent =
      `Water:  in 20.0 → out ${wOut.toFixed(1)} kPa\n` +
      `Blood:  in  2.0 → out ${bOut.toFixed(1)} kPa\n` +
      `Mean water–blood gradient  ${gapMean.toFixed(1)} kPa`;
    big.textContent = `O₂ taken from water: ${(100 * (W_IN - wOut) / W_IN).toFixed(0)} %`;
  }
  draw();
  keepTextFills(svg);
}

autoMount(NAME, mount);
