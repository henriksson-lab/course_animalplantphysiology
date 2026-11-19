"""Original explanatory figures for P5 (stress, defence and biotechnology).
Run from any directory with Python 3 (matplotlib needed for the two plots):
    python3 plant/stress-biotechnology/figures/make_diagrams.py
Same palette and 800x440 viewBox as animal/organisation/figures/make_diagrams.py."""
from pathlib import Path
from html import escape
import math
ROOT = Path(__file__).parent
BLUE = '#267a91'; RED = '#b64853'; GREEN = '#397646'; INK = '#243645'; PALE = '#eaf3f5'; GOLD = '#b37a22'
LEAF = '#e1ebdc'; SAND = '#f3e8df'; ROSE = '#f5dadd'; GREY = '#8a949c'


def text(x, y, s, size=25, colour=INK, anchor='middle', weight='normal', style='normal'):
    return ''.join(f'<text x="{x}" y="{y+i*int(size*1.2)}" font-size="{size}" fill="{colour}" text-anchor="{anchor}" '
                   f'font-weight="{weight}" font-style="{style}">{escape(line)}</text>'
                   for i, line in enumerate(s.split('\n')))
def rect(x, y, w, h, fill=PALE, stroke=BLUE, r=6, width=3):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'
def circle(x, y, r, fill=PALE, stroke=BLUE, width=3):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'
def ellipse(x, y, rx, ry, fill=PALE, stroke=BLUE, width=3, rot=0):
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{stroke}" stroke-width="{width}" transform="rotate({rot} {x} {y})"/>'
def line(x1, y1, x2, y2, c=INK, width=3, dash=''):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{width}" stroke-dasharray="{dash}"/>'
def arrow(x1, y1, x2, y2, c=BLUE, width=3, dash=''):
    a = math.degrees(math.atan2(y2-y1, x2-x1))
    return line(x1, y1, x2, y2, c, width, dash)+f'<path d="M {x2} {y2} l -14 -8 l 0 16 Z" fill="{c}" transform="rotate({a} {x2} {y2})"/>'
def inhibit(x1, y1, x2, y2, c=RED, width=4):
    """Line ending in a flat bar: 'suppresses'."""
    a = math.atan2(y2-y1, x2-x1); px, py = -math.sin(a)*16, math.cos(a)*16
    return line(x1, y1, x2, y2, c, width)+line(x2-px, y2-py, x2+px, y2+py, c, 6)
def path(d, c=BLUE, fill='none', width=4):
    return f'<path d="{d}" fill="{fill}" stroke="{c}" stroke-width="{width}" stroke-linejoin="round" stroke-linecap="round"/>'
def write(name, title, desc, parts):
    (ROOT/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 440" role="img" aria-labelledby="title desc">'
                           f'<title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc>'
                           f'<rect width="800" height="440" fill="white"/><g font-family="Arial, sans-serif">'+''.join(parts)+'</g></svg>\n')


# ---------------------------------------------------------------- ABA and guard cells
def stoma(cx, cy, pore):
    """Two guard cells around a pore; pore = half-width of the opening."""
    p = [ellipse(cx, cy, 72, 100, LEAF, GREEN), ellipse(cx, cy, max(pore, 2), 70, 'white', GREEN, 3)]
    p += [line(cx, cy-100, cx, cy-70, GREEN), line(cx, cy+70, cx, cy+100, GREEN)]
    for dx, dy in [(-45, -40), (-50, 10), (-42, 55), (45, -40), (50, 10), (42, 55)]:
        p += [circle(cx+dx, cy+dy, 7, GREEN, GREEN, 1)]
    return p
p = [text(400, 36, 'ABA closes stomata by draining guard-cell turgor')]
p += stoma(130, 175, 26) + stoma(560, 175, 3)
p += [text(130, 310, 'Open: guard cells\nswollen with water', 23), text(560, 310, 'Closed: turgor lost', 23)]
p += [arrow(225, 175, 455, 175, GOLD, 4), rect(285, 125, 110, 38, '#fbf1df', GOLD), text(340, 152, 'ABA', 25, GOLD, weight='bold'),
      text(340, 212, 'binds guard-cell', 22), text(340, 238, 'receptors', 22)]
for y, s, c in [(120, 'K⁺', BLUE), (175, 'anions', BLUE), (230, 'H₂O', BLUE)]:
    p += [arrow(640, y, 690, y, c), text(698, y+8, s, 23, c, 'start')]
p += [text(400, 378, 'Ion channels open → K⁺ and anions leave → water follows', 22),
      text(400, 418, 'Cost: CO₂ uptake and evaporative cooling fall too', 22, RED)]
write('aba-stomata.svg', 'ABA closes stomata',
      'A pair of swollen guard cells surrounds an open pore. ABA binds receptors in the guard cells; potassium ions, anions and then water leave, '
      'the guard cells lose turgor and the pore closes. The cost is less CO2 uptake and less evaporative cooling.', p)


# ---------------------------------------------------------------- Salt: SOS1 and NHX
p = [text(400, 36, 'Salt tolerance: keep Na⁺ out of the cytoplasm')]
p += [rect(10, 60, 160, 320, '#f4efe6', GOLD, 10), text(90, 95, 'Salty soil', 23, GOLD)]
for (x, y) in [(45, 230), (120, 255), (50, 300), (125, 360), (45, 365)]:
    p += [text(x, y, 'Na⁺', 22, RED)]
p += [rect(200, 70, 420, 300, LEAF, GREEN, 30), text(290, 105, 'Cytoplasm', 23, GREEN)]
p += [rect(390, 115, 200, 215, PALE, BLUE, 26), text(490, 200, 'Vacuole', 23, BLUE), text(490, 235, 'Na⁺ stored', 23, RED)]
# SOS1 in the plasma membrane: Na+ out
p += [rect(186, 150, 28, 50, GOLD, GOLD, 6), arrow(250, 175, 135, 175, RED, 4), text(240, 160, 'SOS1', 22, INK, 'start', 'bold'),
      text(100, 135, 'Na⁺ out', 22, RED)]
# NHX in the tonoplast: Na+ into vacuole
p += [rect(376, 250, 28, 50, GOLD, GOLD, 6), arrow(320, 275, 440, 275, RED, 4), text(345, 245, 'NHX', 22, INK, 'middle', 'bold')]
# leak in
p += [arrow(140, 320, 255, 320, GREY, 3, '7 5'), text(295, 355, 'Na⁺ leaks in', 22, GREY)]
p += [text(710, 110, 'Both are', 22), text(710, 137, 'Na⁺/H⁺', 22), text(710, 164, 'antiporters', 22),
      text(710, 230, 'Cytoplasm', 22, GREEN), text(710, 257, 'keeps high', 22, GREEN), text(710, 284, 'K⁺ : Na⁺', 22, GREEN)]
p += [text(400, 418, 'Vacuolar Na⁺ also lowers ψs, so water still enters', 22)]
write('salt-transport.svg', 'Sodium exclusion and vacuolar storage',
      'A root cell in salty soil. The SOS1 antiporter in the plasma membrane pumps sodium back out to the soil; the NHX antiporter in the '
      'vacuolar membrane moves sodium into the vacuole. The cytoplasm keeps a high potassium to sodium ratio.', p)


# ---------------------------------------------------------------- HR and SAR
p = [text(400, 36, 'Local cell death, then resistance in the whole plant')]
p += [path('M330 430 C330 330 335 200 340 70', GREEN, 'none', 7)]
p += [ellipse(200, 330, 125, 48, LEAF, GREEN, 3, -12), path('M330 302 L80 356', GREEN, 'none', 2)]
for (x, y) in [(150, 330), (205, 318), (255, 335), (180, 355)]:
    p += [circle(x, y, 14, '#7a4a2a', '#4a2a17', 2), circle(x, y, 22, 'none', RED, 2)]
p += [ellipse(480, 220, 120, 42, LEAF, GREEN, 3, 10), ellipse(200, 140, 110, 38, LEAF, GREEN, 3, 12),
      path('M337 190 L362 199', GREEN, 'none', 4), path('M307 163 L338 160', GREEN, 'none', 4)]
for (x, y) in [(480, 220), (200, 140)]:
    p += [text(x, y+8, 'SAR', 23, GREEN, weight='bold')]
p += [arrow(300, 300, 395, 245, RED, 3, '8 6'), arrow(318, 270, 300, 175, RED, 3, '8 6')]
p += [text(80, 410, 'Infected leaf: HR lesions', 22, RED, 'start'), text(560, 300, 'Signal moves in', 22, RED, 'start'),
      text(560, 327, 'the phloem; SA', 22, RED, 'start'), text(560, 354, 'needed for SAR', 22, RED, 'start')]
p += [text(620, 120, 'Uninfected leaves:', 22, GREEN), text(620, 147, 'PR proteins,', 22, GREEN), text(620, 174, 'broad resistance', 22, GREEN)]
write('hr-sar.svg', 'Hypersensitive response and systemic acquired resistance',
      'A lower leaf shows small dead patches where the hypersensitive response killed infected cells. A signal travels through the phloem '
      'to uninfected upper leaves, which develop salicylic-acid-dependent systemic acquired resistance with PR proteins.', p)


# ---------------------------------------------------------------- SA versus JA
p = [text(400, 36, 'Two defence pathways that hold each other back')]
p += [rect(80, 60, 280, 50, ROSE, RED), text(220, 94, 'Biotrophic pathogens', 22),
      rect(430, 60, 320, 50, SAND, GOLD), text(590, 94, 'Necrotrophs, chewing insects', 22)]
p += [arrow(220, 112, 220, 140, INK), arrow(590, 112, 590, 140, INK)]
p += [circle(220, 210, 68, PALE, BLUE, 4), text(220, 222, 'SA', 38, BLUE, weight='bold'),
      circle(590, 210, 68, '#fbf1df', GOLD, 4), text(590, 205, 'JA', 38, GOLD, weight='bold'), text(590, 240, '+ ethylene', 22, GOLD)]
p += [inhibit(292, 185, 515, 185), inhibit(518, 238, 295, 238), text(405, 220, 'suppress', 22, RED)]
p += [arrow(220, 280, 220, 305, INK), arrow(590, 280, 590, 305, INK)]
p += [text(220, 333, 'HR, SAR,\nPR proteins', 22), text(590, 333, 'Proteinase inhibitors,\nphytoalexins', 22)]
p += [text(400, 418, 'Pseudomonas makes coronatine, a JA mimic, to switch SA off', 22, INK)]
write('sa-ja.svg', 'Salicylic acid and jasmonic acid antagonism',
      'Biotrophic pathogens induce salicylic acid, giving the hypersensitive response, SAR and PR proteins. Necrotrophs and chewing insects '
      'induce jasmonic acid with ethylene, giving proteinase inhibitors and phytoalexins. Each pathway suppresses the other.', p)


# ---------------------------------------------------------------- Binary vector and T-DNA
p = [text(400, 34, 'A binary vector: our gene between the T-DNA borders')]
p += [rect(30, 55, 740, 190, '#f7f9fa', INK, 90), text(80, 95, 'Agrobacterium', 23, INK, 'start', style='italic')]
p += [circle(250, 150, 58, 'none', BLUE, 5), path('M 209 191 A 58 58 0 0 0 291 191', RED, 'none', 11),
      text(250, 145, 'binary', 22, BLUE), text(250, 170, 'vector', 22, BLUE), text(250, 238, 'T-DNA', 20, RED, weight='bold')]
p += [circle(560, 155, 62, 'none', GREY, 5), path('M 498 155 A 62 62 0 0 1 560 93', GOLD, 'none', 11),
      text(620, 90, 'vir genes', 22, GOLD, 'start'), text(560, 152, 'disarmed', 22, GREY), text(560, 177, 'Ti plasmid', 22, GREY)]
p += [line(209, 191, 60, 300, RED, 2, '6 5'), line(291, 191, 740, 300, RED, 2, '6 5')]
p += [line(60, 330, 740, 330, INK, 4)]
p += [path('M60 305 L80 330 L60 355 Z', RED, RED, 2), path('M740 305 L720 330 L740 355 Z', RED, RED, 2),
      text(50, 385, 'LB', 23, RED, 'start', 'bold'), text(750, 385, 'RB', 23, RED, 'end', 'bold')]
p += [rect(110, 308, 230, 44, LEAF, GREEN), text(225, 338, 'marker (nptII)', 22, GREEN)]
p += [rect(380, 308, 300, 44, PALE, BLUE), text(530, 338, 'promoter + our gene', 22, BLUE)]
p += [text(400, 425, 'vir proteins cut at the borders; the T-DNA between them enters the plant genome', 21)]
write('binary-vector.svg', 'Binary vector and helper Ti plasmid',
      'An Agrobacterium cell carries a small binary vector whose T-DNA region holds a selectable marker and the gene of interest between the '
      'left and right borders, plus a disarmed helper Ti plasmid that supplies the vir genes.', p)


# ---------------------------------------------------------------- Transformation workflow
xs = [85, 245, 400, 555, 715]
p = [text(400, 36, 'From construct to transgenic plant')]
for a, b in zip(xs, xs[1:]):
    p += [arrow(a+58, 160, b-58, 160, INK)]
# 1 construct
p += [circle(85, 160, 45, 'none', BLUE, 5), path('M 53 128 A 45 45 0 0 1 117 128', RED, 'none', 10)]
# 2 leaf discs + bacteria
p += [ellipse(245, 175, 62, 28, '#f7f9fa', INK), ellipse(245, 168, 62, 28, '#fdfdfd', INK)]
for x in [220, 248, 272]:
    p += [circle(x, 165, 12, LEAF, GREEN, 2)]
for (x, y) in [(232, 150), (262, 180), (210, 178), (283, 155)]:
    p += [rect(x, y, 10, 5, GOLD, GOLD, 2, 1)]
# 3 selection plate: brown discs and one green callus
p += [ellipse(400, 175, 62, 28, '#f7f9fa', INK), ellipse(400, 168, 62, 28, '#fdfdfd', INK)]
for x in [372, 428]:
    p += [circle(x, 165, 12, '#c9b08a', '#8a6a3a', 2)]
p += [circle(400, 163, 13, '#9cc48a', GREEN, 3)]
# 4 regeneration jar
p += [rect(520, 105, 70, 100, '#f7f9fa', INK, 8), rect(520, 175, 70, 30, '#f1ead2', GOLD, 4),
      path('M555 175 L555 130', GREEN, 'none', 4), path('M555 145 C540 135 535 125 538 118 C548 122 553 132 555 145', GREEN, LEAF, 3),
      path('M555 140 C570 130 575 120 572 113 C562 117 557 127 555 140', GREEN, LEAF, 3)]
# 5 gel
p += [rect(670, 110, 90, 100, '#2f3d48', INK, 6)]
for (x, y) in [(690, 140), (690, 160), (690, 185), (715, 160), (740, 160)]:
    p += [rect(x-9, y, 18, 6, '#e7f1f4', '#e7f1f4', 1, 1)]
labels = ['Construct\nin vector', 'Infect\nexplants', 'Select\n(kanamycin)', 'Regenerate\nshoots', 'Confirm\nPCR, RT-PCR']
for x, s in zip(xs, labels):
    p += [text(x, 262, s, 22)]
p += [text(400, 375, 'Only transformed cells carry the marker and survive selection', 22),
      text(400, 415, 'Regeneration uses the auxin : cytokinin rules of tissue culture', 22, GREEN)]
write('transformation-workflow.svg', 'Plant transformation workflow',
      'Five steps: the gene goes into the T-DNA of a binary vector; explants such as leaf discs are infected with Agrobacterium; '
      'they are grown on a selective medium where only transformed tissue stays green; shoots are regenerated; '
      'insertion and expression are confirmed by PCR and RT-PCR.', p)


# ---------------------------------------------------------------- Skoog-Miller grid
def blob(cx, cy, s=1.0):
    q = []
    for dx, dy, r in [(-14, 4, 13), (0, -4, 15), (14, 4, 13), (-6, 12, 11), (8, 12, 11)]:
        q += [circle(cx+dx*s, cy+dy*s, r*s, '#efe6c4', GOLD, 2)]
    return q
def shoots(cx, cy):
    q = blob(cx, cy+18, 0.8)
    for dx in (-14, 4, 18):
        q += [path(f'M{cx+dx} {cy+8} L{cx+dx} {cy-14}', GREEN, 'none', 3),
              path(f'M{cx+dx} {cy-6} c -12 -4 -14 -14 -12 -20 c 8 2 12 10 12 20', GREEN, LEAF, 2),
              path(f'M{cx+dx} {cy-10} c 10 -4 12 -12 11 -18 c -8 2 -11 9 -11 18', GREEN, LEAF, 2)]
    return q
def roots(cx, cy):
    q = blob(cx, cy-14, 0.8)
    for dx, ex in [(-16, -30), (-5, -10), (6, 8), (16, 30)]:
        q += [path(f'M{cx+dx} {cy-4} C{cx+dx} {cy+12} {cx+ex} {cy+18} {cx+ex} {cy+34}', '#8a6a3a', 'none', 3)]
    return q
p = [text(400, 32, 'The auxin : cytokinin ratio decides what an explant forms')]
cols = [215, 375, 535]; rows = [62, 170, 278]   # rows top = high cytokinin
outcome = {(0, 0): 'shoots', (0, 1): 'shoots', (0, 2): 'callus',
           (1, 0): 'shoots', (1, 1): 'callus', (1, 2): 'roots',
           (2, 0): 'little growth', (2, 1): 'roots', (2, 2): 'roots'}
fills = {'shoots': LEAF, 'callus': '#fbf4dc', 'roots': SAND, 'little growth': '#f4f5f6'}
for (r, c), o in outcome.items():
    x, y = cols[c], rows[r]
    p += [rect(x, y, 150, 100, fills[o], INK, 8, 2)]
    cx, cy = x+75, y+36
    if o == 'shoots': p += shoots(cx, cy)
    elif o == 'callus': p += blob(cx, cy, 1.1)
    elif o == 'roots': p += roots(cx, cy-4)
    else: p += [rect(cx-22, cy-6, 44, 14, '#d8dcc8', GREY, 3, 2)]
    p += [text(cx, y+90, o.capitalize(), 22)]
p += [arrow(195, 375, 195, 75, INK), text(170, 225, 'Cytokinin', 23, INK) .replace('<text ', '<text transform="rotate(-90 170 225)" ')]
p += [arrow(215, 400, 685, 400, INK), text(450, 432, 'Auxin', 23)]
p += [text(700, 120, 'Low ratio', 22, GREEN, 'start'), text(700, 147, '→ shoots', 22, GREEN, 'start'),
      text(700, 230, 'Balanced', 22, GOLD, 'start'), text(700, 257, '→ callus', 22, GOLD, 'start'),
      text(700, 340, 'High ratio', 22, '#8a6a3a', 'start'), text(700, 367, '→ roots', 22, '#8a6a3a', 'start')]
write('skoog-miller.svg', 'Auxin to cytokinin ratio and organ formation',
      'A three-by-three grid of auxin against cytokinin concentration. High cytokinin with low auxin gives shoots, a balanced ratio gives '
      'undifferentiated callus, high auxin with low cytokinin gives roots, and low levels of both give little growth.', p)


# ---------------------------------------------------------------- Independent transgenic lines
p = [text(400, 34, 'Several independent lines separate the gene from the insertion')]
p += [text(390, 72, 'Chromosome with insertion site', 21, GREY), text(700, 72, 'Phenotype', 21, GREY)]
rows = [('Wild type', None, 'normal'), ('Line 1', 280, 'new'), ('Line 2', 430, 'new'),
        ('Line 3', 540, 'new'), ('Empty vector', 350, 'normal')]
for i, (name, pos, ph) in enumerate(rows):
    y = 105 + i*62
    p += [text(20, y+8, name, 22, INK, 'start'), rect(200, y-10, 380, 20, '#f1f3f4', INK, 10, 2)]
    for gx in (230, 330, 470):
        p += [rect(gx, y-10, 30, 20, '#c7d9df', BLUE, 2, 1)]
    if pos:
        empty = name == 'Empty vector'
        p += [rect(pos-14, y-22, 28, 44, '#d0d4d8' if empty else RED, GREY if empty else RED, 4, 2)]
    good = ph == 'new'
    p += [text(700, y+8, ph, 23, RED if good else GREEN, weight='bold' if good else 'normal')]
p += [text(400, 420, 'Only the transgene is common to lines 1–3', 22)]
write('independent-lines.svg', 'Independent transgenic lines and controls',
      'Five chromosomes. Wild type has no insert and is normal. Lines 1, 2 and 3 have the transgene at three different positions and all '
      'show the same new phenotype. An empty-vector line has an insert without the gene and is normal.', p)


# ---------------------------------------------------------------- Bt toxin mechanism
p = [text(400, 34, 'Bt toxin needs an alkaline gut and specific receptors')]
xs = [100, 300, 500, 700]
for a, b in zip(xs, xs[1:]):
    p += [arrow(a+62, 150, b-62, 150, INK)]
# 1 protoxin crystal
p += [path('M100 105 L140 150 L100 195 L60 150 Z', GOLD, '#fbf1df', 4)]
# 2 cleaved active toxin
p += [path('M300 125 L325 150 L300 175 L275 150 Z', GOLD, GOLD, 3), path('M262 108 l14 0 l-7 12 Z', GREY, '#d9dde0', 2),
      path('M328 182 l14 0 l-7 12 Z', GREY, '#d9dde0', 2), path('M330 112 l12 4 l-8 9 Z', GREY, '#d9dde0', 2)]
# 3 binding to receptors on gut cells
for x in (455, 500, 545):
    p += [rect(x-22, 160, 44, 60, ROSE, RED, 4, 2), path(f'M{x} 160 L{x} 145 M{x} 145 L{x-8} 135 M{x} 145 L{x+8} 135', BLUE, 'none', 3)]
p += [path('M500 108 L516 124 L500 140 L484 124 Z', GOLD, GOLD, 2)]
# 4 pore and lysis
p += [rect(668, 120, 64, 80, ROSE, RED, 4, 2), rect(692, 112, 16, 40, 'white', GOLD, 3, 3)]
for dx, dy in [(-50, 20), (50, 30), (-45, 60), (48, 75)]:
    p += [arrow(700 + dx*0.3, 160 + dy*0.3, 700 + dx, 160 + dy, RED, 2)]
for x, s in zip(xs, ['Larva eats\nprotoxin', 'Alkaline gut:\nproteases\nactivate it', 'Binds gut\nreceptors', 'Pores form,\ncells lyse']):
    p += [text(x, 262, s, 22)]
p += [rect(60, 360, 680, 62, PALE, BLUE), text(400, 399, 'Mammals: acidic stomach and no receptor, so no binding', 22, BLUE)]
write('bt-mechanism.svg', 'How Bt toxin kills a caterpillar',
      'Four steps: the larva eats the Cry protoxin; proteases in the alkaline gut activate it; the toxin binds specific receptors on gut '
      'epithelial cells; it forms pores and the cells lyse. Mammals have an acidic stomach and no receptor.', p)


# ---------------------------------------------------------------- CRISPR versus transgene
def chrom(y, genes=((120, 'A'), (430, 'B'), (620, 'C'))):
    q = [rect(60, y, 680, 30, '#f1f3f4', INK, 15, 2)]
    for x, s in genes:
        q += [rect(x, y, 100, 30, '#c7d9df', BLUE, 3, 2), text(x+28, y+23, s, 20, BLUE, weight='bold')]
    return q
p = [text(60, 52, 'Transgenesis', 25, INK, 'start', 'bold')]
p += chrom(90) + [rect(290, 70, 80, 70, RED, RED, 4, 2), text(330, 112, 'T-DNA', 18, 'white', weight='bold')]
p += [text(60, 180, 'Foreign DNA inserted at a random site; it stays in the plant', 22, INK, 'start')]
p += [text(60, 245, 'Genome editing (CRISPR–Cas9)', 25, INK, 'start', 'bold')]
p += chrom(300) + [ellipse(495, 268, 46, 24, '#fbf1df', GOLD, 3), text(495, 276, 'Cas9', 20, GOLD, weight='bold'),
                   path('M488 300 L498 316 L508 300', RED, 'none', 4), line(485, 254, 535, 254, RED, 4)]
p += [text(560, 258, 'guide RNA', 22, RED, 'start')]
p += [text(60, 375, 'Guide RNA picks the site; repair leaves a small indel in gene B', 22, INK, 'start'),
      text(60, 412, 'The Cas9 construct is then removed by crossing', 22, GREEN, 'start')]
write('crispr-vs-transgene.svg', 'Transgenesis compared with CRISPR editing',
      'Top: a T-DNA carrying foreign DNA lands at a random position in a chromosome and stays there. Bottom: Cas9 guided by a guide RNA '
      'cuts gene B at a chosen site; repair leaves a small insertion or deletion, and the Cas9 construct can be crossed out.', p)


# ---------------------------------------------------------------- Plots (matplotlib)
try:
    import matplotlib
    matplotlib.use('svg')
    import matplotlib.pyplot as plt
    plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 22, 'axes.edgecolor': INK, 'axes.labelcolor': INK,
                         'xtick.color': INK, 'ytick.color': INK, 'svg.fonttype': 'none', 'axes.spines.top': False,
                         'axes.spines.right': False, 'axes.linewidth': 2})

    # Refuge: deterministic one-locus model, random mating across refuge and Bt field.
    def refuge_curve(refuge, h, p0=0.001, gens=60, s_bt=0.99):
        out = [p0]; p = p0
        vSS = 1 - s_bt; vRR = 1.0; vRS = vSS + h*(vRR - vSS)
        w = [refuge + (1-refuge)*v for v in (vSS, vRS, vRR)]
        for _ in range(gens):
            q = 1 - p
            wbar = q*q*w[0] + 2*p*q*w[1] + p*p*w[2]
            p = (p*q*w[1] + p*p*w[2]) / wbar
            out.append(p)
        return out
    fig, ax = plt.subplots(figsize=(8, 4.4))
    G = 100; g = range(G+1)
    ax.plot(g, refuge_curve(0.0, 0.0, gens=G), color=RED, lw=4, label='No refuge')
    ax.plot(g, refuge_curve(0.05, 0.0, gens=G), color=BLUE, lw=4, label='5% refuge')
    ax.plot(g, refuge_curve(0.2, 0.0, gens=G), color=GREEN, lw=4, label='20% refuge')
    ax.plot(g, refuge_curve(0.2, 1.0, gens=G), color=GOLD, lw=4, ls='--', label='20% refuge,\ndominant allele')
    ax.set_xlabel('Pest generations'); ax.set_ylabel('Resistance allele\nfrequency')
    ax.set_ylim(0, 1.02); ax.set_xlim(0, G)
    for x0, y0, s, c in [(18, 0.50, 'No refuge', RED), (73, 0.45, '5% refuge', BLUE),
                         (60, 0.08, '20% refuge', GREEN), (28, 0.68, '20% refuge,\ndominant allele', GOLD)]:
        ax.text(x0, y0, s, color=c, fontsize=20, va='center')
    fig.tight_layout(); fig.savefig(ROOT/'refuge-model.svg'); plt.close(fig)

    # Growth-defence trade-off: schematic yield against herbivore pressure.
    x = [i/50 for i in range(51)]
    fig, ax = plt.subplots(figsize=(8, 4.4))
    ax.plot(x, [1.0 - 0.85*v for v in x], color=RED, lw=4, label='No defence')
    ax.plot(x, [0.70 - 0.10*v for v in x], color=BLUE, lw=4, label='Defence always on')
    ax.plot(x, [0.95 - 0.40*v for v in x], color=GREEN, lw=4, ls='--', label='Induced defence')
    ax.set_xlabel('Herbivore pressure'); ax.set_ylabel('Seed yield')
    ax.set_xticks([0, 1]); ax.set_xticklabels(['none', 'heavy']); ax.set_yticks([])
    ax.set_ylim(0, 1.05); ax.set_xlim(0, 1)
    ax.legend(frameon=False, fontsize=19, loc='lower left')
    ax.text(0.99, 1.0, 'schematic', ha='right', va='top', fontsize=18, color=GREY, transform=ax.transAxes)
    fig.tight_layout(); fig.savefig(ROOT/'growth-defence.svg'); plt.close(fig)
except ImportError:
    print('matplotlib not found: plots not regenerated')
