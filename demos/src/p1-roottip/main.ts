// Root growth: more cells or longer cells? Auto-mounts on <div data-demo="p1-roottip">.
// Two root tips (A and B) seen with the tip fixed on the right. Each meristem releases new cells
// at a production rate F (cells per hour per cell file); each new cell leaves the meristem at
// 10 µm and elongates (relative rate 0.8 h⁻¹) until it reaches its final length Lf, then matures.
// In steady state the root grows at F × Lf: the same speed can come from many short cells or
// fewer long ones. Options: data-fa, data-la, data-fb, data-lb (initial F and Lf of each root).
import { autoMount, button, htmlEl, presets, slider, svgEl, setAttrs } from "../lib/ui";

const NAME = "p1-roottip";
const LD = 10;          // µm, length of a cell leaving the meristem
const K = 0.8;          // h⁻¹, relative elongation rate
const TMAX = 8;         // h
const SC = 0.8;         // px per µm

function injectStyle(): void {
  if (document.getElementById(NAME + "-style")) return;
  const s = document.createElement("style");
  s.id = NAME + "-style";
  s.textContent = `
.qb-demo[data-demo="${NAME}"] { flex-direction: column; gap: 6px; }
.qb-demo[data-demo="${NAME}"] .qb-plot { flex: 0 0 auto; width: 1120px; max-width: 1120px; }
.reveal .qb-demo[data-demo="${NAME}"] { font-size: 20px; }
.qb-demo[data-demo="${NAME}"] .rt-row { display: flex; gap: 24px; align-items: flex-start; width: 1120px; }
.qb-demo[data-demo="${NAME}"] .rt-col { flex: 1 1 0; display: flex; flex-direction: column; gap: .3em; }
.qb-demo[data-demo="${NAME}"] .rt-col h4 { margin: 0; font-size: 1em; }
.qb-demo[data-demo="${NAME}"] .qb-slider { grid-template-columns: 11em 1fr 4.4em; }
.qb-demo[data-demo="${NAME}"] .rt-ctl { flex: 0 0 300px; display: flex; flex-direction: column; gap: .4em; }
.qb-demo[data-demo="${NAME}"] svg .lab { font-size: 20px; }
.qb-demo[data-demo="${NAME}"] svg .small { font-size: 18px; fill: var(--qb-muted); }
.qb-demo[data-demo="${NAME}"] svg .gain { font-size: 20px; font-weight: 700; }
`;
  document.head.appendChild(s);
}

const C = { mer: "#397646", elong: "#cfe5c8", mature: "#f1f4ee", edge: "#397646", old: "#d9d4c7", hair: "#8a9a7a",
  cap: "#e8d9b5", red: "#b64853", blue: "#267a91", ink: "#243645", gold: "#b37a22" };

interface Cell { born: number; lf: number }
interface Lane {
  F: number; Lf: number; cells: Cell[]; nextBirth: number;
  g: SVGGElement; old: SVGRectElement; gainTxt: SVGTextElement; bracket: SVGPathElement; ro: HTMLDivElement;
  sF: ReturnType<typeof slider>; sL: ReturnType<typeof slider>;
}

const cellLen = (c: Cell, t: number) => Math.min(c.lf, LD * Math.exp(K * Math.max(0, t - c.born)));

function mount(host: HTMLElement): void {
  injectStyle();
  const init = [
    { F: Number(host.dataset.fa ?? 2.2), L: Number(host.dataset.la ?? 40) },
    { F: Number(host.dataset.fb ?? 1.25), L: Number(host.dataset.lb ?? 70) },
  ];
  const W = 1120, H = 300, XT = 1040, LH = 54;
  const laneY = [70, 205];
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "qb-plot", role: "img",
    "aria-label": "Two root tips producing and elongating cells; the length gained is shown for each" });
  const clipId = `${NAME}-clip-${Math.random().toString(36).slice(2, 7)}`;
  svgEl("rect", { x: 0, y: 0, width: XT + 8, height: H }, svgEl("clipPath", { id: clipId }, svgEl("defs", {}, svg)));
  // zone labels (approximate, for the default settings)
  const timeTxt = svgEl("text", { x: 600, y: 24, "text-anchor": "middle", class: "lab" }, svg);
  svgEl("text", { x: XT - 30, y: 24, "text-anchor": "middle", class: "small" }, svg).textContent = "meristem";
  svgEl("text", { x: XT - 170, y: 24, "text-anchor": "middle", class: "small" }, svg).textContent = "elongation";
  svgEl("text", { x: 300, y: 24, "text-anchor": "middle", class: "small" }, svg).textContent = "maturation (root hairs)";

  const panelRow = htmlEl("div", "rt-row");
  const lanes: Lane[] = [];
  ["A", "B"].forEach((name, i) => {
    const y = laneY[i];
    svgEl("text", { x: 4, y: y - 10, class: "lab", "font-weight": "700" }, svg).textContent = `Root ${name}`;
    const g = svgEl("g", { "clip-path": `url(#${clipId})` }, svg);
    const old = svgEl("rect", { y, height: LH, fill: C.old, stroke: "#b8b2a4", "stroke-width": 2 }, g);
    // meristem: six small dividing cells next to the cap
    for (let k = 0; k < 6; k++)
      svgEl("rect", { x: XT - (k + 1) * LD * SC * 1.25, y, width: LD * SC * 1.25, height: LH, fill: C.mer, stroke: "#fff", "stroke-width": 1.5 }, svg);
    svgEl("path", { d: `M ${XT} ${y} Q ${XT + 70} ${y + LH / 2} ${XT} ${y + LH} Z`, fill: C.cap, stroke: C.gold, "stroke-width": 2 }, svg);
    const bracket = svgEl("path", { fill: "none", stroke: C.red, "stroke-width": 3 }, svg);
    const gainTxt = svgEl("text", { y: y + LH + 30, "text-anchor": "middle", class: "gain", fill: C.red }, svg);
    const col = htmlEl("div", "rt-col", "", panelRow);
    htmlEl("h4", "", `Root ${name}`, col);
    const lane = { F: init[i].F, Lf: init[i].L, cells: [], nextBirth: 0, g, old, gainTxt, bracket } as unknown as Lane;
    lane.sF = slider(col, "Cell production", 0.25, 4, 0.05, lane.F, v => { lane.F = v; draw(); }, v => v.toFixed(2) + "/h");
    lane.sL = slider(col, "Final cell length", 20, 150, 5, lane.Lf, v => { lane.Lf = v; draw(); }, v => v.toFixed(0) + " µm");
    lane.ro = htmlEl("div", "qb-readout", "", col);
    lanes.push(lane);
  });
  const ctl = htmlEl("div", "rt-ctl", "", panelRow);
  const playBtn = button(ctl, "▶ Grow for 8 h", () => (running ? pause() : play()));
  const pre = presets(ctl, [
    { label: "Slide example", apply: () => setBoth(2.2, 40, 1.25, 70) },
    { label: "Identical roots", apply: () => setBoth(1.5, 60, 1.5, 60) },
  ]);
  button(ctl, "Reset", () => { pause(); pre.forEach(b => b.classList.remove("active")); setBoth(init[0].F, init[0].L, init[1].F, init[1].L); restart(); });
  host.append(svg, panelRow);

  function setBoth(fa: number, la: number, fb: number, lb: number): void {
    const v = [[fa, la], [fb, lb]];
    lanes.forEach((ln, i) => { ln.F = v[i][0]; ln.Lf = v[i][1]; ln.sF.set(ln.F); ln.sL.set(ln.Lf); });
    restart();
  }

  // ---------- simulation ----------
  let t = 0, running = false, raf = 0, last = 0;
  function restart(): void {
    pause(); t = 0;
    // start in steady state: cells born during the previous 6 h are already in place
    lanes.forEach(ln => {
      ln.cells = [];
      for (let b = -6; b <= 0; b += 1 / ln.F) ln.cells.push({ born: b, lf: ln.Lf });
      ln.nextBirth = ln.cells[ln.cells.length - 1].born + 1 / ln.F;
    });
    draw();
  }
  function play(): void {
    if (t >= TMAX - 1e-9) restart();
    running = true; playBtn.textContent = "❚❚ Pause"; last = performance.now();
    raf = requestAnimationFrame(step);
  }
  function pause(): void {
    running = false; cancelAnimationFrame(raf);
    playBtn.textContent = t >= TMAX - 1e-9 ? "▶ Grow again" : "▶ Grow for 8 h";
  }
  function step(now: number): void {
    const dt = Math.min(0.1, (now - last) / 1000); last = now;   // 1 h of model time per second
    t = Math.min(TMAX, t + dt);
    for (const ln of lanes) {
      while (ln.nextBirth <= t) { ln.cells.push({ born: ln.nextBirth, lf: ln.Lf }); ln.nextBirth += 1 / ln.F; }
    }
    draw();
    if (t >= TMAX - 1e-9) { pause(); return; }
    raf = requestAnimationFrame(step);
  }

  function draw(): void {
    timeTxt.textContent = `t = ${t.toFixed(1)} h`;
    const x0 = XT - 6 * LD * SC * 1.25;          // left edge of the meristem
    lanes.forEach((ln, i) => {
      const y = laneY[i];
      // cells, newest next to the meristem
      while (ln.g.childNodes.length > 1) ln.g.removeChild(ln.g.lastChild!);
      let x = x0, total = 0, total0 = 0;
      for (let k = ln.cells.length - 1; k >= 0; k--) {
        const c = ln.cells[k];
        const L = cellLen(c, t), w = L * SC;
        const mature = L >= c.lf - 0.01;
        x -= w; total += L; total0 += c.born <= 0 ? cellLen(c, 0) : 0;
        if (x + w < 0) continue;
        svgEl("rect", { x, y, width: w, height: LH, fill: mature ? C.mature : C.elong, stroke: C.edge, "stroke-width": 1.5 }, ln.g);
        if (mature && t - c.born > 4) {   // root hairs on older mature cells
          svgEl("line", { x1: x + w / 2, x2: x + w / 2 - 6, y1: y, y2: y - 16, stroke: C.hair, "stroke-width": 2 }, ln.g);
          svgEl("line", { x1: x + w / 2, x2: x + w / 2 - 6, y1: y + LH, y2: y + LH + 16, stroke: C.hair, "stroke-width": 2 }, ln.g);
        }
      }
      setAttrs(ln.old, { x: -10, width: Math.max(0, x + 10) });
      // the soil point level with the meristem edge at t = 0 is now `gained` behind the tip
      const gained = total - total0;
      const xs = Math.max(0, x0 - gained * SC);
      ln.bracket.setAttribute("d", gained > 0 ? `M ${xs} ${y + LH + 6} L ${xs} ${y + LH + 12} L ${x0} ${y + LH + 12} L ${x0} ${y + LH + 6}` : "");
      setAttrs(ln.gainTxt, { x: Math.max(110, (xs + x0) / 2) });
      ln.gainTxt.textContent = gained > 0 ? `+${(gained / 1000).toFixed(2)} mm` : "";
      const n = ln.cells.filter(c => c.born > 0).length;
      const rate = ln.F * ln.Lf;
      ln.ro.textContent =
        `new cells ${n}; tip moved ${(gained / 1000).toFixed(2)} mm\n` +
        `growth rate F × Lf = ${(rate / 1000).toFixed(3)} mm/h`;
    });
  }

  restart();
}

autoMount(NAME, mount);
