import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { C, isCoarse } from './theme.js';
import { Burger, makeLayer } from './ingredients.js';

const lin = (hex) => new THREE.Color(hex); // Color() já converte sRGB → linear

/* sprites desfocados para ingredientes flutuando (profundidade) */
function bitTexture(kind, blur) {
  const s = 128, c = document.createElement('canvas'); c.width = c.height = s;
  const ctx = c.getContext('2d'); ctx.filter = `blur(${blur}px)`; ctx.translate(s / 2, s / 2);
  if (kind === 'leaf') {
    ctx.fillStyle = '#5DAA34'; ctx.beginPath(); ctx.moveTo(-36, 0); ctx.quadraticCurveTo(0, -34, 38, 0); ctx.quadraticCurveTo(0, 30, -36, 0); ctx.fill();
    ctx.strokeStyle = '#B7DD72'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(32, 0); ctx.stroke();
  } else if (kind === 'seed') {
    ctx.fillStyle = '#F6E7C1'; ctx.beginPath(); ctx.ellipse(0, 0, 14, 26, 0.4, 0, 7); ctx.fill();
  } else if (kind === 'tomato') {
    ctx.fillStyle = '#D9261A'; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.fill();
    ctx.fillStyle = '#FF7B5E'; ctx.beginPath(); ctx.arc(0, 0, 22, 0, 7); ctx.fill();
  } else if (kind === 'onion') {
    ctx.strokeStyle = '#8A2B6C'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(0, 0, 28, 0, 7); ctx.stroke();
  } else if (kind === 'chili') {
    ctx.fillStyle = '#E8B04A'; ctx.beginPath(); ctx.arc(0, 0, 18, 0, 7); ctx.fill();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

const BG_VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }`;
const BG_FRAG = `
uniform vec3 uBg1, uBg2, uVig, uGlow; uniform vec2 uRes, uGlowPos; uniform float uGlowR, uTime, uGlowOn;
varying vec2 vUv;
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
void main(){
  vec2 uv = vUv; float asp = uRes.x / uRes.y;
  vec3 col = mix(uBg1, uBg2, smoothstep(-0.1, 1.2, (1.0 - uv.y) * 0.7 + uv.x * 0.25));
  vec2 d = (uv - uGlowPos) * vec2(asp, 1.0);
  float r = length(d);
  float glow = exp(-r * r / (uGlowR * uGlowR * 0.55)) * uGlowOn;
  col = mix(col, uGlow, glow * 0.55);
  float disc = smoothstep(uGlowR * 1.02, uGlowR * 0.98, r) * 0.07 * uGlowOn;
  col += uGlow * disc;
  vec2 v = (uv - 0.5) * vec2(asp * 0.8, 1.0);
  col = mix(col, uVig, smoothstep(0.35, 1.05, length(v)) * 0.85);
  col += (h(uv * uRes + uTime) - 0.5) * 0.012;
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export class MainScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.tier = isCoarse || innerWidth < 820 ? 1 : 2;
    this.reduced = false;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: this.tier > 1, powerPreference: 'high-performance' });
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = this.tier > 1;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    this.camera.position.set(0, 0, 16);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.35;

    // fundo (gradiente + vinheta + brilho atrás do burger)
    this.bgU = {
      uBg1: { value: lin(C.bg1) }, uBg2: { value: lin(C.bg2) }, uVig: { value: lin(C.vignette) }, uGlow: { value: lin(C.glow) },
      uRes: { value: new THREE.Vector2(1, 1) }, uGlowPos: { value: new THREE.Vector2(0.68, 0.5) }, uGlowR: { value: 0.35 }, uTime: { value: 0 }, uGlowOn: { value: 1 },
    };
    const bg = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms: this.bgU, vertexShader: BG_VERT, fragmentShader: BG_FRAG, depthWrite: false, depthTest: false }));
    bg.frustumCulled = false; bg.renderOrder = -10; this.scene.add(bg);

    // luzes quentes cinematográficas
    this.scene.add(new THREE.HemisphereLight('#FFD7A8', '#5A1E08', 0.45));
    const key = new THREE.DirectionalLight('#FFE6C8', 2.4); key.position.set(4, 7, 6);
    key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 6; key.shadow.bias = -0.0008; key.shadow.intensity = 0.55; key.shadow.normalBias = 0.02;
    Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 30 });
    this.key = key;
    const rim = new THREE.DirectionalLight('#FF7A1F', 4.5); rim.position.set(-5, 3, -6);
    const fill = new THREE.DirectionalLight('#FFB070', 1.1); fill.position.set(-7, -1, 4);
    const under = new THREE.PointLight('#FF5A00', 6, 9, 1.6); under.position.set(0, -3, 1.5);
    this.underLight = under;

    // rig → spin → burger
    this.rig = new THREE.Group(); this.spin = new THREE.Group();
    this.rig.add(this.spin); this.scene.add(this.rig);
    this.rig.add(key, key.target);
    this.scene.add(rim, fill); this.rig.add(under);
    this.burger = new Burger(['bunBottom', 'patty', 'cheese', 'tomato', 'onion', 'lettuce', 'bunTop'], 'high');
    this.spin.add(this.burger.group);

    // sombra de contato sob o burger
    const sc = document.createElement('canvas'); sc.width = sc.height = 128;
    const sx = sc.getContext('2d'); const sg = sx.createRadialGradient(64, 64, 0, 64, 64, 64);
    sg.addColorStop(0, 'rgba(20,6,0,.75)'); sg.addColorStop(1, 'rgba(20,6,0,0)'); sx.fillStyle = sg; sx.fillRect(0, 0, 128, 128);
    this.contact = new THREE.Mesh(new THREE.PlaneGeometry(5, 5), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(sc), transparent: true, depthWrite: false }));
    this.contact.rotation.x = -Math.PI / 2; this.rig.add(this.contact);

    this.initParticles();
    this.initBits();

    // composer
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.4, 0.5, 0.9);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    // estado de interação
    this.anchor = { x: 0.68, y: 0.5, h: 0.7, tilt: 0.2, explode: 0, yaw: 0 };
    this.cur = { x: 0.68, y: 0.5, h: 0.7, tilt: 0.2, explode: 0 };
    this.mouse = new THREE.Vector2(); this.mouseS = new THREE.Vector2();
    this.yaw = -0.4; this.yawVel = 0; this.dragging = false;
    this.raycaster = new THREE.Raycaster();
    this.rain = [];
    this.clock = new THREE.Clock();
    this.fps = { frames: 0, time: 0, low: 0 };
    this.onSelect = null; this.offscreen = false; this.skip = 0;

    this.resize();
    addEventListener('resize', () => this.resize());
  }

  initParticles() {
    const make = (n, color, size, blending) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
      geo.setAttribute('alpha', new THREE.BufferAttribute(new Float32Array(n), 1));
      const mat = new THREE.ShaderMaterial({
        uniforms: { uColor: { value: lin(color) }, uSize: { value: size }, uScale: { value: 1 } },
        vertexShader: `attribute float alpha; varying float vA; uniform float uSize, uScale; void main(){ vA = alpha; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = uSize * uScale * (10.0 / -mv.z); gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `uniform vec3 uColor; varying float vA; void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(uColor, a * vA); }`,
        transparent: true, depthWrite: false, blending,
      });
      const pts = new THREE.Points(geo, mat); pts.frustumCulled = false;
      const data = Array.from({ length: n }, () => ({ life: Math.random(), speed: 0, x: 0, y: 0, z: 0, seed: Math.random() * 100 }));
      return { pts, data, n };
    };
    const n = this.tier > 1 ? 1 : 0.5;
    this.steam = make(Math.round(40 * n), '#FFF1E0', 55, THREE.NormalBlending);
    this.embers = make(Math.round(70 * n), '#FFB347', 9, THREE.AdditiveBlending);
    this.steam.data.forEach((d) => this.resetSteam(d, true));
    this.embers.data.forEach((d) => this.resetEmber(d, true));
    this.spin.add(this.steam.pts); this.rig.add(this.embers.pts);
  }
  resetSteam(d, init) { const a = Math.random() * 6.28, r = Math.random() * 1.2; d.x = Math.cos(a) * r; d.z = Math.sin(a) * r; d.y = 0.3; d.life = init ? Math.random() : 0; d.speed = 0.25 + Math.random() * 0.35; }
  resetEmber(d, init) { const a = Math.random() * 6.28, r = 1 + Math.random() * 2.2; d.x = Math.cos(a) * r; d.z = Math.sin(a) * r * 0.6; d.y = -2.3; d.life = init ? Math.random() : 0; d.speed = 0.25 + Math.random() * 0.5; }

  initBits() {
    const kinds = ['leaf', 'leaf', 'seed', 'tomato', 'leaf', 'leaf', 'seed', 'chili', 'leaf', 'seed', 'tomato', 'leaf'];
    const spots = [[0.02, 0.32], [0.48, -0.36], [0.12, -0.08], [0.46, 0.2], [0.05, 0.42], [-0.06, -0.42], [0.36, 0.42], [0.42, -0.1], [-0.47, -0.3], [0.2, 0.45], [-0.12, 0.44], [0.3, -0.44]];
    this.bits = new THREE.Group(); this.scene.add(this.bits);
    const texCache = {};
    kinds.forEach((k, i) => {
      const z = [-6, -3, 3.5, -4, 2, -7, 4.5, -2, 5, -5, 1, -1][i];
      const blur = Math.min(10, Math.abs(z) * 1.6 - 1);
      const key = k + Math.round(blur);
      texCache[key] ??= bitTexture(k, Math.max(0, blur));
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texCache[key], transparent: true, depthWrite: false, opacity: z > 0 ? 0.75 : 0.9 }));
      const s = (k === 'seed' ? 0.25 : 0.5) * (1 + z * 0.05);
      sp.scale.set(s, s, 1);
      sp.userData = { bx: spots[i][0], by: spots[i][1], z, ph: Math.random() * 6, rs: (Math.random() - 0.5) * 0.6 };
      sp.material.rotation = Math.random() * 6;
      this.bits.add(sp);
    });
  }

  resize() {
    const w = innerWidth, h = innerHeight;
    const pr = Math.min(devicePixelRatio, this.tier > 1 ? 1.5 : this.tier === 1 ? 1.25 : 1);
    this.renderer.setPixelRatio(pr); this.renderer.setSize(w, h, false);
    this.composer?.setPixelRatio(pr); this.composer?.setSize(w, h);
    this.bloom?.resolution.set(w / 2, h / 2);
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.bgU.uRes.value.set(w, h);
    this.visH = 2 * this.camera.position.z * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    this.steam && (this.steam.pts.material.uniforms.uScale.value = h / 900);
    this.embers && (this.embers.pts.material.uniforms.uScale.value = h / 900 * pr);
    this.bits?.children.forEach((sp) => { sp.userData.wx = sp.userData.bx * this.visH * this.camera.aspect; sp.userData.wy = sp.userData.by * this.visH; });
  }

  setQuality(tier) {
    this.tier = tier;
    this.renderer.shadowMap.enabled = tier > 1;
    this.scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; });
    this.resize();
  }

  /* ---- intro: camadas caem e montam o burger ---- */
  intro() {
    this.burger.layers.forEach((l, i) => {
      l.userData.drop = 7 + i * 0.6;
      gsap.to(l.userData, { drop: 0, duration: this.reduced ? 0.01 : 1.1, delay: this.reduced ? 0 : 0.15 + i * 0.13, ease: 'bounce.out' });
    });
  }

  /* ---- interação ---- */
  pick(clientX, clientY) {
    this.mouse.set((clientX / innerWidth) * 2 - 1, -(clientY / innerHeight) * 2 + 1);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hits = this.raycaster.intersectObject(this.burger.group, true);
    for (const h of hits) { let o = h.object; while (o && !o.userData?.type) o = o.parent; if (o && !o.userData.remove) return o; }
    return null;
  }
  select(layer) {
    const b = this.burger;
    if (b.selected) gsap.to(b.selected.userData, { pop: 0, duration: 0.4 });
    b.selected = layer && layer !== b.selected ? layer : null;
    if (b.selected) gsap.to(b.selected.userData, { pop: 1, duration: 0.6, ease: 'back.out(2)' });
    this.onSelect?.(b.selected);
  }
  screenOf(layer) {
    const v = new THREE.Vector3(); layer.getWorldPosition(v); v.project(this.camera);
    return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight };
  }
  /** easter egg: chuva de ingredientes */
  rainIngredients() {
    const types = ['tomato', 'cheese', 'lettuce', 'onion', 'bunTop', 'patty', 'pickles', 'bacon'];
    const count = this.tier > 1 ? 36 : 18;
    const w = this.visH * this.camera.aspect;
    for (let i = 0; i < count; i++) {
      const l = makeLayer(types[i % types.length], 'low', i);
      l.traverse((m) => { if (m.isMesh) m.castShadow = false; });
      const s = 0.18 + Math.random() * 0.14; l.scale.setScalar(s);
      l.position.set((Math.random() - 0.5) * w, this.visH / 2 + 1 + Math.random() * 6, (Math.random() - 0.5) * 4);
      l.userData.rv = new THREE.Vector3(Math.random() * 3, Math.random() * 3, Math.random() * 3);
      l.userData.vy = -(2 + Math.random() * 3);
      this.scene.add(l); this.rain.push(l);
    }
  }

  /* ---- loop ---- */
  frame() {
    const dt = Math.min(this.clock.getDelta(), 0.05), t = this.clock.elapsedTime;
    const R = this.reduced;
    const k = 1 - Math.pow(0.002, dt);

    // âncora de seção → posição/escala do burger em tela
    for (const key of ['x', 'y', 'h', 'tilt', 'explode']) this.cur[key] += (this.anchor[key] - this.cur[key]) * k;
    const visW = this.visH * this.camera.aspect;
    this.rig.position.set((this.cur.x - 0.5) * visW, (0.5 - this.cur.y) * this.visH, 0);
    this.burger.explode = this.cur.explode;
    this.burger.breath = R ? 0 : 1;
    const bh = this.burger.totalHeight(0.1) + 0.4;
    const scale = Math.max(0.05, (this.cur.h * this.visH) / (bh + this.cur.explode * 3.5));
    this.rig.scale.setScalar(scale);
    this.contact.position.y = -this.burger.totalHeight() / 2 - 0.35;

    // giro: auto + arrasto + parallax do mouse
    this.mouseS.lerp(this.mouse, R ? 1 : 0.06);
    if (!this.dragging) { this.yawVel *= Math.pow(0.04, dt); this.yaw += this.yawVel * dt + (R ? 0 : 0.12 * dt); }
    const par = R ? 0 : 1;
    this.spin.rotation.y = this.yaw + this.anchor.yaw + this.mouseS.x * 0.35 * par;
    this.spin.rotation.x = this.cur.tilt - this.mouseS.y * 0.14 * par;
    this.spin.position.y = R ? 0 : Math.sin(t * 0.8) * 0.06;

    this.burger.update(t, dt, R);

    // brilho de fundo segue o burger
    const sp = new THREE.Vector3(); this.rig.getWorldPosition(sp); sp.project(this.camera);
    this.bgU.uGlowPos.value.set((sp.x + 1) / 2, (sp.y + 1) / 2);
    this.bgU.uGlowR.value = Math.min(0.55, this.cur.h * 0.62);
    this.bgU.uTime.value = t % 10;

    // partículas
    const pOn = !R;
    this.steam.pts.visible = this.embers.pts.visible = pOn;
    if (pOn) {
      const top = this.burger.totalHeight() / 2;
      const sp2 = this.steam.pts.geometry.attributes, ep = this.embers.pts.geometry.attributes;
      this.steam.data.forEach((d, i) => {
        d.life += dt * d.speed * 0.45; if (d.life > 1) this.resetSteam(d);
        sp2.position.setXYZ(i, d.x + Math.sin(t + d.seed) * 0.3 * d.life, top + 0.1 + d.life * 1.6, d.z);
        sp2.alpha.setX(i, Math.sin(d.life * Math.PI) * 0.06);
      });
      this.embers.data.forEach((d, i) => {
        d.life += dt * d.speed * 0.35; if (d.life > 1) this.resetEmber(d);
        ep.position.setXYZ(i, d.x + Math.sin(t * 2 + d.seed) * 0.25, d.y + d.life * 5.5, d.z);
        ep.alpha.setX(i, Math.sin(d.life * Math.PI) * (0.6 + 0.4 * Math.sin(t * 20 + d.seed)));
      });
      sp2.position.needsUpdate = sp2.alpha.needsUpdate = ep.position.needsUpdate = ep.alpha.needsUpdate = true;
    }
    this.underLight.intensity = 5 + (R ? 0 : Math.sin(t * 7) * 0.8 + Math.sin(t * 13) * 0.5);

    // ingredientes flutuantes com profundidade
    this.bits.children.forEach((s) => {
      const u = s.userData;
      s.position.set(u.wx + (R ? 0 : Math.sin(t * 0.4 + u.ph) * 0.4) - this.mouseS.x * u.z * 0.08, u.wy + (R ? 0 : Math.cos(t * 0.5 + u.ph) * 0.3) - this.mouseS.y * u.z * 0.05, u.z);
      if (!R) s.material.rotation += u.rs * dt;
    });

    // chuva
    if (this.rain.length) {
      this.rain = this.rain.filter((l) => {
        l.userData.vy -= 6 * dt; l.position.y += l.userData.vy * dt;
        l.rotation.x += l.userData.rv.x * dt; l.rotation.y += l.userData.rv.y * dt; l.rotation.z += l.userData.rv.z * dt;
        if (l.position.y < -this.visH / 2 - 3) { this.scene.remove(l); return false; }
        return true;
      });
    }

    // burger fora da tela: o fundo quase não muda, então redesenha só a cada 8 quadros
    this.skip = this.offscreen && !this.rain.length ? (this.skip + 1) % 8 : 0;
    if (!this.skip) { if (this.tier > 0) this.composer.render(dt); else this.renderer.render(this.scene, this.camera); }

    // qualidade automática
    const f = this.fps; f.frames++; f.time += dt;
    if (f.time > 2) {
      const fps = f.frames / f.time; f.frames = 0; f.time = 0;
      if (fps < 42 && this.tier > 0) { f.low++; if (f.low >= 2) { f.low = 0; this.setQuality(this.tier - 1); } } else f.low = 0;
      this.lastFps = fps;
    }
  }
}
