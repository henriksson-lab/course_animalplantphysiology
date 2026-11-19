"""Original explanatory figures for A4 (water, ions and excretion).

Run from any directory with Python 3 (matplotlib needed for the plotted figures):
    python3 animal/water-excretion/figures/make_diagrams.py
Hand-drawn schematics use the A1 helpers and palette (800 x 440 viewBox, labels >= 22 px);
quantitative curves are drawn with matplotlib at the same size and in the same colours.
"""
from pathlib import Path
from html import escape
import math

ROOT = Path(__file__).parent
BLUE = '#267a91'; RED = '#b64853'; GREEN = '#397646'; INK = '#243645'; PALE = '#eaf3f5'; GOLD = '#b37a22'
PINK = '#f5dadd'; SAND = '#fff4df'; LEAF = '#e4efdf'; GREY = '#f4f5f6'


def text(x, y, s, size=25, colour=INK, anchor='middle', weight='normal'):
    return ''.join(f'<text x="{x}" y="{y+i*int(size*1.2)}" font-size="{size}" fill="{colour}" text-anchor="{anchor}" font-weight="{weight}">{escape(line)}</text>'
                   for i, line in enumerate(s.split('\n')))


def rect(x, y, w, h, fill=PALE, stroke=BLUE, r=6, width=3):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'


def circle(x, y, r, fill=PALE, stroke=BLUE, width=3):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'


def line(x1, y1, x2, y2, c=INK, width=3, dash=''):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{width}" stroke-dasharray="{dash}"/>'


def arrow(x1, y1, x2, y2, c=BLUE, width=3):
    ang = math.degrees(math.atan2(y2 - y1, x2 - x1))
    return line(x1, y1, x2, y2, c, width) + f'<path d="M {x2} {y2} l -14 -8 l 0 16 Z" fill="{c}" transform="rotate({ang:.1f} {x2} {y2})"/>'


def path(d, c=BLUE, fill='none', width=4, dash=''):
    return f'<path d="{d}" fill="{fill}" stroke="{c}" stroke-width="{width}" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="{dash}"/>'


def write(name, title, desc, parts, defs=''):
    (ROOT / name).write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 440" role="img" aria-labelledby="title desc">'
        f'<title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc>{defs}'
        f'<g font-family="Arial, sans-serif">' + ''.join(parts) + '</g></svg>\n')


def fish(x, y, s=1.0, fill=PALE, stroke=BLUE):
    """A simple side-view fish centred at (x, y), facing right."""
    d = (f'M{x-110*s} {y} C{x-60*s} {y-60*s} {x+60*s} {y-60*s} {x+110*s} {y} '
         f'C{x+60*s} {y+60*s} {x-60*s} {y+60*s} {x-110*s} {y} Z')
    tail = f'M{x-105*s} {y} L{x-160*s} {y-38*s} L{x-150*s} {y} L{x-160*s} {y+38*s} Z'
    gill = f'M{x+52*s} {y-30*s} C{x+38*s} {y-10*s} {x+38*s} {y+10*s} {x+52*s} {y+30*s}'
    return [path(tail, stroke, fill, 3), path(d, stroke, fill, 3), path(gill, RED, 'none', 4), circle(x + 80 * s, y - 12 * s, 6, INK, INK, 1)]


# ---------------------------------------------------------------------------
# Freshwater and marine teleosts: the same organs, opposite fluxes.
p = [rect(8, 8, 386, 424, '#eef6fb', BLUE, 14, 2), rect(406, 8, 386, 424, '#dfeaf2', BLUE, 14, 2),
     text(200, 45, 'Fresh water ~5 mOsm', 24, BLUE, weight='bold'), text(600, 45, 'Seawater ~1,000 mOsm', 24, BLUE, weight='bold')]
p += fish(215, 200) + fish(610, 200)
p += [text(205, 207, 'body 300', 22), text(600, 207, 'body 350', 22)]
# freshwater: water in, salt out, much dilute urine, gills take up NaCl
p += [arrow(165, 95, 165, 148, BLUE), text(165, 85, 'water in', 22, BLUE),
      arrow(335, 125, 282, 165, GREEN), text(320, 88, 'gills take\nup NaCl', 22, GREEN),
      arrow(235, 248, 262, 300, RED), text(262, 330, 'salt leaks out', 22, RED),
      arrow(125, 235, 125, 368, GOLD, 7), text(40, 400, 'lots of dilute urine', 22, GOLD, 'start')]
# marine: water out, salt in, drinks, gills secrete NaCl, little urine
p += [arrow(560, 148, 560, 95, BLUE), text(560, 85, 'water out', 22, BLUE),
      arrow(772, 135, 730, 185, BLUE), text(772, 118, 'drinks', 22, BLUE, 'end'),
      arrow(672, 225, 722, 290, GREEN), text(785, 318, 'gills secrete\nNaCl', 22, GREEN, 'end'),
      arrow(590, 305, 605, 252, RED), text(545, 335, 'salt leaks in', 22, RED),
      arrow(522, 232, 522, 368, GOLD, 2), text(440, 400, 'little urine', 22, GOLD, 'start')]
write('teleosts.svg', 'Freshwater and marine teleosts have opposite problems',
      'A freshwater fish gains water and loses salt, so it makes much dilute urine and takes up NaCl at the gills. '
      'A marine fish loses water and gains salt, so it drinks, secretes NaCl at the gills and makes little urine.', p)

# ---------------------------------------------------------------------------
# The transporting epithelial cell.
p = [text(110, 40, 'Lumen', 26, INK, weight='bold'), text(690, 40, 'Blood side', 26, INK, weight='bold'),
     rect(10, 60, 200, 330, SAND, GOLD, 8, 2), rect(590, 60, 200, 330, PINK, RED, 8, 2),
     rect(230, 70, 340, 310, PALE, BLUE, 30, 4),
     text(400, 120, 'Cell', 26, BLUE, weight='bold'), text(400, 155, 'Na⁺ 15 mmol L⁻¹', 23), text(400, 190, 'inside −70 mV', 23),
     text(110, 105, 'Na⁺ 140', 24), text(690, 105, 'Na⁺ 140', 24),
     text(230, 422, 'apical membrane', 22, BLUE), text(570, 422, 'basolateral', 22, BLUE)]
# apical channel or cotransporter (passive)
p += [rect(219, 205, 22, 50, '#b8d9e2', BLUE, 4), arrow(70, 230, 320, 230, BLUE),
      text(110, 275, 'passive:\nchannel or\ncotransporter', 22, BLUE)]
# basolateral Na+/K+-ATPase
p += [circle(570, 232, 28, GOLD, GOLD), text(570, 240, 'ATP', 20, 'white', weight='bold'),
      arrow(480, 212, 700, 212, RED), text(690, 195, '3 Na⁺', 23, RED), arrow(700, 255, 605, 255, GREEN), text(690, 290, '2 K⁺', 23, GREEN),
      text(690, 325, 'Na⁺/K⁺-ATPase', 22, RED)]
# water follows osmotically
p += [line(30, 360, 750, 360, BLUE, 3, '10 7'), f'<path d="M 768 360 l -18 -9 l 0 18 Z" fill="{BLUE}"/>',
      text(400, 345, 'water follows (osmosis)', 22, BLUE)]
write('epithelial-cell.svg', 'A polarised transporting epithelial cell',
      'Na+ enters the cell passively across the apical membrane through channels or cotransporters. '
      'The basolateral Na+/K+-ATPase pumps 3 Na+ to the blood side and 2 K+ into the cell. Water follows osmotically.', p)

# ---------------------------------------------------------------------------
# The nephron: segments and the four processes.
p = [rect(0, 60, 800, 150, SAND, 'none', 0, 0), rect(0, 210, 800, 230, '#f6e6d4', 'none', 0, 0),
     text(790, 95, 'cortex', 24, GOLD, 'end'), text(10, 430, 'medulla', 24, GOLD, 'start'), line(0, 210, 800, 210, GOLD, 2, '8 6')]
# Bowman's capsule + glomerulus
p += [path('M140 105 A 48 48 0 1 0 140 175', BLUE, 'none', 7), circle(118, 140, 28, PINK, RED), text(118, 40, 'glomerulus', 23, RED),
      arrow(60, 140, 88, 140, RED)]
# proximal convoluted tubule
pt = 'M140 105 C 180 80, 220 130, 250 100 C 280 70, 310 140, 330 120'
# descending and ascending limbs
loop = 'M330 120 L 340 380 C 345 420, 395 420, 400 380 L 410 160'
dct = 'M410 160 C 430 100, 470 140, 500 100 C 530 70, 560 130, 590 110'
cd = 'M590 110 L 640 90 L 640 420'
p += [path(pt, BLUE, 'none', 9), path(loop, BLUE, 'none', 9), path(dct, GREEN, 'none', 9), path(cd, INK, 'none', 11)]
p += [text(240, 165, 'proximal\ntubule', 22, BLUE), text(250, 300, 'loop of\nHenle', 22, BLUE), text(520, 160, 'distal\ntubule', 22, GREEN),
      text(670, 300, 'collecting\nduct', 22, INK, 'start'), arrow(640, 395, 640, 432, INK)]
# process arrows: filtration, reabsorption, secretion
p += [text(25, 232, '1 filtration', 22, RED, 'start'),
      arrow(260, 105, 260, 50, GREEN), text(275, 45, '2 reabsorption', 22, GREEN, 'start'),
      arrow(470, 40, 470, 105, GOLD), text(485, 45, '3 secretion', 22, GOLD, 'start'),
      text(622, 425, '4 excretion: urine', 22, INK, 'end')]
write('nephron.svg', 'The nephron and its four processes',
      'Plasma is filtered from the glomerulus into Bowman\'s capsule. The fluid passes the proximal tubule, the loop of Henle '
      'dipping into the medulla, the distal tubule and the collecting duct. Reabsorption returns substances to the blood, '
      'secretion adds them to the tubule, and what remains is excreted.', p)

# ---------------------------------------------------------------------------
# The medullary osmotic gradient and the loop of Henle.
defs = ('<defs><linearGradient id="med" x1="0" y1="0" x2="0" y2="1">'
        '<stop offset="0" stop-color="#fdf6ea"/><stop offset="1" stop-color="#d9a35f"/></linearGradient></defs>')
p = [rect(0, 80, 800, 360, 'url(#med)', 'none', 0, 0), text(400, 38, 'Interstitial osmolarity rises from cortex to inner medulla', 24)]
for y, v in [(110, '300'), (210, '600'), (310, '900'), (410, '1,200')]:
    p += [line(0, y, 60, y, GOLD, 2), text(70, y + 8, v, 22, INK, 'start')]
p += [text(70, 75, 'mOsm L⁻¹', 22, INK, 'start')]
# descending limb (water out), thick ascending limb (NaCl out, no water)
p += [path('M300 80 L 300 380 C 300 425, 380 425, 380 380 L 380 80', BLUE, 'none', 12),
      arrow(300, 92, 300, 138, 'white', 3), arrow(380, 138, 380, 92, 'white', 3)]
for y in (180, 270, 360):
    p += [arrow(290, y, 238, y, BLUE), text(228, y + 8, 'H₂O', 22, BLUE, 'end')]
    p += [arrow(392, y, 446, y, RED), text(456, y + 8, 'NaCl', 22, RED, 'start')]
p += [text(340, 435, 'loop of Henle', 22, BLUE),
      text(205, 105, 'descending:\nwater leaves', 22, BLUE), text(470, 105, 'thick ascending:\nNaCl out, no water', 22, RED, 'start')]
# collecting duct
p += [path('M730 80 L 730 430', INK, 'none', 12), arrow(730, 92, 730, 140, 'white', 3)]
for y in (270, 360):
    p += [arrow(718, y, 668, y, BLUE)]
p += [text(625, 215, 'with ADH:\nwater leaves', 22, INK)]
write('medullary-gradient.svg', 'The loop of Henle builds the medullary gradient',
      'Interstitial osmolarity rises from 300 mOsm per litre in the cortex to 1200 in the inner medulla. '
      'Water leaves the descending limb; the thick ascending limb pumps NaCl out without water. '
      'With ADH, water leaves the collecting duct into the concentrated medulla.', p, defs)


# ---------------------------------------------------------------------------
# Plotted figures (matplotlib), same size and colours as the schematics.
def plots():
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 22, 'axes.edgecolor': INK, 'axes.labelcolor': INK,
                         'xtick.color': INK, 'ytick.color': INK, 'text.color': INK, 'axes.linewidth': 1.5,
                         'svg.fonttype': 'none', 'axes.spines.top': False, 'axes.spines.right': False})

    def fig():
        return plt.figure(figsize=(800 / 72, 440 / 72), dpi=72)

    def save(f, name, title):
        f.savefig(ROOT / name, format='svg', metadata={'Title': title, 'Date': None})
        plt.close(f)

    # Conformers and regulators
    f = fig(); ax = f.add_axes([0.13, 0.19, 0.83, 0.74])
    x = [0, 1100]
    ax.plot(x, x, color=GOLD, lw=4, label='conformer')
    ax.plot([0, 1100], [300, 300], color=BLUE, lw=4, label='regulator')
    ax.scatter([1000], [1000], s=150, color=GOLD, zorder=3); ax.annotate('mussel', (1000, 1000), (700, 1000), fontsize=22, color=GOLD, va='center')
    ax.scatter([5], [300], s=150, color=BLUE, zorder=3); ax.annotate('goldfish', (5, 300), (30, 180), fontsize=22, color=BLUE)
    ax.scatter([1000], [350], s=150, color=BLUE, zorder=3); ax.annotate('cod', (1000, 350), (930, 420), fontsize=22, color=BLUE)
    ax.scatter([1000], [1050], s=150, color=RED, zorder=3, marker='D'); ax.annotate('shark', (1000, 1050), (1000, 1120), fontsize=22, color=RED, ha='center')
    ax.set_xlim(0, 1150); ax.set_ylim(0, 1200)
    ax.set_xlabel('Medium osmolarity (mOsm L⁻¹)'); ax.set_ylabel('Body fluid (mOsm L⁻¹)')
    ax.legend(loc='upper left', frameon=False, fontsize=22, bbox_to_anchor=(0.0, 0.95))
    save(f, 'conformer-regulator.svg', 'Body-fluid osmolarity against medium osmolarity')

    # Clearance comparison
    f = fig(); ax = f.add_axes([0.13, 0.13, 0.83, 0.8])
    names = ['glucose', 'urea', 'inulin', 'PAH']; vals = [0, 60, 125, 600]; cols = [GREEN, GREEN, INK, GOLD]
    ax.bar(names, vals, color=cols, width=0.6)
    ax.axhline(125, color=RED, lw=3, ls='--'); ax.text(-0.45, 150, 'GFR = 125', color=RED, fontsize=22)
    for i, v in enumerate(vals):
        ax.text(i, v + 15, f'{v}', ha='center', fontsize=22)
    ax.text(0.5, 330, 'below GFR:\nnet reabsorption', ha='center', color=GREEN, fontsize=22)
    ax.text(2.1, 470, 'above GFR:\nnet secretion', ha='center', color=GOLD, fontsize=22)
    ax.set_ylim(0, 680); ax.set_ylabel('Clearance (mL min⁻¹)')
    save(f, 'clearance.svg', 'Renal clearance of four substances compared with GFR')

    # Glucose transport maximum
    import numpy as np
    f = fig(); ax = f.add_axes([0.12, 0.19, 0.84, 0.74])
    P = np.linspace(0, 32, 200); gfr = 0.125; tm = 2.0
    filt = gfr * P; reab = np.minimum(filt, tm); exc = filt - reab
    ax.plot(P, filt, color=INK, lw=3, ls='--', label='filtered')
    ax.plot(P, reab, color=GREEN, lw=4, label='reabsorbed')
    ax.plot(P, exc, color=GOLD, lw=4, label='excreted')
    ax.axvline(16, color=RED, lw=2, ls=':'); ax.text(15.6, 3.45, 'threshold\n16 mmol L⁻¹', color=RED, fontsize=22, ha='right')
    ax.axvspan(4, 6, color=BLUE, alpha=0.15); ax.text(5, 2.6, 'normal', color=BLUE, fontsize=22, ha='center')
    ax.text(31, 2.1, '$T_m$', color=GREEN, fontsize=22, va='bottom', ha='right')
    ax.set_xlim(0, 32); ax.set_ylim(0, 4.2)
    ax.set_xlabel('Plasma glucose (mmol L⁻¹)'); ax.set_ylabel('mmol min⁻¹')
    ax.text(22, 3.3, 'filtered', color=INK, fontsize=22, ha='right')
    ax.text(24, 1.7, 'reabsorbed', color=GREEN, fontsize=22, ha='center', va='top')
    ax.text(26, 0.55, 'excreted', color=GOLD, fontsize=22, ha='left', va='top')
    save(f, 'glucose-tm.svg', 'Glucose filtration, reabsorption and excretion against plasma glucose')

    # Minimum urine volume
    f = fig(); ax = f.add_axes([0.13, 0.19, 0.83, 0.74])
    U = np.linspace(80, 5500, 400)
    ax.plot(U, 900 / U, color=BLUE, lw=4)
    pts = [(100, 'no ADH', RED, (300, 8.0)), (1200, 'human max', GREEN, (1400, 2.0)), (5000, 'kangaroo rat', GOLD, (3700, 1.4))]
    for u, lab, c, xy in pts:
        ax.scatter([u], [900 / u], s=160, color=c, zorder=3)
        ax.annotate(f'{lab}: {900/u:.2g} L', (u, 900 / u), xy, fontsize=22, color=c)
    ax.set_xlim(0, 5500); ax.set_ylim(0, 10)
    ax.set_xlabel('Urine osmolarity (mOsm L⁻¹)'); ax.set_ylabel('Urine (L day⁻¹)')
    ax.text(2600, 6.0, 'volume = 900 mOsm ÷ osmolarity', fontsize=22, color=BLUE, ha='center')
    save(f, 'urine-volume.svg', 'Minimum urine volume against urine osmolarity for a 900 mOsm solute load')


plots()
