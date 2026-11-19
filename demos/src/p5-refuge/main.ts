// Bt maize and the refuge strategy: frequency of a resistance allele R in a pest over generations.
// One locus, two alleles (S, R). Each generation: larvae are spread over the field, a fraction
// `refuge` on non-Bt maize (all genotypes survive) and the rest on Bt maize (survival vSS, vRS, vRR).
// Survivors' adults mate at random across the whole landscape (Hardy-Weinberg among the next larvae).
//   vSS = 1 - kill,  vRR = 1,  vRS = vSS + h (vRR - vSS)   (h = dominance of resistance)
//   p' = (p^2 wRR + p q wRS) / wbar,  w_g = refuge + (1 - refuge) v_g
// Optional drift: binomial sampling of 2N alleles each generation (seeded, 5 replicates).
//
// <div data-demo="p5-refuge"
//      data-refuge="20"     refuge, % of the field          (default 20)
//      data-h="0"           dominance of R, 0 = recessive    (default 0)
//      data-p0="0.001"      initial frequency of R            (default 0.001)
//      data-kill="99"       % of SS larvae killed on Bt maize ("high dose", default 99)
//      data-gens="150"      generations shown                 (default 150)
//      data-n="10000"       adults per generation for the drift runs
//      data-seed="3"></div>
import { autoMount, button, checkbox, htmlEl, presets, rng, slider, svgEl, setAttrs, scale } from "../lib/ui";

const NAME = "p5-refuge";
const W = 640, H = 500;
const M = { l: 92, r: 22, t: 24, b: 76 };

const CSS = `
.reveal .qb-demo[data-demo="${NAME}"] { flex-wrap: nowrap; gap: 26px; }
.qb-demo[data-demo="${NAME}"] .qb-plot { flex: 0 1 ${W}px; max-width: ${W}px; }
.qb-demo[data-demo="${NAME}"] .qb-panel { flex: 1 1 430px; max-width: 470px; }
[data-demo="${NAME}"] .p5r-big { font-size: 1.15em; font-weight: 700; }
[data-demo="${NAME}"] .p5r-fast { color: var(--qb-c2); }
[data-demo="${NAME}"] .p5r-slow { color: var(--qb-c3); }
[data-demo="${NAME}"] svg .tick { font-size: 18px; fill: var(--qb-muted); }
[data-demo="${NAME}"] svg .lab { font-size: 20px; }
[data-demo="${NAME}"] svg .main { fill: none; stroke: var(--qb-c1); stroke-width: 5; }
[data-demo="${NAME}"] svg .ghost { fill: none; stroke: var(--qb-c2); stroke-width: 3; stroke-dasharray: 9 7; opacity: .75; }
[data-demo="${NAME}"] svg .rep { fill: none; stroke: var(--qb-c5); stroke-width: 2.2; opacity: .8; }
[data-demo="${NAME}"] svg .half { stroke: var(--qb-muted); stroke-width: 1.5; stroke-dasharray: 4 5; }
[data-demo="${NAME}"] svg .glab { font-size: 18px; fill: var(--qb-c2); }
[data-demo="${NAME}"] .p5r-key { display: flex; flex-wrap: wrap; gap: .2em 1em; font-size: 18px; }
[data-demo="${NAME}"] .p5r-sw { display: inline-block; width: 26px; height: 0; vertical-align: middle; margin-right: .3em; border-top: 5px solid var(--qb-c1); }
[data-demo="${NAME}"] .p5r-sw.g { border-top: 3px dashed var(--qb-c2); }
[data-demo="${NAME}"] .p5r-sw.r { border-top: 3px solid var(--qb-c5); }
`;

function injectCss(): void {
  if (document.getElementById(NAME + "-style")) return;
  const s = document.createElement("style");
  s.id = NAME + "-style";
  s.textContent = CSS;
  document.head.appendChild(s);
}

interface Params { refuge: number; h: number; p0: number; kill: number }

/** Fitness of SS, RS, RR averaged over refuge and Bt field. */
function fitness({ refuge, h, kill }: Params): [number, number, number] {
  const vSS = 1 - kill, vRR = 1, vRS = vSS + h * (vRR - vSS);
  return [vSS, vRS, vRR].map(v => refuge + (1 - refuge) * v) as [number, number, number];
}

function select(p: number, w: [number, number, number]): number {
  const q = 1 - p;
  const wbar = q * q * w[0] + 2 * p * q * w[1] + p * p * w[2];
  return (p * q * w[1] + p * p * w[2]) / wbar;
}

function deterministic(par: Params, gens: number): number[] {
  const w = fitness(par), out = [par.p0];
  let p = par.p0;
  for (let g = 0; g < gens; g++) { p = select(p, w); out.push(p); }
  return out;
}

/** Binomial(n, p): exact inversion when n p is small, normal approximation otherwise. */
function binom(n: number, p: number, r: { unif: () => number; norm: () => number }): number {
  const mu = n * p, v = mu * (1 - p);
  if (v > 30) return Math.min(n, Math.max(0, Math.round(mu + Math.sqrt(v) * r.norm())));
  if (p > 0.5) return n - binom(n, 1 - p, r);
  const u = r.unif();
  let k = 0, pk = Math.pow(1 - p, n), cum = pk;
  while (cum < u && k < n) { pk *= ((n - k) / (k + 1)) * (p / (1 - p)); k++; cum += pk; }
  return k;
}

function drift(par: Params, gens: number, N: number, seed: number): number[] {
  const r = rng(seed), w = fitness(par), out = [par.p0];
  let p = par.p0;
  for (let g = 0; g < gens; g++) {
    p = p <= 0 || p >= 1 ? p : binom(2 * N, select(p, w), r) / (2 * N);
    out.push(p);
  }
  return out;
}

function firstAbove(xs: number[], v: number): number {
  for (let i = 0; i < xs.length; i++) if (xs[i] >= v) return i;
  return -1;
}

function mount(host: HTMLElement): void {
  injectCss();
  const d = host.dataset;
  const def: Params = {
    refuge: Number(d.refuge ?? 20) / 100, h: Number(d.h ?? 0),
    p0: Number(d.p0 ?? 0.001), kill: Number(d.kill ?? 99) / 100,
  };
  const gens = Math.max(20, Number(d.gens ?? 150));
  const seed = Number(d.seed ?? 3);
  const N = Number(d.n ?? 10000);
  let par: Params = { ...def };
  let showDrift = false;

  // ---- plot ----
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "qb-plot", role: "img",
    "aria-label": "Resistance allele frequency against pest generations" });
  const x = scale(0, gens, M.l, W - M.r);
  const yLin = scale(0, 1, H - M.b, M.t), yLog = scale(-4, 0, H - M.b, M.t);
  let logY = false;
  const y = (v: number) => logY ? yLog(Math.log10(Math.max(v, 1e-4))) : yLin(v);
  const gAx = svgEl("g", {}, svg);
  const step = gens <= 60 ? 10 : gens <= 160 ? 25 : 50;
  function drawAxes(): void {
    gAx.replaceChildren();
    const ticks = logY ? [1e-4, 1e-3, 0.01, 0.1, 1] : [0, 0.25, 0.5, 0.75, 1];
    for (const v of ticks) {
      svgEl("line", { x1: M.l, x2: W - M.r, y1: y(v), y2: y(v), class: v === ticks[0] ? "axis" : "grid" }, gAx);
      svgEl("text", { x: M.l - 10, y: y(v) + 6, "text-anchor": "end", class: "tick" }, gAx).textContent =
        logY ? (v >= 0.01 ? String(v) : v === 1e-3 ? "0.001" : "0.0001") : v.toFixed(2);
    }
    for (let g = 0; g <= gens; g += step) {
      svgEl("line", { x1: x(g), x2: x(g), y1: y(ticks[0]), y2: y(ticks[0]) + 6, class: "axis" }, gAx);
      svgEl("text", { x: x(g), y: y(ticks[0]) + 28, "text-anchor": "middle", class: "tick" }, gAx).textContent = String(g);
    }
    svgEl("line", { x1: M.l, x2: M.l, y1: y(ticks[0]), y2: y(1), class: "axis" }, gAx);
    svgEl("line", { x1: M.l, x2: W - M.r, y1: y(0.5), y2: y(0.5), class: "half" }, gAx);
    svgEl("text", { x: (M.l + W - M.r) / 2, y: H - 14, "text-anchor": "middle", class: "lab" }, gAx).textContent = "Pest generations";
    svgEl("text", { x: 22, y: (M.t + H - M.b) / 2, "text-anchor": "middle", class: "lab",
      transform: `rotate(-90 22 ${(M.t + H - M.b) / 2})` }, gAx).textContent =
      "Resistance allele frequency" + (logY ? " (log)" : "");
  }
  drawAxes();
  const ghost = svgEl("path", { class: "ghost" }, svg);
  const gReps = svgEl("g", {}, svg);
  const main = svgEl("path", { class: "main" }, svg);
  const ghostLab = svgEl("text", { class: "glab", "text-anchor": "start" }, svg);

  const toPath = (xs: number[]) => xs.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join("");

  // ---- panel ----
  const panel = htmlEl("div", "qb-panel");
  const pre = presets(panel, [
    { label: "No refuge", apply: () => set({ refuge: 0, h: 0 }) },
    { label: "20% refuge", apply: () => set({ refuge: 0.2, h: 0 }) },
    { label: "20%, dominant R", apply: () => set({ refuge: 0.2, h: 1 }) },
  ]);
  const sRef = slider(panel, "Refuge (% of field)", 0, 50, 1, par.refuge * 100, v => { par.refuge = v / 100; clearPre(); draw(); }, v => `${v}%`);
  const sH = slider(panel, "Dominance of R (h)", 0, 1, 0.05, par.h, v => { par.h = v; clearPre(); draw(); });
  const lp = Math.log10(par.p0);
  const sP = slider(panel, "Initial R frequency", -4, -1, 0.1, lp, v => { par.p0 = Math.pow(10, v); clearPre(); draw(); },
    v => fmtP0(Math.pow(10, v)));
  const row = htmlEl("div", "p5r-key", "", panel);
  checkbox(row, "Log scale", false, v => { logY = v; drawAxes(); draw(); });
  checkbox(row, `Drift (5 runs, ${N} adults)`, false, v => { showDrift = v; draw(); });
  const key = htmlEl("div", "p5r-key", "", panel);
  key.innerHTML = `<span><i class="p5r-sw"></i>this field</span><span><i class="p5r-sw g"></i>no refuge</span><span><i class="p5r-sw r"></i>drift runs</span>`;
  const ro = htmlEl("div", "qb-readout", "", panel);
  htmlEl("div", "qb-note", `Bt maize kills ${Math.round(par.kill * 100)}% of SS larvae. Adults from refuge and Bt maize mate at random.`, panel);
  button(htmlEl("div", "", "", panel), "Reset", () => { clearPre(); set({ ...def }); });

  function clearPre(): void { pre.forEach(b => b.classList.remove("active")); }
  function set(q: Partial<Params>): void {
    par = { ...par, ...q };
    sRef.set(Math.round(par.refuge * 100)); sH.set(par.h); sP.set(Math.log10(par.p0));
    draw();
  }

  function draw(): void {
    const ps = deterministic(par, gens);
    const base = deterministic({ ...par, refuge: 0 }, gens);
    main.setAttribute("d", toPath(ps));
    const showGhost = par.refuge > 0;
    ghost.setAttribute("d", showGhost ? toPath(base) : "");
    const gb = firstAbove(base, 0.5);
    if (showGhost && gb >= 0) {
      setAttrs(ghostLab, { x: x(gb) + 8, y: y(0.62) });
      ghostLab.textContent = "no refuge";
    } else ghostLab.textContent = "";
    gReps.replaceChildren();
    if (showDrift) for (let k = 0; k < 5; k++)
      svgEl("path", { class: "rep", d: toPath(drift(par, gens, N, seed + 101 * k)) }, gReps);

    const w = fitness(par);
    const g50 = firstAbove(ps, 0.5);
    const t = g50 < 0 ? `> ${gens} generations` : `after ${g50} generations`;
    const cls = g50 < 0 || g50 > 60 ? "p5r-slow" : "p5r-fast";
    ro.innerHTML =
      `R reaches 50%: <span class="p5r-big ${cls}">${t}</span>\n` +
      (par.refuge > 0 ? `Without refuge: ${gb < 0 ? "> " + gens : gb} generations\n` : "") +
      `Fitness  SS ${w[0].toFixed(3)}  RS ${w[1].toFixed(3)}  RR ${w[2].toFixed(2)}`;
  }

  host.append(svg, panel);
  draw();
}

function fmtP0(v: number): string {
  return v >= 0.01 ? v.toFixed(2) : v >= 0.001 ? v.toFixed(4) : v.toFixed(5);
}

autoMount(NAME, mount);
