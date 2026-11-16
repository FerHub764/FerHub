import numpy as np
from PIL import Image, ImageDraw, ImageFilter
rng=np.random.default_rng(7); W,H=2400,1200
img=Image.new('RGB',(W,H),(0,0,0)); 
g=np.zeros((H,W,3)); y=np.linspace(0,1,H)[:,None]
g[...,0]=6+10*y; g[...,1]=9+12*y; g[...,2]=18+20*y
img=Image.fromarray(g.astype('uint8'))
lay=Image.new('RGB',(W,H)); d=ImageDraw.Draw(lay)
for i in range(420):
    x=rng.uniform(0,W); yy=H*(0.35+0.6*rng.beta(2,1.4)); r=rng.uniform(6,26)
    warm=rng.random()<0.65
    c=(255,int(rng.uniform(140,190)),int(rng.uniform(60,110))) if warm else (int(rng.uniform(140,190)),int(rng.uniform(190,220)),255)
    k=rng.uniform(0.15,0.8); c=tuple(int(v*k) for v in c)
    d.ellipse([x-r,yy-r,x+r,yy+r],fill=c)
lay=lay.filter(ImageFilter.GaussianBlur(10))
out=np.clip(np.asarray(img,float)+np.asarray(lay,float),0,255).astype('uint8')
Image.fromarray(out).save('city_bokeh.png')
