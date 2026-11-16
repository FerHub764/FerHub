import sys, math, bpy
sys.path.insert(0, '/tmp/claude-0/work')
import scene
from mathutils import Vector
SCR=(0,0.139,0.118)
SHOTS = {
 's1': dict(n=96, screen='lesson2', focal=55, f=2.0, cam=[(-0.16,-0.36,0.085),(-0.09,-0.30,0.08)], aim=[(-0.02,0.08,0.05),(0.0,0.08,0.05)], focus=[(-0.03,0.03,0.012),(-0.02,0.03,0.012)]),
 's2': dict(n=120, screen='home', focal=45, f=2.8, cam=[(0.08,-0.58,0.24),(0.045,-0.45,0.205)], aim=[(0.0,0.139,0.118),(0.0,0.139,0.12)], focus=[SCR,SCR]),
 's3': dict(n=120, screen='lesson2', focal=55, f=1.6, cam=[(0.31,-0.27,0.095),(0.27,-0.25,0.10)], aim=[(-0.02,0.07,0.075),(-0.03,0.08,0.08)], focus=[(0.07,-0.01,0.012),(0.0,0.135,0.12)], rack=(30,70)),
 's4': dict(n=120, screen='track', focal=35, f=3.2, cam=[(-0.62,-0.72,0.36),(0.38,-0.80,0.33)], aim=[(-0.04,0.06,0.08),(0.02,0.06,0.08)], focus=[(0,0.06,0.08),(0,0.06,0.08)]),
 's5': dict(n=120, screen='cert', focal=50, f=2.2, cam=[(-0.09,-0.38,0.165),(-0.03,-0.25,0.145)], aim=[(0.0,0.139,0.118),(0.0,0.139,0.118)], focus=[SCR,SCR]),
 's6': dict(n=120, screen='home', focal=40, f=2.8, cam=[(0.0,-0.52,0.21),(0.0,-0.95,0.32)], aim=[(0.0,0.10,0.10),(0.0,0.10,0.12)], focus=[SCR,SCR]),
}
def ease(t): return t*t*(3-2*t)
def setup(name):
    s=SHOTS[name]
    sc=scene.build(s['screen'])
    sc.frame_start=1; sc.frame_end=s['n']
    cam=bpy.data.objects['Cam']; aim=bpy.data.objects['Aim']; foc=bpy.data.objects['Focus']
    cam.data.lens=s['focal']; cam.data.dof.aperture_fstop=s['f']
    # keyframe every frame with smooth gentle ease (mostly linear, eased ends) + subtle handheld drift
    n=s['n']
    for fr in range(1,n+1):
        t=(fr-1)/(n-1); e=0.75*t+0.25*ease(t)
        lerp=lambda a,b: Vector(a).lerp(Vector(b),e)
        hh=Vector((0.0009*math.sin(fr*0.21)+0.0006*math.sin(fr*0.53+1), 0.0005*math.sin(fr*0.17+2), 0.0008*math.sin(fr*0.29+0.5)+0.0004*math.sin(fr*0.71)))
        cam.location=lerp(*s['cam'])+hh*(cam.location.length/0.4); cam.keyframe_insert('location',frame=fr)
        aim.location=lerp(*s['aim']); aim.keyframe_insert('location',frame=fr)
        if 'rack' in s:
            a,b=s['rack']; k=min(1,max(0,(fr-a)/(b-a))); k=ease(k)
            foc.location=Vector(s['focus'][0]).lerp(Vector(s['focus'][1]),k)
        else:
            foc.location=lerp(*s['focus'])
        foc.keyframe_insert('location',frame=fr)
    return sc
if __name__=='__main__':
    argv=sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else sys.argv[1:]
    name,mode=argv[0],argv[1]
    sc=setup(name)
    sc.cycles.samples=20
    if mode=='test':
        sc.cycles.samples=int(argv[2]) if len(argv)>2 else 16
        sc.render.resolution_percentage=int(argv[4]) if len(argv)>4 else 50
        for fr in [int(x) for x in (argv[3].split(',') if len(argv)>3 else [SHOTS[name]['n']//2])]:
            sc.frame_set(fr); sc.render.filepath=f'/tmp/claude-0/work/test/{name}_{fr:03d}.png'
            bpy.ops.render.render(write_still=True)
    else:
        import os
        out=f'/tmp/claude-0/work/frames/{name}'; os.makedirs(out,exist_ok=True)
        start=int(argv[2]) if len(argv)>2 else 1
        for fr in range(start, SHOTS[name]['n']+1, 2):
            p=f'{out}/{fr:04d}.png'
            if os.path.exists(p): continue
            sc.frame_set(fr); sc.render.filepath=p
            bpy.ops.render.render(write_still=True)
