"""Original explanatory vectors for A1; run from any directory with Python 3."""
from pathlib import Path
from html import escape
ROOT=Path(__file__).parent
BLUE='#267a91'; RED='#b64853'; GREEN='#397646'; INK='#243645'; PALE='#eaf3f5'; GOLD='#b37a22'
def text(x,y,s,size=25,colour=INK,anchor='middle'):
    return ''.join(f'<text x="{x}" y="{y+i*30}" font-size="{size}" fill="{colour}" text-anchor="{anchor}">{escape(line)}</text>' for i,line in enumerate(s.split('\n')))
def rect(x,y,w,h,fill=PALE,stroke=BLUE,r=6):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="3"/>'
def circle(x,y,r,fill=PALE,stroke=BLUE):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="3"/>'
def line(x1,y1,x2,y2,c=INK,width=3,dash=''):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{width}" stroke-dasharray="{dash}"/>'
def arrow(x1,y1,x2,y2,c=BLUE):
    return line(x1,y1,x2,y2,c)+f'<path d="M {x2} {y2} l -12 -7 l 0 14 Z" fill="{c}" transform="rotate({__import__("math").degrees(__import__("math").atan2(y2-y1,x2-x1))} {x2} {y2})"/>'
def path(d,c=BLUE,fill='none',width=4):
    return f'<path d="{d}" fill="{fill}" stroke="{c}" stroke-width="{width}" stroke-linejoin="round"/>'
def write(name,title,desc,parts):
    (ROOT/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 440" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc><g font-family="Arial, sans-serif">'+''.join(parts)+'</g></svg>\n')

# Levels: recognisable structural features rather than boxes of vocabulary.
p=[text(400,35,'One intestinal wall contains several tissues')]
p += [circle(90,150,40),circle(90,150,12,'#b8d9e2'),text(90,235,'Cell')]
for x in range(205,335,31): p += [rect(x,117,30,66),circle(x+15,150,5,BLUE),line(x,185,x+30,185,RED)]
p += [text(270,235,'Epithelium'),arrow(140,150,190,150)]
p += [circle(470,150,70,'#f3e8df',GOLD),circle(470,150,48,'#d6e9df',GREEN),circle(470,150,31,'white',BLUE),text(470,235,'Intestinal wall'),arrow(345,150,385,150)]
p += [path('M650 105 C625 130 625 175 650 200 L710 200 C735 175 735 130 710 105 Z',INK,'#f4f5f6'),path('M660 130 C700 110 720 150 665 155 C635 175 720 190 700 165',RED),text(680,235,'Organism'),arrow(550,150,615,150)]
p += [text(400,305,'Epithelium + connective tissue + muscle + nerves',24),text(400,355,'Functions depend on their arrangement and interaction.',24),text(400,410,'Original schematic; not a specimen image',22)]
write('levels.svg','Cells, tissues and organs','A cell joins a sheet of epithelium. The sheet is one layer in an intestinal wall, part of an organism.',p)

# Internal compartments and a continuous gut lumen.
p=[rect(75,85,650,275,'#f1f5f6',INK,35),text(400,60,'Body boundary'),rect(50,130,700,85,'#fff4df',GOLD),text(400,178,'Gut lumen: connected to the exterior',25)]
for x in range(85,710,40):p += [rect(x,215,39,35,'#d9ebf0',BLUE,0)]
p += [text(255,282,'Selective epithelium',23),arrow(420,180,420,295,BLUE),text(535,283,'Absorption',23),rect(160,310,480,25,'#f5dadd',RED),arrow(200,323,590,323,RED),text(400,395,'Interstitial fluid and blood are internal compartments.',23)]
write('compartments.svg','The gut lumen is outside the internal environment','A gut lumen crosses the body boundary. Absorption crosses its epithelial lining into internal fluid and blood.',p)

# Isometric cubes, with surface-to-volume accounting.
def cube(x,y,s):
    d=s*.38
    return [path(f'M{x} {y} l{s} 0 l0 {s} l{-s} 0 Z',BLUE,'#d8eaf0'),path(f'M{x} {y} l{d} {-d} l{s} 0 l{-d} {d} Z',BLUE,'#edf6f8'),path(f'M{x+s} {y} l{d} {-d} l0 {s} l{-d} {d} Z',BLUE,'#b8d7e1')]
p=[text(400,25,'Doubling length does not double exchange capacity')]+cube(105,145,85)+cube(460,100,170)
p += [text(155,285,'Length L'),text(555,305,'Length 2L'),text(160,345,'Area 6L²\nVolume L³',24),text(560,345,'Area ×4\nVolume ×8',24),text(400,430,'Surface area / volume falls from 6/L to 3/L.',24)]
write('geometry.svg','Surface area and volume scale differently','Two cubes have lengths L and 2L. Surface area increases fourfold and volume eightfold, halving their surface-to-volume ratio.',p)

# Diffusion distances and time bars, explicitly schematic.
p=[text(400,38,'Same diffusion coefficient: time scale ∝ distance²')]
p += [rect(60,95,95,95),circle(105,140,14,BLUE),arrow(165,142,225,142),circle(250,142,17,'#f5dadd',RED),text(160,225,'Distance L',24),rect(60,260,6,35,BLUE),text(60,335,'Time scale 1',24,anchor='start')]
p += [rect(420,95,95,95),circle(465,140,14,BLUE),arrow(525,142,735,142),circle(760,142,17,'#f5dadd',RED),text(600,225,'Distance 10L',24),rect(180,260,600,35,BLUE),text(480,335,'Time scale 100',24)]
p += [text(400,395,'Bulk flow bridges long distances; diffusion handles short final steps.',23),text(400,430,'Distance arrows are schematic; time bars show the 1:100 ratio.',22)]
write('diffusion.svg','Long diffusion distances are slow','For unchanged diffusion properties, a tenfold distance has an approximately hundredfold characteristic time. The time bars represent that ratio.',p)

# Polarity and epithelial layer number.
p=[text(210,40,'Thin exchange lining'),text(600,40,'Layered protective lining'),text(400,90,'Lumen / exposed surface',24)]
for x in range(60,355,60):p += [rect(x,160,58,35,'#d8eaf0'),circle(x+29,177,7,BLUE)]
for row in range(3):
    for x in range(450,745,60):p += [rect(x,115+row*42,58,40,'#f3dfe3',RED),circle(x+29,135+row*42,7,RED)]
p += [line(60,205,355,205,INK),line(450,250,745,250,INK),arrow(200,120,200,245),text(210,300,'One short diffusion path',23),text(600,300,'Multiple cell layers',23),text(400,355,'Apical side faces the lumen; basal side faces support tissue.',23),text(400,412,'Original tissue schematic — not a micrograph',22)]
write('epithelium.svg','Epithelial polarity and layers','A one-cell-thick flattened lining presents a short exchange barrier. A stratified lining has several layers. Apical and basal sides are labelled.',p)

# Muscle fibre and a neuron: shapes carry the mechanism.
p=[text(200,40,'Muscle: organised force'),text(600,40,'Neuron: connected signalling')]
for y in [100,155,210]:
    p += [rect(45,y,310,38,'#f6dfe0',RED)]
    for x in range(60,345,25):p += [line(x,y+3,x,y+35,RED,2)]
p += [arrow(160,280,70,280,RED),arrow(245,280,335,280,RED),text(200,330,'Contractile elements\narranged within fibres',24)]
p += [circle(570,170,43,'#e1ebdc',GREEN),circle(570,170,14,GREEN)]
for endpoint in [(460,90),(455,150),(470,250),(550,70)]:p += [path(f'M550 160 L{endpoint[0]} {endpoint[1]}',GREEN)]
p += [path('M610 170 L730 170 L775 125 M730 170 L775 210',GREEN),arrow(635,200,720,200,GREEN),text(600,330,'Processes link cells;\nsignals change targets.',24),text(400,420,'Conceptual tissue sketches; not diagnostic histology images',22)]
write('muscle-neuron.svg','Structure supports force or signalling','Parallel striated muscle fibres indicate organised contractile machinery. A branched neuron has processes carrying signals toward connected targets.',p)

# Section angle: single tube, two section planes.
p=[text(400,38,'One tube can produce different section profiles')]
p += [rect(45,110,350,100,'#dcebf0',BLUE,48),rect(45,140,350,40,'white',BLUE,18),line(150,75,150,245,RED,4,'8 5'),line(75,161,365,161,GREEN,4,'8 5'),text(155,285,'Cut across',24,RED),text(300,335,'Cut along',24,GREEN)]
p += [arrow(400,125,480,125,RED),circle(590,125,65,'#dcebf0',BLUE),circle(590,125,35,'white',BLUE),text(700,135,'Ring',24)]
p += [arrow(400,300,480,300,GREEN),rect(510,265,230,18,'#dcebf0'),rect(510,320,230,18,'#dcebf0'),text(625,390,'Two walls + lumen',24),text(400,425,'Orientation changes appearance, not organ identity.',22)]
write('sections.svg','Sectioning changes the apparent shape','A transverse plane through a tube gives a ring, while a longitudinal plane shows two wall profiles separated by a lumen.',p)

# Feedback loop: clear sign and pathway not an isolated text chain.
p=[text(400,35,'Response opposes the temperature disturbance')]
p += [rect(40,75,250,75,'#f5dadd',RED),text(165,107,'Body temperature\nrises',25),arrow(295,112,430,112),rect(440,75,300,75),text(590,107,'Sensing and\nneural control',25)]
p += [arrow(590,155,590,240),rect(440,250,300,85,'#e4efdf',GREEN),text(590,285,'Heat loss increases;\nheat production may fall',23)]
p += [arrow(430,292,300,292,GREEN),rect(40,250,250,85,'#edf5f7'),text(165,285,'Temperature moves\ntowards its range',23)]
p += [arrow(165,245,165,155,GREEN),text(195,205,'−',38,GREEN),text(400,392,'As the deviation falls, the response is reduced.',24),text(400,430,'Negative feedback describes direction, not harm.',23)]
write('feedback.svg','Negative feedback in temperature regulation','A rise in body temperature activates sensing and control, changing heat loss and production. The resulting temperature change opposes the disturbance.',p)

# Two actual gas routes and the role of circulation.
p=[text(200,40,'Insect'),text(600,40,'Mammal')]
p += [path('M60 110 L145 110 L200 150 L280 110 M200 150 L280 190 M200 150 L200 235 M200 235 L290 265 M200 235 L120 270',BLUE),text(75,80,'Air',24),arrow(65,125,135,125),circle(305,265,20,'#e2eedf',GREEN),circle(305,190,20,'#e2eedf',GREEN),text(195,340,'Tracheae branch\nnear tissue cells',24)]
p += [path('M500 90 L500 135 M500 135 C440 100 435 225 490 230 L500 145 M500 135 C560 100 565 225 510 230 L500 145',BLUE,'#e4eff3'),text(510,75,'Air',24),arrow(555,180,630,180,BLUE),path('M630 125 L690 125 L690 265 L630 265 Z',RED),arrow(690,180,750,180,RED),circle(770,180,20,'#e2eedf',GREEN),text(600,340,'Lungs → blood → cells',24),text(400,410,'Both need a gradient and a short final diffusion path.',23)]
write('gas-routes.svg','Two transport architectures for oxygen','Insects bring air through branching tracheal tubes near cells. Mammals exchange gases at the lungs and use blood to deliver oxygen to tissues.',p)
