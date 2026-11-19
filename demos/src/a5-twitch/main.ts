// Grading muscle force: summation and tetanus (stimulus frequency) and recruitment (motor units).
// Auto-mounts on <div data-demo="a5-twitch">.
//   data-hz="10"     starting stimulus frequency; 0 = a single stimulus
//   data-units="4"   starting number of motor units recruited (1-4)
// Model (schematic, same as the lecture figure): each stimulus adds a twitch-shaped activation
// (t/tau) exp(1 - t/tau), tau = 40 ms; force of a unit = size x (1 - exp(-S/3.04)), so a single
// twitch is ~0.28 of a fused tetanus (about 3.5x). Units have sizes 1, 2, 3, 4 and are recruited
// smallest first (size principle).
import { autoMount, button, htmlEl, presets, slider, svgEl } from "../lib/ui";
import { axes, polyline } from "./axes";

const NAME = "a5-twitch";
const BLUE = "#267a91", RED = "#b64853", GREEN = "#397646", INK = "#243645", GOLD = "#b37a22";
const TAU = 40, S0 = 3.04, T_END = 700, T_ON = 50, T_OFF = 550, DT = 1;
const SIZES = [1, 2, 3, 4];
const COLS = [BLUE, GREEN, GOLD, RED];

function stimTimes(hz: number): number[] {
  if (hz <= 0) return [T_ON];
  const out: number[] = [];
  for (let t = T_ON; t < T_OFF; t += 1000 / hz) out.push(t);
  return out;
}

function unitForce(stims: number[]): number[] {
  const n = Math.round(T_END / DT) + 1, S = new Float64Array(n);
  for (const ts of stims) {
    for (let i = Math.ceil(ts / DT); i < n; i++) {
      const u = (i * DT - ts) / TAU;
      if (u > 12) break;
      S[i] += u * Math.exp(1 - u);
    }
  }
  return Array.from(S, s => 1 - Math.exp(-s / S0));
}

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
[data-demo="${NAME}"] .tw-verdict { font-size: 1.15em; font-weight: 700; }
`;
  document.head.appendChild(s);
}

function mount(host: HTMLElement): void {
  injectStyle();
  const W = 690, H = 520;
  const st = { hz: Number(host.dataset.hz ?? 10), units: Math.max(1, Math.min(4, Number(host.dataset.units ?? 4))) };
  const start = { ...st };
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "qb-plot", role: "img",
    "aria-label": "Muscle force against time for a train of stimuli, stacked by motor unit" });
  const box = { x0: 70, y0: 40, x1: 675, y1: 420 };
  const ymax = SIZES.reduce((a, b) => a + b, 0);
  const { sx, sy } = axes(svgEl("g", {}, svg), box, [0, T_END], [0, ymax], [0, 100, 200, 300, 400, 500, 600, 700],
    [0, 2, 4, 6, 8, 10], "time (ms)", "force (one unit's tetanus × size)");
  const areas = SIZES.map((_, i) => svgEl("path", { fill: COLS[i], "fill-opacity": 0.35, stroke: COLS[i], "stroke-width": 2.5 }, svg));
  const total = svgEl("path", { fill: "none", stroke: INK, "stroke-width": 3 }, svg);
  const gStim = svgEl("g", {}, svg);
  const stimLab = svgEl("text", { x: box.x0, y: 510, class: "lab" }, svg);

  const panel = htmlEl("div", "qb-panel");
  const slF = slider(panel, "Stimulus rate (Hz)", 0, 100, 1, st.hz, v => { st.hz = v; draw(); }, v => v === 0 ? "one" : v.toFixed(0));
  const slU = slider(panel, "Motor units", 1, 4, 1, st.units, v => { st.units = v; draw(); }, v => v.toFixed(0));
  htmlEl("div", "qb-note", "Units are recruited smallest first (sizes 1, 2, 3, 4). Rate 0 = one stimulus.", panel);
  const btns = presets(panel, [
    { label: "Single twitch", apply: () => set(0, st.units) },
    { label: "5 Hz", apply: () => set(5, st.units) },
    { label: "15 Hz", apply: () => set(15, st.units) },
    { label: "30 Hz", apply: () => set(30, st.units) },
    { label: "80 Hz", apply: () => set(80, st.units) },
  ]);
  const verdict = htmlEl("div", "tw-verdict", "", panel);
  const ro = htmlEl("div", "qb-readout", "", panel);
  button(htmlEl("div", "qb-presets", "", panel), "Reset", () => { set(start.hz, start.units); btns.forEach(b => b.classList.remove("active")); });
  host.append(svg, panel);

  function set(hz: number, units: number): void { st.hz = hz; st.units = units; slF.set(hz); slU.set(units); draw(); }

  const twitchPeak = Math.max(...unitForce([T_ON]));

  function draw(): void {
    const stims = stimTimes(st.hz);
    const f = unitForce(stims);
    const ts = f.map((_, i) => sx(i * DT));
    let base = f.map(() => 0);
    areas.forEach((a, k) => {
      if (k >= st.units) { a.setAttribute("d", ""); return; }
      const topv = base.map((b, i) => b + SIZES[k] * f[i]);
      const up = polyline(ts, topv.map(sy)), down = polyline(ts.slice().reverse(), base.slice().reverse().map(sy)).replace(/^M/, "L");
      a.setAttribute("d", up + down + "Z");
      base = topv;
    });
    total.setAttribute("d", polyline(ts, base.map(sy)));
    gStim.replaceChildren();
    for (const t of stims) svgEl("line", { x1: sx(t), x2: sx(t), y1: 470, y2: 488, stroke: RED, "stroke-width": 2 }, gStim);
    stimLab.textContent = `${stims.length} ${stims.length === 1 ? "stimulus" : "stimuli"} (motor-neuron spikes)`;
    const unitPeak = Math.max(...f);
    // ripple over the last 150 ms of the train
    const i0 = Math.round((T_OFF - 150) / DT), i1 = Math.round(T_OFF / DT);
    const seg = f.slice(i0, i1), rip = st.hz > 0 ? (Math.max(...seg) - Math.min(...seg)) / Math.max(...seg) : 1;
    let msg: string, col: string;
    if (st.hz === 0 || stims.length === 1) { msg = "Single twitch"; col = BLUE; }
    else if (Math.min(...seg) < 0.15 * Math.max(...seg)) { msg = "Separate twitches: each relaxes first"; col = BLUE; }
    else if (rip > 0.05) { msg = "Summation: unfused tetanus"; col = GOLD; }
    else { msg = "Fused tetanus"; col = RED; }
    verdict.textContent = msg; verdict.style.color = col;
    const totalPeak = Math.max(...base);
    ro.textContent =
      `peak force / one twitch  ${(unitPeak / twitchPeak).toFixed(1)}×\n` +
      `units recruited          ${st.units} of 4\n` +
      `peak total force         ${totalPeak.toFixed(1)}`;
  }
  draw();
}

autoMount(NAME, mount);
