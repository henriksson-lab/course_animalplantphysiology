"""Original explanatory vectors and plots for P2; run from any directory with Python 3.
Schematics are hand-written SVG; plotted relationships use matplotlib (same palette).
Every figure uses an 800 x 440 viewBox with labels of at least 22 px."""
from pathlib import Path
from html import escape
import math
ROOT=Path(__file__).parent
BLUE='#267a91'; RED='#b64853'; GREEN='#397646'; INK='#243645'; PALE='#eaf3f5'; GOLD='#b37a22'
WALL='#f3e8df'; CYTO='#e2eedf'; VAC='#d8eaf0'; SUBERIN='#5a3b1e'
def text(x,y,s,size=24,colour=INK,anchor='middle',weight='normal'):
    return ''.join(f'<text x="{x}" y="{y+i*30}" font-size="{size}" fill="{colour}" text-anchor="{anchor}" font-weight="{weight}">{escape(line)}</text>' for i,line in enumerate(s.split('\n')))
def rect(x,y,w,h,fill=PALE,stroke=BLUE,r=6,width=3):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'
def circle(x,y,r,fill=PALE,stroke=BLUE,width=3):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'
def line(x1,y1,x2,y2,c=INK,width=3,dash=''):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{c}" stroke-width="{width}" stroke-dasharray="{dash}" stroke-linecap="round"/>'
def head(x2,y2,ang,c):
    return f'<path d="M {x2} {y2} l -14 -8 l 0 16 Z" fill="{c}" transform="rotate({math.degrees(ang):.1f} {x2} {y2})"/>'
def arrow(x1,y1,x2,y2,c=BLUE,width=3,dash=''):
    return line(x1,y1,x2,y2,c,width,dash)+head(x2,y2,math.atan2(y2-y1,x2-x1),c)
def polyarrow(pts,c,width=4,dash=''):
    d='M '+' L '.join(f'{x} {y}' for x,y in pts)
    (x1,y1),(x2,y2)=pts[-2],pts[-1]
    return f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{width}" stroke-dasharray="{dash}" stroke-linejoin="round" stroke-linecap="round"/>'+head(x2,y2,math.atan2(y2-y1,x2-x1),c)
def write(name,title,desc,parts):
    (ROOT/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 440" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc><g font-family="Arial, sans-serif">'+''.join(parts)+'</g></svg>\n')

# --- Three routes across the root to the xylem ------------------------------------
p=[rect(20,105,760,250,WALL,'#d8c3ae',4,2)]
cells=[(110,225,'Epidermis'),(237,352,'Cortex'),(364,479,''),(491,596,'Endodermis')]
for x0,x1,lab in cells:
    p+=[rect(x0,130,x1-x0,200,CYTO,GREEN,8,3)]
p+=[text(300,92,'Cortex',23)]
for x0,x1,lab in cells:
    if lab and lab!='Cortex': p+=[text((x0+x1)/2,92,lab,23)]
p+=[text(55,92,'Soil',23),text(700,92,'Stele',23)]
# root hair into the soil
p+=[f'<path d="M110 262 L40 262 Q28 272 40 282 L110 282" fill="{CYTO}" stroke="{GREEN}" stroke-width="3"/>',rect(108,264,6,16,CYTO,CYTO,0,0)]
# Casparian strip in the radial walls of the endodermis
p+=[rect(491,105,105,25,SUBERIN,SUBERIN,2,1),rect(491,330,105,25,SUBERIN,SUBERIN,2,1)]
p+=[line(545,357,545,405,INK,2),text(560,428,'Casparian strip',22,SUBERIN,'start',weight='bold')]
# xylem vessel in the stele
p+=[rect(640,150,120,160,'white',INK,10,7),text(700,238,'xylem',23)]
# plasmodesmata on the symplastic level
for xw in (225,352,479):
    p+=[rect(xw,193,12,14,CYTO,GREEN,2,2)]
# routes
p+=[polyarrow([(30,117),(485,117),(485,165),(522,165)],BLUE,4,'10 7')]
p+=[polyarrow([(70,272),(150,272),(150,200),(560,200),(632,200)],GREEN,5)]
p+=[polyarrow([(90,305),(632,305)],GOLD,4)]
for x in (110,225,237,352,364,479,491,596):
    p+=[circle(x,305,6,'#fff4df',GOLD,2)]
p+=[polyarrow([(530,172),(632,186)],BLUE,4,'10 7')]
# legend
p+=[text(20,395,'- - apoplastic: walls only',22,BLUE,'start')]
p+=[text(420,395,'—— symplastic: plasmodesmata',22,GREEN,'start')]
p+=[text(20,428,'—o— transmembrane: every membrane',22,GOLD,'start')]
write('root-routes.svg','Three routes of water across the root','Water moves from soil through epidermis and cortex to the endodermis by apoplastic, symplastic and transmembrane routes. The Casparian strip in the endodermal walls blocks the apoplast, so all water crosses a membrane before reaching the xylem.',p)

# --- Guard cells: closed and open ------------------------------------------------
def guard_pair(cx,cy,orx,ory,prx,pry,fill):
    d=(f'M {cx-orx} {cy} a {orx} {ory} 0 1 0 {2*orx} 0 a {orx} {ory} 0 1 0 {-2*orx} 0 Z '
       f'M {cx-prx} {cy} a {prx} {pry} 0 1 0 {2*prx} 0 a {prx} {pry} 0 1 0 {-2*prx} 0 Z')
    return [f'<path d="{d}" fill="{fill}" fill-rule="evenodd" stroke="{GREEN}" stroke-width="4"/>',
            line(cx,cy-ory,cx,cy-pry,GREEN,4),line(cx,cy+pry,cx,cy+ory,GREEN,4)]
p=[text(200,40,'Closed'),text(600,40,'Open')]
p+=guard_pair(200,200,62,120,4,82,CYTO)
p+=guard_pair(600,200,86,120,30,84,'#cfe5c8')
p+=[text(200,355,'low turgor: pore shut',23)]
p+=[text(600,355,'high turgor: pore open',23)]
p+=[arrow(690,150,770,130,RED,4),text(745,112,'H⁺',23,RED,weight='bold')]
p+=[arrow(775,215,695,215,GOLD,4),text(740,200,'K⁺ Cl⁻',22,GOLD,weight='bold')]
p+=[arrow(775,280,690,270,BLUE,4),text(745,308,'H₂O',23,BLUE,weight='bold')]
p+=[arrow(425,200,500,200,INK,4),text(462,180,'light',22)]
p+=[line(600,250,520,300,INK,2),text(505,315,'pore',22,anchor='end')]
p+=[text(400,410,'Solutes in → Ψ falls → water in → guard cells bow apart',23)]
write('stomata-opening.svg','Guard cells close and open a stoma','A closed stoma has two slack guard cells pressed together. After H+ is pumped out and K+ and Cl- enter, water follows, turgor rises and the swollen guard cells bow apart to open the pore.',p)

# --- Plotted relationships (matplotlib, 800 x 440 units, 1 pt = 1 unit) -----------
import matplotlib
matplotlib.use('svg')
import matplotlib.pyplot as plt
import numpy as np
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':22,'axes.edgecolor':INK,'axes.labelcolor':INK,
                     'xtick.color':INK,'ytick.color':INK,'text.color':INK,'axes.linewidth':1.5,
                     'svg.fonttype':'none','axes.spines.top':False,'axes.spines.right':False})
def fig():
    return plt.figure(figsize=(800/72,440/72),dpi=72)
def save(f,name,title):
    f.savefig(ROOT/name,format='svg',metadata={'Title':title,'Date':None})
    plt.close(f)
    out=(ROOT/name).read_text().replace('width="800pt" height="440pt"','width="800" height="440"')
    (ROOT/name).write_text(out)

# Components of Psi for three situations.
cases=[('Turgid cell',-0.8,0.5),('Flaccid cell',-0.8,0.0),('Xylem sap\n(transpiring)',-0.05,-0.8)]
f=fig(); ax=f.add_axes([0.13,0.2,0.84,0.72])
w=0.26
for i,(lab,s,pp) in enumerate(cases):
    ax.bar(i-w,s,w,color=GOLD,label='Ψs (solutes)' if i==0 else None)
    ax.bar(i,pp,w,color=GREEN,label='Ψp (pressure)' if i==0 else None)
    ax.bar(i+w,s+pp,w,color=BLUE,label='Ψ = Ψs + Ψp' if i==0 else None)
    ax.text(i+w,s+pp-0.05 if s+pp<0 else s+pp+0.03,f'{s+pp:+.2f}'.replace('-','−'),ha='center',va='top' if s+pp<0 else 'bottom',fontsize=20,color=BLUE)
ax.axhline(0,color=INK,lw=1.5)
ax.set_xticks(range(3),[c[0] for c in cases])
ax.set_ylim(-1.05,0.75); ax.set_ylabel('Ψ (MPa)')
ax.tick_params(axis='x',length=0)
ax.legend(loc='upper right',fontsize=20,frameon=False,ncol=1)
save(f,'psi-components.svg','Components of water potential')

# Hofler diagram: one cell, Psi_s at incipient plasmolysis = -0.6 MPa, wall modulus 6 MPa.
PS0=-0.6; EPS=6.0
V=np.linspace(0.72,1.11,400)
ps=PS0/V; pp=np.where(V>1,EPS*(V-1),0); psi=ps+pp
Vfull=(EPS+math.sqrt(EPS**2+4*EPS*(-PS0)))/(2*EPS)
f=fig(); ax=f.add_axes([0.13,0.17,0.84,0.76])
ax.axvspan(0.72,1.0,color='#eef0f2')
ax.plot(V,pp,color=GREEN,lw=4,label='Ψp')
ax.plot(V,ps,color=GOLD,lw=4,label='Ψs')
ax.plot(V,psi,color=BLUE,lw=4,label='Ψ')
ax.axhline(0,color=INK,lw=1.2)
for v,y,lab,dx,ha in [(PS0/-0.8,-0.8,'in −0.8 MPa:\nplasmolysed',0.012,'left'),(1.0,-0.6,'in −0.6 MPa:\nflaccid (Ψp = 0)',-0.012,'right'),
                     ]:
    ax.plot([v],[y],'o',ms=13,color=BLUE,mec='white',mew=2,zorder=5)
    ax.text(v+dx,y+(0.06 if y>-0.7 else 0.1),lab,ha=ha,va='bottom',fontsize=20,color=INK)
ax.plot([Vfull],[0],'o',ms=13,color=BLUE,mec='white',mew=2,zorder=5)
ax.annotate('in pure water:\nfull turgor',xy=(Vfull-0.004,0.02),xytext=(0.9,0.3),fontsize=20,ha='center',
            arrowprops=dict(arrowstyle='-|>',color=INK,lw=1.5,mutation_scale=20))
ax.text(0.73,0.62,'Ψp = 0: protoplast shrinks from wall',fontsize=20,color='#666',va='center')
ax.text(1.103,0.62,'Ψp',color=GREEN,ha='right',fontsize=22,fontweight='bold')
ax.text(1.103,-0.48,'Ψs',color=GOLD,ha='right',fontsize=22,fontweight='bold')
ax.text(1.103,0.08,'Ψ',color=BLUE,ha='right',fontsize=22,fontweight='bold')
ax.set_xlim(0.72,1.11); ax.set_ylim(-0.95,0.75)
ax.set_xlabel('Relative protoplast volume'); ax.set_ylabel('MPa')
ax.set_xticks([0.75,0.8,0.85,0.9,0.95,1.0,1.05,1.1])
save(f,'hofler.svg','Hofler diagram of one cell')

# Soil-plant-air gradient: the lecture's values, with the air on its own scale.
st=['Soil','Root\nxylem','Leaf\ncells']; vals=[-0.1,-0.4,-0.8]
f=fig()
ax=f.add_axes([0.13,0.2,0.53,0.72]); ax2=f.add_axes([0.74,0.2,0.15,0.72])
ax.plot(range(3),vals,'-',color=BLUE,lw=3,zorder=1)
ax.scatter(range(3),vals,s=260,color=[GREEN,BLUE,GREEN],edgecolor='white',linewidth=2,zorder=3)
for i,v in enumerate(vals):
    ax.text(i,v-0.08,f'{v:.1f}'.replace('-','−'),ha='center',va='top',fontsize=22,color=INK)
ax.set_xticks(range(3),st); ax.tick_params(axis='x',length=0)
ax.set_ylim(-1.25,0.05); ax.set_xlim(-0.4,2.4); ax.set_ylabel('Ψ (MPa)')
ax.axhline(0,color=INK,lw=1.2)
ax.annotate('',xy=(2.35,-1.03),xytext=(-0.3,-1.03),arrowprops=dict(arrowstyle='-|>',color=INK,lw=2,mutation_scale=25))
ax.text(1.0,-1.22,'water flows downhill in Ψ',ha='center',va='bottom',fontsize=20)
ax2.bar([0],[-95],0.6,color=RED)
ax2.set_xticks([0],['Air\n50 % RH']); ax2.tick_params(axis='x',length=0)
ax2.set_ylim(-110,4); ax2.set_xlim(-0.6,0.6); ax2.axhline(0,color=INK,lw=1.2)
ax2.set_yticks([0,-50,-100],['0','−50','−100'])
ax2.text(0,-50,'−95',ha='center',va='center',fontsize=22,color='white',fontweight='bold')
ax2.yaxis.tick_right(); ax2.spines['right'].set_visible(True); ax2.spines['left'].set_visible(False)
f.text(0.70,0.56,'own\nscale',ha='center',va='center',fontsize=20,color=RED)
save(f,'soil-air-gradient.svg','Water potential from soil to air')
