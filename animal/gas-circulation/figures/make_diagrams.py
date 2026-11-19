"""Explanatory figures for A3 (gas exchange and circulation).

Run from any directory with Python 3 (matplotlib >= 3.8 for the plotted curves).
Same palette and 800x440 frame as animal/organisation/figures/make_diagrams.py.
"""
from pathlib import Path
from html import escape
import math

ROOT = Path(__file__).parent
BLUE = '#267a91'; RED = '#b64853'; GREEN = '#397646'; INK = '#243645'; PALE = '#eaf3f5'; GOLD = '#b37a22'
GREY = '#8b969d'; PALERED = '#f5dadd'; PALEGREEN = '#e2eedf'; PALEGOLD = '#fff4df'


# ---------------------------------------------------------------- hand-drawn SVG helpers
def text(x, y, s, size=24, colour=INK, anchor='middle', weight='normal'):
    return ''.join(f'<text x="{x}" y="{y + i * (size + 6)}" font-size="{size}" fill="{colour}" '
                   f'text-anchor="{anchor}" font-weight="{weight}">{escape(line)}</text>'
                   for i, line in enumerate(s.split('\n')))


def rect(x, y, w, h, fill=PALE, stroke=BLUE, r=6, width=3):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'


def circle(x, y, r, fill=PALE, stroke=BLUE, width=3):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'


def line(x1, y1, x2, y2, c=INK, width=3, dash=''):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{width}" stroke-dasharray="{dash}"/>'


def arrow(x1, y1, x2, y2, c=BLUE, width=3):
    ang = math.degrees(math.atan2(y2 - y1, x2 - x1))
    return (line(x1, y1, x2, y2, c, width) +
            f'<path d="M {x2} {y2} l -14 -8 l 0 16 Z" fill="{c}" transform="rotate({ang:.1f} {x2} {y2})"/>')


def path(d, c=BLUE, fill='none', width=4):
    return f'<path d="{d}" fill="{fill}" stroke="{c}" stroke-width="{width}" stroke-linejoin="round"/>'


def write(name, title, desc, parts):
    (ROOT / name).write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 440" role="img" aria-labelledby="title desc">'
        f'<title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc>'
        f'<rect width="800" height="440" fill="white"/><g font-family="Arial, sans-serif">' + ''.join(parts) + '</g></svg>\n')


# ---------------------------------------------------------------- 1. the O2 route
p = [text(400, 34, 'Bulk flow and diffusion alternate', 26, weight='bold')]
stations = [(80, 'Air', PALE, BLUE), (240, 'Alveolus', PALE, BLUE), (400, 'Lung\ncapillary', PALERED, RED),
            (560, 'Muscle\ncapillary', PALERED, RED), (720, 'Mito-\nchondrion', PALEGREEN, GREEN)]
for x, lab, f, s in stations:
    p += [circle(x, 175, 56, f, s), text(x, 170 if '\n' in lab else 183, lab, 22)]
steps = [(80, 240, 'Ventilation', 'bulk flow', BLUE), (240, 400, 'Across ~0.5 µm', 'diffusion', GOLD),
         (400, 560, 'Circulation', 'bulk flow', RED), (560, 720, 'Across a few µm', 'diffusion', GOLD)]
for i, (a, b, top, kind, c) in enumerate(steps):
    y = 280 if i % 2 == 0 else 320
    p += [arrow(a + 58, 175, b - 60, 175, c, 4 if kind == 'bulk flow' else 3)]
    p += [text((a + b) / 2, y, top, 22, c), text((a + b) / 2, y + 28, kind, 22, c, weight='bold')]
p += [line(70, 368, 730, 368, GREY, 2), text(400, 405, 'Bulk flow: driven by total pressure, needs a pump', 22),
      text(400, 433, 'Diffusion: driven by partial pressure, only over µm', 22)]
write('o2-route.svg', 'The route of oxygen from air to mitochondrion',
      'Oxygen moves by ventilation (bulk flow) to the alveolus, diffuses into the lung capillary, is carried by the '
      'circulation (bulk flow) to a muscle capillary and diffuses to the mitochondrion.', p)

# ---------------------------------------------------------------- 2. double circulation
p = [text(400, 32, 'Two circuits in series, one heart', 26, weight='bold')]
# lungs on top, body below, heart in the middle (right heart drawn on the left, as seen from the front)
p += [rect(250, 55, 300, 70, PALE, BLUE, 30), text(400, 98, 'Lung capillaries', 24)]
p += [rect(250, 330, 300, 70, PALE, BLUE, 30), text(400, 373, 'Body capillaries', 24)]
p += [rect(255, 175, 130, 110, PALE, BLUE, 14), text(320, 222, 'Right', 24, BLUE, weight='bold'), text(320, 252, 'heart', 22, BLUE)]
p += [rect(415, 175, 130, 110, PALERED, RED, 14), text(480, 222, 'Left', 24, RED, weight='bold'), text(480, 252, 'heart', 22, RED)]
# loops: right heart -> lungs -> left heart -> body -> right heart
p += [path('M290 175 C 230 160 200 120 245 95', BLUE, width=5), arrow(240, 100, 252, 92, BLUE)]
p += [path('M555 92 C 610 110 600 160 548 178', RED, width=5), arrow(556, 172, 547, 178, RED)]
p += [path('M520 285 C 600 300 600 340 555 362', RED, width=5), arrow(562, 358, 551, 364, RED)]
p += [path('M248 362 C 200 340 200 300 252 282', BLUE, width=5), arrow(245, 286, 255, 281, BLUE)]
p += [text(160, 150, 'Pulmonary\narteries', 22, BLUE), text(650, 140, 'Pulmonary\nveins', 22, RED),
      text(655, 315, 'Aorta,\narteries', 22, RED), text(140, 318, 'Veins,\nvenae cavae', 22, BLUE)]
p += [text(400, 430, 'O₂-poor blood in blue, O₂-rich in red; arteries leave the heart', 21)]
write('double-circulation.svg', 'The mammalian double circulation',
      'The right heart pumps O2-poor blood through the pulmonary arteries to the lung capillaries; pulmonary veins '
      'return O2-rich blood to the left heart, which pumps it through the aorta to the body capillaries; veins return '
      'it to the right heart.', p)

# ---------------------------------------------------------------- 3. CO2 transport in a red cell
p = [text(400, 32, 'In tissue capillaries: CO₂ becomes bicarbonate', 26, weight='bold')]
p += [rect(40, 70, 150, 300, PALEGREEN, GREEN, 10), text(115, 205, 'Tissue', 24, GREEN), text(115, 235, 'cell', 24, GREEN)]
p += [f'<ellipse cx="470" cy="220" rx="225" ry="150" fill="{PALERED}" stroke="{RED}" stroke-width="3"/>',
      text(470, 100, 'Red blood cell', 22, RED)]
p += [arrow(195, 150, 290, 150, INK), text(242, 135, 'CO₂', 22)]
p += [text(300, 158, 'CO₂ + H₂O', 24, anchor='start'), arrow(425, 150, 490, 150, GOLD), text(457, 130, 'CA', 20, GOLD, weight='bold'),
      text(500, 158, 'H⁺ + HCO₃⁻', 24, anchor='start')]
p += [arrow(530, 170, 530, 225, INK), text(540, 255, 'H⁺ binds Hb,', 22), text(540, 283, 'which releases O₂', 22)]
p += [arrow(420, 300, 200, 300, RED), text(300, 335, 'O₂ to tissue', 22, RED)]
p += [arrow(685, 175, 785, 175, BLUE), text(740, 155, 'HCO₃⁻', 22, BLUE)]
p += [arrow(785, 245, 690, 245, GREEN), text(745, 275, 'Cl⁻', 22, GREEN)]
p += [text(400, 410, 'CA = carbonic anhydrase.  In the lung all steps run in reverse.', 22)]
write('co2-red-cell.svg', 'Carbon dioxide handling by a red blood cell',
      'CO2 from a tissue cell enters a red blood cell, where carbonic anhydrase converts it with water to H+ and '
      'bicarbonate. Bicarbonate leaves in exchange for chloride; H+ binds haemoglobin and helps it release O2.', p)

# ---------------------------------------------------------------- artery, vein and capillary in section
MUSCLE = '#e7b9b0'
p = [text(400, 32, 'Same flow, different pressure, different wall', 26, weight='bold')]
# artery: thick muscular wall, round lumen, wavy elastic lamina
p += [circle(190, 200, 120, MUSCLE, RED), circle(190, 200, 62, 'white', RED)]
wav = ' '.join(f'{"M" if i == 0 else "L"}{190 + (68 + 4 * math.sin(i * 1.2)) * math.cos(i * math.pi / 36):.1f} '
               f'{200 + (68 + 4 * math.sin(i * 1.2)) * math.sin(i * math.pi / 36):.1f}' for i in range(73))
p += [path(wav, GOLD, width=3)]
p += [text(190, 360, 'Artery', 26, RED, weight='bold'), text(190, 392, 'thick wall: smooth muscle', 22),
      text(190, 420, 'and elastic tissue; round', 22)]
# vein: thin wall, wide flattened lumen
p += [f'<ellipse cx="560" cy="185" rx="150" ry="88" fill="{PALE}" stroke="{BLUE}" stroke-width="12"/>',
      f'<ellipse cx="560" cy="185" rx="138" ry="76" fill="white" stroke="none"/>']
p += [text(560, 335, 'Vein', 26, BLUE, weight='bold'), text(560, 367, 'thin wall, wide lumen;', 22),
      text(560, 395, 'often collapsed in a section', 22)]
# capillary inset
p += [circle(735, 300, 14, 'white', GREEN, 4), circle(735, 300, 5, '#d9534f', '#d9534f', 1),
      text(735, 266, 'Capillary', 20, GREEN), text(735, 342, '1 cell thick', 20, GREEN)]
write('artery-vein.svg', 'Artery, vein and capillary in cross-section',
      'An artery has a thick round wall of smooth muscle with an elastic layer; the vein beside it has a thin wall and '
      'a wider, flattened lumen; a capillary is a single endothelial cell around a lumen the width of one red cell.', p)

# ---------------------------------------------------------------- plotted curves (matplotlib)
try:
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    import numpy as np
except ImportError:  # the hand-drawn figures above still get written
    raise SystemExit('matplotlib not available: skipped the plotted figures')

plt.rcParams.update({
    'font.family': 'sans-serif', 'font.sans-serif': ['Arial', 'Liberation Sans', 'DejaVu Sans'], 'font.size': 17, 'svg.fonttype': 'none',
    'axes.edgecolor': INK, 'axes.labelcolor': INK, 'xtick.color': INK, 'ytick.color': INK, 'text.color': INK,
    'axes.spines.top': False, 'axes.spines.right': False, 'axes.linewidth': 1.5,
    'xtick.labelsize': 16, 'ytick.labelsize': 16, 'svg.hashsalt': 'a3',
})


def fig():
    return plt.subplots(figsize=(8, 4.4))  # 800 x 440 frame, same aspect as the hand-drawn figures


def save(f, name, title, desc):
    f.savefig(ROOT / name, format='svg', metadata={'Title': title, 'Description': desc, 'Date': None, 'Creator': None})
    plt.close(f)


def hill(p, p50, n=2.7):
    return 100 * p ** n / (p ** n + p50 ** n)


P = np.linspace(0, 16, 400)

# 4. the sigmoid curve with the reference points from the slide
f, ax = fig()
ax.plot(P, hill(P, 3.5), color=RED, lw=4)
for p_, lab, dx, dy in [(13.3, 'Arterial', 0, 8), (5.3, 'Venous, rest', 0.4, -8), (3.5, '$P_{50}$', 0.4, -10),
                        (2.7, 'Exercising muscle', 0.4, -9)]:
    s = hill(p_, 3.5)
    ax.plot(p_, s, 'o', ms=10, color=INK, zorder=3)
    ax.annotate(lab, (p_, s), (p_ + dx, s + dy), fontsize=17, ha='left' if dx > 0 else 'right' if dx < 0 else 'center', va='center')
ax.plot([3.5, 3.5, 0], [0, 50, 50], color=GREY, lw=1.5, ls='--')
ax.annotate('', xy=(15.2, hill(5.3, 3.5)), xytext=(15.2, 97.5), arrowprops=dict(arrowstyle='<->', color=BLUE, lw=2.5))
ax.text(14.9, 84, 'Unloaded\nat rest', color=BLUE, fontsize=17, va='center', ha='right')
ax.set_xlim(0, 16); ax.set_ylim(0, 110)
ax.set_xlabel('$P_{O_2}$ (kPa)'); ax.set_ylabel('Hb saturation (%)')
f.tight_layout()
save(f, 'dissociation-curve.svg', 'The O2-haemoglobin dissociation curve',
     'Sigmoid Hill curve with n 2.7 and P50 3.5 kPa. Arterial blood at 13.3 kPa is 97 percent saturated, mixed venous '
     'blood at 5.3 kPa is 75 percent, and venous blood from exercising muscle at 2.7 kPa is about 33 percent.')

# 5. Bohr shift: same arterial loading, more unloading at the same tissue PO2
f, ax = fig()
p50n, p50r = 3.5, 4.9          # normal; warm, acidic muscle (pH 7.2, 39 degC: log P50 +0.096 +0.048)
ax.plot(P, hill(P, p50n), color=BLUE, lw=4, label='Normal (pH 7.4, 37 °C)')
ax.plot(P, hill(P, p50r), color=RED, lw=4, label='Working muscle (pH 7.2, 39 °C)')
pt = 2.7
sn, sr = hill(pt, p50n), hill(pt, p50r)
ax.axvline(pt, color=GREY, lw=1.5, ls='--')
ax.text(pt + 0.2, 4, 'Muscle $P_{O_2}$', fontsize=16, color=INK)
ax.plot([pt, pt], [sr, sn], color=GOLD, lw=6, solid_capstyle='butt')
ax.annotate(f'{sn - sr:.0f} % more\nof Hb unloads', (pt, (sn + sr) / 2), (0.2, 80), fontsize=17, color=GOLD,
            arrowprops=dict(arrowstyle='->', color=GOLD, lw=2))
ax.plot([p50n, p50r], [50, 50], 'o', ms=8, color=INK)
ax.annotate('', xy=(p50r, 50), xytext=(p50n, 50), arrowprops=dict(arrowstyle='->', color=INK, lw=2))
ax.text(p50r + 0.3, 47, '$P_{50}$ rises: right shift', fontsize=16, va='top')
ax.set_xlim(0, 16); ax.set_ylim(0, 105)
ax.set_xlabel('$P_{O_2}$ (kPa)'); ax.set_ylabel('Hb saturation (%)')
ax.legend(loc='lower right', frameon=False, fontsize=16)
f.tight_layout()
save(f, 'bohr-shift.svg', 'The Bohr shift',
     'Two dissociation curves. Lowering pH to 7.2 and raising temperature to 39 degrees moves P50 from 3.5 to about 4.9 kPa. '
     'Loading at 13.3 kPa barely changes, but at a muscle PO2 of 2.7 kPa saturation falls from about 33 to 20 percent.')

# 6. countercurrent versus co-current profiles (equal capacity rates, same exchanger: NTU = 5)
x = np.linspace(0, 1, 200)
ntu = 5.0
co_d = 18 * np.exp(-2 * ntu * x)
co_w, co_b = 11 + co_d / 2, 11 - co_d / 2
cc_w = 20 - 15 * x                    # water 20 -> 5 along the flow
cc_b = cc_w - 3                       # blood enters at x = 1 with 2 kPa, leaves at x = 0 with 17 kPa
f, axs = plt.subplots(1, 2, figsize=(8, 4.4), sharey=True)
for ax, w, b, ttl, back in [(axs[0], cc_w, cc_b, 'Countercurrent', True), (axs[1], co_w, co_b, 'Co-current', False)]:
    ax.fill_between(x, b, w, color=PALEGOLD)
    ax.plot(x, w, color=BLUE, lw=4); ax.plot(x, b, color=RED, lw=4)
    ax.set_title(ttl, fontsize=19, color=INK, fontweight='bold')
    ax.set_xticks([0, 1]); ax.set_xticklabels(['start', 'end'])
    ax.set_xlim(-0.02, 1.02); ax.set_ylim(0, 22)
    ax.text(0.5, w[100] + (2.6 if back else 1.2), 'water →', color=BLUE, fontsize=17, ha='center')
    ax.text(0.5, b[100] - (4.2 if back else 2.6), '← blood' if back else 'blood →', color=RED, fontsize=17, ha='center')
    out = b[0] if back else b[-1]
    ax.plot(0 if back else 1, out, 'o', ms=10, color=RED, clip_on=False, zorder=4)
    ax.text(0.03 if back else 0.97, 0.8, f'blood leaves\nat {out:.0f} kPa', fontsize=16, color=RED,
            ha='left' if back else 'right', va='bottom')
axs[0].set_ylabel('$P_{O_2}$ (kPa)')
f.supxlabel('Position along the gill lamella', fontsize=17)
f.tight_layout()
save(f, 'countercurrent.svg', 'Countercurrent versus co-current exchange',
     'With the same inlets and exchanger, countercurrent flow keeps a 3 kPa gradient along the whole lamella so blood '
     'leaves at 17 kPa; co-current flow loses its gradient and blood leaves at 11 kPa, equal to the water outlet.')

# 7. the PO2 cascade
f, ax = fig()
sites = ['Dry air', 'Alveolar\nair', 'Arterial\nblood', 'Mixed\nvenous', 'Mito-\nchondria']
vals = [21.2, 13.3, 13.0, 5.3, 0.5]
cols = [BLUE, BLUE, RED, '#7b5fa0', GREEN]
ax.bar(range(5), vals, color=cols, width=0.62)
for i, v in enumerate(vals):
    ax.text(i, v + 0.6, '< 1' if v < 1 else f'{v:g}', ha='center', fontsize=17)
for i in range(4):
    ax.annotate('', xy=(i + 0.72, vals[i + 1] + 2.5), xytext=(i + 0.28, vals[i] + 2.5),
                arrowprops=dict(arrowstyle='->', color=GREY, lw=2))
ax.set_xticks(range(5)); ax.set_xticklabels(sites, fontsize=16)
ax.set_ylabel('$P_{O_2}$ (kPa)'); ax.set_ylim(0, 25)
f.tight_layout()
save(f, 'po2-cascade.svg', 'The oxygen partial-pressure cascade',
     'PO2 falls stepwise from 21.2 kPa in dry air to 13.3 in alveolar air, about 13 in arterial blood, 5.3 in mixed '
     'venous blood and below 1 kPa in mitochondria.')

# 8. Poiseuille: flow against radius at constant pressure
f, ax = fig()
r = np.linspace(0.5, 1.3, 200)
ax.plot(r, r ** 4, color=RED, lw=4)
for rr, lab, tx, ty, ha in [(0.5, '½ r → 1/16 flow', 0.52, 0.75, 'left'), (1.0, 'resting radius', 1.03, 0.72, 'left'),
                            (1.19, '+19 % → 2× flow', 1.15, 2.1, 'right')]:
    ax.plot(rr, rr ** 4, 'o', ms=10, color=INK)
    ax.text(tx, ty, lab, fontsize=17, ha=ha)
ax.set_xlabel('Arteriole radius (relative)'); ax.set_ylabel('Flow (relative)')
ax.set_xlim(0.45, 1.32); ax.set_ylim(0, 3)
f.tight_layout()
save(f, 'radius-flow.svg', 'Flow rises with the fourth power of radius',
     'At constant pressure, flow is proportional to radius to the fourth power: halving the radius gives one '
     'sixteenth of the flow and widening it by 19 percent doubles the flow.')
