// Small plotting helpers shared by the animal-physiology demos (a1-*, a2-*, a3-*).
// Lives in a1-scaling/ because demos/src/lib/ is shared with other units; the other
// a*-demos import it from here.
import { svgEl, scale } from "../lib/ui";

export interface Axes {
  g: SVGGElement;
  sx: ReturnType<typeof scale>;
  sy: ReturnType<typeof scale>;
  x0: number; y0: number; w: number; h: number;
}

export interface AxesOpts {
  x0: number; y0: number; w: number; h: number;   // plot rectangle in SVG px
  xmin: number; xmax: number; ymin: number; ymax: number;
  xticks: number[]; yticks: number[];
  xlabel: string; ylabel: string;
  xfmt?: (v: number) => string; yfmt?: (v: number) => string;
}

const minus = (s: string) => s.replace("-", "−");

/** Grid, axes, tick labels (18 px) and axis labels (20 px). Returns the scales. */
export function axes(parent: SVGElement, o: AxesOpts): Axes {
  const g = svgEl("g", {}, parent);
  const sx = scale(o.xmin, o.xmax, o.x0, o.x0 + o.w);
  const sy = scale(o.ymin, o.ymax, o.y0 + o.h, o.y0);
  const xf = o.xfmt ?? (v => minus(String(v))), yf = o.yfmt ?? (v => minus(String(v)));
  for (const t of o.xticks) {
    svgEl("line", { x1: sx(t), x2: sx(t), y1: o.y0, y2: o.y0 + o.h, class: "grid" }, g);
    svgEl("text", { x: sx(t), y: o.y0 + o.h + 24, "text-anchor": "middle", class: "tick" }, g).textContent = xf(t);
  }
  for (const t of o.yticks) {
    svgEl("line", { x1: o.x0, x2: o.x0 + o.w, y1: sy(t), y2: sy(t), class: "grid" }, g);
    svgEl("text", { x: o.x0 - 8, y: sy(t) + 6, "text-anchor": "end", class: "tick" }, g).textContent = yf(t);
  }
  svgEl("line", { x1: o.x0, x2: o.x0 + o.w, y1: o.y0 + o.h, y2: o.y0 + o.h, class: "axis", "stroke-width": 2 }, g);
  svgEl("line", { x1: o.x0, x2: o.x0, y1: o.y0, y2: o.y0 + o.h, class: "axis", "stroke-width": 2 }, g);
  svgEl("text", { x: o.x0 + o.w / 2, y: o.y0 + o.h + 52, "text-anchor": "middle", class: "lab" }, g).textContent = o.xlabel;
  const yl = svgEl("text", { x: 0, y: 0, "text-anchor": "middle", class: "lab",
    transform: `translate(${o.x0 - 58} ${o.y0 + o.h / 2}) rotate(-90)` }, g);
  yl.textContent = o.ylabel;
  return { g, sx, sy, x0: o.x0, y0: o.y0, w: o.w, h: o.h };
}

/** SVG path data through points, skipping non-finite values. */
export function pathD(pts: [number, number][]): string {
  let d = "", pen = false;
  for (const [x, y] of pts) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) { pen = false; continue; }
    d += (pen ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1);
    pen = true;
  }
  return d;
}

/** A clip rectangle for the plot area, so curves that leave the range are cut off. */
export function clipRect(svg: SVGSVGElement, a: Axes, id: string): string {
  const defs = svgEl("defs", {}, svg);
  const cp = svgEl("clipPath", { id }, defs);
  svgEl("rect", { x: a.x0, y: a.y0, width: a.w, height: a.h }, cp);
  return `url(#${id})`;
}

/** Inject a <style> block once per demo name. */
export function injectStyle(id: string, css: string): void {
  if (document.getElementById(id)) return;
  const s = document.createElement("style");
  s.id = id;
  s.textContent = css;
  document.head.appendChild(s);
}

/** Common CSS for the a*-demos: plot sizing inside a slide and SVG text classes. */
export function baseCss(name: string, plotW: number): string {
  return `
.reveal .qb-demo[data-demo="${name}"] { flex-wrap: nowrap; gap: 24px; }
.qb-demo[data-demo="${name}"] .qb-plot { flex: 1 1 420px; max-width: ${plotW}px; }
.reveal .qb-demo[data-demo="${name}"] .qb-plot { flex: 0 0 ${plotW}px; width: ${plotW}px; max-width: ${plotW}px; }
.qb-demo[data-demo="${name}"] .qb-panel { flex: 1 1 300px; max-width: 470px; }
[data-demo="${name}"] svg .tick { font-size: 18px; fill: var(--qb-muted); }
[data-demo="${name}"] svg .lab { font-size: 20px; }
[data-demo="${name}"] svg .note { font-size: 18px; }
[data-demo="${name}"] .big { font-size: 1.12em; font-weight: 700; font-variant-numeric: tabular-nums; }
[data-demo="${name}"] .row { display: flex; justify-content: space-between; gap: .6em; align-items: baseline; }
`;
}

/** demo.css sets `svg text { fill: … }`, which beats a fill attribute; copy fills to inline style. */
export function keepTextFills(svg: SVGSVGElement): void {
  svg.querySelectorAll("text[fill]").forEach(t => { (t as SVGTextElement).style.fill = t.getAttribute("fill") ?? ""; });
}
