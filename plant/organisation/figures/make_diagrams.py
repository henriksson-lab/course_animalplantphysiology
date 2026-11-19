"""Original explanatory vectors for P1; run from any directory with Python 3."""
from pathlib import Path
from html import escape
import math, random
ROOT=Path(__file__).parent
BLUE='#267a91'; RED='#b64853'; GREEN='#397646'; INK='#243645'; PALE='#eaf3f5'; GOLD='#b37a22'
WALL='#f3e8df'; CYTO='#e2eedf'; VAC='#d8eaf0'
def text(x,y,s,size=24,colour=INK,anchor='middle',weight='normal'):
    return ''.join(f'<text x="{x}" y="{y+i*30}" font-size="{size}" fill="{colour}" text-anchor="{anchor}" font-weight="{weight}">{escape(line)}</text>' for i,line in enumerate(s.split('\n')))
def rect(x,y,w,h,fill=PALE,stroke=BLUE,r=6,width=3):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'
def circle(x,y,r,fill=PALE,stroke=BLUE,width=3):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'
def ellipse(x,y,rx,ry,fill=PALE,stroke=BLUE,width=3):
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'
def line(x1,y1,x2,y2,c=INK,width=3,dash=''):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{width}" stroke-dasharray="{dash}" stroke-linecap="round"/>'
def head(x2,y2,ang,c):
    return f'<path d="M {x2} {y2} l -14 -8 l 0 16 Z" fill="{c}" transform="rotate({math.degrees(ang):.1f} {x2} {y2})"/>'
def arrow(x1,y1,x2,y2,c=BLUE,width=3,dash=''):
    return line(x1,y1,x2,y2,c,width,dash)+head(x2,y2,math.atan2(y2-y1,x2-x1),c)
def path(d,c=BLUE,fill='none',width=4,dash=''):
    return f'<path d="{d}" fill="{fill}" stroke="{c}" stroke-width="{width}" stroke-linejoin="round" stroke-dasharray="{dash}"/>'
def write(name,title,desc,parts):
    (ROOT/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 440" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc><g font-family="Arial, sans-serif">'+''.join(parts)+'</g></svg>\n')

# --- Turgor: flaccid versus turgid cell -------------------------------------------
def cell(x,y,w,h,gap):
    """Wall (green) with protoplast inside; gap = space between wall and membrane."""
    return [rect(x,y,w,h,WALL,GREEN,10,7),
            rect(x+6+gap,y+6+gap,w-12-2*gap,h-12-2*gap,CYTO,GREEN,8,2),
            rect(x+22+gap,y+22+gap,w-44-2*gap,h-44-2*gap,VAC,BLUE,8,2)]
p=[text(400,28,'Turgor: the vacuole swells, the wall pushes back')]
p+=[text(185,70,'Flaccid: Ψp = 0')]+cell(85,105,200,170,0)
p+=[text(185,215,'vacuole',22,BLUE)]
p+=[arrow(320,190,410,190,BLUE),text(365,170,'water',22,BLUE)]
p+=[text(610,70,'Turgid: Ψp = 0.3–1 MPa')]+cell(470,100,280,190,0)
p+=[text(610,186,'vacuole',22,BLUE),text(610,212,'+ solutes',22,BLUE)]
for (x1,y1,x2,y2) in [(610,240,610,280),(610,150,610,112),(520,195,480,195),(700,195,740,195)]:
    p+=[arrow(x1,y1,x2,y2,RED,4)]
for (x1,y1,x2,y2) in [(610,316,610,298),(610,80,610,95)]:
    p+=[arrow(x1,y1,x2,y2,GREEN,4)]
p+=[text(610,335,'red: turgor pushes out',22,RED),text(610,362,'green: wall resists',22,GREEN)]
p+=[text(185,320,'membrane just touches',22),text(185,347,'the wall; no pressure',22)]
p+=[text(400,418,'Turgid cells pressing on each other make a leaf or stem rigid.',23)]
write('turgor.svg','Flaccid and turgid plant cells','A flaccid cell has no turgor. After water enters the solute-rich vacuole, the protoplast presses outward on the wall and the wall resists, giving turgor pressure.',p)

# --- Microfibril orientation sets the direction of expansion ----------------------
def hoop_cell(x,y,w,h):
    out=[rect(x,y,w,h,WALL,GREEN,10,4)]
    for xx in range(x+12,x+w-6,14): out.append(line(xx,y+4,xx,y+h-4,GREEN,3))
    return out
def random_cell(x,y,w,h,seed):
    rnd=random.Random(seed); out=[rect(x,y,w,h,WALL,GREEN,10,4)]
    for _ in range(int(w*h/260)):
        cx=rnd.uniform(x+14,x+w-14); cy=rnd.uniform(y+14,y+h-14); a=rnd.uniform(0,math.pi); L=11
        out.append(line(cx-L*math.cos(a),cy-L*math.sin(a),cx+L*math.cos(a),cy+L*math.sin(a),GREEN,3))
    return out
p=[text(400,34,'Microfibril orientation sets the direction of growth')]
p+=[text(205,78,'Transverse "hoops"')]+hoop_cell(70,100,170,80)
p+=[arrow(155,192,155,232,INK),text(175,220,'grows',22,anchor='start')]
p+=hoop_cell(70,245,300,80)+[arrow(250,285,355,285,RED,4)]
p+=[text(205,365,'Lengthens, hardly widens',23),text(205,395,'(stems, roots)',22)]
p+=[text(610,78,'Random orientation')]+random_cell(560,100,100,80,3)
p+=[arrow(610,192,610,222,INK)]
p+=random_cell(530,232,160,120,5)
p+=[text(610,385,'Expands in all directions',23)]
p+=[line(400,70,400,400,'#c9d3d9',2,'6 6')]
p+=[text(400,430,'Green lines: cellulose microfibrils in the primary wall',22,GREEN)]
write('wall-microfibrils.svg','Microfibril orientation and the direction of cell expansion','A cell with transverse cellulose microfibrils elongates along its axis under turgor, while a cell with randomly oriented microfibrils expands in all directions.',p)

# --- Acid growth: H+ pumping loosens the wall --------------------------------------
def wall_panel(x0,spacing,broken):
    out=[rect(x0-30,100,5*spacing+20,205,WALL,'#d8c3ae',4,2)]
    xs=[x0+i*spacing for i in range(5)]
    tether_y=[130,175,220,265]
    for i in range(4):
        for j,ty in enumerate(tether_y):
            yy=ty+(12 if (i+j)%2 else 0)
            a,b=xs[i]+5,xs[i+1]-5
            if not broken:
                out.append(line(a,yy,b,yy,GOLD,4))
            else:
                out+= [line(a,yy,a+14,yy,GOLD,4),line(b-14,yy+8,b,yy+8,GOLD,4)]
                if j%2==0: out.append(circle((a+b)/2,yy+4,7,'#f5dadd',RED,2))
    for x in xs: out.append(rect(x-5,105,10,195,GREEN,GREEN,3,1))
    return out
p=[text(205,34,'Neutral wall'),text(605,34,'Acidified wall')]
p+=wall_panel(95,55,False)
p+=wall_panel(470,67,True)
p+=[arrow(560,72,440,72,RED,4),arrow(650,72,770,72,RED,4),text(605,80,'turgor',22,RED)]
# plasma membranes and pumps
for x0,x1 in [(55,375),(430,775)]:
    p+=[line(x0,318,x1,318,INK,3),line(x0,328,x1,328,INK,3)]
p+=[circle(637,323,17,'#fff4df',GOLD,3),arrow(637,305,637,250,RED,4)]
for (hx,hy) in [(503,200),(637,200),(570,290),(704,290)]:
    p+=[text(hx,hy,'H⁺',22,RED,weight='bold')]
p+=[text(605,365,'ATP-driven H⁺ pump in membrane',22)]
p+=[text(205,365,'tethers hold microfibrils',22)]
p+=[text(400,405,'Low wall pH activates expansins (red): tethers slip,',23),text(400,433,'and turgor stretches the wall irreversibly.',23)]
write('acid-growth.svg','Acid growth of the plant cell wall','Cellulose microfibrils are held by matrix tethers. Pumping H+ into the wall lowers its pH, activating expansins that loosen the tethers so turgor can extend the wall.',p)

# --- Apoplast and symplast ---------------------------------------------------------
p=[text(400,34,'Two routes between cells')]
p+=[rect(40,95,720,215,WALL,'#d8c3ae',6,2)]
for i in range(3):
    x=56+i*236
    p+=[rect(x,111,216,183,CYTO,GREEN,10,3),rect(x+20,140,176,88,VAC,BLUE,10,2)]
p+=[text(144,192,'vacuole',22,BLUE)]
# plasmodesmata through the two shared walls
for xw in (272,508):
    for y in (150,262):
        p+=[rect(xw-1,y-5,22,10,CYTO,GREEN,3,2)]
p+=[line(283,144,250,88,INK,2),text(245,80,'plasmodesma',22,anchor='end')]
# apoplast route along the walls
p+=[arrow(48,103,745,103,BLUE,4,'10 7'),text(700,80,'apoplast',23,BLUE,weight='bold')]
# symplast route through cytoplasm and plasmodesmata
p+=[arrow(90,262,735,262,GREEN,5),text(400,250,'symplast',23,GREEN,weight='bold')]
# membrane crossing
p+=[arrow(400,100,400,134,RED,4),text(415,80,'crosses a membrane',22,RED,anchor='start')]
p+=[text(400,350,'Apoplast: walls and spaces, outside every plasma membrane',22,BLUE)]
p+=[text(400,380,'Symplast: cytoplasm joined through plasmodesmata',22,GREEN)]
p+=[text(400,410,'Moving between them means crossing a membrane: the point of selection',22,RED)]
write('apoplast-symplast.svg','Apoplast and symplast','Three plant cells share walls. The apoplastic route runs through the walls; the symplastic route runs through cytoplasm and plasmodesmata. Entering the symplast from the wall requires crossing a plasma membrane.',p)

# --- Rubisco from two genomes ----------------------------------------------------
p=[text(400,34,'Rubisco is built from two genomes')]
p+=[circle(115,205,78,'#f4f5f6',INK),text(115,195,'Nucleus',23),text(115,228,'rbcS gene',22,GOLD,weight='bold')]
p+=[arrow(185,245,262,262,GOLD,4),text(270,310,'made in',22),text(270,335,'cytosol',22)]
p+=[circle(285,265,18,'#fff4df',GOLD),text(285,273,'S',22,GOLD,weight='bold')]
p+=[ellipse(565,210,215,140,'#eef6ea',GREEN,4),text(565,330,'Chloroplast',23,GREEN)]
p+=[arrow(305,262,600,228,GOLD,4),text(430,285,'imported',22,GOLD)]
p+=[circle(450,150,26,'none',GREEN,4),text(450,205,'rbcL gene',22,BLUE,weight='bold'),text(450,231,'(plastid DNA)',22)]
p+=[arrow(478,152,518,157,BLUE,3),circle(536,160,16,'#d8eaf0',BLUE),text(536,168,'L',22,BLUE,weight='bold')]
p+=[arrow(554,167,600,185,INK,3)]
for i in range(4):
    for j,(f,s_,lab,c) in enumerate([( '#d8eaf0',BLUE,'L',BLUE),('#fff4df',GOLD,'S',GOLD)]):
        x=625+i*30; y=180+j*34
        p+=[circle(x,y,14,f,s_,2),text(x,y+7,lab,18,c,weight='bold')]
p+=[text(670,262,'Rubisco',23),text(670,290,'8 L + 8 S',22)]
p+=[text(400,385,'Large subunit: plastid gene. Small subunit: nuclear gene.',23)]
p+=[text(400,420,'A nuclear mutation can stop photosynthesis.',23,RED)]
write('two-genomes.svg','Rubisco subunits from two genomes','The small subunit of Rubisco is encoded in the nucleus, made in the cytosol and imported into the chloroplast. The large subunit is encoded by plastid DNA and made inside the chloroplast, where both assemble.',p)
