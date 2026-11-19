// Renal handling of glucose: filtered load, transport maximum, excretion and clearance.
// Auto-mounts on <div data-demo="a4-renal">.
//   data-p="5"      starting plasma glucose (mmol/L)
//   data-gfr="125"  starting GFR (mL/min)
//   data-tm="2"     starting transport maximum (mmol/min)
// Model: filtered = GFR x P; reabsorbed = min(filtered, Tm) (sharp saturation, as in the lecture);
// excreted = filtered - reabsorbed; clearance = excreted / P.
import { autoMount, button, htmlEl, presets, slider, svgEl, setAttrs } from "../lib/ui";
import { axes, polyline } from "./axes";

const NAME = "a4-renal";
const PMAX = 30;
const BLUE = "#267a91", RED = "#b64853", GREEN = "#397646", INK = "#243645", GOLD = "#b37a22";

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
[data-demo="${NAME}"] svg .key { font-size: 20px; font-weight: 700; }
[data-demo="${NAME}"] .rn-verdict { font-size: 1.15em; font-weight: 700; }
`;
  document.head.appendChild(s);
}

function mount(host: HTMLElement): void {
  injectStyle();
  const W = 690, H = 520;
  const st = { p: Number(host.dataset.p ?? 5), gfr: Number(host.dataset.gfr ?? 125), tm: Number(host.dataset.tm ?? 2) };
  const start = { ...st };
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "qb-plot", role: "img",
    "aria-label": "Filtered, reabsorbed and excreted glucose against plasma glucose" });

  // top: one minute of filtrate as a bar split into reabsorbed and excreted
  svgEl("text", { x: 10, y: 24, class: "key" }, svg).textContent = "Each minute, glucose filtered:";
  const barBg = svgEl("rect", { x: 10, y: 38, width: 670, height: 34, rx: 6, fill: "#f6f7f9", stroke: "#ccc" }, svg);
  void barBg;
  const barRe = svgEl("rect", { x: 10, y: 38, height: 34, rx: 6, fill: GREEN }, svg);
  const barEx = svgEl("rect", { y: 38, height: 34, rx: 0, fill: GOLD }, svg);
  const barLab = svgEl("text", { x: 10, y: 98, class: "lab" }, svg);

  // plot
  const box = { x0: 70, y0: 150, x1: 670, y1: 440 };
  const gAx = svgEl("g", {}, svg);
  let sx = (v: number) => v, sy = (v: number) => v;
  const lFilt = svgEl("path", { fill: "none", stroke: INK, "stroke-width": 3, "stroke-dasharray": "9 7" }, svg);
  const lRe = svgEl("path", { fill: "none", stroke: GREEN, "stroke-width": 5 }, svg);
  const lEx = svgEl("path", { fill: "none", stroke: GOLD, "stroke-width": 5 }, svg);
  const thr = svgEl("line", { stroke: RED, "stroke-width": 2, "stroke-dasharray": "3 5" }, svg);
  const thrLab = svgEl("text", { class: "lab", style: `fill:${RED}`, "text-anchor": "middle" }, svg);
  const cur = svgEl("line", { stroke: BLUE, "stroke-width": 3 }, svg);
  const dots = [GREEN, GOLD].map(c => svgEl("circle", { r: 8, fill: c, stroke: "#fff", "stroke-width": 2 }, svg));
  const keys = [["filtered", INK], ["reabsorbed", GREEN], ["excreted", GOLD]].map(([t, c], i) => {
    const e = svgEl("text", { x: 500, y: 185 + i * 28, class: "key", style: `fill:${c}` }, svg); e.textContent = t; return e;
  });
  void keys;

  // panel
  const panel = htmlEl("div", "qb-panel");
  const slP = slider(panel, "Plasma glucose", 0, PMAX, 0.5, st.p, v => { st.p = v; draw(); }, v => v.toFixed(1));
  const slG = slider(panel, "GFR (mL/min)", 30, 180, 5, st.gfr, v => { st.gfr = v; draw(); }, v => v.toFixed(0));
  const slT = slider(panel, "Tm (mmol/min)", 0.5, 3, 0.1, st.tm, v => { st.tm = v; draw(); }, v => v.toFixed(1));
  htmlEl("div", "qb-note", "Plasma glucose in mmol L⁻¹. Normal fasting ≈ 5.", panel);
  const btns = presets(panel, [
    { label: "Fasting", apply: () => set(5, 125, 2) },
    { label: "After a meal", apply: () => set(8, 125, 2) },
    { label: "Untreated diabetes", apply: () => set(20, 125, 2) },
    { label: "Diabetes + low GFR", apply: () => set(20, 60, 2) },
  ]);
  const verdict = htmlEl("div", "rn-verdict", "", panel);
  const ro = htmlEl("div", "qb-readout", "", panel);
  button(htmlEl("div", "qb-presets", "", panel), "Reset", () => { set(start.p, start.gfr, start.tm); btns.forEach(b => b.classList.remove("active")); });
  host.append(svg, panel);

  function set(p: number, g: number, t: number): void {
    st.p = p; st.gfr = g; st.tm = t; slP.set(p); slG.set(g); slT.set(t); draw();
  }

  function draw(): void {
    const g = st.gfr / 1000;                                   // L/min
    const ymax = Math.max(4, Math.ceil(0.18 * PMAX));
    ({ sx, sy } = axes(gAx, box, [0, PMAX], [0, ymax], [0, 5, 10, 15, 20, 25, 30], Array.from({ length: ymax + 1 }, (_, i) => i),
      "plasma glucose (mmol L⁻¹)", "mmol min⁻¹"));
    const P = Array.from({ length: 121 }, (_, i) => (i / 120) * PMAX);
    const filt = P.map(p => g * p), re = filt.map(f => Math.min(f, st.tm)), ex = filt.map((f, i) => f - re[i]);
    lFilt.setAttribute("d", polyline(P.map(sx), filt.map(v => sy(Math.min(v, ymax)))));
    lRe.setAttribute("d", polyline(P.map(sx), re.map(sy)));
    lEx.setAttribute("d", polyline(P.map(sx), ex.map(v => sy(Math.min(v, ymax)))));
    const pt = st.tm / g;                                      // threshold plasma concentration
    if (pt <= PMAX) {
      setAttrs(thr, { x1: sx(pt), x2: sx(pt), y1: box.y0, y2: box.y1, visibility: "visible" });
      setAttrs(thrLab, { x: Math.max(box.x0 + 150, Math.min(sx(pt), box.x1 - 70)), y: box.y0 - 10, visibility: "visible" });
      thrLab.textContent = `threshold ${pt.toFixed(1)}`;
    } else { thr.setAttribute("visibility", "hidden"); thrLab.setAttribute("visibility", "hidden"); }
    const f = g * st.p, r = Math.min(f, st.tm), e = f - r;
    setAttrs(cur, { x1: sx(st.p), x2: sx(st.p), y1: box.y0, y2: box.y1 });
    setAttrs(dots[0], { cx: sx(st.p), cy: sy(r) });
    setAttrs(dots[1], { cx: sx(st.p), cy: sy(Math.min(e, ymax)) });
    // bar: full width = the largest filtered load on the plot
    const full = 0.18 * PMAX, bw = 670;
    setAttrs(barRe, { width: Math.max(0, bw * r / full) });
    setAttrs(barEx, { x: 10 + bw * r / full, width: Math.max(0, bw * e / full) });
    barLab.textContent = `${f.toFixed(2)} mmol: ${r.toFixed(2)} back to blood, ${e.toFixed(2)} into urine`;
    const C = st.p > 0 ? (e / st.p) * 1000 : 0;                // mL/min
    verdict.textContent = e > 1e-9 ? "Glucose in the urine (glycosuria)" : "All filtered glucose reabsorbed";
    verdict.style.color = e > 1e-9 ? GOLD : GREEN;
    ro.textContent =
      `filtered load  ${f.toFixed(2)} mmol/min\n` +
      `reabsorbed     ${r.toFixed(2)} mmol/min\n` +
      `excreted       ${e.toFixed(2)} mmol/min\n` +
      `clearance      ${C.toFixed(0)} mL/min (GFR ${st.gfr})`;
  }
  draw();
}

autoMount(NAME, mount);
