// P3 light-response curve explorer. Net CO2 uptake of one leaf against light, for a C3 or a C4
// leaf, at a chosen CO2 concentration and leaf temperature, with or without stomatal closure.
// Shows net and gross photosynthesis, dark respiration, CO2 lost by photorespiration and the
// light compensation point. Drag the handle (or use the light slider) to read the curve.
// "Keep curve" leaves a grey copy for comparison.
// Auto-mounts on <div data-demo="p3-lightcurve">. Optional: data-pathway="C4", data-co2="420",
// data-temp="25", data-light="600".
import { autoMount, button, checkbox, draggable, htmlEl, presets, scale, slider, svgEl, svgPoint, setAttrs } from "../lib/ui";
import { compensation, rates, type Leaf, type Pathway } from "./model";

const NAME = "p3-lightcurve";
const C = { net: "#267a91", gross: "#397646", rd: "#b64853", pr: "#b37a22", kept: "#9aa5ad", ink: "#243645" };
const STYLE = `
.qb-demo[data-demo="${NAME}"] { flex-wrap: nowrap; gap: 22px; }
.qb-demo[data-demo="${NAME}"] .qb-plot { flex: 0 1 640px; max-width: 640px; }
.reveal .qb-demo[data-demo="${NAME}"] .qb-plot { flex: 0 0 640px; width: 640px; height: 500px; }
.qb-demo[data-demo="${NAME}"] .qb-panel { flex: 1 1 460px; max-width: 490px; gap: .45em; }
.reveal .qb-demo[data-demo="${NAME}"] { font-size: 19px; }
.qb-demo[data-demo="${NAME}"] .lc-big { font-size: 1.3em; font-weight: 700; color: ${C.net}; }
.qb-demo[data-demo="${NAME}"] .lc-row { display: flex; justify-content: space-between; gap: .5em; }
.qb-demo[data-demo="${NAME}"] .lc-row b { font-variant-numeric: tabular-nums; }
.qb-demo[data-demo="${NAME}"] .lc-tbl { background: var(--qb-panel); border-radius: 6px; padding: .35em .6em; line-height: 1.45; }
.qb-demo[data-demo="${NAME}"] .lc-btns { display: flex; flex-wrap: wrap; gap: .35em; align-items: center; }
.qb-demo[data-demo="${NAME}"] .qb-slider { grid-template-columns: 7.2em 1fr 4.6em; }
`;

function injectStyle(): void {
  if (document.getElementById("qb-style-" + NAME)) return;
  const s = document.createElement("style");
  s.id = "qb-style-" + NAME;
  s.textContent = STYLE;
  document.head.appendChild(s);
}

const f1 = (v: number) => (Math.abs(v) < 0.05 ? "0.0" : v.toFixed(1)).replace("-", "−");

function mount(host: HTMLElement): void {
  injectStyle();
  const init: Leaf & { I: number } = {
    pathway: (host.dataset.pathway === "C4" ? "C4" : "C3") as Pathway,
    co2: Number(host.dataset.co2 ?? 420), temp: Number(host.dataset.temp ?? 25), closed: false,
    I: Number(host.dataset.light ?? 600),
  };
  const leaf: Leaf = { pathway: init.pathway, co2: init.co2, temp: init.temp, closed: false };
  let I = init.I;
  const kept: { d: string; label: string }[] = [];

  // ---- plot ----
  const W = 640, H = 500, L = 78, Rr = 612, T = 20, B = 430;
  const IMAX = 2000, YMIN = -5, YMAX = 45;
  let zoom = false;                                   // zoomed view: light 0-400, uptake -5..10
  let sx = scale(0, IMAX, L, Rr), sy = scale(YMIN, YMAX, B, T);
  const imax = () => (zoom ? 400 : IMAX);
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "qb-plot", role: "img",
    "aria-label": "Net CO2 uptake of a leaf against light intensity" }, host);
  const gGrid = svgEl("g", {}, svg);
  function drawGrid(): void {
    gGrid.replaceChildren();
    const xm = imax(), ylo = zoom ? -5 : YMIN, yhi = zoom ? 10 : YMAX;
    sx = scale(0, xm, L, Rr); sy = scale(ylo, yhi, B, T);
    const xs = zoom ? 50 : 250, ys = zoom ? 1 : 5;
    for (let x = 0; x <= xm; x += xs) {
      svgEl("line", { x1: sx(x), y1: T, x2: sx(x), y2: B, class: "grid" }, gGrid);
      if (x % (2 * xs) === 0) svgEl("text", { x: sx(x), y: B + 26, "text-anchor": "middle", "font-size": 18 }, gGrid).textContent = String(x);
    }
    for (let y = ylo; y <= yhi; y += ys) {
      svgEl("line", { x1: L, y1: sy(y), x2: Rr, y2: sy(y), class: y === 0 ? "axis" : "grid", "stroke-width": y === 0 ? 2 : 1 }, gGrid);
      if (y % (2 * ys) === 0 || y === ylo) svgEl("text", { x: L - 8, y: sy(y) + 6, "text-anchor": "end", "font-size": 18 }, gGrid).textContent = String(y).replace("-", "−");
    }
    svgEl("line", { x1: L, y1: T, x2: L, y2: B, class: "axis", "stroke-width": 2 }, gGrid);
  }
  svgEl("text", { x: (L + Rr) / 2, y: H - 14, "text-anchor": "middle", "font-size": 20 }, svg).textContent = "Light (µmol photons m⁻² s⁻¹)";
  svgEl("text", { x: 20, y: (T + B) / 2, "text-anchor": "middle", "font-size": 20, transform: `rotate(-90 20 ${(T + B) / 2})` }, svg)
    .textContent = "Net CO₂ uptake (µmol m⁻² s⁻¹)";
  const clipId = `${NAME}-clip-${Math.random().toString(36).slice(2, 8)}`;
  const cp0 = svgEl("clipPath", { id: clipId }, svgEl("defs", {}, svg));
  svgEl("rect", { x: L, y: T - 2, width: Rr - L, height: B - T + 4 }, cp0);
  const plotG = svgEl("g", { "clip-path": `url(#${clipId})` }, svg);

  const gKept = svgEl("g", {}, plotG);
  const rdLine = svgEl("line", { stroke: C.rd, "stroke-width": 2.5, "stroke-dasharray": "8 6" }, plotG);
  const rdLab = svgEl("text", { "font-size": 18, style: `fill:${C.rd}`, "text-anchor": "end" }, svg);
  const grossPath = svgEl("path", { fill: "none", stroke: C.gross, "stroke-width": 3, "stroke-dasharray": "10 6" }, plotG);
  const netPath = svgEl("path", { fill: "none", stroke: C.net, "stroke-width": 5, "stroke-linejoin": "round" }, plotG);
  const cursor = svgEl("line", { y1: T, y2: B, stroke: C.ink, "stroke-width": 1.5, "stroke-dasharray": "3 5" }, svg);
  const comp = svgEl("circle", { r: 8, fill: "#fff", stroke: C.gross, "stroke-width": 3 }, svg);
  const compLab = svgEl("text", { "font-size": 18, style: `fill:${C.gross}`, "font-weight": 700 }, svg);
  const handle = svgEl("circle", { r: 14, class: "handle", stroke: C.net }, svg);
  draggable(handle, ev => { const [px] = svgPoint(svg, ev); return [sx.invert(px), 0]; }, x => {
    I = Math.round(Math.max(0, Math.min(imax(), x)) / (zoom ? 2 : 10)) * (zoom ? 2 : 10);
    slI.set(I); draw();
  });

  // ---- panel ----
  const panel = htmlEl("div", "qb-panel", "", host);
  const pathBtns = presets(panel, [
    { label: "C3 leaf (wheat)", apply: () => { leaf.pathway = "C3"; draw(); } },
    { label: "C4 leaf (maize)", apply: () => { leaf.pathway = "C4"; draw(); } },
  ]);
  const slI = slider(panel, "Light", 0, IMAX, 10, I, v => { I = v; draw(); }, v => v.toFixed(0));
  const slC = slider(panel, "CO₂ (ppm)", 100, 1200, 10, leaf.co2, v => { leaf.co2 = v; draw(); }, v => v.toFixed(0));
  const slT = slider(panel, "Leaf temp.", 5, 45, 1, leaf.temp, v => { leaf.temp = v; draw(); }, v => `${v.toFixed(0)} °C`);
  const closedBox = checkbox(panel, "Drought: stomata nearly closed", false, v => { leaf.closed = v; draw(); });
  checkbox(panel, "Zoom in on low light (0–400)", false, v => { zoom = v; if (zoom && I > 400) { I = 200; slI.set(I); } kept.length = 0; drawKept(); draw(); });
  const scen = presets(panel, [
    { label: "Air today", apply: () => setAll("C3", 420, 25, false) },
    { label: "Hot, dry", apply: () => setAll(leaf.pathway, 420, 38, true) },
    { label: "1000 ppm", apply: () => setAll(leaf.pathway, 1000, 25, false) },
    { label: "Cool, 12 °C", apply: () => setAll(leaf.pathway, 420, 12, false) },
  ]);
  const big = htmlEl("div", "lc-big", "", panel);
  const tbl = htmlEl("div", "lc-tbl", "", panel);
  const row = (label: string, col: string) => {
    const r = htmlEl("div", "lc-row", "", tbl);
    htmlEl("span", "", label, r).style.color = col;
    return htmlEl("b", "", "", r);
  };
  const vGross = row("Gross photosynthesis", C.gross);
  const vRd = row("Dark respiration", C.rd);
  const vPr = row("Photorespiration CO₂ loss", C.pr);
  const vComp = row("Compensation point", C.ink);
  const vLim = row("Limited by", C.ink);
  htmlEl("div", "qb-note", "Solid blue: net uptake. Dashed green: gross. Dashed red: −respiration. ○ compensation point.", panel);
  const btns = htmlEl("div", "lc-btns", "", panel);
  button(btns, "Keep this curve", () => { kept.push({ d: netPath.getAttribute("d") ?? "", label: tag() }); drawKept(); });
  button(btns, "Clear kept", () => { kept.length = 0; drawKept(); });
  button(btns, "Reset", () => { setAll(init.pathway, init.co2, init.temp, false); I = init.I; slI.set(I); kept.length = 0; drawKept(); draw(); });

  function tag(): string {
    return `${leaf.pathway}, ${leaf.co2} ppm, ${leaf.temp} °C${leaf.closed ? ", dry" : ""}`;
  }
  function setAll(p: Pathway, co2: number, temp: number, closed: boolean): void {
    leaf.pathway = p; leaf.co2 = co2; leaf.temp = temp; leaf.closed = closed;
    slC.set(co2); slT.set(temp); closedBox.checked = closed;
    draw();
  }
  function drawKept(): void {
    gKept.replaceChildren();
    kept.forEach(k => {
      svgEl("path", { d: k.d, fill: "none", stroke: C.kept, "stroke-width": 3.5 }, gKept);
      // label at the right end of the kept curve
      const m = /([\d.]+),([\d.]+)$/.exec(k.d);
      if (m) svgEl("text", { x: Rr - 4, y: Number(m[2]) - 8, "text-anchor": "end", "font-size": 17, style: "fill:#6d7882" }, gKept).textContent = k.label;
    });
  }

  function draw(): void {
    drawGrid();
    pathBtns.forEach((b, i) => b.classList.toggle("active", (i === 0) === (leaf.pathway === "C3")));
    scen.forEach(b => b.classList.remove("active"));
    let dn = "", dg = "";
    const lo = sy.invert(B + 4), hi = sy.invert(T - 4), clampY = (v: number) => Math.max(lo, Math.min(hi, v));
    for (let k = 0; k <= 200; k++) {
      const x = (imax() * k) / 200, r = rates(x, leaf);
      const yN = clampY(r.net), yG = clampY(r.gross);
      dn += `${k ? "L" : "M"}${sx(x).toFixed(1)},${sy(yN).toFixed(1)}`;
      dg += `${k ? "L" : "M"}${sx(x).toFixed(1)},${sy(yG).toFixed(1)}`;
    }
    netPath.setAttribute("d", dn);
    grossPath.setAttribute("d", dg);
    const r = rates(I, leaf);
    setAttrs(rdLine, { x1: L, x2: Rr, y1: sy(-r.rd), y2: sy(-r.rd) });
    setAttrs(rdLab, { x: Rr - 6, y: sy(-r.rd) + 22 });
    rdLab.textContent = `−respiration = −${r.rd.toFixed(1)}`;
    setAttrs(cursor, { x1: sx(I), x2: sx(I) });
    setAttrs(handle, { cx: sx(Math.min(I, imax())), cy: sy(clampY(r.net)) });
    cursor.style.display = handle.style.display = I > imax() ? "none" : "";
    const cp = compensation(leaf, IMAX);
    const cpOn = cp !== null && cp <= imax();
    comp.style.display = compLab.style.display = cpOn ? "" : "none";
    if (cp !== null && cpOn) {
      setAttrs(comp, { cx: sx(cp), cy: sy(0) });
      setAttrs(compLab, { x: sx(cp) + 12, y: sy(0) + 26 });
      compLab.textContent = `compensation ${cp.toFixed(0)}`;
    }
    big.textContent = `Net uptake: ${f1(r.net)} µmol CO₂ m⁻² s⁻¹`;
    vGross.textContent = f1(r.gross);
    vRd.textContent = f1(r.rd);
    vPr.textContent = leaf.pathway === "C4" ? "≈ 0" : `${f1(r.photoresp)} (${r.voc.toFixed(2)} O₂/CO₂)`;
    vComp.textContent = cp === null ? "never reached" : `${cp.toFixed(0)} µmol photons`;
    vLim.textContent = I < 1 ? "no light" : r.limit;
  }

  draw();
}

autoMount(NAME, mount);
