// Minimal axes for a time/value plot inside an SVG (copy kept per demo folder).
import { svgEl } from "../lib/ui";

export interface Box { x0: number; y0: number; x1: number; y1: number }

export function linear(d0: number, d1: number, r0: number, r1: number): (v: number) => number {
  return v => r0 + (v - d0) * (r1 - r0) / (d1 - d0);
}

/** Draw grid, ticks and axis titles; returns the x and y scales. */
export function axes(g: SVGGElement, b: Box, xd: [number, number], yd: [number, number],
  xt: number[], yt: number[], xName: string, yName: string, fmt: (v: number) => string = v => String(v).replace("-", "−")) {
  g.replaceChildren();
  const sx = linear(xd[0], xd[1], b.x0, b.x1), sy = linear(yd[0], yd[1], b.y1, b.y0);
  for (const v of xt) {
    svgEl("line", { x1: sx(v), y1: b.y0, x2: sx(v), y2: b.y1, class: "grid" }, g);
    svgEl("text", { x: sx(v), y: b.y1 + 24, "text-anchor": "middle", class: "tick" }, g).textContent = fmt(v);
  }
  for (const v of yt) {
    svgEl("line", { x1: b.x0, y1: sy(v), x2: b.x1, y2: sy(v), class: "grid" }, g);
    svgEl("text", { x: b.x0 - 8, y: sy(v) + 6, "text-anchor": "end", class: "tick" }, g).textContent = fmt(v);
  }
  svgEl("line", { x1: b.x0, y1: b.y1, x2: b.x1, y2: b.y1, class: "axis" }, g);
  svgEl("line", { x1: b.x0, y1: b.y0, x2: b.x0, y2: b.y1, class: "axis" }, g);
  svgEl("text", { x: (b.x0 + b.x1) / 2, y: b.y1 + 52, "text-anchor": "middle", class: "lab" }, g).textContent = xName;
  svgEl("text", { x: b.x0 - 8, y: b.y0 - 14, "text-anchor": "start", class: "lab" }, g).textContent = yName;
  return { sx, sy };
}

/** SVG path "d" for a polyline. */
export function polyline(xs: number[], ys: number[]): string {
  let d = "";
  for (let i = 0; i < xs.length; i++) d += (i ? "L" : "M") + xs[i].toFixed(1) + " " + ys[i].toFixed(1);
  return d;
}
