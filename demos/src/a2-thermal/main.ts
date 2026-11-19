// Metabolic rate against ambient temperature for a 25 g endotherm (mouse) and a 25 g
// ectotherm (lizard). The endotherm keeps 37 °C: inside the thermoneutral zone it runs at
// its basal rate; below the lower critical temperature (LCT) it must replace the heat lost,
// conductance × (37 − Ta), so the rate rises linearly; above the upper critical temperature
// active cooling raises it again. Fur insulation divides the conductance, which moves the LCT.
// The ectotherm's body follows the air, so its rate follows Q10 from 1/8 of the mouse's basal
// rate at 37 °C. Drag the vertical line (or use the slider) to read both rates and the food
// energy per day. Auto-mounts on <div data-demo="a2-thermal">.
import { autoMount, htmlEl, presets, slider, svgEl, setAttrs, draggable, svgPoint, type Slider } from "../lib/ui";
import { axes, pathD, clipRect, injectStyle, baseCss, keepTextFills } from "../a1-scaling/plot";

const NAME = "a2-thermal";
const BLUE = "#246b83", RED = "#a64836", GREEN = "#38794c", GOLD = "#b57c22", INK = "#26343c";
const TB = 37, BMR = 0.20, UCT = 34, HOT = 0.012;        // W, °C, W per °C above UCT
const C1 = BMR / 7;                                     // conductance (W/°C) with thin fur: LCT = 30 °C
const TMIN = -30, TMAX = 45, YMAX = 1.2;

export const lct = (ins: number) => TB - BMR / (C1 / ins);
export function mouse(ta: number, ins: number): number {
  if (ta > UCT) return BMR + HOT * (ta - UCT);
  return Math.max(BMR, (C1 / ins) * (TB - ta));
}
export const lizard = (ta: number, q10: number) => (BMR / 8) * Math.pow(q10, (ta - TB) / 10);

let uid = 0;

function mount(host: HTMLElement): void {
  injectStyle(NAME + "-style", baseCss(NAME, 640) + `
[data-demo="${NAME}"] svg .curve { fill: none; stroke-width: 4; }
`);
  let ins = 1, q10 = 2.5, ta = 20;
  const W = 640, H = 500;
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "qb-plot", role: "img",
    "aria-label": "Metabolic rate against ambient temperature for a mouse and a lizard" }, host);
  const ax = axes(svg, { x0: 82, y0: 18, w: 535, h: 400, xmin: TMIN, xmax: TMAX, ymin: 0, ymax: YMAX,
    xticks: [-30, -15, 0, 15, 30, 45], yticks: [0, 0.3, 0.6, 0.9, 1.2],
    xlabel: "Ambient temperature (°C)", ylabel: "Metabolic rate (W)" });
  const axLog = axes(svg, { x0: 82, y0: 18, w: 535, h: 400, xmin: TMIN, xmax: TMAX, ymin: -3, ymax: 0.3,
    xticks: [-30, -15, 0, 15, 30, 45], yticks: [-3, -2, -1, 0],
    xlabel: "Ambient temperature (°C)", ylabel: "Metabolic rate (W, log scale)", yfmt: v => String(10 ** v) });
  let logY = false;
  const sy = (v: number) => (logY ? axLog.sy(Math.log10(Math.max(1e-4, v))) : ax.sy(v));
  const clip = clipRect(svg, ax, `${NAME}-clip-${++uid}`);
  const tnz = svgEl("rect", { y: ax.y0, height: ax.h, fill: "#e9efd9" }, svg);
  svg.insertBefore(tnz, svg.firstChild);
  const tnzLab = svgEl("text", { y: ax.y0 + 24, "text-anchor": "middle", class: "note", fill: GREEN }, svg);
  tnzLab.textContent = "TNZ";
  const g = svgEl("g", { "clip-path": clip }, svg);
  const cM = svgEl("path", { class: "curve", stroke: RED }, g);
  const cL = svgEl("path", { class: "curve", stroke: BLUE }, g);
  const lctDot = svgEl("circle", { r: 8, fill: RED }, svg);
  const lctLab = svgEl("text", { class: "note", fill: RED, "text-anchor": "middle" }, svg);
  const vline = svgEl("line", { y1: ax.y0, y2: ax.y0 + ax.h, stroke: GOLD, "stroke-width": 3 }, svg);
  const pM = svgEl("circle", { r: 8, fill: RED, stroke: "#fff", "stroke-width": 2 }, svg);
  const pL = svgEl("circle", { r: 8, fill: BLUE, stroke: "#fff", "stroke-width": 2 }, svg);
  const handle = svgEl("circle", { r: 14, class: "handle", stroke: GOLD, cy: ax.y0 + ax.h }, svg);

  const panel = htmlEl("div", "qb-panel", "", host);
  const slT: Slider = slider(panel, "Air temperature (°C)", TMIN, TMAX, 1, ta, v => { ta = v; draw(); });
  const slI: Slider = slider(panel, "Mouse fur insulation (×)", 1, 10, 0.5, ins, v => { ins = v; draw(); }, v => v.toFixed(1));
  const slQ: Slider = slider(panel, "Lizard Q₁₀", 1.5, 3.5, 0.1, q10, v => { q10 = v; draw(); });
  const logBox = htmlEl("label", "qb-check", "", panel);
  const logIn = htmlEl("input", "", "", logBox); logIn.type = "checkbox";
  logIn.addEventListener("change", () => { logY = logIn.checked; logIn.blur(); draw(); });
  logBox.append(" Log scale (shows the lizard's Q₁₀ curve)");
  const out = htmlEl("div", "qb-readout", "", panel);
  const big = htmlEl("div", "big", "", panel);
  const set = (t: number, i: number, q: number) => {
    ta = t; ins = i; q10 = q; slT.set(t); slI.set(i); slQ.set(q); draw();
  };
  presets(panel, [
    { label: "Reset (20 °C)", apply: () => set(20, 1, 2.5) },
    { label: "Warm day 32 °C", apply: () => set(32, 1, 2.5) },
    { label: "Winter night 0 °C", apply: () => set(0, 1, 2.5) },
    { label: "Thick winter fur", apply: () => set(0, 4, 2.5) },
  ]);
  htmlEl("div", "qb-note", "Drag the gold handle along the temperature axis.", panel);

  draggable(handle, ev => svgPoint(svg, ev), x => {
    ta = Math.round(Math.min(TMAX, Math.max(TMIN, ax.sx.invert(x))));
    slT.set(ta); draw();
  });

  const curve = (f: (t: number) => number) => {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 300; i++) { const t = TMIN + (TMAX - TMIN) * i / 300; pts.push([ax.sx(t), sy(f(t))]); }
    return pathD(pts);
  };

  function draw(): void {
    const L = lct(ins);
    ax.g.style.display = logY ? "none" : ""; axLog.g.style.display = logY ? "" : "none";
    cM.setAttribute("d", curve(t => mouse(t, ins)));
    cL.setAttribute("d", curve(t => lizard(t, q10)));
    const xl = ax.sx(Math.max(TMIN, L));
    setAttrs(tnz, { x: xl, width: ax.sx(UCT) - xl });
    setAttrs(tnzLab, { x: (xl + ax.sx(UCT)) / 2 });
    setAttrs(lctDot, { cx: ax.sx(L), cy: sy(BMR), visibility: L >= TMIN ? "visible" : "hidden" });
    setAttrs(lctLab, { x: ax.sx(L), y: sy(BMR) + 30, visibility: L >= TMIN ? "visible" : "hidden" });
    lctLab.textContent = "LCT";
    const x = ax.sx(ta), m = mouse(ta, ins), l = lizard(ta, q10);
    setAttrs(vline, { x1: x, x2: x }); setAttrs(handle, { cx: x });
    setAttrs(pM, { cx: x, cy: logY ? sy(m) : ax.sy(Math.min(m, YMAX)) }); setAttrs(pL, { cx: x, cy: sy(l) });
    const kJ = (w: number) => (w * 86.4).toFixed(w * 86.4 < 10 ? 1 : 0);   // W → kJ per day
    const zone = ta > UCT ? "above UCT: cooling costs" : ta >= L ? "thermoneutral zone" : "below LCT: makes extra heat";
    out.innerHTML =
      `<b style="color:${RED}">Mouse</b>   ${m.toFixed(2)} W = ${kJ(m)} kJ day⁻¹\n` +
      `        ${zone}\n` +
      `<b style="color:${BLUE}">Lizard</b>  ${l.toFixed(3)} W = ${kJ(l)} kJ day⁻¹\n` +
      `Mouse LCT ${L.toFixed(0)} °C`;
    big.textContent = `Mouse needs ${(m / l).toFixed(0)}× the lizard's energy`;
  }
  draw();
  keepTextFills(svg);
}

autoMount(NAME, mount);
