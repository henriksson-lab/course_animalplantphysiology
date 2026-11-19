// Membrane potential from ion gradients and permeabilities (Nernst and Goldman-Hodgkin-Katz).
// Auto-mounts on <div data-demo="a5-membrane">.
//   data-preset="rest|highk|peak|konly"   the preset shown first (default rest).
// At 37 C: E_ion = 61.5 mV / z * log10(out/in);
// Vm = 61.5 mV * log10((PK[K]o + PNa[Na]o) / (PK[K]i + PNa[Na]i))   (Cl- assumed passively distributed).
import { autoMount, button, htmlEl, presets, rng, slider, svgEl, setAttrs } from "../lib/ui";

const NAME = "a5-membrane";
const BLUE = "#267a91", RED = "#b64853", GREEN = "#397646", INK = "#243645", GOLD = "#b37a22";
const K61 = 61.5;

interface State { ko: number; ki: number; nao: number; nai: number; logr: number }   // logr = log10(PNa/PK)
const PRESETS: Record<string, { label: string; s: State }> = {
  rest: { label: "Rest", s: { ko: 5, ki: 140, nao: 145, nai: 15, logr: Math.log10(0.04) } },
  highk: { label: "K⁺ out = 20", s: { ko: 20, ki: 140, nao: 145, nai: 15, logr: Math.log10(0.04) } },
  peak: { label: "Na⁺ channels open", s: { ko: 5, ki: 140, nao: 145, nai: 15, logr: Math.log10(20) } },
  konly: { label: "K⁺ channels only", s: { ko: 5, ki: 140, nao: 145, nai: 15, logr: -3 } },
};

function injectStyle(): void {
  if (document.getElementById(NAME + "-style")) return;
  const s = document.createElement("style");
  s.id = NAME + "-style";
  s.textContent = `
.reveal .qb-demo[data-demo="${NAME}"] { flex-wrap: nowrap; gap: 24px; }
.reveal .qb-demo[data-demo="${NAME}"] .qb-plot { flex: 0 0 640px; width: 640px; }
.qb-demo[data-demo="${NAME}"] .qb-panel { flex: 1 1 440px; max-width: 480px; }
[data-demo="${NAME}"] svg .tick { font-size: 18px; fill: var(--qb-muted); }
[data-demo="${NAME}"] svg .lab { font-size: 20px; }
[data-demo="${NAME}"] svg .big { font-size: 24px; font-weight: 700; }
[data-demo="${NAME}"] .mb-vm { font-size: 1.3em; font-weight: 700; color: ${BLUE}; }
`;
  document.head.appendChild(s);
}

const nernst = (o: number, i: number, z = 1) => (K61 / z) * Math.log10(o / i);
const ghk = (s: State) => {
  const r = Math.pow(10, s.logr);
  return K61 * Math.log10((s.ko + r * s.nao) / (s.ki + r * s.nai));
};
const mv = (v: number) => (v >= 0 ? "+" : "−") + Math.abs(v).toFixed(0);

function mount(host: HTMLElement): void {
  injectStyle();
  const W = 640, H = 520;
  const first = PRESETS[host.dataset.preset ?? "rest"] ?? PRESETS.rest;
  const st: State = { ...first.s };
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "qb-plot", role: "img",
    "aria-label": "Ion concentrations on both sides of a membrane and the resulting potentials on a voltage scale" });

  // left: compartments with ion dots
  const out = { x: 10, y: 40, w: 300, h: 200 }, inn = { x: 10, y: 270, w: 300, h: 200 };
  svgEl("rect", { x: out.x, y: out.y, width: out.w, height: out.h, rx: 10, fill: "#eef6fb", stroke: BLUE, "stroke-width": 2 }, svg);
  svgEl("rect", { x: inn.x, y: inn.y, width: inn.w, height: inn.h, rx: 10, fill: "#fdf0f1", stroke: RED, "stroke-width": 2 }, svg);
  svgEl("rect", { x: out.x, y: 244, width: out.w, height: 22, fill: GOLD }, svg);
  svgEl("text", { x: 20, y: 30, class: "big" }, svg).textContent = "outside";
  svgEl("text", { x: 20, y: 500, class: "big" }, svg).textContent = "inside";
  const gDots = svgEl("g", {}, svg);
  // legend
  svgEl("circle", { cx: 180, cy: 22, r: 7, fill: GREEN }, svg);
  svgEl("text", { x: 192, y: 29, class: "lab" }, svg).textContent = "K⁺";
  svgEl("circle", { cx: 240, cy: 22, r: 7, fill: RED }, svg);
  svgEl("text", { x: 252, y: 29, class: "lab" }, svg).textContent = "Na⁺";
  // channel widths (drawn in the membrane) show relative permeability
  const chK = svgEl("rect", { x: 80, y: 240, height: 30, fill: GREEN, rx: 3 }, svg);
  const chNa = svgEl("rect", { x: 210, y: 240, height: 30, fill: RED, rx: 3 }, svg);

  // right: voltage scale
  const vmin = -110, vmax = 80, y0 = 40, y1 = 480, X = 420;
  const vy = (v: number) => y0 + (vmax - Math.max(vmin, Math.min(vmax, v))) * (y1 - y0) / (vmax - vmin);
  svgEl("line", { x1: X, y1: y0, x2: X, y2: y1, class: "axis", "stroke-width": 2 }, svg);
  svgEl("text", { x: X, y: 26, class: "lab", "text-anchor": "middle" }, svg).textContent = "mV";
  for (let v = -100; v <= 60; v += 20) {
    svgEl("line", { x1: X - 8, y1: vy(v), x2: X, y2: vy(v), class: "axis" }, svg);
    svgEl("text", { x: X - 12, y: vy(v) + 6, class: "tick", "text-anchor": "end" }, svg).textContent = v === 0 ? "0" : mv(v);
  }
  const mk = (c: string, w: number) => ({
    l: svgEl("line", { x1: X, x2: X + 90, stroke: c, "stroke-width": w }, svg),
    t: svgEl("text", { x: X + 98, class: "lab", style: `fill:${c}; font-weight:700` }, svg),
  });
  const mK = mk(GREEN, 4), mNa = mk(RED, 4), mVm = mk(BLUE, 8);
  const arNa = svgEl("line", { stroke: RED, "stroke-width": 3 }, svg);
  const arK = svgEl("line", { stroke: GREEN, "stroke-width": 3 }, svg);

  // panel
  const panel = htmlEl("div", "qb-panel");
  const vmBig = htmlEl("div", "mb-vm", "", panel);
  const sl = {
    ko: slider(panel, "K⁺ outside", 1, 40, 1, st.ko, v => { st.ko = v; draw(); }, v => v.toFixed(0)),
    ki: slider(panel, "K⁺ inside", 50, 200, 5, st.ki, v => { st.ki = v; draw(); }, v => v.toFixed(0)),
    nao: slider(panel, "Na⁺ outside", 50, 200, 5, st.nao, v => { st.nao = v; draw(); }, v => v.toFixed(0)),
    nai: slider(panel, "Na⁺ inside", 5, 60, 1, st.nai, v => { st.nai = v; draw(); }, v => v.toFixed(0)),
    r: slider(panel, "P_Na / P_K", -3, 1.5, 0.05, st.logr, v => { st.logr = v; draw(); }, v => { const r = Math.pow(10, v); return r < 0.01 ? "≈0" : r < 1 ? r.toFixed(2) : r.toFixed(0); }),
  };
  htmlEl("div", "qb-note", "Concentrations in mmol L⁻¹, 37 °C.", panel);
  const keys = Object.keys(PRESETS);
  const btns = presets(panel, keys.map(k => ({ label: PRESETS[k].label, apply: () => load(PRESETS[k].s) })));
  btns.forEach((b, i) => b.classList.toggle("active", PRESETS[keys[i]] === first));
  const ro = htmlEl("div", "qb-readout", "", panel);
  button(htmlEl("div", "qb-presets", "", panel), "Reset", () => { load(PRESETS.rest.s); btns.forEach((b, i) => b.classList.toggle("active", i === 0)); });
  host.append(svg, panel);

  function load(s: State): void {
    Object.assign(st, s);
    sl.ko.set(s.ko); sl.ki.set(s.ki); sl.nao.set(s.nao); sl.nai.set(s.nai); sl.r.set(s.logr);
    draw();
  }

  // fixed dot positions
  const R = rng(3);
  const posO = Array.from({ length: 80 }, () => [out.x + 15 + R.unif() * (out.w - 30), out.y + 15 + R.unif() * (out.h - 30)]);
  const posI = Array.from({ length: 80 }, () => [inn.x + 15 + R.unif() * (inn.w - 30), inn.y + 15 + R.unif() * (inn.h - 30)]);

  function draw(): void {
    gDots.replaceChildren();
    const n = (c: number) => Math.round(c / 5);            // one dot per 5 mmol/L
    const put = (pos: number[][], start: number, k: number, col: string) => {
      for (let i = start; i < Math.min(pos.length, start + k); i++) svgEl("circle", { cx: pos[i][0], cy: pos[i][1], r: 5, fill: col }, gDots);
      return start + k;
    };
    put(posO, put(posO, 0, n(st.ko), GREEN), n(st.nao), RED);
    put(posI, put(posI, 0, n(st.ki), GREEN), n(st.nai), RED);
    const r = Math.pow(10, st.logr);
    const wK = 34, wNa = Math.max(2, Math.min(70, 34 * r));
    setAttrs(chK, { width: wK }); setAttrs(chNa, { width: wNa });

    const eK = nernst(st.ko, st.ki), eNa = nernst(st.nao, st.nai), vm = ghk(st);
    const place = (m: { l: SVGLineElement; t: SVGTextElement }, v: number, label: string, dy = 0) => {
      setAttrs(m.l, { y1: vy(v), y2: vy(v) }); setAttrs(m.t, { y: vy(v) + 7 + dy }); m.t.textContent = label;
    };
    // keep the three labels from overlapping
    const ys = [{ k: "na", v: eNa }, { k: "vm", v: vm }, { k: "k", v: eK }].sort((a, b) => b.v - a.v);
    const ly: Record<string, number> = {};
    let last = -1e9;
    for (const it of ys) { let y = vy(it.v); if (y < last + 26) y = last + 26; ly[it.k] = y - vy(it.v); last = y; }
    place(mNa, eNa, `E_Na ${mv(eNa)}`, ly.na);
    place(mK, eK, `E_K ${mv(eK)}`, ly.k);
    place(mVm, vm, `Vm ${mv(vm)}`, ly.vm);
    setAttrs(arNa, { x1: X + 45, x2: X + 45, y1: vy(vm), y2: vy(eNa) });
    setAttrs(arK, { x1: X + 70, x2: X + 70, y1: vy(vm), y2: vy(eK) });
    vmBig.textContent = `Membrane potential: ${mv(vm)} mV`;
    const dNa = vm - eNa, dK = vm - eK;
    ro.textContent =
      `E_K  ${mv(eK)} mV   E_Na ${mv(eNa)} mV\n` +
      `Na⁺ driving force ${mv(dNa)} mV, ${dNa < 0 ? "in" : "out"}\n` +
      `K⁺ driving force  ${mv(dK)} mV, ${dK > 0 ? "out" : "in"}`;
  }
  draw();
}

autoMount(NAME, mount);
