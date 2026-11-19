// Body-temperature regulation by feedback. A disturbance (exercise heat, or cold) acts from
// minute 10 to minute 40. The body loses a little heat passively; the controller adds an
// effector response proportional to the deviation from the 37 °C set point, measured
// `delay` minutes ago:
//   dT/dt = d(t) − k0 (T − 37) − s · g · (T(t − delay) − 37)
// s = +1 negative feedback (response opposes the deviation), 0 none, −1 positive feedback.
// Shows: stronger gain → smaller remaining error; no feedback → large drift; positive
// feedback → runaway; gain with a long delay → overshoot and oscillation.
// Auto-mounts on <div data-demo="a1-feedback">.
import { autoMount, htmlEl, presets, slider, svgEl, setAttrs, type Slider } from "../lib/ui";
import { axes, pathD, clipRect, injectStyle, baseCss, keepTextFills } from "../a1-scaling/plot";

const NAME = "a1-feedback";
const BLUE = "#267a91", RED = "#b64853", GREEN = "#397646", GOLD = "#b37a22", INK = "#243645";
const SET = 37, K0 = 0.05, TEND = 60, DT = 0.01, ON = 10, OFF = 40;
const YMIN = 33, YMAX = 43;

export function simulate(sign: number, gain: number, delay: number, load: number): { t: number[]; T: number[]; eff: number[] } {
  const n = Math.round(TEND / DT), lag = Math.round(delay / DT);
  const T = new Array<number>(n + 1).fill(SET), t: number[] = [], eff: number[] = [];
  for (let i = 0; i <= n; i++) {
    const ti = i * DT;
    const seen = T[Math.max(0, i - lag)] - SET;
    const e = -sign * gain * seen;                 // effector output, °C min⁻¹
    t.push(ti); eff.push(e);
    if (i === n) break;
    const d = ti >= ON && ti < OFF ? load : 0;
    let next = T[i] + DT * (d - K0 * (T[i] - SET) + e);
    next = Math.max(20, Math.min(50, next));
    T[i + 1] = next;
  }
  return { t, T, eff };
}

let uid = 0;

function mount(host: HTMLElement): void {
  injectStyle(NAME + "-style", baseCss(NAME, 640));
  let sign = 1, gain = 0.5, delay = 0, load = 0.3;
  const W = 640, H = 500;
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "qb-plot", role: "img",
    "aria-label": "Body temperature over time under feedback control" }, host);
  const ax = axes(svg, { x0: 82, y0: 18, w: 535, h: 330, xmin: 0, xmax: TEND, ymin: YMIN, ymax: YMAX,
    xticks: [0, 10, 20, 30, 40, 50, 60], yticks: [33, 35, 37, 39, 41, 43],
    xlabel: "Time (min)", ylabel: "Body temperature (°C)" });
  const clip = clipRect(svg, ax, `${NAME}-clip-${++uid}`);
  const band = svgEl("rect", { x: ax.sx(ON), width: ax.sx(OFF) - ax.sx(ON), y: ax.y0, height: ax.h, fill: "#fbefe0" }, svg);
  svg.insertBefore(band, svg.firstChild);
  const bandLab = svgEl("text", { x: (ax.sx(ON) + ax.sx(OFF)) / 2, y: ax.y0 + 26, "text-anchor": "middle", class: "note", fill: GOLD }, svg);
  svgEl("line", { x1: ax.x0, x2: ax.x0 + ax.w, y1: ax.sy(SET), y2: ax.sy(SET), stroke: GREEN, "stroke-width": 2, "stroke-dasharray": "8 6" }, svg);
  svgEl("text", { x: ax.x0 + ax.w - 4, y: ax.sy(SET) + 22, "text-anchor": "end", class: "note", fill: GREEN }, svg).textContent = "set point";
  const g = svgEl("g", { "clip-path": clip }, svg);
  const curve = svgEl("path", { fill: "none", stroke: RED, "stroke-width": 4 }, g);
  const lethal = svgEl("text", { x: ax.x0 + 10, y: ax.y0 + 56, class: "note", fill: RED, "font-weight": 700 }, svg);

  // Effector strip below the plot: what the sweat glands / skin vessels are doing.
  const sy0 = 428, sh = 40;
  svgEl("text", { x: ax.x0 - 8, y: sy0 + 18, "text-anchor": "end", class: "note" }, svg).textContent = "Effector";
  svgEl("line", { x1: ax.x0, x2: ax.x0 + ax.w, y1: sy0 + sh / 2, y2: sy0 + sh / 2, stroke: "#bbb" }, svg);
  const eff = svgEl("path", { fill: "none", stroke: BLUE, "stroke-width": 3 }, svg);
  svgEl("text", { x: ax.x0 + ax.w, y: sy0 - 2, "text-anchor": "end", class: "note", fill: BLUE }, svg).textContent = "↑ cooling";
  svgEl("text", { x: ax.x0 + ax.w, y: sy0 + sh + 16, "text-anchor": "end", class: "note", fill: BLUE }, svg).textContent = "↓ heating";

  const panel = htmlEl("div", "qb-panel", "", host);
  const loopBtns = presets(panel, [
    { label: "Negative feedback", apply: () => { sign = 1; draw(); } },
    { label: "None", apply: () => { sign = 0; draw(); } },
    { label: "Positive feedback", apply: () => { sign = -1; draw(); } },
  ]);
  loopBtns[0].classList.add("active");
  const slG: Slider = slider(panel, "Gain (response strength)", 0, 2, 0.05, gain, v => { gain = v; draw(); });
  const slD: Slider = slider(panel, "Response delay (min)", 0, 4, 0.1, delay, v => { delay = v; draw(); });
  const slL: Slider = slider(panel, "Disturbance (°C min⁻¹)", -0.4, 0.4, 0.05, load, v => { load = v; draw(); },
    v => (v > 0 ? "+" : "") + v.toFixed(2).replace("-", "−"));
  const out = htmlEl("div", "qb-readout", "", panel);
  const big = htmlEl("div", "big", "", panel);
  const set = (s: number, gg: number, dd: number, ll: number) => {
    sign = s; gain = gg; delay = dd; load = ll; slG.set(gg); slD.set(dd); slL.set(ll);
    loopBtns.forEach((b, i) => b.classList.toggle("active", i === [1, 0, -1].indexOf(s)));
    draw();
  };
  presets(panel, [
    { label: "Reset", apply: () => set(1, 0.5, 0, 0.3) },
    { label: "Strong, fast", apply: () => set(1, 2, 0, 0.3) },
    { label: "Strong, slow", apply: () => set(1, 2, 1.5, 0.3) },
    { label: "Cold", apply: () => set(1, 0.5, 0, -0.3) },
  ]);

  function draw(): void {
    const r = simulate(sign, gain, delay, load);
    const step = 10;
    const pts: [number, number][] = [], ep: [number, number][] = [];
    const emax = 1.2;
    for (let i = 0; i < r.t.length; i += step) {
      pts.push([ax.sx(r.t[i]), ax.sy(r.T[i])]);
      const e = Math.max(-emax, Math.min(emax, r.eff[i]));
      ep.push([ax.sx(r.t[i]), sy0 + sh / 2 + (e / emax) * (sh / 2)]);
    }
    curve.setAttribute("d", pathD(pts));
    eff.setAttribute("d", pathD(ep));
    bandLab.textContent = load > 0 ? "exercise (heat load)" : load < 0 ? "cold exposure" : "no disturbance";
    const iEnd = Math.round((OFF - 0.01) / DT);
    const errEnd = r.T[iEnd] - SET;
    let peak = SET;
    for (const v of r.T) if (Math.abs(v - SET) > Math.abs(peak - SET)) peak = v;
    const outside = r.T.some(v => v > 42 || v < 34);
    lethal.textContent = outside ? "outside the survivable range" : "";
    setAttrs(lethal, { y: peak > SET ? ax.y0 + 56 : ax.y0 + ax.h - 14 });
    out.textContent =
      `Largest deviation         ${(peak - SET >= 0 ? "+" : "−")}${Math.abs(peak - SET).toFixed(2)} °C\n` +
      `Deviation at minute 40    ${(errEnd >= 0 ? "+" : "−")}${Math.abs(errEnd).toFixed(2)} °C\n` +
      `Back at 37 ± 0.1 °C at 60 min: ${Math.abs(r.T[r.T.length - 1] - SET) < 0.1 ? "yes" : "no"}`;
    big.textContent = sign === 1 ? "The response opposes the change" : sign === 0 ? "Nothing opposes the change" : "The response amplifies the change";
    big.style.color = sign === 1 ? BLUE : RED;
  }
  draw();
  keepTextFills(svg);
}

autoMount(NAME, mount);
