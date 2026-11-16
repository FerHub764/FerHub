"""Photoreal desk scene for the DevTrilhas commercial (Blender bpy, Cycles)."""
import bpy, bmesh, math, os, sys
from mathutils import Vector

W = '/tmp/claude-0/work'
SCREENS = W + '/screens'
HDRI = '/tmp/claude-0/assets/hdri/city.exr'


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, **kw):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    for k, v in kw.items():
        p.inputs[k].default_value = v
    return m, p


def box(name, size, loc, bevel=0.0, segs=4, material=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel:
        b = o.modifiers.new('bev', 'BEVEL')
        b.width = bevel
        b.segments = segs
        b.limit_method = 'ANGLE'
        o.modifiers.new('wn', 'WEIGHTED_NORMAL')
    bpy.ops.object.shade_smooth()
    if material:
        o.data.materials.append(material)
    return o


def lathe(name, profile, material, loc):
    me = bpy.data.meshes.new(name)
    bm = bmesh.new()
    vs = [bm.verts.new((r, 0, z)) for r, z in profile]
    for a, b in zip(vs, vs[1:]):
        bm.edges.new((a, b))
    bmesh.ops.spin(bm, geom=bm.verts[:] + bm.edges[:], cent=(0, 0, 0), axis=(0, 0, 1), angle=math.tau, steps=96)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bm.to_mesh(me)
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    o.location = loc
    for p in me.polygons:
        p.use_smooth = True
    o.modifiers.new('sub', 'SUBSURF').levels = 1
    o.data.materials.append(material)
    return o


def wood_material():
    m, p = mat('Walnut', **{'Roughness': 0.5})
    nt = m.node_tree; N, L = nt.nodes, nt.links
    tc = N.new('ShaderNodeTexCoord')
    mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (0.35, 14.0, 1.0)
    L.new(tc.outputs['Object'], mp.inputs['Vector'])
    grain = N.new('ShaderNodeTexNoise'); grain.inputs['Scale'].default_value = 6.0; grain.inputs['Detail'].default_value = 12; grain.inputs['Roughness'].default_value = 0.62; grain.inputs['Distortion'].default_value = 0.4
    L.new(mp.outputs['Vector'], grain.inputs['Vector'])
    mp2 = N.new('ShaderNodeMapping'); mp2.inputs['Scale'].default_value = (1.0, 3.0, 1.0)
    L.new(tc.outputs['Object'], mp2.inputs['Vector'])
    blot = N.new('ShaderNodeTexNoise'); blot.inputs['Scale'].default_value = 2.0; blot.inputs['Detail'].default_value = 3
    L.new(mp2.outputs['Vector'], blot.inputs['Vector'])
    mix = N.new('ShaderNodeMix'); mix.data_type = 'FLOAT'; mix.inputs['Factor'].default_value = 0.3
    L.new(grain.outputs['Fac'], mix.inputs['A']); L.new(blot.outputs['Fac'], mix.inputs['B'])
    ramp = N.new('ShaderNodeValToRGB')
    e = ramp.color_ramp.elements
    e[0].position = 0.35; e[0].color = (0.028, 0.013, 0.007, 1)
    e[1].position = 0.68; e[1].color = (0.13, 0.062, 0.03, 1)
    L.new(mix.outputs['Result'], ramp.inputs['Fac']); L.new(ramp.outputs['Color'], p.inputs['Base Color'])
    rr = N.new('ShaderNodeMapRange'); rr.inputs['To Min'].default_value = 0.38; rr.inputs['To Max'].default_value = 0.62
    L.new(blot.outputs['Fac'], rr.inputs['Value']); L.new(rr.outputs['Result'], p.inputs['Roughness'])
    bump = N.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = 0.05; bump.inputs['Distance'].default_value = 0.0003
    L.new(grain.outputs['Fac'], bump.inputs['Height']); L.new(bump.outputs['Normal'], p.inputs['Normal'])
    p.inputs['Coat Weight'].default_value = 0.12; p.inputs['Coat Roughness'].default_value = 0.35
    return m


def screen_material(img_path):
    m, p = mat('Screen', **{'Base Color': (0.0, 0.0, 0.0, 1), 'Roughness': 0.08, 'Specular IOR Level': 0.35})
    nt = m.node_tree
    tex = nt.nodes.new('ShaderNodeTexImage')
    tex.name = 'ScreenTex'
    tex.image = bpy.data.images.load(img_path)
    tex.interpolation = 'Cubic'
    nt.links.new(tex.outputs['Color'], p.inputs['Emission Color'])
    p.inputs['Emission Strength'].default_value = 2.2
    return m


def set_screen(name):
    m = bpy.data.materials['Screen']
    t = m.node_tree.nodes['ScreenTex']
    t.image = bpy.data.images.load(f'{SCREENS}/{name}.png', check_existing=True)


def build(screen='home'):
    reset()
    sc = bpy.context.scene

    # --- materials
    alu, _ = mat('Aluminium', **{'Base Color': (0.20, 0.205, 0.215, 1), 'Metallic': 1.0, 'Roughness': 0.34, 'Anisotropic': 0.4})
    keym, _ = mat('Keycap', **{'Base Color': (0.012, 0.012, 0.014, 1), 'Roughness': 0.55})
    bezel, _ = mat('Bezel', **{'Base Color': (0.004, 0.004, 0.005, 1), 'Roughness': 0.12})
    pad, _ = mat('Trackpad', **{'Base Color': (0.13, 0.135, 0.145, 1), 'Metallic': 0.7, 'Roughness': 0.28})
    ceramic, _ = mat('Ceramic', **{'Base Color': (0.05, 0.05, 0.052, 1), 'Roughness': 0.35, 'Coat Weight': 0.8, 'Coat Roughness': 0.08})
    coffee, _ = mat('Coffee', **{'Base Color': (0.03, 0.012, 0.004, 1), 'Roughness': 0.04})
    leather, _ = mat('Leather', **{'Base Color': (0.025, 0.03, 0.035, 1), 'Roughness': 0.6})
    paper, _ = mat('Paper', **{'Base Color': (0.75, 0.72, 0.66, 1), 'Roughness': 0.8})
    penm, _ = mat('Pen', **{'Base Color': (0.6, 0.45, 0.2, 1), 'Metallic': 1.0, 'Roughness': 0.25})
    wall, _ = mat('Wall', **{'Base Color': (0.02, 0.02, 0.022, 1), 'Roughness': 0.9})

    # --- desk
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0.2, 0))
    desk = bpy.context.object; desk.scale = (2.6, 1.6, 1); desk.name = 'Desk'
    desk.data.materials.append(wood_material())
    box('DeskEdge', (2.6, 0.03, 0.04), (0, -0.6, -0.02), bevel=0.004, material=desk.data.materials[0])

    # --- laptop base
    T = 0.0105
    box('Base', (0.304, 0.212, T), (0, 0, T / 2), bevel=0.0035, segs=5, material=alu)
    box('Well', (0.272, 0.112, 0.0012), (0, 0.044, T + 0.0002), bevel=0.0008, material=bezel)
    kw, pitch = 0.0158, 0.01875
    rows = 6
    for r in range(rows):
        y = 0.004 + r * 0.0182
        cols = 14 if r < 5 else 10
        for c in range(cols):
            x = -0.122 + c * pitch + (0.0 if r % 2 == 0 else 0.004)
            w = kw
            if r == 0 and c == 4:
                w = kw * 5 + pitch - kw; x += 0.002
            if r == 0 and 4 < c < 9:
                continue
            if x + w / 2 > 0.128:
                continue
            h = 0.0105 if r == 5 else kw
            box(f'k{r}_{c}', (w, h, 0.0016), (x + w / 2 - kw / 2, y, T + 0.0011), bevel=0.0012, segs=3, material=keym)
    box('Trackpad', (0.13, 0.082, 0.0003), (0, -0.058, T + 0.00005), bevel=0.0015, material=pad)
    box('Notch', (0.05, 0.005, 0.002), (0, -0.104, T - 0.0005), bevel=0.001, material=alu)

    # --- lid (pivot at hinge)
    hinge = bpy.data.objects.new('Hinge', None)
    bpy.context.collection.objects.link(hinge)
    hinge.location = (0, 0.104, T + 0.002)
    LH, LT = 0.212, 0.005
    lid = box('Lid', (0.304, LT, LH), (0, 0.003, LH / 2), bevel=0.003, segs=5, material=alu)
    lid.parent = hinge
    bz = box('BezelGlass', (0.300, 0.0006, LH - 0.004), (0, -0.0005 - LT / 2 + 0.003, LH / 2), bevel=0.002, material=bezel)
    bz.parent = hinge
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, -0.0012 - LT / 2 + 0.003, LH / 2 + 0.006))
    scr = bpy.context.object; scr.name = 'Display'
    scr.rotation_euler = (math.radians(90), 0, 0)
    scr.scale = (0.286, 0.17875, 1)
    scr.data.materials.append(screen_material(f'{SCREENS}/{screen}.png'))
    scr.parent = hinge
    hinge.rotation_euler = (math.radians(-18), 0, 0)

    # --- mug
    prof = [(0.0, 0.004), (0.036, 0.004), (0.039, 0.008), (0.041, 0.05), (0.042, 0.094), (0.0405, 0.0965), (0.0375, 0.094), (0.0365, 0.05), (0.034, 0.014), (0.0, 0.012)]
    mug = lathe('Mug', [(0, 0)] + [(r, z) for r, z in prof[1:]], ceramic, (-0.27, -0.06, 0))
    bpy.ops.mesh.primitive_torus_add(major_radius=0.026, minor_radius=0.0055, location=(-0.27 - 0.045, -0.06, 0.05), rotation=(math.radians(90), 0, 0))
    hnd = bpy.context.object; hnd.scale = (0.75, 1, 1); hnd.data.materials.append(ceramic); bpy.ops.object.shade_smooth()
    bpy.ops.mesh.primitive_cylinder_add(radius=0.0362, depth=0.001, location=(-0.27, -0.06, 0.078), vertices=96)
    bpy.context.object.data.materials.append(coffee)

    # --- notebook + pen
    nb = box('Notebook', (0.15, 0.21, 0.013), (0.285, -0.03, 0.0066), bevel=0.002, material=leather)
    nb.rotation_euler.z = math.radians(-8)
    pg = box('Pages', (0.146, 0.206, 0.009), (0.2855, -0.03, 0.0066), bevel=0.0005, material=paper)
    pg.rotation_euler.z = math.radians(-8)
    pg.location.x += 0.002
    bpy.ops.mesh.primitive_cylinder_add(radius=0.0045, depth=0.14, location=(0.26, -0.085, 0.0175), rotation=(math.radians(90), 0, math.radians(-25)), vertices=48)
    pen = bpy.context.object; pen.data.materials.append(penm); bpy.ops.object.shade_smooth()

    # --- wall + window with city bokeh
    box('BackWall', (6, 0.05, 3), (0, 2.6, 1.0), material=wall)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0.0, 2.55, 0.6))
    city = bpy.context.object; city.name = 'CityWindow'
    city.rotation_euler = (math.radians(90), 0, 0); city.scale = (6.0, 1.5, 1)
    cm = bpy.data.materials.new('City'); cm.use_nodes = True
    nt = cm.node_tree; nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputMaterial'); em = nt.nodes.new('ShaderNodeEmission')
    tx = nt.nodes.new('ShaderNodeTexImage'); tx.image = bpy.data.images.load(W + '/city_bokeh.png')
    nt.links.new(tx.outputs['Color'], em.inputs['Color']); em.inputs['Strength'].default_value = 1.4
    nt.links.new(em.outputs['Emission'], out.inputs['Surface'])
    city.data.materials.append(cm)
    city.visible_shadow = False

    # --- lights
    def area(name, loc, rot, size, power, color):
        ld = bpy.data.lights.new(name, 'AREA'); ld.size = size; ld.energy = power; ld.color = color
        ld.shape = 'DISK'
        o = bpy.data.objects.new(name, ld); bpy.context.collection.objects.link(o)
        o.location = loc
        o.rotation_euler = rot
        return o
    key = area('LampKey', (-0.75, -0.25, 0.75), (0, 0, 0), 0.25, 38, (1.0, 0.66, 0.38))
    tgt = bpy.data.objects.new('KeyTgt', None); bpy.context.collection.objects.link(tgt); tgt.location = (-0.05, 0.0, 0.0)
    c = key.constraints.new('TRACK_TO'); c.target = tgt; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
    rim = area('Rim', (0.9, 1.4, 0.7), (0, 0, 0), 0.6, 22, (0.45, 0.6, 1.0))
    c = rim.constraints.new('TRACK_TO'); c.target = tgt; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
    fill = area('Fill', (0.2, -1.6, 0.6), (0, 0, 0), 1.5, 4, (0.6, 0.7, 1.0))
    c = fill.constraints.new('TRACK_TO'); c.target = tgt; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'

    # --- world
    world = bpy.data.worlds.new('W'); sc.world = world; world.use_nodes = True
    wn = world.node_tree.nodes; env = wn.new('ShaderNodeTexEnvironment'); env.image = bpy.data.images.load(HDRI)
    world.node_tree.links.new(env.outputs['Color'], wn['Background'].inputs['Color'])
    wn['Background'].inputs['Strength'].default_value = 0.04

    # --- camera
    cd = bpy.data.cameras.new('Cam'); cam = bpy.data.objects.new('Cam', cd)
    bpy.context.collection.objects.link(cam); sc.camera = cam
    aim = bpy.data.objects.new('Aim', None); bpy.context.collection.objects.link(aim)
    c = cam.constraints.new('TRACK_TO'); c.target = aim; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
    focus = bpy.data.objects.new('Focus', None); bpy.context.collection.objects.link(focus)
    cd.dof.use_dof = True; cd.dof.focus_object = focus
    cd.sensor_width = 36

    # --- render
    sc.render.engine = 'CYCLES'
    cy = sc.cycles
    cy.device = 'CPU'; cy.samples = 64; cy.use_adaptive_sampling = True; cy.adaptive_threshold = 0.04
    cy.use_denoising = True; cy.denoiser = 'OPENIMAGEDENOISE'
    cy.max_bounces = 6; cy.glossy_bounces = 3; cy.diffuse_bounces = 3; cy.transmission_bounces = 2; cy.transparent_max_bounces = 2
    cy.caustics_reflective = False; cy.caustics_refractive = False
    cy.blur_glossy = 1.0
    sc.render.resolution_x = 1920; sc.render.resolution_y = 804
    sc.render.fps = 24
    sc.render.film_transparent = False; sc.render.use_persistent_data = True
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.look = 'AgX - Medium High Contrast'
    sc.render.image_settings.file_format = 'PNG'
    sc.render.threads_mode = 'FIXED'; sc.render.threads = os.cpu_count()
    return sc
