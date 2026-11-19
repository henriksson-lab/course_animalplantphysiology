// Tissue culture: an explant on a medium with auxin and cytokinin. The auxin : cytokinin ratio
// decides whether it forms roots, callus or shoots (Skoog & Miller 1957). Left: the culture dish.
// Right: a map of outcomes over (auxin, cytokinin) with a draggable point.
// A rule-of-thumb model, not fitted to data: concentrations are on a log scale (mg/L); the log
// ratio r = log10(auxin / cytokinin) sets the organ type and the larger concentration the vigour.
// "Wild Agrobacterium" adds the hormones that a crown-gall T-DNA makes inside the cells.
//
// <div data-demo="p5-tissueculture"
//      data-auxin="0.3" data-cytokinin="0.3"   start concentrations, mg/L (0.01-10)
//      data-seed="5"></div>
import { autoMount, button, checkbox, draggable, htmlEl, presets, rng, slider, svgEl, svgPoint, setAttrs, scale } from "../lib/ui";

const NAME = "p5-tissueculture";
const W = 760, H = 520;
const LMIN = -2, LMAX = 1;           // log10 mg/L range of both sliders
const GALL = 1.0;                    // mg/L of each hormone added by a wild-type T-DNA

const CSS = `
.reveal .qb-demo[data-demo="${NAME}"] { flex-wrap: nowrap; gap: 22px; }
.qb-demo[data-demo="${NAME}"] .qb-plot { flex: 0 1 ${W}px; max-width: ${W}px; }
.qb-demo[data-demo="${NAME}"] .qb-panel { flex: 1 1 360px; max-width: 380px; }
[data-demo="${NAME}"] .p5t-out { font-size: 1.35em; font-weight: 700; }
[data-demo="${NAME}"] svg .tick { font-size: 18px; fill: var(--qb-muted); }
[data-demo="${NAME}"] svg .lab { font-size: 20px; }
[data-demo="${NAME}"] svg .rlab { font-size: 19px; font-weight: 600; fill: #222; }
[data-demo="${NAME}"] svg .agar { fill: #f4ecc9; stroke: #b9a66a; stroke-width: 2; }
[data-demo="${NAME}"] svg .dish { fill: #f7fbfc; stroke: #8aa3ad; stroke-width: 3; }
[data-demo="${NAME}"] svg .explant { fill: #8fbf6f; stroke: #3f6f2c; stroke-width: 2; }
[data-demo="${NAME}"] svg .callus { fill: #efe3b0; stroke: #a8892e; stroke-width: 1.5; }
[data-demo="${NAME}"] svg .shoot { stroke: #397646; stroke-width: 4; fill: none; stroke-linecap: round; }
[data-demo="${NAME}"] svg .leaf { fill: #8cc06a; stroke: #397646; stroke-width: 1.5; }
[data-demo="${NAME}"] svg .root { stroke: #9a7a4a; stroke-width: 3; fill: none; stroke-linecap: round; }
[data-demo="${NAME}"] svg .gall { fill: none; stroke: #b64853; stroke-width: 3; stroke-dasharray: 6 5; }
`;

function injectCss(): void {
  if (document.getElementById(NAME + "-style")) return;
  const s = document.createElement("style");
  s.id = NAME + "-style";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const sig = (z: number) => 1 / (1 + Math.exp(-z));

interface Outcome { roots: number; shoots: number; callus: number; vigour: number }

/** Organ formation from total auxin and cytokinin (mg/L). Scores are 0..1. */
function outcome(aux: number, cyt: number): Outcome {
  const la = Math.log10(aux), lc = Math.log10(cyt);
  const r = la - lc;
  const vigour = sig((Math.max(la, lc) + 1.2) / 0.25);        // too little of both: little growth
  const roots = vigour * sig((r - 0.7) / 0.15);
  const shoots = vigour * sig((-r - 0.7) / 0.15);
  const callus = vigour * (0.25 + 0.75 * Math.exp(-(r * r) / (2 * 0.5 * 0.5)));
  return { roots, shoots, callus, vigour };
}

function verdict(o: Outcome): string {
  if (o.vigour < 0.3) return "Little growth";
  if (o.roots > 0.5) return o.callus > 0.45 ? "Roots from callus" : "Roots";
  if (o.shoots > 0.5) return o.callus > 0.45 ? "Shoots from callus" : "Shoots";
  return "Callus";
}

function mount(host: HTMLElement): void {
  injectCss();
  const d = host.dataset;
  const clampL = (v: number) => Math.min(LMAX, Math.max(LMIN, v));
  const a0 = clampL(Math.log10(Number(d.auxin ?? 0.3))), c0 = clampL(Math.log10(Number(d.cytokinin ?? 0.3)));
  let la = a0, lc = c0, gall = false;
  const R = rng(Number(d.seed ?? 5));

  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "qb-plot", role: "img",
    "aria-label": "Explant in a culture dish and a map of auxin against cytokinin" });

  // ---------------- dish (left)
  const DX = 200, DY = 270;
  svgEl("ellipse", { cx: DX, cy: DY + 18, rx: 185, ry: 175, class: "dish" }, svg);
  svgEl("ellipse", { cx: DX, cy: DY + 30, rx: 170, ry: 150, class: "agar" }, svg);
  const gRoots = svgEl("g", {}, svg);
  const gCallus = svgEl("g", {}, svg);
  svgEl("rect", { x: DX - 45, y: DY + 25, width: 90, height: 22, rx: 6, class: "explant" }, svg);
  const gCallus2 = svgEl("g", {}, svg);
  const gShoots = svgEl("g", {}, svg);
  const gallRing = svgEl("ellipse", { cx: DX, cy: DY + 20, rx: 100, ry: 70, class: "gall" }, svg);
  const title = svgEl("text", { x: DX, y: 50, "text-anchor": "middle", class: "lab" }, svg);
  title.textContent = "Explant after four weeks";

  // fixed random geometry, so the picture is stable while sliders move
  const blobs = Array.from({ length: 40 }, () => ({ a: R.unif() * Math.PI * 2, r: Math.sqrt(R.unif()), s: 0.6 + 0.6 * R.unif() }));
  const shootGeo = Array.from({ length: 7 }, (_, i) => ({ x: -60 + 20 * i + 8 * (R.unif() - .5), lean: (R.unif() - .5) * 0.5, h: 0.7 + 0.5 * R.unif() }));
  const rootGeo = Array.from({ length: 8 }, (_, i) => ({ x: -63 + 18 * i + 6 * (R.unif() - .5), bend: (R.unif() - .5) * 60, len: 0.6 + 0.5 * R.unif() }));

  function drawDish(o: Outcome): void {
    gCallus.replaceChildren(); gCallus2.replaceChildren(); gShoots.replaceChildren(); gRoots.replaceChildren();
    const cs = o.callus;                         // callus size 0..1
    const rx = 20 + 85 * cs, ry = 10 + 48 * cs;
    for (const b of blobs) {
      if (cs < 0.08) break;
      const x = DX + Math.cos(b.a) * b.r * rx, y = DY + 26 + Math.sin(b.a) * b.r * ry - 10 * cs;
      svgEl("circle", { cx: x, cy: y, r: (6 + 16 * cs) * b.s, class: "callus" }, b.r > 0.6 ? gCallus : gCallus2);
    }
    const top = DY + 22 - 50 * cs;               // where shoots start
    const nS = Math.round(7 * o.shoots);
    for (let i = 0; i < nS; i++) {
      const g = shootGeo[i], h = 120 * o.shoots * g.h, x0 = DX + g.x * (0.5 + cs * 0.6);
      const x1 = x0 + g.lean * h, y1 = top - h;
      svgEl("path", { d: `M${x0} ${top} Q${x0} ${top - h / 2} ${x1} ${y1}`, class: "shoot" }, gShoots);
      for (const [f, side] of [[0.55, -1], [0.75, 1], [1.0, -1], [1.0, 1]] as [number, number][]) {
        const px = x0 + (x1 - x0) * f, py = top + (y1 - top) * f, L = 10 + 14 * o.shoots;
        svgEl("ellipse", { cx: px + side * L * 0.7, cy: py - 4, rx: L * 0.75, ry: L * 0.32, class: "leaf",
          transform: `rotate(${side * -30} ${px + side * L * 0.7} ${py - 4})` }, gShoots);
      }
    }
    const nR = Math.round(8 * o.roots);
    for (let i = 0; i < nR; i++) {
      const g = rootGeo[i], len = 110 * o.roots * g.len, x0 = DX + g.x * (0.5 + cs * 0.6), y0 = DY + 40 + 20 * cs;
      svgEl("path", { d: `M${x0} ${y0} C${x0} ${y0 + len / 2} ${x0 + g.bend} ${y0 + len / 2} ${x0 + g.bend * 0.8} ${y0 + len}`, class: "root" }, gRoots);
      for (let k = 1; k <= 3; k++) {         // root hairs / laterals
        const t = k / 4, px = x0 + g.bend * 0.5 * t * t, py = y0 + len * t;
        svgEl("path", { d: `M${px} ${py} l${(k % 2 ? 1 : -1) * 12 * o.roots} ${8 * o.roots}`, class: "root", "stroke-width": 1.5 }, gRoots);
      }
    }
    gallRing.style.display = gall ? "" : "none";
  }

  // ---------------- map (right)
  const MX0 = 455, MX1 = 745, MY0 = 70, MY1 = 360;
  const mx = scale(LMIN, LMAX, MX0, MX1), my = scale(LMIN, LMAX, MY1, MY0);
  const gMap = svgEl("g", {}, svg);
  const N = 30, cw = (MX1 - MX0) / N;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const a = LMIN + (i + 0.5) * (LMAX - LMIN) / N, c = LMIN + (j + 0.5) * (LMAX - LMIN) / N;
    const o = outcome(10 ** a, 10 ** c);
    const v = verdict(o);
    const fill = v === "Little growth" ? "#eceeef" : v.startsWith("Roots") ? "#ecd6c0" : v.startsWith("Shoots") ? "#cfe5c2" : "#f6edc6";
    svgEl("rect", { x: MX0 + i * cw, y: MY1 - (j + 1) * cw, width: cw + 0.5, height: cw + 0.5, fill }, gMap);
  }
  svgEl("rect", { x: MX0, y: MY0, width: MX1 - MX0, height: MY1 - MY0, fill: "none", class: "axis" }, gMap);
  const lab = (x: number, y: number, s: string) => { svgEl("text", { x, y, "text-anchor": "middle", class: "rlab" }, gMap).textContent = s; };
  lab(mx(-1.4), my(0.4), "Shoots"); lab(mx(0.35), my(-1.4), "Roots"); lab(mx(0.2), my(0.45), "Callus"); lab(mx(-1.45), my(-1.75), "Little");
  for (const v of [-2, -1, 0, 1]) {
    const s = String(10 ** v);
    svgEl("text", { x: mx(v), y: MY1 + 24, "text-anchor": "middle", class: "tick" }, gMap).textContent = s;
    svgEl("text", { x: MX0 - 8, y: my(v) + 6, "text-anchor": "end", class: "tick" }, gMap).textContent = s;
  }
  svgEl("text", { x: (MX0 + MX1) / 2, y: MY1 + 52, "text-anchor": "middle", class: "lab" }, gMap).textContent = "Auxin (mg/L)";
  svgEl("text", { x: (MX0 + MX1) / 2, y: MY0 - 14, "text-anchor": "middle", class: "lab" }, gMap).textContent = "Cytokinin (mg/L) ↑";
  const gallDot = svgEl("circle", { r: 9, fill: "none", stroke: "#b64853", "stroke-width": 3, "stroke-dasharray": "4 3" }, svg);
  const handle = svgEl("circle", { r: 15, class: "handle", stroke: "var(--qb-c1)" }, svg);
  draggable(handle, ev => svgPoint(svg, ev), (x, y) => {
    la = clampL(mx.invert(x)); lc = clampL(my.invert(y));
    sA.set(la); sC.set(lc); clearPre(); draw();
  });
  const outText = svgEl("text", { x: (MX0 + MX1) / 2, y: 460, "text-anchor": "middle", class: "lab" }, svg);
  const ratioText = svgEl("text", { x: (MX0 + MX1) / 2, y: 492, "text-anchor": "middle", class: "tick" }, svg);

  // ---------------- panel
  const panel = htmlEl("div", "qb-panel");
  const fmt = (v: number) => { const x = 10 ** v; return x >= 1 ? x.toFixed(1) : x >= 0.1 ? x.toFixed(2) : x.toFixed(3); };
  const pre = presets(panel, [
    { label: "Rooting", apply: () => setL(0.3, -1.7) },
    { label: "Callus", apply: () => setL(0, 0) },
    { label: "Shoots", apply: () => setL(-1.5, 0.3) },
    { label: "No hormones", apply: () => setL(-2, -2) },
  ]);
  const sA = slider(panel, "Auxin", LMIN, LMAX, 0.05, la, v => { la = v; clearPre(); draw(); }, fmt);
  const sC = slider(panel, "Cytokinin", LMIN, LMAX, 0.05, lc, v => { lc = v; clearPre(); draw(); }, fmt);
  htmlEl("div", "qb-note", "mg/L in the medium, log scale. Drag the dot on the map too.", panel);
  const gallBox = checkbox(panel, "Infected by wild Agrobacterium", false, v => { gall = v; draw(); });
  const ro = htmlEl("div", "qb-readout", "", panel);
  htmlEl("div", "qb-note", "Rule of thumb, not data: exact levels depend on species and tissue.", panel);
  button(htmlEl("div", "", "", panel), "Reset", () => { gall = false; gallBox.checked = false; clearPre(); setL(a0, c0); });

  function clearPre(): void { pre.forEach(b => b.classList.remove("active")); }
  function setL(a: number, c: number): void { la = a; lc = c; sA.set(a); sC.set(c); draw(); }

  function draw(): void {
    const aux = 10 ** la + (gall ? GALL : 0), cyt = 10 ** lc + (gall ? GALL : 0);
    const o = outcome(aux, cyt);
    drawDish(o);
    setAttrs(handle, { cx: mx(la), cy: my(lc) });
    const ea = clampL(Math.log10(aux)), ec = clampL(Math.log10(cyt));
    setAttrs(gallDot, { cx: mx(ea), cy: my(ec) });
    gallDot.style.display = gall ? "" : "none";
    const v = verdict(o);
    outText.textContent = gall ? `${v === "Callus" ? "Tumour (crown gall)" : v}` : v;
    const ratio = aux / cyt;
    ratioText.textContent = `auxin : cytokinin = ${ratio >= 10 ? ratio.toFixed(0) : ratio >= 1 ? ratio.toFixed(1) : ratio.toFixed(2)}`;
    ro.innerHTML = `<span class="p5t-out">${outText.textContent}</span>\n` +
      `Roots ${pct(o.roots)}  Shoots ${pct(o.shoots)}\nCallus ${pct(o.callus)}` +
      (gall ? `\nT-DNA adds ${GALL} mg/L of each\n(dashed ring on map)` : "");
  }
  const pct = (x: number) => `${Math.round(100 * x)}%`.padStart(4);

  host.append(svg, panel);
  draw();
}

autoMount(NAME, mount);
