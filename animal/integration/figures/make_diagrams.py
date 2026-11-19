"""Original explanatory figures for A5 (nerves, muscles, hormones, reproduction).

Run from any directory with Python 3 (numpy + matplotlib needed for the plotted figures):
    python3 animal/integration/figures/make_diagrams.py
Hand-drawn schematics use the A1 helpers and palette (800 x 440 viewBox, labels >= 22 px).
Voltage traces come from the Hodgkin-Huxley (1952) squid-axon model, shifted by -5 mV so that
rest is -70 mV as in the lecture; the twitch traces use the same simple model as the a5-twitch demo.
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


def ellipse(x, y, rx, ry, fill=PALE, stroke=BLUE, width=3):
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'


def line(x1, y1, x2, y2, c=INK, width=3, dash=''):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{width}" stroke-dasharray="{dash}" stroke-linecap="round"/>'


def head(x2, y2, ang, c, size=1.0):
    return f'<path d="M {x2} {y2} l {-14*size} {-8*size} l 0 {16*size} Z" fill="{c}" transform="rotate({ang:.1f} {x2} {y2})"/>'


def arrow(x1, y1, x2, y2, c=BLUE, width=3, dash=''):
    return line(x1, y1, x2, y2, c, width, dash) + head(x2, y2, math.degrees(math.atan2(y2 - y1, x2 - x1)), c, max(1.0, min(1.8, width / 4)))


def path(d, c=BLUE, fill='none', width=4, dash=''):
    return f'<path d="{d}" fill="{fill}" stroke="{c}" stroke-width="{width}" stroke-linejoin="round" stroke-linecap="round" stroke-dasharray="{dash}"/>'


def write(name, title, desc, parts):
    (ROOT / name).write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 440" role="img" aria-labelledby="title desc">'
        f'<title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc>'
        f'<g font-family="Arial, sans-serif">' + ''.join(parts) + '</g></svg>\n')


# ---------------------------------------------------------------------------
# Resting potential and driving forces on a voltage scale.
def vy(v):
    return 50 + (70 - v) * 370 / 170


p = [line(150, vy(70), 150, vy(-100), INK, 3), text(150, 30, 'mV', 22)]
for v in (60, 30, 0, -30, -60, -90):
    p += [line(140, vy(v), 150, vy(v), INK, 2), text(132, vy(v) + 8, f'{v:+d}'.replace('-', '−').replace('+0', '0'), 22, INK, 'end')]
p += [line(150, vy(61), 400, vy(61), RED, 4), text(410, vy(61) + 8, 'E_Na +61', 22, RED, 'start'),
      line(150, vy(-55), 400, vy(-55), INK, 2, '8 6'), text(410, vy(-55) + 8, 'threshold −55', 22, INK, 'start'),
      line(150, vy(-70), 400, vy(-70), BLUE, 6), text(410, vy(-70) + 14, 'Vm −70 (rest)', 22, BLUE, 'start', 'bold'),
      line(150, vy(-89), 400, vy(-89), GREEN, 4), text(410, vy(-89) + 14, 'E_K −89', 22, GREEN, 'start')]
p += [arrow(250, vy(-70) - 6, 250, vy(61) + 6, RED, 5), text(258, vy(0), 'Na⁺:\n131 mV', 22, RED, 'start'),
      arrow(330, vy(-70) + 4, 330, vy(-89) - 4, GREEN, 3)]
# membrane schematic
p += [rect(668, 70, 24, 330, GOLD, GOLD, 4), text(615, 95, 'outside', 22), text(750, 95, 'inside', 22),
      arrow(575, 180, 785, 180, RED, 12), text(620, 160, 'Na⁺ in', 24, RED, weight='bold'), text(745, 225, 'large', 22, RED),
      arrow(785, 300, 580, 300, GREEN, 4), text(745, 285, 'K⁺ out', 24, GREEN, weight='bold'), text(620, 335, 'small', 22, GREEN),
      text(610, 432, 'driving force = Vm − E_ion', 22)]
write('driving-forces.svg', 'Equilibrium potentials and driving forces at rest',
      'On a voltage scale, rest at -70 mV lies close to E_K (-89 mV) and far from E_Na (+61 mV). '
      'The driving force on Na+ is large and inward; on K+ it is small and outward.', p)

# ---------------------------------------------------------------------------
# The chemical synapse, numbered steps.
p = [rect(365, 0, 70, 60, PALE, BLUE, 0), path('M365 55 C 170 70, 160 225, 215 228 L 585 228 C 640 225, 630 70, 435 55', BLUE, PALE, 4),
     arrow(400, 5, 400, 50, RED, 4), text(450, 32, '1 spike arrives', 22, RED, 'start')]
for (x, y) in [(290, 125), (345, 170), (420, 110), (480, 160), (530, 120), (285, 185)]:
    p += [circle(x, y, 17, 'white', GOLD)]
    for dx, dy in [(-5, -4), (5, -3), (0, 6)]:
        p += [circle(x + dx, y + dy, 3, GOLD, GOLD, 1)]
# fused vesicle and released transmitter
p += [path('M380 228 A 20 20 0 0 1 420 228', GOLD, 'none', 3)]
for (x, y) in [(392, 238), (405, 244), (418, 237), (385, 247), (412, 251), (398, 252)]:
    p += [circle(x, y, 3.5, GOLD, GOLD, 1)]
# Ca channels on the side walls
for (x, y, ang, sx) in [(212, 190, 0, -1), (588, 190, 0, 1)]:
    p += [rect(x - 10, y - 15, 20, 30, RED, RED, 3), arrow(x + sx * 70, y + 20, x + sx * 5, y + 2, RED, 3)]
p += [text(10, 110, '2 Ca²⁺ channels\nopen; 3 Ca²⁺\nenters', 22, RED, 'start'),
      text(790, 110, '4 vesicles fuse:\nexocytosis', 22, GOLD, 'end')]
# postsynaptic cell
p += [rect(120, 262, 560, 80, LEAF, GREEN, 10), text(10, 255, 'cleft', 22, INK, 'start')]
for x in (350, 400, 450):
    p += [rect(x - 9, 254, 18, 20, GREEN, GREEN, 3)]
p += [arrow(400, 280, 400, 330, GREEN, 3), text(540, 310, '6 channels open', 22, GREEN),
      text(400, 380, '5 transmitter diffuses and binds receptors', 22, INK),
      text(400, 420, '7 removed: acetylcholinesterase or reuptake', 22, INK)]
write('synapse.svg', 'Steps of chemical synaptic transmission',
      'A spike reaches the presynaptic terminal, Ca2+ channels open and Ca2+ enters, vesicles fuse and release transmitter, '
      'transmitter crosses the cleft and binds receptors, postsynaptic channels open, and the transmitter is removed.', p)

# ---------------------------------------------------------------------------
# The knee-jerk reflex arc.
p = [ellipse(250, 260, 190, 36, PINK, RED), text(290, 268, '5 quadriceps contracts', 22, RED),
     ellipse(250, 360, 190, 30, GREY, INK), text(250, 368, 'hamstrings relax', 22, INK),
     path('M440 260 L 500 260', INK, 'none', 6), arrow(525, 312, 480, 272, INK, 3), text(520, 335, 'tap', 22, INK)]
# spinal cord cross-section (dorsal side up)
p += [ellipse(650, 130, 110, 80, GREY, INK),
      path('M575 105 C 610 70, 690 70, 725 105 C 705 130, 705 150, 725 170 C 690 200, 610 200, 575 170 C 595 150, 595 130, 575 105 Z', INK, '#dfe3e6', 2),
      text(650, 32, '3 spinal cord: one synapse', 22, INK)]
# spindle and sensory neuron
p += [rect(80, 250, 40, 20, GOLD, GOLD, 8), text(40, 205, '1 muscle spindle', 22, GOLD, 'start'),
      path('M120 258 C 300 190, 380 70, 470 62 L 625 110', BLUE, 'none', 5), circle(470, 62, 13, BLUE, BLUE),
      text(330, 110, '2 sensory\nneuron', 22, BLUE, 'end'), circle(628, 112, 6, BLUE, BLUE)]
# motor neuron to quadriceps
p += [circle(640, 135, 13, GREEN, GREEN), path('M640 135 C 600 230, 520 250, 410 250', GREEN, 'none', 5),
      text(520, 212, '4 motor neuron', 22, GREEN, 'end')]
# inhibitory interneuron and motor neuron to hamstrings
p += [circle(680, 155, 9, RED, RED), line(632, 116, 680, 155, RED, 3), circle(700, 175, 11, INK, INK),
      path('M700 175 C 700 260, 620 355, 440 358', INK, 'none', 4, '10 6'),
      text(790, 330, 'inhibitory\ninterneuron', 22, RED, 'end')]
write('reflex-arc.svg', 'The knee-jerk reflex arc',
      'A tap stretches the quadriceps; its muscle spindle excites a sensory neuron, which synapses once in the spinal cord on a motor neuron '
      'that makes the quadriceps contract. An inhibitory interneuron relaxes the hamstrings.', p)

# ---------------------------------------------------------------------------
# The sarcomere at two lengths (scale: 256 px per micrometre).
def sarcomere(y0, z1, z2, label):
    c = (z1 + z2) / 2; um = 256; thick = 1.6 * um / 2; thin = 1.0 * um
    q = [text(15, y0 - 80, label, 22, INK, 'start', 'bold')]
    for dy in (-30, 0, 30):
        q += [line(c - thick, y0 + dy, c + thick, y0 + dy, RED, 9)]
        for x in range(int(c - thick + 12), int(c - 18), 22):
            q += [line(x, y0 + dy - 7, x - 6, y0 + dy - 13, RED, 3), line(x, y0 + dy + 7, x - 6, y0 + dy + 13, RED, 3)]
        for x in range(int(c + 18), int(c + thick - 6), 22):
            q += [line(x, y0 + dy - 7, x + 6, y0 + dy - 13, RED, 3), line(x, y0 + dy + 7, x + 6, y0 + dy + 13, RED, 3)]
    for dy in (-45, -15, 15, 45):
        q += [line(z1, y0 + dy, z1 + thin, y0 + dy, BLUE, 4), line(z2, y0 + dy, z2 - thin, y0 + dy, BLUE, 4)]
    q += [line(z1, y0 - 58, z1, y0 + 58, INK, 6), line(z2, y0 - 58, z2, y0 + 58, INK, 6), line(c, y0 - 40, c, y0 + 40, INK, 2, '4 4')]
    # brackets
    yb = y0 + 72
    q += [line(c - thick, yb, c + thick, yb, RED, 2), text(c, yb + 26, 'A band', 22, RED)]
    if c - thick - z1 > 4:
        q += [line(z1, yb, c - thick, yb, BLUE, 2), text((z1 + c - thick) / 2, yb + 26, 'I', 22, BLUE),
              line(c + thick, yb, z2, yb, BLUE, 2), text((z2 + c + thick) / 2, yb + 26, 'I', 22, BLUE)]
    hz = (z2 - thin) - (z1 + thin)
    if hz > 4:
        q += [line(z1 + thin, y0 - 64, z2 - thin, y0 - 64, GOLD, 3), text(c, y0 - 72, 'H zone', 22, GOLD)]
    return q


p = sarcomere(110, 80, 720, '2.5 µm') + sarcomere(320, 131, 669, '2.1 µm')
p += [text(560, 30, 'myosin', 22, RED, 'end'), text(660, 30, 'actin', 22, BLUE, 'end'), text(790, 30, 'Z disc', 22, INK, 'end')]
write('sarcomere.svg', 'A sarcomere at two lengths',
      'When a sarcomere shortens from 2.5 to 2.1 micrometres the A band (thick filament length) is unchanged, while the I bands and the H zone become shorter. '
      'Neither thick nor thin filaments change length; they overlap more.', p)

# ---------------------------------------------------------------------------
# The cross-bridge cycle.
boxes = [(400, 62, 290, '1 ATP binds:\nhead detaches', BLUE), (665, 210, 250, '2 ATP → ADP + Pᵢ:\nhead re-cocked', GOLD),
         (400, 358, 290, '3 head binds actin\n(site exposed by Ca²⁺)', GREEN), (135, 210, 250, '4 Pᵢ released:\npower stroke', RED)]
p = []
for x, y, w, s, c in boxes:
    p += [rect(x - w / 2, y - 45, w, 90, 'white', c, 12), text(x, y - 6, s, 23, c)]
p += [arrow(548, 70, 650, 160, INK), arrow(650, 260, 548, 350, INK), arrow(252, 350, 150, 260, INK), arrow(150, 160, 252, 70, INK)]
p += [text(400, 200, 'no ATP: heads', 22, INK), text(400, 228, 'stay attached', 22, INK), text(400, 256, '= rigor', 22, INK),
      text(400, 432, 'each power stroke moves actin ~10 nm', 22, INK)]
write('crossbridge.svg', 'The cross-bridge cycle',
      'ATP binding detaches myosin from actin; ATP hydrolysis re-cocks the head; the head binds an exposed site on actin; '
      'phosphate release drives the power stroke. Without ATP the heads stay attached (rigor).', p)

# ---------------------------------------------------------------------------
# Nervous systems across animals.
p = [rect(5, 5, 255, 430, GREY, 'none', 12, 0), rect(272, 5, 255, 430, GREY, 'none', 12, 0), rect(539, 5, 256, 430, GREY, 'none', 12, 0),
     text(132, 40, 'Hydra', 24, INK, weight='bold'), text(400, 40, 'Earthworm', 24, INK, weight='bold'), text(667, 40, 'Vertebrate', 24, INK, weight='bold')]
# hydra: tube with tentacles, nerve net
p += [path('M95 310 L 95 140 C 95 120, 170 120, 170 140 L 170 310 Z', BLUE, PALE, 3)]
for d in ('M105 128 C 80 80, 60 90, 45 70', 'M125 122 C 120 80, 110 70, 115 55', 'M150 124 C 160 80, 180 80, 200 65', 'M165 132 C 200 110, 220 120, 235 105'):
    p += [path(d, BLUE, 'none', 3)]
import random
rnd = random.Random(4)
pts = [(x + rnd.uniform(-7, 7), y + rnd.uniform(-7, 7)) for y in range(150, 300, 30) for x in (110, 132, 155)]
for i, a in enumerate(pts):
    for b in pts[i + 1:]:
        if math.dist(a, b) < 40:
            p += [line(a[0], a[1], b[0], b[1], GREEN, 2)]
p += [circle(x, y, 4, GREEN, GREEN, 1) for x, y in pts]
p += [text(132, 345, 'nerve net,', 22), text(132, 372, 'no brain', 22)]
# earthworm: segmented body, cerebral ganglia dorsal at front, ventral cord with ganglia
p += [rect(290, 160, 220, 70, PINK, RED, 35)]
for x in range(320, 500, 22):
    p += [line(x, 162, x, 228, RED, 1)]
p += [circle(495, 178, 9, GREEN, GREEN), path('M495 178 C 505 200, 495 215, 485 218 L 300 218', GREEN, 'none', 4)]
p += [circle(x, 218, 5, GREEN, GREEN, 1) for x in range(310, 480, 22)]
p += [text(400, 285, 'brain at front,', 22), text(400, 312, 'ventral cord', 22), text(400, 339, 'with ganglia', 22), arrow(400, 125, 470, 125, INK, 2), text(400, 115, 'moves', 22, INK, 'end')]
# vertebrate: body outline with dorsal brain and cord
p += [path('M560 210 C 590 150, 760 150, 785 205 C 760 255, 590 255, 560 210 Z', BLUE, PALE, 3),
      ellipse(740, 185, 22, 15, GREEN, GREEN), path('M720 185 L 585 192', GREEN, 'none', 5)]
p += [text(667, 285, 'brain +', 22), text(667, 312, 'dorsal hollow', 22), text(667, 339, 'spinal cord', 22)]
p += [text(400, 420, 'Same parts everywhere: neurons, spikes and synapses', 22, INK)]
write('nervous-systems.svg', 'Three ways to organise a nervous system',
      'Hydra has a diffuse nerve net and no brain. An earthworm has cerebral ganglia at the front and a ventral nerve cord with a ganglion in each segment. '
      'A vertebrate has a brain and a dorsal hollow spinal cord.', p)

# ---------------------------------------------------------------------------
# The male hypothalamic-pituitary-gonadal axis.
p = [rect(220, 20, 260, 62, PALE, BLUE, 10), text(350, 60, 'Hypothalamus', 24, BLUE, weight='bold'),
     rect(220, 140, 260, 62, PALE, BLUE, 10), text(350, 180, 'Anterior pituitary', 24, BLUE, weight='bold'),
     rect(80, 270, 230, 62, LEAF, GREEN, 10), text(195, 310, 'Leydig cells', 24, GREEN, weight='bold'),
     rect(390, 270, 230, 62, LEAF, GREEN, 10), text(505, 310, 'Sertoli cells', 24, GREEN, weight='bold'),
     arrow(350, 84, 350, 136, INK), text(362, 118, 'GnRH', 22, INK, 'start'),
     arrow(290, 204, 220, 266, INK), text(262, 248, 'LH', 22, INK, 'start'),
     arrow(410, 204, 480, 266, INK), text(470, 236, 'FSH', 22, INK, 'start'),
     arrow(195, 334, 300, 392, GREEN), arrow(505, 334, 400, 392, GREEN), text(350, 425, 'spermatogenesis, male traits', 22, GREEN)]
p += [path('M80 300 L 40 300 L 40 51 L 212 51', RED, 'none', 3, '10 6'), head(214, 51, 0, RED),
      path('M40 171 L 212 171', RED, 'none', 3, '10 6'), head(214, 171, 0, RED),
      text(50, 245, 'testosterone (−)', 22, RED, 'start')]
p += [path('M620 300 L 680 300 L 680 171 L 488 171', RED, 'none', 3, '10 6'), head(486, 171, 180, RED), text(690, 240, 'inhibin (−)', 22, RED, 'start')]
write('hpg-axis.svg', 'The male hypothalamic-pituitary-gonadal axis',
      'GnRH from the hypothalamus stimulates LH and FSH release from the anterior pituitary. LH drives testosterone from Leydig cells; FSH acts on Sertoli cells. '
      'Testosterone inhibits the hypothalamus and pituitary; inhibin inhibits FSH release.', p)


# ---------------------------------------------------------------------------
# Plotted figures.
def hh(I_of_t, T, dt=0.005, shift=-5.0, phi=3.0):
    """Hodgkin-Huxley squid axon; rate constants x phi = 3 (about 16 C), so a spike lasts ~1 ms.
    Returns t, V (shifted), gNa, gK. The a5-spike demo uses the same model."""
    import numpy as np
    n = int(T / dt); t = np.arange(n) * dt
    V = -65.0; m, h, nn = 0.053, 0.596, 0.318
    out = np.empty((4, n))
    for i in range(n):
        v = V + 65.0
        am = 0.1 * (25 - v) / (math.exp((25 - v) / 10) - 1) if abs(25 - v) > 1e-6 else 1.0
        bm = 4 * math.exp(-v / 18); ah = 0.07 * math.exp(-v / 20); bh = 1 / (math.exp((30 - v) / 10) + 1)
        an = 0.01 * (10 - v) / (math.exp((10 - v) / 10) - 1) if abs(10 - v) > 1e-6 else 0.1
        bn = 0.125 * math.exp(-v / 80)
        gna = 120 * m ** 3 * h; gk = 36 * nn ** 4
        I = I_of_t(t[i])
        dV = I - gna * (V - 50) - gk * (V + 77) - 0.3 * (V + 54.387)
        m += dt * phi * (am * (1 - m) - bm * m); h += dt * phi * (ah * (1 - h) - bh * h); nn += dt * phi * (an * (1 - nn) - bn * nn)
        V += dt * dV
        out[:, i] = (V + shift, gna, gk, 0)
    return t, out[0], out[1], out[2]


def twitch_force(stim_times, T=600, dt=1.0, tau=40.0, s0=3.04):
    """Sum of twitch kernels (t/tau)exp(1 - t/tau), then saturation 1 - exp(-S/s0). Same as the a5-twitch demo."""
    import numpy as np
    t = np.arange(0, T, dt); S = np.zeros_like(t)
    for ts in stim_times:
        u = np.clip(t - ts, 0, None) / tau
        S += np.where(t >= ts, u * np.exp(1 - u), 0)
    return t, 1 - np.exp(-S / s0)


def plots():
    import numpy as np
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

    # Action potential with channel conductances
    t, V, gna, gk = hh(lambda s: 40.0 if 1.0 <= s < 1.5 else 0.0, 8.0)
    print(f'AP: rest {V[0]:.1f}, peak {V.max():.1f}, AHP {V[int(2.5/0.005):].min():.1f} mV')
    f = fig()
    ax = f.add_axes([0.13, 0.36, 0.84, 0.6]); bx = f.add_axes([0.13, 0.13, 0.84, 0.2], sharex=ax)
    ax.plot(t, V, color=INK, lw=4)
    ax.axhline(-55, color=INK, lw=1.5, ls='--'); ax.text(7.95, -50, 'threshold', fontsize=22, ha='right')
    ax.axhline(-70, color=BLUE, lw=1.5, ls=':'); ax.text(7.95, -66, 'rest', fontsize=22, ha='right', color=BLUE)
    ip = int(np.argmax(V))
    ax.annotate('Na⁺ open', (t[ip] - 0.3, 0), (0.15, 10), fontsize=22, color=RED, ha='left',
                arrowprops=dict(arrowstyle='->', color=RED, lw=2))
    ax.annotate('Na⁺ inactivate,\nK⁺ open', (t[ip] + 0.6, 0), (t[ip] + 1.6, 5), fontsize=22, color=GREEN, va='center',
                arrowprops=dict(arrowstyle='->', color=GREEN, lw=2))
    ia = int(2.5 / 0.005) + int(np.argmin(V[int(2.5 / 0.005):]))
    ax.annotate('undershoot', (t[ia], V[ia]), (t[ia] + 1.0, -106), fontsize=22, color=GREEN,
                arrowprops=dict(arrowstyle='->', color=GREEN, lw=2))
    ax.set_ylim(-110, 50); ax.set_yticks([-90, -70, -50, -30, -10, 10, 30, 50]); ax.set_yticklabels(['−90', '', '−50', '', '−10', '', '30', ''])
    ax.set_ylabel('Vm (mV)'); plt.setp(ax.get_xticklabels(), visible=False)
    bx.plot(t, gna, color=RED, lw=3); bx.plot(t, gk, color=GREEN, lw=3)
    bx.text(0.2, 25, 'g_Na', color=RED, fontsize=22); bx.text(5.5, 18, 'g_K', color=GREEN, fontsize=22)
    bx.set_yticks([]); bx.set_ylabel('open')
    bx.set_xlabel('Time (ms)'); bx.set_xlim(0, 8)
    save(f, 'action-potential.svg', 'An action potential with Na+ and K+ conductances')

    # Refractory periods: a second stimulus after 2 ms or 3 ms
    f = fig()
    cases = [(1.5, 320, 'at 1.5 ms, 8× stronger: no spike (absolute)', RED),
             (3.0, 40, 'at 3 ms, same strength: no spike', GOLD),
             (3.0, 80, 'at 3 ms, 2× stronger: spike (relative)', GREEN)]
    for k, (d, a2, lab, col) in enumerate(cases):
        t, V, _, _ = hh(lambda s, d=d, a2=a2: 40.0 if 1 <= s < 1.5 else (a2 if 1 + d <= s < 1.5 + d else 0.0), 10.0)
        n = int(np.sum((V[1:] > 0) & (V[:-1] <= 0)))
        print(f'refractory {d} ms x{a2/40:.0f}: {n} spikes')
        ax = f.add_axes([0.1, 0.70 - 0.27 * k, 0.87, 0.23])
        ax.plot(t, V, color=col, lw=3)
        ax.plot([1, 1 + d], [-100, -100], '^', color=INK, ms=11)
        ax.text(9.9, 5, lab, color=col, fontsize=22, ha='right')
        ax.set_ylim(-110, 45); ax.set_xlim(0, 10); ax.set_yticks([-70, 30]); ax.set_yticklabels(['−70', '+30'])
        if k < 2:
            plt.setp(ax.get_xticklabels(), visible=False)
        else:
            ax.set_xlabel('Time (ms); triangles = stimuli')
    f.text(0.01, 0.55, 'Vm (mV)', rotation=90, va='center', fontsize=22)
    save(f, 'refractory.svg', 'A second stimulus during the refractory period')

    # Twitch, summation, tetanus
    f = fig()
    cases = [([20], 'twitch', BLUE), ([20 + 100 * i for i in range(5)], '10 Hz: summation', GOLD), ([20 + 12.5 * i for i in range(40)], '80 Hz: tetanus', RED)]
    for k, (stims, lab, col) in enumerate(cases):
        ax = f.add_axes([0.1 + 0.3 * k, 0.17, 0.26, 0.7])
        t, F = twitch_force(stims)
        ax.plot(t, F, color=col, lw=4)
        ax.plot(stims, [-0.07] * len(stims), '|', color=INK, ms=14, mew=2)
        ax.set_ylim(-0.12, 1.05); ax.set_xlim(0, 600); ax.set_xticks([0, 500])
        ax.set_title(lab, color=col, fontsize=22)
        if k == 0:
            ax.set_ylabel('Force (tetanus = 1)')
        else:
            ax.set_yticklabels([])
        if k == 1:
            ax.set_xlabel('Time (ms); ticks = stimuli')
    save(f, 'summation.svg', 'Twitch, summation and tetanus')

    # Ovarian cycle hormones (schematic shapes on a relative scale)
    d = np.linspace(0, 28, 400)
    g = lambda c, w: np.exp(-0.5 * ((d - c) / w) ** 2)
    lh = 0.12 + 0.85 * g(13.5, 0.7)
    fsh = 0.2 + 0.15 * g(3, 3) + 0.25 * g(13.5, 0.8) + 0.12 * g(28.5, 2)
    oes = 0.1 + 0.55 * g(12, 2.0) + 0.25 * g(21, 3)
    prog = 0.05 + 0.75 * g(21, 3.0)
    f = fig(); ax = f.add_axes([0.06, 0.17, 0.92, 0.7])
    ax.axvspan(0, 14, color=BLUE, alpha=0.07)
    ax.plot(d, lh, color=RED, lw=4); ax.plot(d, fsh, color=GOLD, lw=4); ax.plot(d, oes, color=BLUE, lw=4); ax.plot(d, prog, color=GREEN, lw=4)
    ax.text(14.6, 0.7, 'LH surge', color=RED, fontsize=22)
    ax.text(1, 0.43, 'FSH', color=GOLD, fontsize=22)
    ax.text(8.6, 0.5, 'oestradiol', color=BLUE, fontsize=22, ha='right')
    ax.text(21, 0.86, 'progesterone', color=GREEN, fontsize=22, ha='center')
    ax.axvline(14, color=INK, lw=1.5, ls='--'); ax.text(14, 1.03, 'ovulation', fontsize=22, ha='center')
    ax.text(7, 1.03, 'follicular phase', fontsize=22, ha='center', color=BLUE)
    ax.text(21, 1.03, 'luteal phase', fontsize=22, ha='center', color=GREEN)
    ax.set_xlim(0, 28); ax.set_ylim(0, 1.0); ax.set_yticks([]); ax.set_ylabel('relative level')
    ax.set_xticks([0, 7, 14, 21, 28]); ax.set_xlabel('Day of cycle')
    save(f, 'ovarian-cycle.svg', 'Hormone levels across a 28-day ovarian cycle')


plots()
