// Tonicity: red-cell volume in a bath of NaCl (cannot cross) and urea (can cross).
// Auto-mounts on <div data-demo="a4-tonicity">.
//   data-nacl="300" data-urea="0"   starting bath, in mOsm/L.
// Model (Boyle-van 't Hoff with a permeant solute): the cell holds a fixed amount of
// impermeant solute, 300 mOsm/L at volume 1, with an osmotically inactive fraction Vb.
// Water flows fast towards the higher osmolarity; urea diffuses in or out more slowly.
// Above 1.8 x the starting volume the cell bursts (haemolysis).
import { autoMount, button, checkbox, htmlEl, presets, rng, slider, svgEl, setAttrs } from "../lib/ui";
import { axes, polyline } from "./axes";

const NAME = "a4-tonicity";
const VB = 0.3;                     // osmotically inactive volume fraction
const N_IN = 300 * (1 - VB);        // impermeant solute inside (mOsm per unit volume at V = 1)
const KW = 6, KU = 0.5;             // water and urea rate constants (schematic time units)
const T_END = 12, DT = 0.005;
const V_LYSIS = 1.8;

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
[data-demo="${NAME}"] svg .big { font-size: 22px; font-weight: 700; }
[data-demo="${NAME}"] .tn-verdict { font-size: 1.15em; font-weight: 700; }
`;
  document.head.appendChild(s);
}

interface Traj { t: number[]; V: number[]; u: number[]; burst: number }   // burst = index or -1

function simulate(nacl: number, urea: number, ureaPermeant: boolean): Traj {
  const outImp = nacl + (ureaPermeant ? 0 : urea);
  const outPerm = ureaPermeant ? urea : 0;
  let V = 1, u = 0;                  // u: urea amount inside (mOsm x volume)
  const t: number[] = [], Vs: number[] = [], us: number[] = [];
  let burst = -1;
  for (let i = 0; i * DT <= T_END + 1e-9; i++) {
    if (i % 10 === 0) { t.push(i * DT); Vs.push(V); us.push(u); }
    if (V > V_LYSIS) { burst = t.length - 1; break; }
    const w = V - VB;
    const inside = (N_IN + u) / w;
    const dV = KW * (inside - (outImp + outPerm)) / 300;
    const du = KU * (outPerm - u / w) * Math.pow(V, 2 / 3);
    V = Math.max(VB + 0.05, V + DT * dV);
    u = Math.max(0, u + DT * du);
  }
  return { t, V: Vs, u: us, burst };
}

function mount(host: HTMLElement): void {
  injectStyle();
  const W = 690, H = 520;
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "qb-plot", role: "img",
    "aria-label": "A red blood cell in a bath, and its volume over time" });
  // left: the bath and the cell
  const bath = { x0: 10, y0: 40, x1: 290, y1: 470 };
  svgEl("rect", { x: bath.x0, y: bath.y0, width: bath.x1 - bath.x0, height: bath.y1 - bath.y0, rx: 14,
    fill: "#eef6fb", stroke: "#267a91", "stroke-width": 2 }, svg);
  const title = svgEl("text", { x: 150, y: 28, "text-anchor": "middle", class: "big" }, svg);
  const gDots = svgEl("g", {}, svg);
  const cell = svgEl("path", { fill: "#e9a3aa", stroke: "#b64853", "stroke-width": 4 }, svg);
  const gInDots = svgEl("g", {}, svg);
  const cellLab = svgEl("text", { x: 380, y: 500, class: "big" }, svg);
  // legend
  svgEl("circle", { cx: 30, cy: 505, r: 6, fill: "#267a91" }, svg);
  svgEl("text", { x: 44, y: 511, class: "tick" }, svg).textContent = "NaCl";
  svgEl("circle", { cx: 110, cy: 505, r: 6, fill: "#b37a22" }, svg);
  svgEl("text", { x: 124, y: 511, class: "tick" }, svg).textContent = "urea";
  // right: volume against time
  const gAx = svgEl("g", {}, svg);
  const box = { x0: 380, y0: 60, x1: 675, y1: 420 };
  const { sx, sy } = axes(gAx, box, [0, T_END], [0.4, 1.9], [0, 4, 8, 12], [0.5, 1, 1.5],
    "time (schematic)", "cell volume (start = 1)", v => v.toString());
  svgEl("line", { x1: box.x0, y1: sy(1), x2: box.x1, y2: sy(1), stroke: "#777", "stroke-width": 2, "stroke-dasharray": "6 5" }, gAx);
  svgEl("line", { x1: box.x0, y1: sy(V_LYSIS), x2: box.x1, y2: sy(V_LYSIS), stroke: "#b64853", "stroke-width": 2, "stroke-dasharray": "3 4" }, gAx);
  svgEl("text", { x: box.x1, y: sy(V_LYSIS) - 6, "text-anchor": "end", class: "tick", style: "fill:#b64853" }, gAx).textContent = "bursts";
  const trace = svgEl("path", { fill: "none", stroke: "#b64853", "stroke-width": 4 }, svg);
  const dot = svgEl("circle", { r: 7, fill: "#b64853" }, svg);

  // panel
  const panel = htmlEl("div", "qb-panel");
  const r = { nacl: Number(host.dataset.nacl ?? 300), urea: Number(host.dataset.urea ?? 0), perm: true };
  const slN = slider(panel, "NaCl", 0, 600, 10, r.nacl, v => { r.nacl = v; restart(); }, v => `${v}`);
  const slU = slider(panel, "Urea", 0, 600, 10, r.urea, v => { r.urea = v; restart(); }, v => `${v}`);
  htmlEl("div", "qb-note", "Bath concentrations in mOsm L⁻¹. The cell starts at 300 mOsm L⁻¹ of trapped solute.", panel);
  const perm = checkbox(panel, "Membrane lets urea through", true, v => { r.perm = v; restart(); });
  const btns = presets(panel, [
    { label: "NaCl 300", apply: () => set(300, 0) },
    { label: "NaCl 200", apply: () => set(200, 0) },
    { label: "NaCl 400", apply: () => set(400, 0) },
    { label: "NaCl 150 + urea 150", apply: () => set(150, 150) },
    { label: "Urea 300", apply: () => set(0, 300) },
  ]);
  const verdict = htmlEl("div", "tn-verdict", "", panel);
  const ro = htmlEl("div", "qb-readout", "", panel);
  const row = htmlEl("div", "qb-presets", "", panel);
  button(row, "Replay", () => restart());
  button(row, "Reset", () => { perm.checked = true; r.perm = true; set(300, 0); btns.forEach((b, i) => b.classList.toggle("active", i === 0)); });
  host.append(svg, panel);

  function set(n: number, u: number): void { r.nacl = n; r.urea = u; slN.set(n); slU.set(u); restart(); }

  // fixed dot positions in the bath (seeded), shown in proportion to concentration
  const R = rng(7);
  const spots = Array.from({ length: 80 }, () => [bath.x0 + 14 + R.unif() * (bath.x1 - bath.x0 - 28), bath.y0 + 14 + R.unif() * (bath.y1 - bath.y0 - 28)]);
  const inSpots = Array.from({ length: 40 }, () => { const a = R.unif() * 2 * Math.PI, d = Math.sqrt(R.unif()); return [Math.cos(a) * d, Math.sin(a) * d]; });
  const CX = 150, CY = 255, R0 = 72;

  function cellPath(V: number): string {
    const rad = R0 * Math.sqrt(V);                      // a flat disc: area ~ volume
    const crenate = V < 0.97 ? Math.min(1, (0.97 - V) / 0.2) : 0;
    let d = "";
    for (let i = 0; i <= 120; i++) {
      const a = (i / 120) * 2 * Math.PI;
      const rr = rad * (1 + 0.14 * crenate * Math.max(0, Math.cos(14 * a)) ** 3);
      d += (i ? "L" : "M") + (CX + rr * Math.cos(a)).toFixed(1) + " " + (CY + rr * Math.sin(a)).toFixed(1);
    }
    return d + "Z";
  }

  let traj: Traj = simulate(r.nacl, r.urea, r.perm);
  let raf = 0, t0 = 0;
  const ANIM_MS = 3500;

  function drawDots(V: number, uIn: number, burst: boolean): void {
    gDots.replaceChildren(); gInDots.replaceChildren();
    const rad = R0 * Math.sqrt(V) + 10;
    const nN = Math.round(r.nacl / 15), nU = Math.round(r.urea / 15);
    let k = 0;
    for (const [x, y] of spots) {
      if (Math.hypot(x - CX, y - CY) < rad) continue;
      if (k < nN) svgEl("circle", { cx: x, cy: y, r: 5, fill: "#267a91" }, gDots);
      else if (k < nN + nU) svgEl("circle", { cx: x, cy: y, r: 5, fill: "#b37a22" }, gDots);
      k++;
    }
    if (burst) return;
    const cIn = uIn / Math.max(0.05, V - VB);
    const nIn = Math.min(inSpots.length, Math.round(cIn / 15));
    for (let i = 0; i < nIn; i++) {
      const [a, b] = inSpots[i];
      svgEl("circle", { cx: CX + a * R0 * Math.sqrt(V) * 0.8, cy: CY + b * R0 * Math.sqrt(V) * 0.8, r: 5, fill: "#b37a22" }, gInDots);
    }
  }

  function frame(now: number): void {
    const f = Math.min(1, (now - t0) / ANIM_MS);
    const last = traj.burst >= 0 ? traj.burst : traj.t.length - 1;
    const i = Math.min(last, Math.round(f * (traj.t.length - 1)));
    const burst = traj.burst >= 0 && i >= traj.burst;
    trace.setAttribute("d", polyline(traj.t.slice(0, i + 1).map(sx), traj.V.slice(0, i + 1).map(v => sy(Math.min(1.9, v)))));
    setAttrs(dot, { cx: sx(traj.t[i]), cy: sy(Math.min(1.9, traj.V[i])) });
    cell.setAttribute("d", cellPath(traj.V[i]));
    cell.setAttribute("fill", burst ? "none" : "#e9a3aa");
    cell.setAttribute("stroke-dasharray", burst ? "10 14" : "");
    drawDots(traj.V[i], traj.u[i], burst);
    const V = traj.V[i];
    cellLab.textContent = burst ? "burst (haemolysis)" : V > 1.04 ? `swelling: ${V.toFixed(2)}×` : V < 0.96 ? `shrinking: ${V.toFixed(2)}×` : `steady: ${V.toFixed(2)}×`;
    if (f < 1 && !(burst && i >= last)) raf = requestAnimationFrame(frame);
  }

  function restart(): void {
    cancelAnimationFrame(raf);
    traj = simulate(r.nacl, r.urea, r.perm);
    const total = r.nacl + r.urea;
    const effective = r.nacl + (r.perm ? 0 : r.urea);
    const osm = total > 310 ? "hyperosmotic" : total < 290 ? "hyposmotic" : "isosmotic";
    const ton = effective > 310 ? "hypertonic" : effective < 290 ? "hypotonic" : "isotonic";
    title.textContent = `bath: ${total} mOsm L⁻¹`;
    verdict.textContent = `${osm}, but ${ton}`;
    verdict.style.color = ton === "isotonic" ? "#397646" : ton === "hypotonic" ? "#b64853" : "#267a91";
    if (osm.slice(0, 3) === ton.slice(0, 3)) verdict.textContent = `${osm} and ${ton}`;
    const fin = traj.burst >= 0 ? "bursts" : `${traj.V[traj.V.length - 1].toFixed(2)}×`;
    ro.textContent = `total outside      ${total} mOsm L⁻¹\nnon-penetrating    ${effective} mOsm L⁻¹\nfinal cell volume  ${fin}`;
    t0 = performance.now();
    frame(t0);
  }

  btns.forEach((b, i) => b.classList.toggle("active", r.nacl === [300, 200, 400, 150, 0][i] && r.urea === [0, 0, 0, 150, 300][i]));
  restart();
}

autoMount(NAME, mount);
