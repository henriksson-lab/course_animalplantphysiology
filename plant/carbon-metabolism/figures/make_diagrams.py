"""Original explanatory figures for P3; run from any directory with Python 3 (+ matplotlib).
Same palette and 800x440 viewBox as animal/organisation/figures/make_diagrams.py."""
from pathlib import Path
from html import escape
import math
ROOT = Path(__file__).parent
BLUE = '#267a91'; RED = '#b64853'; GREEN = '#397646'; INK = '#243645'; PALE = '#eaf3f5'; GOLD = '#b37a22'
LEAF = '#e2eedf'; SAND = '#f3e8df'; ROSE = '#f5dadd'; CREAM = '#fff4df'


def text(x, y, s, size=24, colour=INK, anchor='middle', weight='normal', rotate=None):
    rot = f' transform="rotate({rotate} {x} {y})"' if rotate is not None else ''
    return ''.join(f'<text x="{x}" y="{y + i * (size + 6)}" font-size="{size}" fill="{colour}" '
                   f'text-anchor="{anchor}" font-weight="{weight}"{rot}>{escape(line)}</text>'
                   for i, line in enumerate(s.split('\n')))
def rect(x, y, w, h, fill=PALE, stroke=BLUE, r=6, width=3):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'
def circle(x, y, r, fill=PALE, stroke=BLUE, width=3):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'
def line(x1, y1, x2, y2, c=INK, width=3, dash=''):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{width}" stroke-dasharray="{dash}"/>'
def head(x2, y2, ang, c, s=1.0):
    return (f'<path d="M {x2} {y2} l {-13 * s} {-7 * s} l 0 {14 * s} Z" fill="{c}" '
            f'transform="rotate({math.degrees(ang):.1f} {x2} {y2})"/>')
def arrow(x1, y1, x2, y2, c=BLUE, width=3, dash=''):
    return line(x1, y1, x2, y2, c, width, dash) + head(x2, y2, math.atan2(y2 - y1, x2 - x1), c)
def curve(x1, y1, cx1, cy1, cx2, cy2, x2, y2, c=BLUE, width=3, dash=''):
    """Cubic Bezier with an arrowhead at the end."""
    return (f'<path d="M {x1} {y1} C {cx1} {cy1} {cx2} {cy2} {x2} {y2}" fill="none" stroke="{c}" '
            f'stroke-width="{width}" stroke-dasharray="{dash}"/>' + head(x2, y2, math.atan2(y2 - cy2, x2 - cx2), c))
def path(d, c=BLUE, fill='none', width=4):
    return f'<path d="{d}" fill="{fill}" stroke="{c}" stroke-width="{width}" stroke-linejoin="round"/>'
def write(name, title, desc, parts, defs=''):
    (ROOT / name).write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 440" role="img" aria-labelledby="title desc">'
        f'<title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc>{defs}'
        f'<g font-family="Arial, sans-serif">' + ''.join(parts) + '</g></svg>\n')


# ---------------------------------------------------------------- Z-scheme
p = [text(430, 32, 'Light lifts each electron twice: the Z-scheme', 25)]
p += [arrow(28, 425, 28, 70, INK, 3), text(18, 250, 'Electron energy', 22, rotate=-90)]
chain1 = [(150, 115), (240, 165), (330, 220), (420, 275), (500, 320)]
chain2 = [(500, 70), (590, 118), (660, 165), (712, 198)]
p += [path('M ' + ' L '.join(f'{x} {y}' for x, y in chain1), BLUE, width=4),
      path('M ' + ' L '.join(f'{x} {y}' for x, y in chain2[:3]), BLUE, width=4),
      arrow(660, 165, 712, 198, BLUE, 4)]
p += [arrow(150, 365, 150, 128, GOLD, 7), text(132, 250, 'light', 24, GOLD, 'end'),
      arrow(500, 310, 500, 84, GOLD, 7), text(482, 200, 'light', 24, GOLD, 'end')]
for (x, y) in chain1[1:4] + chain2[1:3]:
    p.append(circle(x, y, 11))
p += [circle(150, 372, 16, LEAF, GREEN), circle(150, 115, 13, LEAF, GREEN),
      circle(500, 320, 16, LEAF, GREEN), circle(500, 70, 13, LEAF, GREEN)]
p += [text(165, 102, 'P680*', 22, anchor='start'), text(515, 60, 'P700*', 22, anchor='start'),
      text(150, 412, 'P680', 24, GREEN, weight='bold'), text(150, 436, 'photosystem II', 22, GREEN),
      text(500, 360, 'P700', 24, GREEN, weight='bold'), text(500, 384, 'photosystem I', 22, GREEN),
      arrow(65, 372, 128, 372, BLUE), text(60, 352, 'H₂O', 24, anchor='middle'), text(60, 405, '→ O₂', 22, RED),
      text(254, 152, 'PQ', 22, anchor='start'), text(345, 208, 'cyt b₆f', 22, anchor='start'),
      text(318, 255, 'pumps H⁺', 22, RED, 'end'), text(435, 268, 'PC', 22, anchor='start'),
      text(604, 106, 'Fd', 22, anchor='start'), text(675, 156, 'FNR', 22, anchor='start'),
      text(712, 236, 'NADP⁺', 22), text(712, 262, '→ NADPH', 22, GREEN, weight='bold')]
write('zscheme.svg', 'The Z-scheme of linear electron flow',
      'Electrons from water are lifted by light at photosystem II (P680), pass downhill through plastoquinone, '
      'cytochrome b6f (which pumps protons) and plastocyanin to photosystem I (P700), are lifted again by light, '
      'and pass through ferredoxin and FNR to reduce NADP+ to NADPH.', p)

# ---------------------------------------------------------------- thylakoid membrane, ATP synthase, cyclic flow
p = [rect(0, 0, 800, 180, CREAM, 'none', 0, 0), rect(0, 232, 800, 208, ROSE, 'none', 0, 0),
     rect(0, 180, 800, 52, '#d9ebf0', BLUE, 0, 2),
     text(12, 68, 'Stroma: pH ~8', 24, INK, 'start', 'bold'), text(12, 428, 'Lumen: pH ~5 (1000× more H⁺)', 24, RED, 'start', 'bold')]
for x, w, lab, tx in [(70, 100, 'PSII', 120), (235, 100, 'b₆f', 266), (385, 100, 'PSI', 435)]:
    p += [rect(x, 165, w, 82, LEAF, GREEN, 10), text(tx, 215, lab, 24, GREEN, weight='bold')]
p += [arrow(170, 206, 233, 206, INK, 3), arrow(335, 206, 383, 206, INK, 3)]
p += [arrow(105, 80, 112, 160, GOLD, 5), text(118, 104, 'light', 22, GOLD, 'start'),
      arrow(470, 80, 463, 160, GOLD, 5), text(480, 104, 'light', 22, GOLD, 'start')]
p += [text(120, 290, '2H₂O → O₂ + 4H⁺', 22, RED), arrow(312, 140, 312, 300, RED, 4), text(322, 320, 'H⁺', 24, RED, 'start'),
      text(302, 140, 'H⁺', 24, RED, 'end'),
      arrow(485, 172, 545, 130, GREEN, 3), text(552, 128, 'NADPH', 24, GREEN, 'start', 'bold')]
p += [curve(420, 162, 410, 95, 345, 95, 330, 160, GREEN, 3, '8 6'), text(378, 82, 'cyclic', 22, GREEN, weight='bold')]
# ATP synthase: membrane part + stalk + head in the stroma
p += [rect(655, 168, 70, 76, '#d6e3ef', BLUE, 8), rect(681, 120, 18, 50, '#d6e3ef', BLUE, 3), circle(690, 104, 34, '#d6e3ef', BLUE),
      text(690, 284, 'ATP synthase', 22, BLUE, weight='bold'), arrow(625, 360, 678, 250, RED, 4), text(615, 384, 'H⁺ flows back', 22, RED),
      text(690, 60, 'ADP + Pᵢ → ATP', 22, INK, weight='bold')]
for x, y in [(80, 360), (200, 380), (350, 370), (470, 340), (420, 300)]:
    p.append(text(x, y, 'H⁺', 22, RED))
write('thylakoid.svg', 'Proton gradient and ATP synthase in the thylakoid membrane',
      'Water splitting at photosystem II and pumping by cytochrome b6f fill the lumen with protons (pH about 5 against '
      'pH about 8 in the stroma). Protons flow back through ATP synthase, which makes ATP on the stroma side. '
      'Photosystem I reduces NADP+ to NADPH; in cyclic flow electrons return from PSI to cytochrome b6f.', p)

# ---------------------------------------------------------------- Calvin-Benson cycle
p = [text(400, 32, '3 CO₂ in, 1 triose phosphate out', 25)]
p += [rect(70, 85, 230, 70, LEAF, GREEN), text(185, 129, '3 RuBP (5C)', 25, weight='bold'),
      rect(500, 85, 230, 70), text(615, 129, '6 3-PGA (3C)', 25, weight='bold'),
      rect(285, 300, 230, 70, CREAM, GOLD), text(400, 344, '6 triose-P (3C)', 25, weight='bold')]
p += [arrow(305, 120, 494, 120, GREEN, 4), text(400, 98, '1 Carboxylation', 23, GREEN, weight='bold'),
      text(400, 150, '+ 3 CO₂ (Rubisco)', 22, GREEN)]
p += [arrow(612, 162, 480, 294, BLUE, 4), text(600, 222, '2 Reduction', 23, BLUE, 'start', 'bold'),
      text(600, 250, '6 ATP, 6 NADPH', 22, BLUE, 'start')]
p += [arrow(318, 294, 188, 162, GOLD, 4), text(205, 222, '3 Regeneration', 23, GOLD, 'end', 'bold'),
      text(225, 250, '5 triose-P, 3 ATP', 22, GOLD, 'end')]
p += [arrow(518, 335, 585, 335, RED, 4), text(595, 328, 'export 1:', 22, RED, 'start', 'bold'),
      text(595, 356, 'sucrose, starch', 22, RED, 'start')]
p += [text(400, 420, 'Carbon: 3 × 5C + 3 CO₂ = 18 C = 6 × 3C', 22)]
write('calvin-cycle.svg', 'The three phases of the Calvin-Benson cycle',
      'Rubisco carboxylates 3 RuBP with 3 CO2, giving 6 3-PGA. Reduction with 6 ATP and 6 NADPH gives 6 triose phosphates. '
      'Five of them regenerate 3 RuBP using 3 more ATP; one is exported for sucrose and starch.', p)

# ---------------------------------------------------------------- photorespiration across three organelles
p = [text(400, 32, 'Rubisco + O₂: the salvage route crosses three organelles', 25)]
p += [rect(15, 60, 255, 330, LEAF, GREEN, 30), text(142, 95, 'Chloroplast', 24, GREEN, weight='bold'),
      rect(290, 60, 220, 330, CREAM, GOLD, 30), text(400, 95, 'Peroxisome', 24, GOLD, weight='bold'),
      rect(530, 60, 255, 330, ROSE, RED, 30), text(657, 95, 'Mitochondrion', 24, RED, weight='bold')]
p += [text(142, 145, 'RuBP + O₂', 24, weight='bold'), arrow(142, 155, 142, 190, INK), text(152, 180, 'Rubisco', 22, GREEN, 'start'),
      text(142, 218, '2-phospho-', 22), text(142, 242, 'glycolate', 22), text(142, 270, '+ 3-PGA', 22)]
p += [arrow(205, 230, 345, 160, INK), text(400, 150, 'glycolate', 22), arrow(400, 160, 400, 195, INK),
      text(400, 218, 'glycine', 22)]
p += [arrow(445, 212, 590, 160, INK), text(657, 150, '2 glycine', 22), arrow(657, 160, 657, 195, INK),
      text(657, 220, 'serine', 22), text(657, 262, '+ CO₂ lost', 24, RED, weight='bold'),
      text(657, 292, '+ NH₃ to refix', 22, RED)]
p += [arrow(600, 228, 450, 300, INK), text(400, 320, 'glycerate', 22), arrow(340, 315, 245, 340, INK),
      text(142, 340, '3-PGA → Calvin', 22), text(142, 366, 'cycle', 22)]
p += [text(400, 425, 'Of 4 carbons in 2 glycolate, 3 return and 1 is lost as CO₂.', 22)]
write('photorespiration.svg', 'Photorespiration crosses chloroplast, peroxisome and mitochondrion',
      'Rubisco oxygenates RuBP to 3-PGA and 2-phosphoglycolate. Glycolate goes to the peroxisome and becomes glycine. '
      'In the mitochondrion two glycines give serine, CO2 and NH3. Serine returns via the peroxisome as glycerate, '
      'which re-enters the Calvin-Benson cycle as 3-PGA.', p)

# ---------------------------------------------------------------- C4 in space vs CAM in time
p = [text(200, 32, 'C4: separated in space', 25, GREEN, weight='bold'),
     text(600, 32, 'CAM: separated in time', 25, BLUE, weight='bold'), line(400, 15, 400, 380, '#9aa5ad', 2, '6 6')]
p += [rect(15, 100, 180, 230, LEAF, GREEN, 14), rect(210, 100, 180, 230, '#c6dcc4', GREEN, 14),
      text(105, 360, 'mesophyll', 22, GREEN), text(300, 360, 'bundle sheath', 22, GREEN)]
p += [arrow(105, 52, 105, 125, INK), text(120, 75, 'CO₂', 22, anchor='start'),
      text(105, 160, 'PEP', 22), text(105, 186, 'carboxylase', 22), arrow(105, 196, 105, 235, INK),
      text(105, 262, 'malate', 23, weight='bold'), arrow(150, 255, 228, 255, GOLD, 4),
      text(300, 140, 'malate', 23, weight='bold'), arrow(300, 150, 300, 180, INK), text(300, 205, 'CO₂ → Rubisco', 22),
      text(300, 235, 'Calvin cycle', 22), text(300, 282, 'high CO₂', 22, RED, weight='bold')]
p += [rect(410, 100, 180, 230, INK, INK, 14), rect(610, 100, 180, 230, CREAM, GOLD, 14),
      text(500, 360, 'night', 22, INK, weight='bold'), text(700, 360, 'day', 22, GOLD, weight='bold'),
      circle(560, 130, 13, '#f4f5f6', '#f4f5f6'), circle(566, 125, 12, INK, INK, 0)]
p += [text(500, 165, 'stomata open', 22, 'white'), text(500, 205, 'CO₂ → PEPC', 22, 'white'), arrow(500, 213, 500, 240, 'white'),
      text(500, 268, 'malate stored', 22, 'white', weight='bold'), text(500, 294, 'in vacuole', 22, 'white')]
p += [circle(763, 128, 14, '#f2c45a', GOLD), text(700, 165, 'stomata closed', 22),
      text(700, 205, 'malate → CO₂', 22), arrow(700, 213, 700, 240, INK), text(700, 268, 'Rubisco', 22, weight='bold'),
      text(700, 294, 'Calvin cycle', 22), arrow(595, 255, 625, 255, GOLD, 4)]
p += [text(400, 418, 'Same two enzymes in both: PEP carboxylase first, Rubisco last.', 22)]
write('c4-cam.svg', 'C4 separates CO2 fixation in space, CAM in time',
      'In C4 plants PEP carboxylase in mesophyll cells makes malate, which moves to bundle-sheath cells where CO2 is released '
      'to Rubisco. In CAM plants stomata open at night and malate is stored in the vacuole; by day stomata close and the '
      'malate releases CO2 to Rubisco in the same cell.', p)

# ---------------------------------------------------------------- Muench pressure flow
defs = (f'<defs><linearGradient id="press" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#7fb08a"/>'
        f'<stop offset="1" stop-color="#eef6ec"/></linearGradient></defs>')
p = [text(400, 32, 'Osmosis at the source drives bulk flow to the sink', 25)]
p += [rect(15, 60, 165, 330, LEAF, GREEN, 18), text(97, 100, 'SOURCE', 24, GREEN, weight='bold'), text(97, 128, '(leaf)', 22, GREEN),
      rect(620, 60, 165, 330, SAND, GOLD, 18), text(702, 100, 'SINK', 24, GOLD, weight='bold'), text(702, 128, '(root, fruit)', 22, GOLD)]
p += [f'<rect x="120" y="150" width="560" height="80" rx="8" fill="url(#press)" stroke="{GREEN}" stroke-width="3"/>',
      text(400, 142, 'phloem sieve tube', 22, GREEN, weight='bold'),
      rect(120, 320, 560, 44, '#d9ebf0', BLUE, 8), text(400, 395, 'xylem', 22, BLUE, weight='bold'),
      arrow(560, 342, 240, 342, BLUE, 3)]
for x, y in [(140, 215), (165, 168), (190, 212), (215, 165), (245, 214), (280, 168), (310, 214), (350, 170), (470, 168), (430, 216), (560, 216)]:
    p.append(circle(x, y, 6, '#f2c45a', GOLD, 2))
p += [arrow(55, 190, 125, 190, GOLD, 4), text(97, 250, '1 sucrose', 22, INK), text(97, 276, 'loaded', 22, INK)]
p += [arrow(220, 318, 220, 226, BLUE, 4), text(232, 285, '2 water in (osmosis)', 22, BLUE, 'start')]
p += [text(135, 197, '3 high pressure', 22, RED, 'start', 'bold')]
p += [arrow(355, 190, 540, 190, INK, 5), text(425, 258, '4 bulk flow', 22, INK, weight='bold')]
p += [arrow(675, 190, 750, 190, GOLD, 4), text(702, 250, '5 sucrose', 22, INK), text(702, 276, 'unloaded', 22, INK),
      arrow(600, 226, 600, 316, BLUE, 4), text(590, 280, 'water out', 22, BLUE, 'end'),
      text(665, 197, 'low', 22, RED, 'end', 'bold')]
p += [text(400, 432, 'Flow goes from high to low pressure, up or down the plant.', 22)]
write('pressure-flow.svg', 'The pressure-flow (Muench) model of phloem transport',
      'At the source, sucrose is loaded into the sieve tube, water follows from the xylem by osmosis and pressure rises. '
      'Sap moves by bulk flow to the sink, where sucrose is unloaded and water leaves, keeping the pressure low. '
      'Water returns in the xylem.', p, defs)


# ---------------------------------------------------------------- light-response curve (matplotlib)
def light_response():
    import numpy as np
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    plt.rcParams.update({'svg.fonttype': 'none', 'font.family': 'sans-serif',
                         'font.sans-serif': ['Arial', 'DejaVu Sans'], 'font.size': 22})
    I_obs = np.array([0, 50, 200, 800]); N_obs = np.array([-2, 0, 6, 9]); Rd = 2.0

    def gross(I, a, Pm, th):
        # non-rectangular hyperbola
        b = a * I + Pm
        return (b - np.sqrt(np.maximum(b * b - 4 * th * a * I * Pm, 0))) / (2 * th)
    best = None
    for a in np.linspace(0.03, 0.06, 61):
        for Pm in np.linspace(9.5, 14, 91):
            for th in np.linspace(0.3, 0.99, 70):
                err = np.sum((gross(I_obs, a, Pm, th) - Rd - N_obs) ** 2)
                if best is None or err < best[0]:
                    best = (err, a, Pm, th)
    _, a, Pm, th = best
    I = np.linspace(0, 1200, 400); N = gross(I, a, Pm, th) - Rd
    fig, ax = plt.subplots(figsize=(800 / 72, 440 / 72), dpi=72)
    fig.subplots_adjust(left=0.11, right=0.97, top=0.95, bottom=0.17)
    ax.axhline(0, color=INK, lw=1.5)
    ax.plot(I, N, color=BLUE, lw=4)
    ax.plot(I_obs, N_obs, 'o', ms=11, color=INK, zorder=3)
    ax.set_xlim(-20, 1200); ax.set_ylim(-4, 12)
    ax.set_xlabel('Light (µmol photons m⁻² s⁻¹)', color=INK)
    ax.set_ylabel('Net CO₂ uptake\n(µmol m⁻² s⁻¹)', color=INK)
    ax.tick_params(colors=INK, labelsize=20)
    for s in ['top', 'right']:
        ax.spines[s].set_visible(False)
    ax.annotate('dark respiration (−2)', (0, -2), (90, -3.3), color=RED, fontsize=22,
                arrowprops=dict(arrowstyle='->', color=RED, lw=2))
    ax.annotate('compensation point (50)', (50, 0), (160, 1.0), color=GREEN, fontsize=22,
                arrowprops=dict(arrowstyle='->', color=GREEN, lw=2))
    ax.text(70, 7.2, 'light-limited:\nsteep slope', color=GOLD, fontsize=22)
    ax.text(700, 10.4, 'saturated: CO₂ / Rubisco limit', color=GOLD, fontsize=22, ha='center')
    ax.annotate('', (200, 6), (200, -2), arrowprops=dict(arrowstyle='<->', color=INK, lw=1.5, ls='--'))
    ax.text(215, 3.6, 'gross = 6 + 2', fontsize=20, color=INK)
    fig.savefig(ROOT / 'light-response.svg', format='svg')
    plt.close(fig)
    print(f'light response fit: alpha={a:.4f} Pmax={Pm:.2f} theta={th:.2f}; net at data:',
          [round(float(v), 2) for v in gross(I_obs, a, Pm, th) - Rd])


light_response()
