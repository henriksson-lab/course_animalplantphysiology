// P4 phytochrome switch: the lettuce-seed experiment. Give imbibed seeds a sequence of brief red
// (660 nm) and far-red (730 nm) flashes, watch the fraction of phytochrome in the active Pfr form,
// then incubate in darkness and see how many of 20 seeds germinate.
// Each flash is saturating, so it sets phytochrome to the photoequilibrium of that light:
// red -> ~85% Pfr (Pfr also absorbs a little red), far-red -> ~3% Pfr. Seeds start as Pr only
// (phytochrome is synthesised as Pr). Germination probability rises steeply with Pfr.
// Auto-mounts on <div data-demo="p4-phytochrome">. Optional: data-seq="R FR R" (start sequence).
import { autoMount, button, htmlEl, presets, rng, svgEl } from "../lib/ui";

const NAME = "p4-phytochrome";
const RED = "#d03a3a", FR = "#6e1f33", PR_C = "#267a91", INK = "#243645", GREEN = "#397646";
const PFR_RED = 0.85, PFR_FR = 0.03, N = 20, MAXF = 8;
const STYLE = `
.qb-demo[data-demo="${NAME}"] { flex-wrap: nowrap; gap: 24px; }
.qb-demo[data-demo="${NAME}"] .qb-plot { flex: 0 1 620px; max-width: 620px; }
.reveal .qb-demo[data-demo="${NAME}"] .qb-plot { flex: 0 0 620px; width: 620px; height: 520px; }
.qb-demo[data-demo="${NAME}"] .qb-panel { flex: 1 1 440px; max-width: 480px; gap: .6em; }
.reveal .qb-demo[data-demo="${NAME}"] { font-size: 20px; }
.qb-demo[data-demo="${NAME}"] .ph-flash { display: flex; gap: .5em; }
.qb-demo[data-demo="${NAME}"] .ph-flash .qb-btn { flex: 1; font-size: 1em; padding: .45em .5em; color: #fff; font-weight: 700; border: none; }
.qb-demo[data-demo="${NAME}"] .ph-flash .qb-btn:disabled { opacity: .35; cursor: default; }
.qb-demo[data-demo="${NAME}"] .ph-r { background: ${RED}; }
.qb-demo[data-demo="${NAME}"] .ph-fr { background: ${FR}; }
.qb-demo[data-demo="${NAME}"] .ph-inc { font-size: 1em; padding: .4em .6em; font-weight: 600; }
.qb-demo[data-demo="${NAME}"] .ph-status { border: 3px solid ${INK}; border-radius: 8px; padding: .35em .6em; }
.qb-demo[data-demo="${NAME}"] .ph-title { font-size: 1.15em; font-weight: 700; }
`;

function injectStyle(): void {
  if (document.getElementById("qb-style-" + NAME)) return;
  const s = document.createElement("style");
  s.id = "qb-style-" + NAME;
  s.textContent = STYLE;
  document.head.appendChild(s);
}

type Flash = "R" | "FR";
const pfrAfter = (seq: Flash[]) => (seq.length === 0 ? 0 : seq[seq.length - 1] === "R" ? PFR_RED : PFR_FR);
/** Probability that a seed germinates in darkness, given its Pfr fraction. */
const pGerm = (pfr: number) => 0.95 / (1 + Math.exp(-(pfr - 0.3) / 0.05));

function mount(host: HTMLElement): void {
  injectStyle();
  const r = rng(7);
  const thresholds = Array.from({ length: N }, () => r.unif());
  const angles = Array.from({ length: N }, () => (r.unif() - 0.5) * 1.6);
  const startSeq = (host.dataset.seq ?? "").trim().split(/\s+/).filter(s => s === "R" || s === "FR") as Flash[];
  let seq: Flash[] = [...startSeq];
  let incubated = false;

  // ---- SVG ----
  const W = 620, H = 520;
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "qb-plot", role: "img",
    "aria-label": "Flash sequence, fraction of phytochrome as Pfr after each flash, and a dish of lettuce seeds" }, host);
  svgEl("text", { x: 10, y: 26, "font-size": 20, "font-weight": 700 }, svg).textContent = "Flashes given (in order)";
  const gStrip = svgEl("g", {}, svg);
  // Pfr step chart
  const cx0 = 70, cx1 = 600, cy0 = 300, cy1 = 90;
  const px = (k: number) => cx0 + (cx1 - cx0) * k / MAXF, py = (f: number) => cy0 - (cy0 - cy1) * f;
  for (const f of [0, 0.25, 0.5, 0.75, 1]) {
    svgEl("line", { x1: cx0, x2: cx1, y1: py(f), y2: py(f), class: f === 0 ? "axis" : "grid" }, svg);
    svgEl("text", { x: cx0 - 8, y: py(f) + 6, "text-anchor": "end", "font-size": 18 }, svg).textContent = `${f * 100}%`;
  }
  svgEl("text", { x: 18, y: (cy0 + cy1) / 2, "text-anchor": "middle", "font-size": 19, transform: `rotate(-90 18 ${(cy0 + cy1) / 2})` }, svg)
    .textContent = "Pfr (active)";
  svgEl("text", { x: cx1, y: cy0 + 26, "text-anchor": "end", "font-size": 18, style: "fill:#666" }, svg).textContent = "after each flash →";
  const thr = svgEl("line", { x1: cx0, x2: cx1, y1: py(0.3), y2: py(0.3), stroke: GREEN, "stroke-width": 2, "stroke-dasharray": "6 6" }, svg);
  void thr;
  svgEl("text", { x: cx1, y: py(0.3) - 8, "text-anchor": "end", "font-size": 18, style: `fill:${GREEN}` }, svg).textContent = "enough Pfr to germinate";
  const step = svgEl("path", { fill: "none", stroke: RED, "stroke-width": 4, "stroke-linejoin": "round" }, svg);
  const gDots = svgEl("g", {}, svg);
  // Petri dish
  const dx = 310, dy = 408;
  svgEl("ellipse", { cx: dx, cy: dy, rx: 285, ry: 82, fill: "#f4efe2", stroke: "#8a7a5a", "stroke-width": 3 }, svg);
  svgEl("ellipse", { cx: dx, cy: dy, rx: 270, ry: 72, fill: "#eae2cc", stroke: "none" }, svg);
  const seeds: { body: SVGEllipseElement; root: SVGPathElement }[] = [];
  for (let i = 0; i < N; i++) {
    const col = i % 10, row = Math.floor(i / 10);
    const x = dx - 225 + col * 50 + (row ? 25 : 0), y = dy - 22 + row * 44;
    const a = angles[i] * 57.3;
    const g = svgEl("g", { transform: `translate(${x} ${y}) rotate(${a.toFixed(1)})` }, svg);
    const root = svgEl("path", { d: "M 9 0 C 18 2 24 8 30 16", fill: "none", stroke: "#f7f7f0", "stroke-width": 4, "stroke-linecap": "round" }, g);
    const body = svgEl("ellipse", { cx: 0, cy: 0, rx: 11, ry: 5, fill: "#6b5a3a", stroke: "#3d3220", "stroke-width": 1.5 }, g);
    seeds.push({ body, root });
  }
  const dishLab = svgEl("text", { x: dx, y: dy + 108, "text-anchor": "middle", "font-size": 19, "font-weight": 700 }, svg);

  // ---- panel ----
  const panel = htmlEl("div", "qb-panel", "", host);
  htmlEl("div", "qb-note", "Imbibed lettuce seeds in darkness. Give brief flashes, then incubate in the dark.", panel);
  const fl = htmlEl("div", "ph-flash", "", panel);
  const bR = button(fl, "Red flash 660 nm", () => add("R"), "ph-r");
  const bF = button(fl, "Far-red 730 nm", () => add("FR"), "ph-fr");
  const bInc = button(panel, "Incubate 2 days in darkness", () => { incubated = true; draw(); }, "ph-inc");
  const status = htmlEl("div", "ph-status", "", panel);
  const sTitle = htmlEl("div", "ph-title", "", status);
  const sWhy = htmlEl("div", "", "", status);
  htmlEl("div", "", "Lecture sequences:", panel);
  const pre = presets(panel, [
    { label: "dark", apply: () => load([]) },
    { label: "R", apply: () => load(["R"]) },
    { label: "R FR", apply: () => load(["R", "FR"]) },
    { label: "R FR R", apply: () => load(["R", "FR", "R"]) },
    { label: "R FR R FR", apply: () => load(["R", "FR", "R", "FR"]) },
  ]);
  button(panel, "Reset (new seeds, no flashes)", () => load([...startSeq]));

  function load(s: Flash[]): void { seq = s; incubated = false; draw(); }
  function add(f: Flash): void {
    if (incubated || seq.length >= MAXF) return;
    seq.push(f); pre.forEach(b => b.classList.remove("active")); draw();
  }

  function draw(): void {
    // strip
    gStrip.replaceChildren();
    if (seq.length === 0) svgEl("text", { x: 10, y: 58, "font-size": 19, style: "fill:#777" }, gStrip).textContent = "none yet: seeds have only Pr";
    seq.forEach((f, i) => {
      const x = px(i + 1) - 26;
      svgEl("rect", { x, y: 38, width: 52, height: 30, rx: 5, fill: f === "R" ? RED : FR }, gStrip);
      svgEl("text", { x: x + 26, y: 60, "text-anchor": "middle", "font-size": 18, "font-weight": 700, style: "fill:#fff" }, gStrip).textContent = f;
    });
    // step chart
    let d = `M ${px(0)} ${py(0)}`, prev = 0;
    gDots.replaceChildren();
    seq.forEach((f, i) => {
      const v = f === "R" ? PFR_RED : PFR_FR;
      d += ` L ${px(i + 1) - 18} ${py(prev)} L ${px(i + 1)} ${py(v)}`;
      prev = v;
      svgEl("circle", { cx: px(i + 1), cy: py(v), r: 7, fill: f === "R" ? RED : FR, stroke: "#fff", "stroke-width": 2 }, gDots);
      svgEl("text", { x: px(i + 1) + 10, y: py(v) - 10, "text-anchor": "start", "font-size": 18, "font-weight": 700 }, gDots)
        .textContent = `${Math.round(v * 100)}%`;
    });
    d += ` L ${cx1} ${py(prev)}`;
    step.setAttribute("d", d);
    // seeds
    const pfr = pfrAfter(seq), p = pGerm(pfr);
    let n = 0;
    seeds.forEach((s, i) => {
      const g = incubated && thresholds[i] < p;
      if (g) n++;
      s.root.style.display = g ? "" : "none";
      s.body.setAttribute("fill", g ? "#8a7a4a" : "#6b5a3a");
    });
    dishLab.textContent = incubated ? `${n} of ${N} seeds germinated (${Math.round(100 * n / N)}%)` : "20 seeds, not yet incubated";
    bR.disabled = bF.disabled = incubated || seq.length >= MAXF;
    bInc.disabled = incubated;
    const last = seq.length ? (seq[seq.length - 1] === "R" ? "red" : "far-red") : "none";
    sTitle.textContent = `Pfr = ${Math.round(pfr * 100)}% of phytochrome`;
    sTitle.style.color = pfr > 0.3 ? RED : PR_C;
    sWhy.textContent = seq.length === 0
      ? "Phytochrome is made as inactive Pr, so a seed that has seen no light has no Pfr."
      : `Last flash: ${last}. ${last === "red" ? "Red converts Pr to active Pfr (Pfr absorbs some red too, so ~85%, not 100%)." : "Far-red converts Pfr back to inactive Pr (~3% Pfr remains)."}`
        + (incubated ? "" : " Incubate to test the prediction.");
    status.style.borderColor = incubated ? (n > N / 2 ? GREEN : "#8a959e") : INK;
  }

  draw();
}

autoMount(NAME, mount);
