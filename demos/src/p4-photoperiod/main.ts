// P4 photoperiod clock. Set the day length and add a brief night break (red, red then far-red,
// or far-red only) at a chosen time in the night, or an hour of darkness in the middle of the day.
// The plant measures the longest uninterrupted dark period: a short-day plant (SDP) flowers when
// it is at least the critical night length, a long-day plant (LDP) when it is shorter.
// A red flash makes Pfr and so splits the night; far-red straight after returns phytochrome to Pr
// and the night counts as unbroken; far-red alone leaves Pr in place, so it has no effect.
// Auto-mounts on <div data-demo="p4-photoperiod">. Optional: data-day="8" data-critical="11".
import { autoMount, checkbox, htmlEl, presets, slider, svgEl, setAttrs } from "../lib/ui";

const NAME = "p4-photoperiod";
const SUN = "#f2c45a", NIGHT = "#243645", RED = "#d03a3a", FR = "#6e1f33", GREEN = "#397646", GOLD = "#b37a22", GREY = "#8a959e";
const STYLE = `
.qb-demo[data-demo="${NAME}"] { flex-wrap: nowrap; gap: 22px; }
.qb-demo[data-demo="${NAME}"] .qb-plot { flex: 0 1 640px; max-width: 640px; }
.reveal .qb-demo[data-demo="${NAME}"] .qb-plot { flex: 0 0 640px; width: 640px; height: 520px; }
.qb-demo[data-demo="${NAME}"] .qb-panel { flex: 1 1 440px; max-width: 490px; gap: .5em; }
.reveal .qb-demo[data-demo="${NAME}"] { font-size: 19px; }
.qb-demo[data-demo="${NAME}"] .qb-slider { grid-template-columns: 8.4em 1fr 3.4em; }
.qb-demo[data-demo="${NAME}"] .pp-out { background: var(--qb-panel); border-radius: 6px; padding: .35em .6em; line-height: 1.4; }
.qb-demo[data-demo="${NAME}"] .pp-big { font-size: 1.1em; font-weight: 700; }
`;

function injectStyle(): void {
  if (document.getElementById("qb-style-" + NAME)) return;
  const s = document.createElement("style");
  s.id = "qb-style-" + NAME;
  s.textContent = STYLE;
  document.head.appendChild(s);
}

type Break = "none" | "R" | "RFR" | "FR";
const fmtH = (h: number) => (Math.abs(h - Math.round(h)) < 1e-6 ? h.toFixed(0) : h.toFixed(1)) + " h";

function mount(host: HTMLElement): void {
  injectStyle();
  const init = { day: Number(host.dataset.day ?? 8), crit: Number(host.dataset.critical ?? 11) };
  let day = init.day, crit = init.crit, brk: Break = "none", at = 0.5, dayDark = false, keepCase = false;

  const W = 640, H = 520, CX = 190, CY = 190, RAD = 125;
  const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, class: "qb-plot", role: "img",
    "aria-label": "24-hour clock of day and night, two plants, and the dark periods the plants measure" }, host);
  // clock: noon at the top
  const ang = (h: number) => ((h - 12) / 24) * 2 * Math.PI - Math.PI / 2;
  const pt = (h: number, r: number): [number, number] => [CX + r * Math.cos(ang(h)), CY + r * Math.sin(ang(h))];
  const arc = (a: number, b: number, r: number) => {
    let span = b - a; if (span < 0) span += 24;
    const [x0, y0] = pt(a, r), [x1, y1] = pt(a + span, r);
    return `M ${CX} ${CY} L ${x0} ${y0} A ${r} ${r} 0 ${span > 12 ? 1 : 0} 1 ${x1} ${y1} Z`;
  };
  svgEl("circle", { cx: CX, cy: CY, r: RAD + 4, fill: "none", stroke: NIGHT, "stroke-width": 2 }, svg);
  const dayArc = svgEl("path", { fill: SUN }, svg);
  const nightArc = svgEl("path", { fill: NIGHT }, svg);
  const dayDarkArc = svgEl("path", { fill: NIGHT }, svg);
  const flashR = svgEl("path", { fill: RED, stroke: "#fff", "stroke-width": 1.5 }, svg);
  const flashF = svgEl("path", { fill: FR, stroke: "#fff", "stroke-width": 1.5 }, svg);
  for (const h of [0, 6, 12, 18]) {
    const side = h === 6 || h === 18;
    const [x, y] = pt(h, side ? RAD + 10 : RAD + 24);
    svgEl("text", { x, y: y + 7, "text-anchor": h === 6 ? "end" : h === 18 ? "start" : "middle", "font-size": 18, style: "fill:#555" }, svg).textContent = h === 12 ? "noon" : h === 0 ? "midnight" : `${h}:00`;
  }
  const clockTxt = svgEl("text", { x: CX, y: CY + 7, "text-anchor": "middle", "font-size": 20, "font-weight": 700, style: "fill:#fff", stroke: NIGHT, "stroke-width": 4, "paint-order": "stroke" }, svg);

  // plants
  const plantG = [svgEl("g", {}, svg), svgEl("g", {}, svg)];
  const plantX = [430, 570];
  const plantLab = ["Short-day", "Long-day"];
  const plantSub = ["(chrysanthemum)", "(spinach)"];
  const verdict: SVGTextElement[] = [];
  plantX.forEach((x, i) => {
    svgEl("text", { x, y: 30, "text-anchor": "middle", "font-size": 19, "font-weight": 700 }, svg).textContent = plantLab[i];
    svgEl("text", { x, y: 54, "text-anchor": "middle", "font-size": 17, style: "fill:#666" }, svg).textContent = plantSub[i];
    verdict.push(svgEl("text", { x, y: 330, "text-anchor": "middle", "font-size": 20, "font-weight": 700 }, svg));
  });
  function drawPlant(g: SVGGElement, x: number, flowers: boolean): void {
    g.replaceChildren();
    const base = 300, top = flowers ? 110 : 190;
    svgEl("line", { x1: x - 50, y1: base, x2: x + 50, y2: base, stroke: "#8a6b4a", "stroke-width": 4 }, g);
    svgEl("line", { x1: x, y1: base, x2: x, y2: top, stroke: GREEN, "stroke-width": 6 }, g);
    for (let k = 0; k < 3; k++) {
      const y = base - 25 - k * 28, s = k % 2 ? 1 : -1;
      svgEl("path", { d: `M ${x} ${y} q ${s * 30} -22 ${s * 52} -6 q ${-s * 24} 18 ${-s * 52} 6 Z`, fill: "#7fb08a", stroke: GREEN, "stroke-width": 2 }, g);
    }
    if (flowers) {
      for (const [dx, dy] of [[0, 0], [-24, 22], [24, 22]]) {
        svgEl("line", { x1: x, y1: top + 30, x2: x + dx, y2: top + dy, stroke: GREEN, "stroke-width": 3 }, g);
        for (let p = 0; p < 6; p++) {
          const a = (p / 6) * 2 * Math.PI;
          svgEl("circle", { cx: x + dx + 10 * Math.cos(a), cy: top + dy + 10 * Math.sin(a), r: 7, fill: "#e8a0b8", stroke: "#b64853", "stroke-width": 1 }, g);
        }
        svgEl("circle", { cx: x + dx, cy: top + dy, r: 6, fill: SUN, stroke: GOLD }, g);
      }
    } else {
      svgEl("circle", { cx: x, cy: top - 4, r: 7, fill: "#a8cfa8", stroke: GREEN, "stroke-width": 2 }, g);
    }
  }

  // linear night bar: dusk -> dawn, with segments and the critical length
  const BX0 = 30, BX1 = 610, BY = 410;
  svgEl("text", { x: BX0, y: 375, "font-size": 19, "font-weight": 700 }, svg).textContent = "The night as the plant measures it (dusk → dawn)";
  const gBar = svgEl("g", {}, svg);
  const critLine = svgEl("line", { y1: BY - 10, y2: BY + 52, stroke: GOLD, "stroke-width": 3, "stroke-dasharray": "6 4" }, svg);
  const critLab = svgEl("text", { y: BY + 74, "font-size": 18, style: `fill:${GOLD}`, "font-weight": 700, "text-anchor": "middle" }, svg);

  // ---- panel ----
  const panel = htmlEl("div", "qb-panel", "", host);
  const slDay = slider(panel, "Day length", 4, 20, 0.5, day, v => { day = v; draw(); }, v => fmtH(v));
  htmlEl("div", "", "Brief flash in the night:", panel);
  const brkBtns = presets(panel, [
    { label: "none", apply: () => { brk = "none"; draw(); } },
    { label: "red", apply: () => { brk = "R"; draw(); } },
    { label: "red, then far-red", apply: () => { brk = "RFR"; draw(); } },
    { label: "far-red only", apply: () => { brk = "FR"; draw(); } },
  ]);
  const slAt = slider(panel, "Flash at", 0, 100, 5, at * 100, v => { at = v / 100; draw(); }, v => `${v.toFixed(0)}%`);
  slAt.input.title = "Position of the flash within the night (% of the way from dusk to dawn)";
  const dd = checkbox(panel, "1 h of darkness in the middle of the day", false, v => { dayDark = v; draw(); });
  const slCrit = slider(panel, "Critical night", 8, 14, 0.5, crit, v => { crit = v; draw(); }, v => fmtH(v));
  const out = htmlEl("div", "pp-out", "", panel);
  const big = htmlEl("div", "pp-big", "", out);
  const why = htmlEl("div", "", "", out);
  htmlEl("div", "", "Lecture cases:", panel);
  const cases = presets(panel, [
    { label: "16 L / 8 D", apply: () => set(16, "none", false) },
    { label: "8 L / 16 D", apply: () => set(8, "none", false) },
    { label: "+ red break", apply: () => set(8, "R", false) },
    { label: "+ red, far-red", apply: () => set(8, "RFR", false) },
    { label: "+ dark in day", apply: () => set(8, "none", true) },
    { label: "reset", apply: () => { set(init.day, "none", false); crit = init.crit; slCrit.set(crit); draw(); } },
  ]);

  function set(d: number, b: Break, dk: boolean): void {
    day = d; brk = b; dayDark = dk; at = 0.5;
    slDay.set(d); slAt.set(50); dd.checked = dk;
    keepCase = true; draw(); keepCase = false;
  }

  function draw(): void {
    brkBtns.forEach((b, i) => b.classList.toggle("active", ["none", "R", "RFR", "FR"][i] === brk));
    const night = 24 - day, dawn = 12 - day / 2, dusk = 12 + day / 2;
    dayArc.setAttribute("d", day >= 24 ? "" : arc(dawn, dusk, RAD));
    nightArc.setAttribute("d", arc(dusk, dawn + 24, RAD));
    dayDarkArc.setAttribute("d", dayDark ? arc(11.5, 12.5, RAD) : "");
    const tb = dusk + at * night;              // clock time of the flash
    const w = 0.35;                            // drawn width of a flash (h); the real flash is minutes
    flashR.setAttribute("d", brk === "R" || brk === "RFR" ? arc(tb - (brk === "RFR" ? w : w / 2), tb + (brk === "RFR" ? 0 : w / 2), RAD + 4) : "");
    flashF.setAttribute("d", brk === "FR" ? arc(tb - w / 2, tb + w / 2, RAD + 4) : brk === "RFR" ? arc(tb, tb + w, RAD + 4) : "");
    clockTxt.textContent = `${fmtH(day)} light`;

    // dark periods the plant measures
    const split = brk === "R";
    const parts = split ? [at * night, (1 - at) * night] : [night];
    const longest = Math.max(...parts);
    const sdp = longest >= crit, ldp = longest < crit;
    drawPlant(plantG[0], plantX[0], sdp);
    drawPlant(plantG[1], plantX[1], ldp);
    verdict.forEach((v, i) => {
      const f = i === 0 ? sdp : ldp;
      v.textContent = f ? "flowers" : "vegetative";
      v.style.fill = f ? GREEN : GREY;
    });

    gBar.replaceChildren();
    const hx = (h: number) => BX0 + (BX1 - BX0) * h / 20;  // bar scale: 0-20 h of night
    let x = 0;
    parts.forEach((len, i) => {
      svgEl("rect", { x: hx(x), y: BY, width: Math.max(0, hx(x + len) - hx(x)), height: 40, fill: NIGHT, stroke: "#fff", "stroke-width": 1 }, gBar);
      if (len >= 1.2) svgEl("text", { x: (hx(x) + hx(x + len)) / 2, y: BY + 27, "text-anchor": "middle", "font-size": 19, "font-weight": 700, style: "fill:#fff" }, gBar).textContent = fmtH(len);
      x += len;
      if (split && i === 0) svgEl("rect", { x: hx(x) - 4, y: BY - 8, width: 8, height: 56, fill: RED }, gBar);
    });
    if (brk === "RFR" || brk === "FR") {
      const xb = hx(at * night);
      if (brk === "RFR") svgEl("rect", { x: xb - 8, y: BY - 8, width: 8, height: 56, fill: RED, opacity: 0.9 }, gBar);
      svgEl("rect", { x: xb, y: BY - 8, width: 8, height: 56, fill: FR }, gBar);
    }
    setAttrs(critLine, { x1: hx(crit), x2: hx(crit) });
    setAttrs(critLab, { x: Math.min(BX1 - 70, hx(crit)) });
    critLab.textContent = `critical ${fmtH(crit)}`;

    big.textContent = `Longest dark period: ${fmtH(longest)} ${longest >= crit ? "≥" : "<"} ${fmtH(crit)}`;
    why.textContent =
      brk === "R" ? "Red makes Pfr: the night is split in two, and each half is measured separately."
      : brk === "RFR" ? "Far-red right after the red turns Pfr back into Pr: the night counts as unbroken."
      : brk === "FR" ? "Far-red alone leaves phytochrome as Pr: no effect on the night."
      : dayDark ? "Darkness during the day changes nothing: only the night is measured."
      : "SDP flower when the night is long enough; LDP when it is short enough.";
    if (!keepCase) cases.forEach(b => b.classList.remove("active"));
  }

  draw();
}

autoMount(NAME, mount);
