"""Original explanatory figures for P4; run from any directory with Python 3 (+ matplotlib).
Same palette and 800x440 viewBox as animal/organisation/figures/make_diagrams.py."""
from pathlib import Path
from html import escape
import math
ROOT = Path(__file__).parent
BLUE = '#267a91'; RED = '#b64853'; GREEN = '#397646'; INK = '#243645'; PALE = '#eaf3f5'; GOLD = '#b37a22'
LEAF = '#e2eedf'; SAND = '#f3e8df'; ROSE = '#f5dadd'; CREAM = '#fff4df'; SUN = '#f2c45a'; FARRED = '#7a2b3a'


def text(x, y, s, size=24, colour=INK, anchor='middle', weight='normal', rotate=None):
    rot = f' transform="rotate({rotate} {x} {y})"' if rotate is not None else ''
    return ''.join(f'<text x="{x}" y="{y + i * (size + 6)}" font-size="{size}" fill="{colour}" '
                   f'text-anchor="{anchor}" font-weight="{weight}"{rot}>{escape(line)}</text>'
                   for i, line in enumerate(s.split('\n')))
def rect(x, y, w, h, fill=PALE, stroke=BLUE, r=6, width=3):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'
def circle(x, y, r, fill=PALE, stroke=BLUE, width=3):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'
def ellipse(x, y, rx, ry, fill=PALE, stroke=BLUE, width=3, rot=0):
    return (f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{stroke}" stroke-width="{width}" '
            f'transform="rotate({rot} {x} {y})"/>')
def line(x1, y1, x2, y2, c=INK, width=3, dash=''):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{width}" stroke-dasharray="{dash}"/>'
def head(x2, y2, ang, c):
    return (f'<path d="M {x2} {y2} l -13 -7 l 0 14 Z" fill="{c}" '
            f'transform="rotate({math.degrees(ang):.1f} {x2} {y2})"/>')
def arrow(x1, y1, x2, y2, c=BLUE, width=3, dash=''):
    return line(x1, y1, x2, y2, c, width, dash) + head(x2, y2, math.atan2(y2 - y1, x2 - x1), c)
def curve(x1, y1, cx1, cy1, cx2, cy2, x2, y2, c=BLUE, width=3, dash=''):
    return (f'<path d="M {x1} {y1} C {cx1} {cy1} {cx2} {cy2} {x2} {y2}" fill="none" stroke="{c}" '
            f'stroke-width="{width}" stroke-dasharray="{dash}"/>' + head(x2, y2, math.atan2(y2 - cy2, x2 - cx2), c))
def path(d, c=BLUE, fill='none', width=4, extra=''):
    return f'<path d="{d}" fill="{fill}" stroke="{c}" stroke-width="{width}" stroke-linejoin="round"{extra}/>'
def tube(d, w=56):
    """A coleoptile drawn as a thick stroked path with a rounded tip."""
    return (path(d, GREEN, width=w + 6, extra=' stroke-linecap="round"') +
            path(d, LEAF, width=w, extra=' stroke-linecap="round"'))
def write(name, title, desc, parts, defs=''):
    (ROOT / name).write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 440" role="img" aria-labelledby="title desc">'
        f'<title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc>{defs}'
        f'<g font-family="Arial, sans-serif">' + ''.join(parts) + '</g></svg>\n')


# ---------------------------------------------------------------- barley grain: GA and the aleurone
p = [text(400, 32, 'Gibberellin from the embryo mobilises the endosperm', 25)]
p += [ellipse(430, 250, 335, 140, '#efe3c8', INK, 2), ellipse(430, 250, 322, 127, CREAM, GOLD, 16)]
p += [path('M 112 195 C 150 170 185 190 190 250 C 185 310 150 330 112 305 C 98 280 98 220 112 195 Z', GREEN, LEAF, 3),
      path('M 200 180 C 222 220 222 280 200 320', GREEN, width=8)]
p += [text(150, 160, 'embryo', 22, GREEN, 'end', 'bold')]
p += [curve(175, 195, 210, 120, 290, 120, 330, 128, GREEN, 4), text(290, 180, '1 GA', 24, GREEN, weight='bold')]
p += [line(590, 126, 622, 106, GOLD, 2), text(790, 68, '2 aleurone (living):', 22, GOLD, 'end', 'bold'),
      text(790, 96, 'α-amylase gene on', 22, GOLD, 'end')]
for x1, y1, x2, y2 in [(450, 131, 450, 175), (560, 136, 545, 178), (680, 165, 650, 196), (520, 368, 520, 325), (650, 345, 625, 310)]:
    p.append(arrow(x1, y1, x2, y2, GOLD, 3))
p += [text(560, 225, '3 α-amylase digests', 22, INK), text(560, 255, 'starch → sugars', 24, INK, weight='bold')]
p += [arrow(420, 290, 228, 268, BLUE, 4), text(365, 320, '4 sugars to the embryo', 22, BLUE),
      text(365, 346, 'via the scutellum', 22, BLUE)]
p += [text(430, 422, 'Endosperm is dead storage tissue. ABA blocks step 2.', 22, RED)]
write('aleurone.svg', 'Gibberellin and the barley aleurone layer',
      'In a barley grain the embryo releases gibberellin. The living aleurone layer around the dead starchy endosperm '
      'switches on the alpha-amylase gene and secretes the enzyme into the endosperm, where starch is digested to sugars '
      'that the scutellum absorbs for the embryo. ABA blocks the aleurone response.', p)

# ---------------------------------------------------------------- Cholodny-Went
p = [text(400, 32, 'Auxin moves to the shaded side, so the shoot bends', 25)]
for y in (130, 175, 220):
    p += [arrow(40, y, 150, y, GOLD, 5)]
p += [text(95, 115 - 10, 'blue light', 22, GOLD), tube('M 210 405 L 210 150')]
p += [circle(210, 140, 30, 'none', BLUE, 3), text(255, 105, 'tip senses light', 22, BLUE, 'start'),
      text(255, 131, '(phototropin)', 22, BLUE, 'start')]
for x, y in [(222, 150), (228, 175), (226, 205), (227, 240), (226, 275), (227, 310), (226, 345), (197, 300)]:
    p.append(circle(x, y, 6, RED, RED, 0))
p += [arrow(198, 160, 222, 168, RED, 3), arrow(248, 200, 248, 360, RED, 3),
      text(262, 260, 'auxin moves to', 22, RED, 'start'), text(262, 286, 'the shaded side', 22, RED, 'start'),
      text(262, 312, 'and down', 22, RED, 'start'), text(170, 380, 'lit side', 22, INK, 'end')]
p += [line(470, 60, 470, 420, '#9aa5ad', 2, '6 6')]
for y in (215, 255):
    p += [arrow(480, y, 540, y, GOLD, 5)]
p += [tube('M 600 405 L 600 290 C 600 210 560 160 515 140')]
for x, y in [(620, 360), (622, 320), (623, 280), (618, 240)]:
    p.append(circle(x, y, 6, RED, RED, 0))
p += [text(648, 266, 'shaded side:', 22, RED, 'start', 'bold'), text(648, 292, 'more auxin,', 22, RED, 'start'),
      text(648, 318, 'grows faster', 22, RED, 'start'),
      text(648, 380, 'bends towards', 22, GREEN, 'start', 'bold'), text(648, 406, 'the light', 22, GREEN, 'start', 'bold')]
write('auxin-phototropism.svg', 'Cholodny-Went model of phototropism',
      'Blue light from one side is sensed by phototropin at the coleoptile tip. Auxin is moved to the shaded side and '
      'transported down, so cells on the shaded side elongate faster and the shoot bends towards the light.', p)

# ---------------------------------------------------------------- gravitropism: root and shoot laid flat
p = [text(200, 32, 'Root laid flat', 25, INK, weight='bold'), text(600, 32, 'Shoot laid flat', 25, INK, weight='bold'),
     line(400, 50, 400, 420, '#9aa5ad', 2, '6 6'), arrow(770, 60, 770, 120, INK, 3), text(760, 100, 'gravity', 22, INK, 'end')]
p += [path('M 38 140 L 160 140 C 230 140 270 180 285 250', '#8a6b4a', width=58, extra=' stroke-linecap="round"'),
      path('M 38 140 L 160 140 C 230 140 270 180 285 250', SAND, width=52, extra=' stroke-linecap="round"')]
p += [circle(288, 258, 34, CREAM, GOLD, 3)]
for x, y in [(276, 276), (288, 280), (300, 276), (282, 268), (295, 269)]:
    p.append(circle(x, y, 5, '#9aa5ad', INK, 1.5))
p += [text(190, 335, 'root cap: amyloplasts', 22, GOLD, weight='bold'), text(190, 361, 'settle to the lower side', 22, GOLD)]
for x in (50, 90, 130, 170):
    p.append(circle(x, 162, 6, RED, RED, 0))
p += [text(20, 210, 'auxin to lower side:', 22, RED, 'start', 'bold'), text(20, 236, 'inhibits elongation', 22, RED, 'start'),
      text(20, 100, 'upper side grows faster', 22, GREEN, 'start'), text(20, 285, 'root bends down', 24, GREEN, 'start', 'bold')]
p += [path('M 440 330 L 600 330 C 680 330 720 290 735 200', GREEN, width=46, extra=' stroke-linecap="round"'),
      path('M 440 330 L 600 330 C 680 330 720 290 735 200', LEAF, width=40, extra=' stroke-linecap="round"')]
for x in (480, 520, 560, 600):
    p.append(circle(x, 347, 6, RED, RED, 0))
p += [text(450, 395, 'auxin to the lower side:', 22, RED, 'start', 'bold'), text(450, 421, 'promotes elongation there', 22, RED, 'start'),
      text(560, 230, 'shoot bends', 24, GREEN, 'end', 'bold'), text(560, 258, 'up', 24, GREEN, 'end', 'bold')]
write('gravitropism.svg', 'Gravitropism in a root and a shoot laid horizontal',
      'In a horizontal root, amyloplasts in the root cap settle to the lower side and auxin accumulates on the lower side, '
      'where it inhibits elongation, so the root bends down. In a horizontal shoot auxin also accumulates on the lower side '
      'but promotes elongation, so the shoot bends up.', p)

# ---------------------------------------------------------------- photoperiod bars
X0, X1 = 235, 545
hx = lambda h: X0 + (X1 - X0) * h / 24
p = [text(390, 40, '24-hour cycle', 23, INK, weight='bold'), text(635, 40, 'SDP', 24, INK, weight='bold'),
     text(735, 40, 'LDP', 24, INK, weight='bold')]
for h in (0, 8, 16, 24):
    p.append(text(hx(h), 66, f'{h} h', 20, '#5b6b78'))
rows = [('Long day', [(0, 16, SUN), (16, 24, INK)], [], ('no', 'flowers')),
        ('Short day', [(0, 8, SUN), (8, 24, INK)], [], ('flowers', 'no')),
        ('Night break: red', [(0, 8, SUN), (8, 24, INK)], [(15.6, 16.4, RED)], ('no', 'flowers')),
        ('Red, then far-red', [(0, 8, SUN), (8, 24, INK)], [(15.2, 16.0, RED), (16.0, 16.8, FARRED)], ('flowers', 'no'))]
for i, (lab, segs, flashes, (sdp, ldp)) in enumerate(rows):
    y = 82 + i * 72
    p.append(text(15, y + 30, lab, 22, INK, 'start', 'bold'))
    for a, b, c in segs:
        p.append(rect(hx(a), y, hx(b) - hx(a), 42, c, INK, 0, 2))
    for a, b, c in flashes:
        p.append(rect(hx(a), y - 8, hx(b) - hx(a), 58, c, 'white', 0, 1.5))
    for x, v in ((635, sdp), (735, ldp)):
        p.append(text(x, y + 30, v, 22, GREEN if v == 'flowers' else '#8a959e', weight='bold' if v == 'flowers' else 'normal'))
p += [text(405, 392, 'Critical night ≈ 11 h. A red flash splits the 16 h night into two 8 h nights;', 21),
      text(405, 422, 'far-red straight after cancels it (phytochrome).', 21)]
write('photoperiod.svg', 'Short-day and long-day plants under night breaks',
      'Bars show 24-hour cycles of light and dark. Short-day plants flower with 8 h light and a 16 h night but not with '
      '16 h light. A red flash in the middle of the long night stops short-day plants and lets long-day plants flower; '
      'far-red straight after the red cancels its effect.', p)

# ---------------------------------------------------------------- florigen
p = [line(120, 420, 780, 420, '#8a6b4a', 4), path('M 450 420 L 450 115', GREEN, width=10)]
p += [path('M 450 330 C 520 300 640 290 720 250 C 640 330 520 350 450 330 Z', GREEN, LEAF, 3),
      path('M 450 380 C 400 360 330 350 290 330 C 340 395 410 395 450 380 Z', GREEN, LEAF, 3),
      path('M 450 230 C 410 205 370 200 345 185 C 375 240 420 245 450 230 Z', GREEN, LEAF, 3)]
p += [path('M 690 262 C 600 300 520 320 457 322 L 457 125', GOLD, width=3, extra=' stroke-dasharray="8 6"')]
for x, y in [(640, 286), (560, 310), (457, 290), (457, 240), (457, 190), (457, 150)]:
    p.append(circle(x, y, 8, SUN, GOLD, 2))
p += [path('M 425 115 C 425 70 475 70 475 115 Z', RED, ROSE, 3), circle(437, 70, 13, ROSE, RED, 2),
      circle(463, 70, 13, ROSE, RED, 2), circle(450, 55, 13, ROSE, RED, 2)]
p += [text(500, 60, '3 apex: FT + FD', 22, RED, 'start', 'bold'), text(500, 88, '→ flower genes on', 22, RED, 'start')]
p += [text(505, 200, '2 FT protein moves', 22, GOLD, 'start', 'bold'), text(505, 226, 'in the phloem', 22, GOLD, 'start')]
p += [text(560, 360, '1 leaf: long days', 22, GREEN, 'start', 'bold'), text(560, 386, 'CONSTANS → FT on', 22, GREEN, 'start')]
p += [text(20, 40, 'Florigen:', 25, INK, 'start', 'bold'), text(20, 70, 'a protein from leaf to apex', 23, INK, 'start')]
write('florigen.svg', 'Florigen: FT protein travels from leaf to shoot apex',
      'In a leaf under long days CONSTANS switches on the FT gene. FT protein moves in the phloem up the stem to the '
      'shoot apex, where FT and FD switch on floral identity genes and flowers form.', p)

# ---------------------------------------------------------------- double fertilisation
p = [text(400, 32, 'Two sperm cells, two fusions', 25)]
p += [ellipse(330, 235, 230, 165, SAND, GOLD, 3), ellipse(340, 235, 175, 110, CREAM, GOLD, 3),
      text(330, 108, 'ovule (maternal tissue)', 22, GOLD, weight='bold'), text(350, 165, 'embryo sac', 22, GOLD)]
p += [path('M 15 236 C 80 236 120 236 172 236', GREEN, width=12, extra=' stroke-linecap="round"'),
      text(55, 280, 'pollen', 22, GREEN, 'middle', 'bold'), text(55, 306, 'tube', 22, GREEN, 'middle', 'bold')]
p += [circle(186, 214, 9, GREEN, GREEN), circle(186, 258, 9, GREEN, GREEN)]
p += [circle(228, 236, 24, '#d6e3ef', BLUE), text(228, 243, 'egg', 18, BLUE, weight='bold')]
p += [circle(330, 220, 14, ROSE, RED), circle(362, 248, 14, ROSE, RED), text(360, 300, 'central cell', 22, RED, weight='bold'),
      text(360, 324, '2 polar nuclei', 22, RED)]
p += [curve(192, 206, 196, 190, 205, 196, 212, 214, GREEN, 3), curve(194, 266, 240, 300, 300, 290, 345, 258, GREEN, 3)]
p += [rect(570, 85, 220, 120, '#d6e3ef', BLUE, 10), text(680, 120, 'sperm 1 + egg', 22, BLUE, weight='bold'),
      text(680, 150, '→ zygote (2n)', 22, BLUE), text(680, 180, '→ embryo', 22, BLUE),
      rect(570, 245, 220, 120, ROSE, RED, 10), text(680, 280, 'sperm 2 +', 22, RED, weight='bold'),
      text(680, 310, 'central cell', 22, RED, weight='bold'), text(680, 340, '→ endosperm (3n)', 22, RED)]
p += [text(330, 428, 'Seed coat and fruit wall stay maternal (2n).', 22)]
write('double-fertilisation.svg', 'Double fertilisation in flowering plants',
      'The pollen tube enters the ovule and releases two sperm cells. One fuses with the egg to form the diploid zygote; '
      'the other fuses with the central cell and its two polar nuclei to form the triploid endosperm.', p)


# ---------------------------------------------------------------- phytochrome absorption spectra (matplotlib)
def spectra():
    import numpy as np
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    plt.rcParams.update({'svg.fonttype': 'none', 'font.family': 'sans-serif',
                         'font.sans-serif': ['Arial', 'DejaVu Sans'], 'font.size': 22})
    wl = np.linspace(300, 800, 501)
    g = lambda mu, s, a: a * np.exp(-0.5 * ((wl - mu) / s) ** 2)
    # Schematic band shapes; peak positions follow measured phytochrome A spectra
    # (Pr ~666 nm with a 610 nm shoulder and a ~380 nm band; Pfr ~730 nm, lower, with a broad shoulder near 670 nm).
    pr = g(666, 22, 1.0) + g(615, 30, 0.25) + g(380, 35, 0.32) + g(330, 25, 0.12)
    pfr = g(730, 28, 0.72) + g(670, 40, 0.25) + g(400, 40, 0.28) + g(330, 25, 0.12)
    fig, ax = plt.subplots(figsize=(800 / 72, 440 / 72), dpi=72)
    fig.subplots_adjust(left=0.08, right=0.98, top=0.86, bottom=0.17)
    ax.axvspan(645, 675, color=ROSE, zorder=0)
    ax.axvspan(715, 745, color='#e2c3cc', zorder=0)
    ax.plot(wl, pr, color=BLUE, lw=4, label='Pr (inactive)')
    ax.plot(wl, pfr, color=RED, lw=4, ls='--', label='Pfr (active)')
    ax.set_xlim(300, 800); ax.set_ylim(0, 1.12)
    ax.set_xlabel('Wavelength (nm)', color=INK); ax.set_ylabel('Absorbance', color=INK)
    ax.set_yticks([]); ax.tick_params(colors=INK, labelsize=20)
    for s in ['top', 'right']:
        ax.spines[s].set_visible(False)
    ax.text(660, 1.17, 'red\n660', color=RED, ha='center', va='bottom', fontsize=20, transform=ax.transData, clip_on=False)
    ax.text(730, 1.17, 'far-red\n730', color=FARRED, ha='center', va='bottom', fontsize=20, clip_on=False)
    ax.text(600, 0.98, 'Pr', color=BLUE, fontsize=24, fontweight='bold', ha='right')
    ax.text(770, 0.62, 'Pfr', color=RED, fontsize=24, fontweight='bold')
    ax.text(310, 0.85, 'red light: Pr → Pfr\nfar-red light: Pfr → Pr', color=INK, fontsize=22, va='top')
    ax.text(310, 0.52, 'Band shapes schematic;\npeaks ~660 and ~730 nm', color='#5b6b78', fontsize=20, va='top')
    fig.savefig(ROOT / 'phytochrome-spectra.svg', format='svg')
    plt.close(fig)


spectra()
