"""Original vector teaching diagrams. Run from any folder to regenerate SVGs."""
from pathlib import Path
from html import escape
D=Path(__file__).resolve().parent
blue='#246b83'; red='#a64836'; green='#38794c'; gold='#b57c22'; ink='#26343c'; pale='#e9f2f5'
def txt(x,y,s,size=24,fill=ink,anchor='middle',weight='normal'):
    return ''.join(f'<text x="{x}" y="{y+i*29}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}">{escape(line)}</text>' for i,line in enumerate(s.split('\n')))
def rect(x,y,w,h,fill=pale,stroke=blue,rx=10):return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="3"/>'
def path(d,stroke=blue,width=4,fill='none',arrow=False):return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"'+(' marker-end="url(#arrow)"' if arrow else '')+'/>'
def arrow(x1,y1,x2,y2,c=blue,w=4):
    import math
    a=math.degrees(math.atan2(y2-y1,x2-x1)); L=math.hypot(x2-x1,y2-y1); k=max(0,(L-12)/L) if L else 0
    return path(f'M{x1},{y1} L{x1+(x2-x1)*k:.1f},{y1+(y2-y1)*k:.1f}',c,w)+f'<path d="M {x2} {y2} l -16 -9 l 0 18 Z" fill="{c}" transform="rotate({a:.1f} {x2} {y2})"/>'
def circle(x,y,r,fill,stroke=blue):return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'
def save(name,title,desc,body):
    s=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 440" role="img" aria-labelledby="title desc"><title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc><defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto-start-reverse"><path d="M0,0 L9,4.5 L0,9 Z" fill="context-stroke"/></marker></defs><rect width="800" height="440" fill="white"/><g font-family="Arial, sans-serif">{body}</g></svg>'
    (D/name).write_text(s)
# The same intake can deliver different amounts of absorbable nutrients.
b=txt(400,34,'Same mass eaten ≠ same nutrients absorbed',26,weight='bold')
for x,label,parts in [(110,'Food A',[('Digestible',180,blue),('Unabsorbed',60,'#d8dce0')]),(450,'Food B',[('Digestible',110,blue),('Unabsorbed',130,'#d8dce0')])]:
    b+=txt(x+110,88,label,26)
    yy=112
    for lab,h,c in parts:
        b+=rect(x,yy,220,h,c,c,0)+txt(x+110,yy+h/2+8,lab,22,'white' if c==blue else ink);yy+=h
b+=txt(400,400,'Equal mass eaten; composition and digestibility differ.',22)
save('food-and-absorption.svg','Food intake and absorption','Two equal-mass food bars contain different proportions of digestible and unabsorbed material. Amount eaten alone does not establish nutrient delivery.',b)
# Continuous tube with external lumen separated from internal transport.
b=txt(400,32,'Follow material across a boundary',26,weight='bold')
b+=path('M65,115 H710',blue,70)+path('M65,115 H710','#f4e3c4',58)
b+=txt(400,123,'Gut lumen: food → digestion products',25)
b+=txt(400,77,'Still connected to the external environment',22)
b+=arrow(680,115,755,115,red)+txt(700,177,'Faeces',22,red)
b+=arrow(315,151,315,255)+txt(190,218,'Absorption',24,blue)
b+=rect(130,280,530,55,'#f5dedb',red)+txt(395,317,'Internal transport: blood / lymph',24,red)
b+=arrow(530,340,530,380,green)+txt(285,408,'Cells: metabolism, maintenance and growth',23,green)
save('digestion-path.svg','Digestion and absorption are different processes','Food moves through a continuous gut lumen. Absorption crosses the epithelium to internal blood or lymph, while unabsorbed material remains in the lumen and leaves as faeces.',b)
# Villus schematic: interface, capillary and lymph routes.
b=txt(400,30,'Villus: more interface, selective entry',26,weight='bold')
b+=path('M140,350 L140,230 C140,165 215,165 215,105 C215,55 300,55 300,105 C300,165 375,165 375,230 L375,350',blue,12)
b+=path('M195,350 L195,240 C195,205 250,180 250,120 C250,90 270,90 270,120 C270,180 325,205 325,240 L325,350',red,7)
b+=path('M260,350 L260,220',green,14)+circle(260,220,14,'#dcebdc',green)
for x,y in [(149,235),(163,202),(188,177),(210,145),(300,146),(329,177),(354,205),(369,238)]:
    b+=path(f'M{x-8},{y-10} l-15,-10 M{x},{y-14} l-9,-17 M{x+8},{y-10} l-2,-20',blue,2)
b+=txt(505,110,'Lumen',24)+arrow(455,125,325,125)
b+=txt(570,195,'Epithelial barrier',24)+arrow(470,202,370,215)
b+=txt(570,270,'Blood capillaries',24,red)+arrow(465,275,325,275,red)
b+=txt(550,340,'Lymphatic route',24,green)+arrow(440,335,265,325,green)
b+=txt(400,414,'Sugars and amino acids → blood; fats → lymph',22)
save('villus-routes.svg','Villus epithelial barrier and removal pathways','A finger-like villus is lined by an epithelial barrier and surface projections. Internal capillaries and a lymphatic route remove absorbed materials.',b)
# Gut ordering and swollen fermentation chamber visually distinguish positions.
b=txt(400,32,'Location changes what can be recovered',26,weight='bold')
for yy,label,fermx,otherx in [(150,'Foregut',220,530),(310,'Hindgut',530,220)]:
    b+=txt(90,yy-64,label,25,anchor='start')
    b+=path(f'M95,{yy} H710',blue,18)
    b+=f'<ellipse cx="{fermx}" cy="{yy}" rx="95" ry="54" fill="#e8efd8" stroke="{green}" stroke-width="3"/>'
    b+=txt(fermx,yy-7,'Microbial',22,green)+txt(fermx,yy+20,'fermentation',22,green)
    b+=rect(otherx-85,yy-35,170,70,pale,blue,8)+txt(otherx,yy-5,'Small',22)+txt(otherx,yy+22,'intestine',22)
    b+=arrow(710,yy,755,yy)
b+=txt(400,416,'Both absorb fermentation products; microbial-cell recovery differs.',22)
save('fermentation-location.svg','Foregut versus hindgut fermentation','The microbial fermentation chamber occurs before the small intestine in a foregut model and after it in a hindgut model. The order changes access to microbial products and biomass.',b)
# Energy flow band widths proportional to an invented budget.
b=txt(400,30,'One interval; one accounting convention',26,weight='bold')
b+=path('M70,210 H290',blue,75)+txt(165,110,'Intake',26,blue)+txt(165,145,'150 kJ',25,blue)
# Four separated bands represent the same 150 kJ distributed by branch.
for y,value,label,c in [(92,40,'Faeces',gold),(182,10,'Excreted',red),(272,85,'Metabolic',blue),(362,15,'Retained',green)]:
    width=value/2
    b+=path(f'M290,210 C385,210 400,{y} 480,{y} H570',c,width)
    b+=txt(590,y-6,label,24,c,anchor='start')+txt(590,y+23,f'{value} kJ',23,c,anchor='start')
b+=txt(400,424,'150 = 40 + 10 + 85 + 15 kJ',25,weight='bold')
save('energy-budget.svg','An energy budget with proportional flow bands','In this example day, 150 kilojoules of intake is partitioned into 40 in faeces, 10 excreted, 85 metabolic expenditure and 15 retained. Band widths are proportional to the values.',b)
# A zero-centered retained balance, not an unsupported physiological response.
b=txt(400,32,'After faecal and excretory losses: 100 kJ',26,weight='bold')
b+=path('M115,350 H710',ink,3)+txt(400,420,'Retained energy (kJ over the interval)',24)
b+=path('M350,95 V350','#8d989f',2)
for x,v in [(150,'−20'),(350,'0'),(550,'+20')]: b+=path(f'M{x},345 V355',ink,2)+txt(x,381,v,22)
b+=rect(350,125,150,52,'#deeddc',green,0)+txt(525,160,'+15',25,green,anchor='start')
b+=txt(130,117,'85 kJ spent',24,anchor='start')
b+=rect(250,240,100,52,'#f5dedb',red,0)+txt(225,275,'−10',25,red,anchor='end')
b+=txt(130,232,'110 kJ spent',24,anchor='start')
b+=txt(615,185,'Storage gains',22,green)+txt(600,313,'Reserves supply\nthe deficit',22,red)
save('retained-balance.svg','Positive and negative retained energy','After fixed losses, 100 kilojoules remain. Spending 85 leaves plus 15 kilojoules retained; spending 110 produces minus 10, requiring a net contribution from reserves.',b)
# Equal energy, different time = different power.
b=txt(400,34,'Equal energy, different rates',26,weight='bold')
for y,label,length,rate,c in [(135,'60 J in 10 s',120,'6 W',red),(290,'60 J in 60 s',600,'1 W',blue)]:
    b+=txt(100,y-35,label,26,c,anchor='start')
    b+=rect(100,y,length,35,c,c,0)+txt(725,y+28,rate,27,c)
    b+=path(f'M100,{y+60} H700','#9ba7ad',2)
    for x in range(100,701,100):b+=path(f'M{x},{y+55} V{y+65}',ink,2)
b+=txt(400,397,'Bar length shows time: 0 → 60 seconds',23)
b+=txt(400,432,'Power = energy / time; 1 W = 1 J s⁻¹',24,weight='bold')
save('energy-and-power.svg','The same energy transferred over different times','Both events transfer 60 joules. The short event lasts 10 seconds and averages 6 watts; the long event lasts 60 seconds and averages 1 watt. Bar lengths show elapsed time rather than energy.',b)
# Parallel ATP supply without numerical ATP yields.
b=txt(400,32,'ATP supply can combine pathways',26,weight='bold')
b+=rect(55,75,690,300,'#fafbfd','#c4cdd1',25)+txt(90,113,'Cell',24,anchor='start')
b+=txt(180,160,'Fuel',27,blue)+arrow(180,175,180,220)
b+=txt(180,253,'Glycolysis',25,blue)+txt(175,291,'Cytosol',22)
b+=arrow(270,245,385,245,blue)+txt(325,222,'Carbon',22)
b+=f'<ellipse cx="{535}" cy="{245}" rx="137" ry="85" fill="#e2edf4" stroke="{blue}" stroke-width="3"/>'
b+=path('M450,250 Q475,200 495,250 T540,250 T585,250 T630,250',blue,3)
b+=txt(535,217,'Mitochondrion',24)+txt(535,302,'Aerobic processes',22)
b+=txt(685,150,'O₂',28,red)+arrow(665,163,630,203,red)
b+=arrow(185,310,185,345,green)+txt(185,370,'ATP',24,green)
b+=arrow(540,330,540,345,green)+txt(540,370,'ATP',24,green)
b+=txt(400,420,'Oxygen uptake does not capture every ATP-producing step.',22)
save('atp-pathways.svg','Cytosolic and mitochondrial contributions to ATP supply','Cytosolic glycolysis can supply ATP without directly consuming oxygen and supplies carbon to mitochondrial processes. Aerobic mitochondrial metabolism requires oxygen. A bout of activity may use both.',b)

# Four routes of heat exchange around one animal on a rock in the sun.
b=txt(400,32,'Heat moves by four routes',26,weight='bold')
b+=circle(95,95,38,'#f8e7c2',gold)
for a in range(0,360,45):
    import math as _m
    b+=path(f'M{95+48*_m.cos(_m.radians(a)):.0f},{95+48*_m.sin(_m.radians(a)):.0f} L{95+62*_m.cos(_m.radians(a)):.0f},{95+62*_m.sin(_m.radians(a)):.0f}',gold,3)
b+=arrow(150,130,290,200,gold)+txt(115,190,'Radiation',24,gold,weight='bold')
b+=path('M120,330 Q400,250 680,330 Z',ink,3,'#d9d4cc')
b+=f'<ellipse cx="400" cy="250" rx="170" ry="48" fill="{pale}" stroke="{blue}" stroke-width="3"/>'
b+=f'<ellipse cx="590" cy="232" rx="42" ry="26" fill="{pale}" stroke="{blue}" stroke-width="3"/>'
b+=txt(400,258,'Body',24,blue)
b+=arrow(400,330,400,302,red)+txt(400,365,'Conduction (contact with rock)',24,red,weight='bold')
for y in [160,195]: b+=path(f'M640,{y} q-20,-10 -40,0 t-40,0 t-40,0',green,3)
b+=arrow(720,178,640,178,green)+txt(790,135,'Convection (wind)',24,green,anchor='end',weight='bold')
for x in [330,380,430]: b+=path(f'M{x},195 q8,-12 0,-24 t0,-24 t0,-24',blue,3)
b+=txt(380,98,'Evaporation',24,blue,weight='bold')
b+=txt(400,415,'Only evaporation always removes heat; the others can add or remove it.',21)
save('heat-routes.svg','Routes of heat exchange','An animal on a rock gains heat by radiation from the sun and by conduction from the warm rock; wind removes heat by convection and evaporation from the body surface removes heat.',b)

# ---------------------------------------------------------------- plotted curves (matplotlib)
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
plt.rcParams.update({'font.family':'sans-serif','font.sans-serif':['Arial','Liberation Sans','DejaVu Sans'],'font.size':17,
    'svg.fonttype':'none','axes.edgecolor':ink,'axes.labelcolor':ink,'xtick.color':ink,'ytick.color':ink,'text.color':ink,
    'axes.spines.top':False,'axes.spines.right':False,'axes.linewidth':1.5,'xtick.labelsize':16,'ytick.labelsize':16,'svg.hashsalt':'a2'})
def plot_save(f,name,title,desc):
    f.tight_layout(); f.savefig(D/name,format='svg',metadata={'Title':title,'Description':desc,'Date':None,'Creator':None}); plt.close(f)

# Q10: rate against temperature for Q10 = 2 and 3, through the respirometry example at 15 degC.
f,ax=plt.subplots(figsize=(8,4.4))
T=np.linspace(5,35,200)
for q,c in [(2,blue),(2.5,ink),(3,red)]:
    ax.plot(T,0.0020*q**((T-15)/10)*1000,color=c,lw=4 if q==2.5 else 3,ls='-' if q==2.5 else '--',label=f'$Q_{{10}}$ = {q}')
ax.plot([15,25],[2.0,5.0],'o',ms=11,color=gold,zorder=3)
ax.annotate('',xy=(25,5.0),xytext=(15,2.0),arrowprops=dict(arrowstyle='->',color=gold,lw=2.5,connectionstyle='angle,angleA=0,angleB=90'))
ax.text(20,1.25,'+10 °C',ha='center',fontsize=17,color=gold); ax.text(25.6,3.4,'× 2.5',fontsize=17,color=gold)
ax.set_xlabel('Temperature (°C)'); ax.set_ylabel('O₂ use (µg min⁻¹ g⁻¹)')
ax.set_xlim(5,35); ax.set_ylim(0,12); ax.legend(frameon=False,loc='upper left')
plot_save(f,'q10-curve.svg','Rate rises exponentially with temperature','Metabolic rate against temperature for Q10 of 2, 2.5 and 3, through 2.0 at 15 degrees. Between 15 and 25 degrees the measured rate rises from 2.0 to 5.0, a factor of 2.5.')

# Thermoneutral zone: two insulation levels, Scholander-style lines extrapolating to body temperature.
f,ax=plt.subplots(figsize=(8,4.4))
Ta=np.linspace(-50,42,400); Tb=37; bmr=1.0; uct=34
def mr(C): return np.where(Ta>uct,bmr+0.12*(Ta-uct),np.maximum(bmr,C*(Tb-Ta)))
for C,c,lab in [(1/7,red,'Thin fur'),(1/70,blue,'Thick fur')]:
    ax.plot(Ta,mr(C),color=c,lw=4,label=lab)
    lct=Tb-bmr/C; ax.plot(lct,bmr,'o',ms=10,color=c,zorder=3)
ax.axvspan(30,uct,color='#e9efd9',zorder=0)
ax.text(32,3.6,'TNZ',ha='center',fontsize=16,color=green)
ax.text(30,0.55,'LCT',ha='center',fontsize=16,color=red); ax.text(-33,0.55,'LCT',ha='center',fontsize=16,color=blue)
ax.text(-48,3.6,'Below LCT, heat loss rises with\n(T$_b$ − T$_a$), so metabolism must rise',fontsize=16,va='top')
ax.set_xlabel('Ambient temperature (°C)'); ax.set_ylabel('Metabolic rate (× basal)')
ax.set_xlim(-50,42); ax.set_ylim(0,4); ax.legend(frameon=False,loc='center left',bbox_to_anchor=(0.0,0.45))
plot_save(f,'thermoneutral-zone.svg','The thermoneutral zone','Metabolic rate of an endotherm against ambient temperature. It is minimal and flat in the thermoneutral zone, rises linearly below the lower critical temperature and rises above the upper critical temperature. Thick fur moves the lower critical temperature from 30 to about minus 33 degrees.')

# Closed respirometry trace: animal chamber versus blank, over 10 minutes.
f,ax=plt.subplots(figsize=(8,4.4))
t=np.linspace(0,10,50); rng=np.random.default_rng(3)
ax.plot(t,8.0-0.040*t+rng.normal(0,0.006,t.size),color=red,lw=3,label='Chamber with animal')
ax.plot(t,8.0-0.010*t+rng.normal(0,0.006,t.size),color=ink,lw=3,ls='--',label='Blank (no animal)')
ax.annotate('',xy=(10.25,7.6),xytext=(10.25,8.0),arrowprops=dict(arrowstyle='<->',color=red,lw=2.5))
ax.text(10.5,7.8,'0.40\nmg L⁻¹',color=red,fontsize=16,va='center')
ax.set_xlabel('Time (min)'); ax.set_ylabel('O₂ in chamber (mg L⁻¹)')
ax.set_xlim(0,12); ax.set_ylim(7.5,8.05); ax.legend(frameon=False,loc='lower left')
plot_save(f,'respirometry-trace.svg','Oxygen falls in a closed respirometer','O2 concentration in a 0.1 litre chamber falls by 0.40 mg per litre in 10 minutes with an animal inside, and by 0.10 mg per litre in the blank chamber without an animal.')
