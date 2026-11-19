// Threshold and refractory periods in the Hodgkin-Huxley model.
// Auto-mounts on <div data-demo="a5-spike">.
//   data-a1="40" data-a2="40" data-gap="3"   starting stimulus strengths and interval (ms).
// Hodgkin-Huxley (1952) squid-axon equations, rate constants x 3 (about 16 C) so a spike lasts
// ~1 ms, voltages shifted by -5 mV so rest is -70 mV (as in the lecture figure).
// Each stimulus is a 0.5 ms current pulse (uA/cm2); stimulus 1 starts at 2 ms.
import { autoMount, button, htmlEl, presets, slider, svgEl, setAttrs } from "../lib/ui";
import { axes, polyline } from "./axes";

const NAME = "a5-spike";
const BLUE = "#267a91", RED = "#b64853", GREEN = "#397646", INK = "#243645", GOLD = "#b37a22";
const S2MAX = 320;
const DT = 0.005, T_END = 20, T1 = 2, PULSE = 0.5, PHI = 3, SHIFT = -5;

interface Run { t: number[]; V: number[]; h: number[]; n4: number[]; spikes: number[] }

function simulate(a1: number, a2: number, gap: number, keepEvery = 10): Run {
  let V = -65, m = 0.0529, h = 0.5961, n = 0.3177;
  const out: Run = { t: [], V: [], h: [], n4: [], spikes: [] };
  let prev = V + SHIFT;
  const steps = Math.round(T_END / DT);
  for (let i = 0; i <= steps; i++) {
    const t = i * DT;
    const I = (t >= T1 && t < T1 + PULSE ? a1 : 0) + (t >= T1 + gap && t < T1 + gap + PULSE ? a2 : 0);
    const v = V + 65;
    const am = Math.abs(25 - v) > 1e-6 ? 0.1 * (25 - v) / (Math.exp((25 - v) / 10) - 1) : 1;
    const bm = 4 * Math.exp(-v / 18), ah = 0.07 * Math.exp(-v / 20), bh = 1 / (Math.exp((30 - v) / 10) + 1);
    const an = Math.abs(10 - v) > 1e-6 ? 0.01 * (10 - v) / (Math.exp((10 - v) / 10) - 1) : 0.1;
    const bn = 0.125 * Math.exp(-v / 80);
    const dV = I - 120 * m * m * m * h * (V - 50) - 36 * n ** 4 * (V + 77) - 0.3 * (V + 54.387);
    m += DT * PHI * (am * (1 - m) - bm * m);
    h += DT * PHI * (ah * (1 - h) - bh * h);
    n += DT * PHI * (an * (1 - n) - bn * n);
    V += DT * dV;
    const vs = V + SHIFT;
    if (vs > 0 && prev <= 0) out.spikes.push(t);
    prev = vs;
    if (i % keepEvery === 0) { out.t.push(t); out.V.push(vs); out.h.push(h); out.n4.push(n ** 4); }
  }
  return out;
}

/** Did the second stimulus produce its own spike? */
const secondFires = (a1: number, a2: number, gap: number) => simulate(a1, a2, gap, 1e9).spikes.some(s => s > T1 + gap);

function injectStyle(): void {
  if (document.getElementById(NAME + "-style")) return;
  const s = document.createElement("style");
  s.id = NAME + "-style";
  s.textContent = `
.reveal .qb-demo[data-demo="${NAME}"] { flex-wrap: nowrap; gap: 24px; }
.reveal .qb-demo[data-demo="${NAME}"] .qb-plot { flex: 0 0 690px; width: 690px; }
.qb-demo[data-demo="${NAME}"] .qb-panel { flex: 1 1 400px; max-width: 440px; }
[data-demo="${NAME}"] svg .tick { font-size: 18px; fill: var(--qb-muted); }
[data-demo="${NAME}"] svg .lab { font-size: 20px; }
[data-demo="${NAME}"] .sp-verdict { font-size: 1.1em; font-weight: 700; }
`;
  document.head.appendChild(s);
}

function mount(host: HTMLElement): void {
  injectStyle();
  const W = 690, H = 520;
  const st = { a1: Number(host.dataset.a1 ?? 40), a2: Number(host.dataset.a2 ?? 40), gap: Number(host.dataset.gap ?? 3) };
  const start = { ...st };
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "qb-plot", role: "img",
    "aria-label": "Membrane potential after two brief stimuli, with sodium-channel availability below" });
  const top = { x0: 70, y0: 30, x1: 675, y1: 300 }, bot = { x0: 70, y0: 385, x1: 675, y1: 465 };
  const gTop = svgEl("g", {}, svg), gBot = svgEl("g", {}, svg);
  const tk = [0, 5, 10, 15, 20];
  const A = axes(gTop, top, [0, T_END], [-100, 50], [], [-90, -70, -55, -30, 0, 30], "", "Vm (mV)");
  // x ticks only on the lower panel
  const B = axes(gBot, bot, [0, T_END], [0, 1], tk, [0, 1], "time (ms)", "", v => String(v));
  svgEl("line", { x1: top.x0, x2: top.x1, y1: A.sy(-55), y2: A.sy(-55), stroke: INK, "stroke-width": 1.5, "stroke-dasharray": "6 5" }, gTop);
  svgEl("text", { x: top.x1, y: A.sy(-55) - 6, "text-anchor": "end", class: "tick" }, gTop).textContent = "≈ threshold";
  const keyA = svgEl("text", { x: bot.x0 + 8, y: bot.y0 - 12, class: "lab", style: `fill:${GREEN}` }, svg);
  keyA.textContent = "Na⁺ channels not inactivated (h)";
  const keyB = svgEl("text", { x: bot.x1, y: bot.y0 - 12, class: "lab", "text-anchor": "end", style: `fill:${GOLD}` }, svg);
  keyB.textContent = "K⁺ channels open";
  const lV = svgEl("path", { fill: "none", stroke: BLUE, "stroke-width": 3.5 }, svg);
  const lH = svgEl("path", { fill: "none", stroke: GREEN, "stroke-width": 3 }, svg);
  const lN = svgEl("path", { fill: "none", stroke: GOLD, "stroke-width": 3 }, svg);
  const tri = [RED, RED].map(c => svgEl("path", { fill: c }, svg));
  const triLab = [1, 2].map(i => { const e = svgEl("text", { class: "lab", style: `fill:${RED}` }, svg); e.textContent = `S${i}`; return e; });

  const panel = htmlEl("div", "qb-panel");
  const sl1 = slider(panel, "S1 strength", 0, 80, 1, st.a1, v => { st.a1 = v; draw(); }, v => v.toFixed(0));
  const sl2 = slider(panel, "S2 strength", 0, S2MAX, 5, st.a2, v => { st.a2 = v; draw(); }, v => v.toFixed(0));
  const slG = slider(panel, "S1 → S2 (ms)", 0.5, 15, 0.5, st.gap, v => { st.gap = v; draw(); }, v => v.toFixed(1));
  htmlEl("div", "qb-note", "Each stimulus is a 0.5 ms current pulse (µA cm⁻²). Threshold for one pulse ≈ 17.", panel);
  const btns = presets(panel, [
    { label: "Too weak", apply: () => set(12, 0, 3) },
    { label: "One spike", apply: () => set(40, 0, 3) },
    { label: "2nd at 1.5 ms, 8×", apply: () => set(40, 320, 1.5) },
    { label: "2nd at 3 ms", apply: () => set(40, 40, 3) },
    { label: "3 ms, 2× stronger", apply: () => set(40, 80, 3) },
    { label: "2nd at 8 ms", apply: () => set(40, 40, 8) },
  ]);
  const verdict = htmlEl("div", "sp-verdict", "", panel);
  const ro = htmlEl("div", "qb-readout", "", panel);
  button(htmlEl("div", "qb-presets", "", panel), "Reset", () => { set(start.a1, start.a2, start.gap); btns.forEach(b => b.classList.remove("active")); });
  host.append(svg, panel);

  function set(a1: number, a2: number, gap: number): void {
    st.a1 = a1; st.a2 = a2; st.gap = gap; sl1.set(a1); sl2.set(a2); slG.set(gap); draw();
  }

  function draw(): void {
    const r = simulate(st.a1, st.a2, st.gap);
    lV.setAttribute("d", polyline(r.t.map(A.sx), r.V.map(v => A.sy(Math.max(-100, Math.min(50, v))))));
    lH.setAttribute("d", polyline(r.t.map(B.sx), r.h.map(v => B.sy(v / 0.6 > 1 ? 1 : v / 0.6))));
    lN.setAttribute("d", polyline(r.t.map(B.sx), r.n4.map(v => B.sy(Math.min(1, v / 0.6)))));
    [T1, T1 + st.gap].forEach((t, i) => {
      const x = A.sx(t), y = top.y1;
      const on = i === 0 ? st.a1 > 0 : st.a2 > 0;
      tri[i].setAttribute("d", on ? `M${x} ${y - 2} l -9 16 l 18 0 Z` : "");
      setAttrs(triLab[i], { x: x + 12, y: y + 16, visibility: on ? "visible" : "hidden" });
    });
    const first = r.spikes.some(s => s < T1 + st.gap);
    const second = st.a2 > 0 && r.spikes.some(s => s > T1 + st.gap);
    let msg = "", col = INK;
    if (!first && !second) { msg = st.a1 + st.a2 === 0 ? "No stimulus" : "Below threshold: no spike"; col = INK; }
    else if (st.a2 === 0) { msg = "One all-or-none spike"; col = BLUE; }
    else if (!first) { msg = "S1 failed; S2 alone decides"; col = INK; }
    else if (second) { msg = "Two spikes"; col = GREEN; }
    else if (!secondFires(st.a1, S2MAX, st.gap)) { msg = `Absolute refractory: even S2 = ${S2MAX} fails`; col = RED; }
    else {
      let lo = st.a2, hi = S2MAX;                         // bisection for the S2 strength that just fires
      for (let k = 0; k < 9; k++) { const mid = (lo + hi) / 2; if (secondFires(st.a1, mid, st.gap)) hi = mid; else lo = mid; }
      msg = `Relative refractory: S2 needs ≈ ${Math.ceil(hi / 5) * 5}`; col = GOLD;
    }
    verdict.textContent = msg; verdict.style.color = col;
    const peak = Math.max(...r.V);
    ro.textContent = `spikes      ${r.spikes.length}\npeak Vm     ${peak >= 0 ? "+" : "−"}${Math.abs(peak).toFixed(0)} mV\nlowest Vm   −${Math.abs(Math.min(...r.V)).toFixed(0)} mV`;
  }
  draw();
}

autoMount(NAME, mount);
