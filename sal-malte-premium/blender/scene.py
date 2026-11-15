"""Sal & Malte — Blender product shots (run with: python3 scene.py <shot> <out_dir> [frame_start frame_end] [--res W H] [--samples N])

shots:
  glass  : hero chopp glass, backlit beer, rising bubbles, condensation, slow orbit + push-in
  pct    : 3D gold "30%" in metal, slow rotation, warm bokeh
  cheers : two chopp glasses meeting in a toast
"""
import bpy, bmesh, math, random, sys, os
from mathutils import Vector

args = sys.argv[1:]
SHOT = args[0] if args else 'glass'
OUT = args[1] if len(args) > 1 else '/tmp/render'
F0 = int(args[2]) if len(args) > 2 and not args[2].startswith('--') else 1
F1 = int(args[3]) if len(args) > 3 and not args[3].startswith('--') else F0
RES = (1080, 1920)
SAMPLES = 48
if '--res' in args:
    i = args.index('--res'); RES = (int(args[i + 1]), int(args[i + 2]))
if '--samples' in args:
    SAMPLES = int(args[args.index('--samples') + 1])
FPS = 30
TOTAL = {'glass': 90, 'pct': 90, 'cheers': 80}[SHOT]

rnd = random.Random(7)

# ---------------------------------------------------------------- scene setup
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = 'CYCLES'
sc.cycles.device = 'CPU'
sc.cycles.samples = SAMPLES
sc.cycles.use_denoising = True
sc.cycles.denoiser = 'OPENIMAGEDENOISE'
sc.cycles.max_bounces = 12
sc.cycles.transmission_bounces = 12
sc.cycles.glossy_bounces = 6
sc.cycles.caustics_reflective = False
sc.cycles.caustics_refractive = False
sc.cycles.blur_glossy = 1.0
sc.render.resolution_x, sc.render.resolution_y = RES
sc.render.resolution_percentage = 100
sc.render.fps = FPS
sc.frame_start, sc.frame_end = 1, TOTAL
sc.render.image_settings.file_format = 'PNG'
sc.render.image_settings.color_mode = 'RGB'
sc.render.film_transparent = False
try:
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.look = 'AgX - Punchy'
except Exception:
    try: sc.view_settings.view_transform = 'Filmic'; sc.view_settings.look = 'High Contrast'
    except Exception: pass
sc.view_settings.exposure = 0.0

world = bpy.data.worlds.new('W'); sc.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get('Background')
bg.inputs[0].default_value = (0.006, 0.004, 0.003, 1)
bg.inputs[1].default_value = 1.0


def mat(name, **kw):
    m = bpy.data.materials.new(name); m.use_nodes = True
    p = m.node_tree.nodes.get('Principled BSDF')
    for k, v in kw.items():
        key = {'color': 'Base Color', 'metal': 'Metallic', 'rough': 'Roughness', 'ior': 'IOR', 'trans': 'Transmission Weight',
               'emit': 'Emission Color', 'emit_s': 'Emission Strength', 'coat': 'Coat Weight', 'sss': 'Subsurface Weight', 'alpha': 'Alpha'}[k]
        p.inputs[key].default_value = v
    return m


def emission_mat(name, color, strength):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    o = nt.nodes.new('ShaderNodeOutputMaterial'); e = nt.nodes.new('ShaderNodeEmission')
    e.inputs[0].default_value = (*color, 1); e.inputs[1].default_value = strength
    nt.links.new(e.outputs[0], o.inputs[0])
    return m


def link(obj):
    bpy.context.collection.objects.link(obj); return obj


def lathe(name, profile, segments=96, smooth=True):
    """profile: list of (r, z) points; returns a revolved mesh object"""
    me = bpy.data.meshes.new(name); bm = bmesh.new()
    rings = []
    for (r, z) in profile:
        ring = []
        for s in range(segments):
            a = 2 * math.pi * s / segments
            ring.append(bm.verts.new((r * math.cos(a), r * math.sin(a), z)))
        rings.append(ring)
    for i in range(len(rings) - 1):
        for s in range(segments):
            a, b = rings[i][s], rings[i][(s + 1) % segments]
            c, d = rings[i + 1][(s + 1) % segments], rings[i + 1][s]
            bm.faces.new((a, b, c, d))
    bm.to_mesh(me); bm.free()
    ob = link(bpy.data.objects.new(name, me))
    if smooth:
        for p in me.polygons: p.use_smooth = True
    return ob


def area_light(name, loc, rot, size, energy, color=(1, 0.8, 0.6), shape='RECTANGLE', size_y=None):
    l = bpy.data.lights.new(name, 'AREA'); l.energy = energy; l.color = color; l.shape = shape
    l.size = size
    if size_y: l.size_y = size_y
    ob = link(bpy.data.objects.new(name, l)); ob.location = loc; ob.rotation_euler = rot
    return ob


def look_at(ob, target):
    d = Vector(target) - ob.location
    ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def bokeh_wall(y=4.5, n=70, spread_x=6, z0=0.2, z1=4.0, seed=3, strength=(6, 18)):
    r = random.Random(seed)
    for i in range(n):
        warm = r.choice([(1.0, 0.42, 0.08), (1.0, 0.55, 0.15), (1.0, 0.33, 0.05), (1.0, 0.65, 0.25)])
        m = emission_mat(f'bk{i}', warm, r.uniform(*strength))
        bpy.ops.mesh.primitive_uv_sphere_add(radius=r.uniform(0.04, 0.11), location=(r.uniform(-spread_x, spread_x), y + r.uniform(-0.8, 1.5), r.uniform(z0, z1)), segments=12, ring_count=6)
        o = bpy.context.active_object; o.data.materials.append(m)
        o.visible_shadow = False


# ---------------------------------------------------------------- materials
GLASS = mat('glass', color=(1, 1, 1, 1), rough=0.0, ior=1.5, trans=1.0)
BEER = mat('beer', color=(1.0, 0.78, 0.30, 1), rough=0.03, ior=1.33, trans=1.0)
# give the beer some body: a volume absorption tint
nt = BEER.node_tree
va = nt.nodes.new('ShaderNodeVolumeAbsorption'); va.inputs[0].default_value = (1.0, 0.68, 0.12, 1); va.inputs[1].default_value = 3.2
nt.links.new(va.outputs[0], nt.nodes['Material Output'].inputs['Volume'])
FOAM = mat('foam', color=(1.0, 0.96, 0.88, 1), rough=0.75)
WATER = mat('water', color=(1, 1, 1, 1), rough=0.0, ior=1.33, trans=1.0)
BUBBLE = mat('bubble', color=(1, 0.95, 0.8, 1), rough=0.0, ior=1.0, trans=1.0)
WOOD = mat('wood', color=(0.05, 0.025, 0.012, 1), rough=0.28, coat=0.6)
GOLD = mat('gold', color=(1.0, 0.72, 0.28, 1), metal=1.0, rough=0.18)


def chopp_glass(x=0.0, y=0.0, scale=1.0, name='g', seed=1, fill=0.86):
    """A thick-bottomed chopp glass (caldereta style) with beer, foam, bubbles and condensation."""
    s = scale
    H = 1.55 * s
    outer = [(0.30 * s, 0.0), (0.33 * s, 0.01 * s), (0.335 * s, 0.12 * s), (0.36 * s, 0.5 * s), (0.40 * s, 1.0 * s), (0.44 * s, H), (0.445 * s, H + 0.005 * s)]
    inner = [(0.43 * s, H + 0.005 * s), (0.425 * s, H), (0.385 * s, 1.0 * s), (0.345 * s, 0.5 * s), (0.31 * s, 0.16 * s), (0.0, 0.15 * s)]
    prof = outer + inner
    g = lathe(name + '_glass', prof); g.location = (x, y, 0); g.data.materials.append(GLASS)
    # beer volume (slightly inside the inner wall)
    top = 0.15 * s + (H - 0.15 * s) * fill
    def rin(z):
        pts = [(0.16 * s, 0.31 * s), (0.5 * s, 0.345 * s), (1.0 * s, 0.385 * s), (H, 0.425 * s)]
        for (z0, r0), (z1, r1) in zip(pts, pts[1:]):
            if z <= z1: return r0 + (r1 - r0) * (z - z0) / (z1 - z0)
        return pts[-1][1]
    bz = [0.155 * s] + [0.155 * s + (top - 0.155 * s) * k / 6 for k in range(1, 7)]
    beer = lathe(name + '_beer', [(0.0, 0.155 * s)] + [(rin(z) - 0.004 * s, z) for z in bz] + [(0.0, top)])
    beer.location = (x, y, 0); beer.data.materials.append(BEER)
    # foam head: a lumpy cap
    fr = rin(top) - 0.003 * s
    foam_prof = [(fr, top - 0.01 * s), (fr * 1.0, top + 0.05 * s), (fr * 0.97, top + 0.10 * s), (fr * 0.8, top + 0.14 * s), (fr * 0.45, top + 0.165 * s), (0.0, top + 0.17 * s)]
    foam = lathe(name + '_foam', foam_prof, segments=64)
    foam.location = (x, y, 0); foam.data.materials.append(FOAM)
    tex = bpy.data.textures.new(name + '_ft', 'CLOUDS'); tex.noise_scale = 0.06 * s
    d = foam.modifiers.new('disp', 'DISPLACE'); d.texture = tex; d.strength = 0.018 * s
    sub = foam.modifiers.new('sub', 'SUBSURF'); sub.levels = 2; sub.render_levels = 2
    foam.modifiers.move(1, 0)
    # bubbles: little spheres climbing in lines from nucleation points
    r = random.Random(seed)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.006 * s, segments=10, ring_count=6)
    proto = bpy.context.active_object; proto.data.materials.append(BUBBLE); proto.hide_render = True; proto.hide_viewport = True
    streams = 22
    for k in range(streams):
        a = r.uniform(0, 2 * math.pi); rr = r.uniform(0.05, 0.27) * s
        speed = r.uniform(0.35, 0.6) * s  # units per second
        per = 7
        for j in range(per):
            b = bpy.data.objects.new(f'{name}_b{k}_{j}', proto.data); link(b)
            sc_ = r.uniform(0.6, 1.4); b.scale = (sc_, sc_, sc_)
            span = top - 0.2 * s
            period = span / speed  # seconds to climb
            off = (j / per) * period * FPS
            loc = lambda z: (x + rr * math.cos(a), y + rr * math.sin(a), z)
            b.location = loc(0.2 * s); b.keyframe_insert('location', frame=1 - off)
            b.location = loc(top + 0.01 * s); b.keyframe_insert('location', frame=1 - off + period * FPS)
            act = b.animation_data.action
            curves = []
            if hasattr(act, 'fcurves') and len(getattr(act, 'fcurves', [])):
                curves = list(act.fcurves)
            else:
                for layer in act.layers:
                    for strip in layer.strips:
                        for cb in strip.channelbags: curves += list(cb.fcurves)
            for f in curves:
                for kp in f.keyframe_points: kp.interpolation = 'LINEAR'
                f.modifiers.new('CYCLES')
            b.parent = None
    # condensation droplets on the outside of the glass
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=12, ring_count=8)
    dp = bpy.context.active_object; dp.data.materials.append(WATER); dp.hide_render = True; dp.hide_viewport = True
    for i in range(260):
        z = r.uniform(0.12 * s, top - 0.02 * s)
        rr = (0.335 + (z / s - 0.12) / (1.55 - 0.12) * (0.44 - 0.335)) * s
        a = r.uniform(0, 2 * math.pi)
        dsz = r.choice([0.004, 0.006, 0.008, 0.011, 0.015]) * s
        o = bpy.data.objects.new(f'{name}_d{i}', dp.data); link(o)
        o.location = (x + (rr + dsz * 0.25) * math.cos(a), y + (rr + dsz * 0.25) * math.sin(a), z)
        o.scale = (dsz, dsz, dsz * (1.3 if dsz > 0.009 else 1.0))
        o.rotation_euler = (0, 0, a)
    return {'glass': g, 'beer': beer, 'foam': foam, 'top': top, 'H': H}


def table(z=0.0, size=12):
    bpy.ops.mesh.primitive_plane_add(size=size, location=(0, 1, z))
    t = bpy.context.active_object; t.data.materials.append(WOOD)
    # subtle wood grain via noise bump
    nt = WOOD.node_tree; p = nt.nodes['Principled BSDF']
    wave = nt.nodes.new('ShaderNodeTexWave'); wave.inputs['Scale'].default_value = 3; wave.inputs['Distortion'].default_value = 6
    bump = nt.nodes.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.15
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    ramp.color_ramp.elements[0].color = (0.03, 0.014, 0.007, 1); ramp.color_ramp.elements[1].color = (0.09, 0.045, 0.02, 1)
    nt.links.new(wave.outputs['Fac'], ramp.inputs[0]); nt.links.new(ramp.outputs[0], p.inputs['Base Color'])
    nt.links.new(wave.outputs['Fac'], bump.inputs['Height']); nt.links.new(bump.outputs[0], p.inputs['Normal'])
    return t


def camera(loc, target, lens=85, fstop=1.8, focus=None):
    c = bpy.data.cameras.new('cam'); c.lens = lens
    c.dof.use_dof = True; c.dof.aperture_fstop = fstop
    ob = link(bpy.data.objects.new('cam', c)); ob.location = loc; look_at(ob, target)
    sc.camera = ob
    if focus is not None: c.dof.focus_distance = focus
    return ob


def key_cam(ob, frames, target):
    """frames: [(frame, (x,y,z), focus_distance)]"""
    for f, loc, fd in frames:
        ob.location = loc; look_at(ob, target)
        ob.keyframe_insert('location', frame=f); ob.keyframe_insert('rotation_euler', frame=f)
        ob.data.dof.focus_distance = fd; ob.data.dof.keyframe_insert('focus_distance', frame=f)


# ---------------------------------------------------------------- shots
if SHOT == 'glass':
    table()
    G = chopp_glass(seed=11)
    # backlight through the beer (the classic beer-commercial glow)
    # soft glow card behind the glass (out of focus) so the beer glows amber
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 2.6, 0.9))
    card = bpy.context.active_object; card.scale = (1.4, 2.2, 1); card.rotation_euler = (math.radians(90), 0, 0)
    cm = bpy.data.materials.new('card'); cm.use_nodes = True; cn = cm.node_tree; cn.nodes.clear()
    co = cn.nodes.new('ShaderNodeOutputMaterial'); ce = cn.nodes.new('ShaderNodeEmission'); ce.inputs[1].default_value = 6.5
    gr = cn.nodes.new('ShaderNodeTexGradient'); gr.gradient_type = 'SPHERICAL'
    tc = cn.nodes.new('ShaderNodeTexCoord'); mp = cn.nodes.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (2.0, 2.0, 2.0)
    rp = cn.nodes.new('ShaderNodeValToRGB'); rp.color_ramp.elements[0].color = (0, 0, 0, 1); rp.color_ramp.elements[1].color = (1.0, 0.72, 0.28, 1)
    cn.links.new(tc.outputs['Object'], mp.inputs[0]); cn.links.new(mp.outputs[0], gr.inputs[0]); cn.links.new(gr.outputs[0], rp.inputs[0])
    cn.links.new(rp.outputs[0], ce.inputs[0]); cn.links.new(ce.outputs[0], co.inputs[0]); card.data.materials.append(cm)
    card.visible_camera = False  # seen only through the glass and in the table
    area_light('rimL', (-1.7, 0.5, 1.3), (0, math.radians(-60), math.radians(-20)), 0.2, 90, (1.0, 0.8, 0.6), size_y=2.4)
    area_light('rimR', (1.7, 0.5, 1.3), (0, math.radians(60), math.radians(20)), 0.2, 90, (1.0, 0.8, 0.6), size_y=2.4)
    area_light('top', (0, -0.2, 2.6), (0, 0, 0), 0.6, 160, (1, 0.92, 0.82))
    area_light('fill', (-1.2, -3.0, 1.9), (math.radians(65), 0, math.radians(-25)), 1.5, 70, (1, 0.85, 0.7))
    bokeh_wall(strength=(1.5, 4))
    target = (0, 0, 0.92)
    cam = camera((0, -6.0, 1.0), target, lens=75, fstop=2.2, focus=6.0)
    key_cam(cam, [(1, (-1.1, -6.4, 0.7), 6.45), (TOTAL, (0.6, -5.0, 1.05), 5.05)], target)

elif SHOT == 'cheers':
    table()
    A = chopp_glass(x=-0.0, seed=21, name='A')
    B = chopp_glass(x=0.0, seed=31, name='B')
    groups = {'A': [o for o in bpy.data.objects if o.name.startswith('A_')], 'B': [o for o in bpy.data.objects if o.name.startswith('B_')]}
    pa = link(bpy.data.objects.new('pivA', None)); pb = link(bpy.data.objects.new('pivB', None))
    for o in groups['A']:
        if o.parent is None: o.parent = pa
    for o in groups['B']:
        if o.parent is None: o.parent = pb
    hit = 60
    for piv, side in ((pa, -1), (pb, 1)):
        for f, dx, dz, rot in ((1, 1.25, 0.0, 0.0), (hit - 6, 0.52, 0.55, 0.16), (hit, 0.47, 0.6, 0.2), (hit + 5, 0.53, 0.58, 0.14), (TOTAL, 0.62, 0.5, 0.08)):
            piv.location = (side * dx, 0, dz); piv.rotation_euler = (0, side * -rot, 0)
            piv.keyframe_insert('location', frame=f); piv.keyframe_insert('rotation_euler', frame=f)
    area_light('back', (0, 2.2, 1.2), (math.radians(90), 0, math.radians(180)), 2.4, 320, (1.0, 0.72, 0.4), size_y=1.6)
    area_light('rimL', (-2.0, 0.4, 1.6), (0, math.radians(-60), math.radians(-20)), 0.3, 160, (1.0, 0.8, 0.6), size_y=2.4)
    area_light('rimR', (2.0, 0.4, 1.6), (0, math.radians(60), math.radians(20)), 0.3, 160, (1.0, 0.8, 0.6), size_y=2.4)
    bokeh_wall()
    target = (0, 0, 1.25)
    cam = camera((0, -5.2, 1.2), target, lens=60, fstop=2.4, focus=5.2)
    key_cam(cam, [(1, (0, -5.4, 1.1), 5.4), (TOTAL, (0, -4.8, 1.3), 4.8)], target)

elif SHOT == 'pct':
    bpy.ops.object.text_add(location=(0, 0, 0))
    t = bpy.context.active_object
    t.data.body = '30%'
    t.data.align_x = 'CENTER'; t.data.align_y = 'CENTER'
    t.data.extrude = 0.12; t.data.bevel_depth = 0.025; t.data.bevel_resolution = 6
    t.data.size = 1.4
    t.rotation_euler = (math.radians(90), 0, 0)
    try:
        fnt = bpy.data.fonts.load('/home/user/FerHub/sal-malte-premium/public/fonts/Anton-Regular.ttf')
        t.data.font = fnt
    except Exception as e:
        print('font fallback', e)
    t.data.materials.append(GOLD)
    piv = link(bpy.data.objects.new('piv', None)); t.parent = piv
    for f, rz in ((1, math.radians(-28)), (TOTAL, math.radians(18))):
        piv.rotation_euler = (0, 0, rz); piv.keyframe_insert('rotation_euler', frame=f)
    # softboxes for the metal to reflect
    area_light('kL', (-2.4, -2.0, 1.6), (math.radians(60), 0, math.radians(-45)), 2.5, 600, (1, 0.85, 0.65), size_y=1.0)
    area_light('kR', (2.6, -1.6, 0.4), (math.radians(80), 0, math.radians(55)), 3.0, 450, (1, 0.7, 0.45), size_y=0.6)
    area_light('top', (0, -0.5, 3.0), (0, 0, 0), 4.0, 300, (1, 0.9, 0.8))
    area_light('rim', (0, 2.0, 0.5), (math.radians(-90), 0, 0), 3.0, 400, (1, 0.6, 0.25))
    for nm, loc, size in (('sbL', (-3, -3, 1.2), (2.0, 3.0)), ('sbR', (3.2, -2.5, 0.0), (1.2, 3.5))):
        bpy.ops.mesh.primitive_plane_add(size=1, location=loc)
        p = bpy.context.active_object; p.scale = (size[0], size[1], 1); look_at(p, (0, 0, 0)); p.rotation_euler.rotate_axis('X', math.radians(180))
        p.data.materials.append(emission_mat(nm, (1, 0.85, 0.65), 3.0)); p.visible_camera = False
    # softbox strips behind the camera: the gold face reflects these
    for nm, z, h, st in (('stripA', 2.6, 1.2, 6.0), ('stripB', -1.2, 0.6, 2.5)):
        bpy.ops.mesh.primitive_plane_add(size=1, location=(0, -9, z))
        p = bpy.context.active_object; p.scale = (9, h, 1); p.rotation_euler = (math.radians(-90), 0, 0)
        p.data.materials.append(emission_mat(nm, (1, 0.82, 0.55), st)); p.visible_camera = False
    bokeh_wall(y=5.5, n=60, spread_x=7, z0=-3, z1=4, seed=5, strength=(1.5, 4))
    cam = camera((0, -6.0, 0.25), (0, 0, 0), lens=55, fstop=1.4, focus=6.0)
    key_cam(cam, [(1, (0, -6.6, 0.4), 6.6), (TOTAL, (0, -5.6, 0.1), 5.6)], (0, 0, 0))

# ---------------------------------------------------------------- render
os.makedirs(OUT, exist_ok=True)
for f in range(F0, F1 + 1):
    sc.frame_set(f)
    sc.render.filepath = os.path.join(OUT, f'{SHOT}_{f:04d}.png')
    bpy.ops.render.render(write_still=True)
    print('rendered', f, flush=True)
