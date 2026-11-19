// O2–haemoglobin dissociation curve with loading in the lung and unloading in a tissue.
// Blue curve: lung conditions (pH 7.4, 37 °C), where blood loads at the arterial PO2.
// Red curve: the tissue's own conditions (pH, temperature), where blood unloads at the
// tissue PO2. The gold bar is the share of haemoglobin that gives up its O2, and the
// readout converts it to mL O2 per litre of blood with the haemoglobin concentration.
// Hill equation, n = 2.7, P50 = 3.5 kPa at pH 7.4 and 37 °C;
// log10 P50 shifts by −0.48 per pH unit (Bohr) and +0.024 per °C.
// Auto-mounts on <div data-demo="a3-dissociation">. Optional data-preset="rest|exercise".
import { autoMount, htmlEl, presets, slider, svgEl, setAttrs, draggable, svgPoint, type Slider } from "../lib/ui";
import { axes, pathD, clipRect, injectStyle, baseCss, keepTextFills } from "../a1-scaling/plot";

const NAME = "a3-dissociation";
const BLUE = "#267a91", RED = "#b64853", GOLD = "#b37a22", INK = "#243645", GREY = "#9aa4aa";
const N = 2.7, P50_REF = 3.5;

export const p50 = (pH: number, T: number) => P50_REF * Math.pow(10, -0.48 * (pH - 7.4) + 0.024 * (T - 37));
export const sat = (P: number, P50: number) => (P <= 0 ? 0 : 1 / (1 + Math.pow(P50 / P, N)));

interface State { pa: number; pv: number; pH: number; T: number; hb: number; }
const PRESETS: Record<string, State> = {
  rest: { pa: 13.3, pv: 5.3, pH: 7.37, T: 37, hb: 150 },
  exercise: { pa: 13.3, pv: 2.7, pH: 7.2, T: 39, hb: 150 },
  nobohr: { pa: 13.3, pv: 2.7, pH: 7.4, T: 37, hb: 150 },
  altitude: { pa: 6.5, pv: 3.5, pH: 7.4, T: 37, hb: 150 },
  anaemia: { pa: 13.3, pv: 5.3, pH: 7.37, T: 37, hb: 100 },
};

let uid = 0;

function mount(host: HTMLElement): void {
  injectStyle(NAME + "-style", baseCss(NAME, 640) + `
[data-demo="${NAME}"] svg .curve { fill: none; stroke-width: 4; }
[data-demo="${NAME}"] svg .ref { fill: none; stroke: ${GREY}; stroke-width: 2; stroke-dasharray: 6 6; }
`);
  const s: State = { ...(PRESETS[host.dataset.preset ?? "rest"] ?? PRESETS.rest) };
  const W = 640, H = 500;
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "qb-plot", role: "img",
    "aria-label": "Haemoglobin dissociation curves for lung and tissue conditions" }, host);
  const ax = axes(svg, { x0: 82, y0: 18, w: 535, h: 400, xmin: 0, xmax: 15, ymin: 0, ymax: 100,
    xticks: [0, 3, 6, 9, 12, 15], yticks: [0, 25, 50, 75, 100], xlabel: "PO₂ (kPa)", ylabel: "Hb saturation (%)" });
  const clip = clipRect(svg, ax, `${NAME}-clip-${++uid}`);
  const plot = svgEl("g", { "clip-path": clip }, svg);
  const ref = svgEl("path", { class: "ref" }, plot);
  const lung = svgEl("path", { class: "curve", stroke: BLUE }, plot);
  const tis = svgEl("path", { class: "curve", stroke: RED }, plot);
  const bar = svgEl("line", { stroke: GOLD, "stroke-width": 12, opacity: 0.85 }, svg);
  const guideA = svgEl("line", { stroke: BLUE, "stroke-width": 1.5, "stroke-dasharray": "4 4" }, svg);
  const guideV = svgEl("line", { stroke: RED, "stroke-width": 1.5, "stroke-dasharray": "4 4" }, svg);
  const ptA = svgEl("circle", { r: 13, class: "handle", stroke: BLUE }, svg);
  const ptV = svgEl("circle", { r: 13, class: "handle", stroke: RED }, svg);
  const labA = svgEl("text", { class: "note", fill: BLUE, "text-anchor": "end" }, svg);
  const labV = svgEl("text", { class: "note", fill: RED }, svg);
  const labBar = svgEl("text", { class: "note", fill: GOLD, "font-weight": 700 }, svg);
  const key = svgEl("g", {}, svg);
  svgEl("line", { x1: 350, x2: 380, y1: 300, y2: 300, stroke: BLUE, "stroke-width": 4 }, key);
  svgEl("text", { x: 388, y: 306, class: "note" }, key).textContent = "Lung: pH 7.4, 37 °C";
  svgEl("line", { x1: 350, x2: 380, y1: 330, y2: 330, stroke: RED, "stroke-width": 4 }, key);
  const keyT = svgEl("text", { x: 388, y: 336, class: "note" }, key);
  svgEl("line", { x1: 350, x2: 380, y1: 360, y2: 360, class: "ref" }, key);
  svgEl("text", { x: 388, y: 366, class: "note" }, key).textContent = "Reference";

  const panel = htmlEl("div", "qb-panel", "", host);
  const sl: Record<string, Slider> = {};
  const upd = (k: keyof State) => (v: number) => { s[k] = v; draw(); };
  sl.pv = slider(panel, "Tissue PO₂ (kPa)", 1, 8, 0.1, s.pv, upd("pv"));
  sl.pH = slider(panel, "Tissue pH", 6.9, 7.6, 0.01, s.pH, upd("pH"));
  sl.T = slider(panel, "Tissue temp. (°C)", 34, 42, 0.5, s.T, upd("T"));
  sl.pa = slider(panel, "Arterial PO₂ (kPa)", 4, 14, 0.1, s.pa, upd("pa"));
  sl.hb = slider(panel, "[Hb] (g L⁻¹)", 60, 200, 5, s.hb, upd("hb"));
  const out = htmlEl("div", "qb-readout", "", panel);
  const big = htmlEl("div", "big", "", panel);
  presets(panel, [
    { label: "Rest", apply: () => setState(PRESETS.rest) },
    { label: "Exercise", apply: () => setState(PRESETS.exercise) },
    { label: "Exercise, no shift", apply: () => setState(PRESETS.nobohr) },
    { label: "Altitude", apply: () => setState(PRESETS.altitude) },
    { label: "Anaemia", apply: () => setState(PRESETS.anaemia) },
  ]);
  htmlEl("div", "qb-note", "Drag the red point to change the tissue PO₂.", panel);

  function setState(n: State): void {
    Object.assign(s, n);
    for (const k of Object.keys(sl) as (keyof State)[]) sl[k].set(s[k]);
    draw();
  }

  draggable(ptV, ev => svgPoint(svg, ev), x => {
    s.pv = Math.round(Math.min(8, Math.max(1, ax.sx.invert(x))) * 10) / 10;
    sl.pv.set(s.pv); draw();
  });
  draggable(ptA, ev => svgPoint(svg, ev), x => {
    s.pa = Math.round(Math.min(14, Math.max(4, ax.sx.invert(x))) * 10) / 10;
    sl.pa.set(s.pa); draw();
  });

  const curve = (P50: number) => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 300; i++) { const P = 15 * i / 300; pts.push([ax.sx(P), ax.sy(100 * sat(P, P50))]); }
    return pathD(pts);
  };
  ref.setAttribute("d", curve(P50_REF));

  function draw(): void {
    const P50t = p50(s.pH, s.T);
    lung.setAttribute("d", curve(P50_REF));
    tis.setAttribute("d", curve(P50t));
    keyT.textContent = `Tissue: pH ${s.pH.toFixed(2)}, ${s.T.toFixed(1)} °C`;
    const Sa = sat(s.pa, P50_REF), Sv = sat(s.pv, P50t);
    const xa = ax.sx(s.pa), ya = ax.sy(100 * Sa), xv = ax.sx(s.pv), yv = ax.sy(100 * Sv);
    setAttrs(ptA, { cx: xa, cy: ya }); setAttrs(ptV, { cx: xv, cy: yv });
    setAttrs(guideA, { x1: ax.x0, x2: xa, y1: ya, y2: ya });
    setAttrs(guideV, { x1: ax.x0, x2: xv, y1: yv, y2: yv });
    const xb = ax.x0 + 14;
    setAttrs(bar, { x1: xb, x2: xb, y1: ya, y2: yv });
    setAttrs(labA, { x: xa - 18, y: ya - 16 }); labA.textContent = "arterial";
    setAttrs(labV, { x: xv + 18, y: yv + 24 }); labV.textContent = "venous";
    const frac = Math.max(0, Sa - Sv);
    setAttrs(labBar, { x: xb + 14, y: (ya + yv) / 2 + 6 }); labBar.textContent = `${(100 * frac).toFixed(0)} % unloaded`;
    const capacity = s.hb * 1.34;                       // mL O2 per L blood when fully saturated
    const ca = capacity * Sa, cv = capacity * Sv;
    out.textContent =
      `Tissue P₅₀      ${P50t.toFixed(1)} kPa\n` +
      `Arterial sat.   ${(100 * Sa).toFixed(0)} %   ${ca.toFixed(0)} mL O₂ L⁻¹\n` +
      `Venous sat.     ${(100 * Sv).toFixed(0)} %   ${cv.toFixed(0)} mL O₂ L⁻¹`;
    big.textContent = `Delivered: ${(ca - cv).toFixed(0)} mL O₂ per L blood`;
  }
  draw();
  keepTextFills(svg);
}

autoMount(NAME, mount);
