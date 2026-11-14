import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import gsap from 'gsap';
import { Burger, makeLayer, materials, fbm } from './ingredients.js';

/* Um único renderer WebGL compartilhado desenha todos os burgers dos cartões em canvases 2D */
export class CardRenderer {
  constructor(size = 360) {
    this.size = size;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(1); this.renderer.setSize(size, size, false);
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; this.scene.environmentIntensity = 0.5;
    this.scene.add(new THREE.HemisphereLight('#FFD7A8', '#5A1E08', 0.8));
    const k = new THREE.DirectionalLight('#FFE6C8', 3); k.position.set(4, 7, 6); this.scene.add(k);
    const r = new THREE.DirectionalLight('#FF7A1F', 4); r.position.set(-5, 3, -6); this.scene.add(r);
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50); this.camera.position.set(0, 2.6, 12); this.camera.lookAt(0, 0, 0);
    this.holder = new THREE.Group(); this.scene.add(this.holder);
  }
  make(types) { const b = new Burger(types, 'low'); b.gap = 0.05; b.update(0, 1, true); return b; }
  draw(burger, canvas, rotY = -0.5) {
    this.holder.clear(); this.holder.add(burger.group);
    const h = burger.totalHeight() + 0.5;
    burger.group.scale.setScalar(Math.min(1.25, 4.4 / h));
    this.holder.rotation.y = rotY;
    this.renderer.render(this.scene, this.camera);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(this.renderer.domElement, 0, 0, canvas.width, canvas.height);
  }
}

/* Cena da chapa (seção Sobre) */
export class GrillScene {
  constructor(canvas, sound) {
    this.canvas = canvas; this.sound = sound; this.visible = false; this.reduced = false;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; this.scene.environmentIntensity = 0.4;
    this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
    this.camera.position.set(0, 7.5, 9); this.camera.lookAt(0, 0, 0);
    this.scene.add(new THREE.HemisphereLight('#FFD2A0', '#2A0E04', 0.6));
    const key = new THREE.DirectionalLight('#FFE3C0', 2.2); key.position.set(3, 8, 4); this.scene.add(key);
    this.coalLight = new THREE.PointLight('#FF5A00', 14, 10, 1.6); this.coalLight.position.set(0, -0.6, 0); this.scene.add(this.coalLight);

    // brasas (shader animado)
    this.coalU = { uTime: { value: 0 } };
    const coal = new THREE.Mesh(new THREE.PlaneGeometry(9, 5), new THREE.ShaderMaterial({
      uniforms: this.coalU, transparent: true,
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: `uniform float uTime; varying vec2 vUv;
        float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
        void main(){ vec2 p=vUv*vec2(9.,5.)*1.4; float c=n(p+uTime*.15)*.6+n(p*2.3-uTime*.2)*.4; float cells=smoothstep(.35,.75,c);
          vec3 col=mix(vec3(.08,.02,.0), vec3(1.,.32,.02), cells); col+=vec3(1.,.75,.3)*pow(cells,4.)*.9;
          float e=smoothstep(0.,.18,vUv.x)*smoothstep(1.,.82,vUv.x)*smoothstep(0.,.2,vUv.y)*smoothstep(1.,.8,vUv.y);
          gl_FragColor=vec4(col*1.6,e); }`,
    }));
    coal.rotation.x = -Math.PI / 2; coal.position.y = -0.9; this.scene.add(coal);

    // grelha (instanced)
    const bars = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.05, 0.05, 8, 10), new THREE.MeshStandardMaterial({ color: '#2a2522', metalness: 0.85, roughness: 0.35 }), 17);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
    for (let i = 0; i < 17; i++) { m.compose(new THREE.Vector3(0, 0, -2.4 + i * 0.3), q, new THREE.Vector3(1, 1, 1)); bars.setMatrixAt(i, m); }
    this.scene.add(bars);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.3, 5.4), new THREE.MeshStandardMaterial({ color: '#1b1614', metalness: 0.7, roughness: 0.5 }));
    frame.position.y = -1.2; frame.scale.set(1, 1, 1); this.scene.add(frame);

    // hambúrgueres na chapa (clique vira)
    this.patties = [];
    [[-2.3, -0.5], [0, 0.6], [2.3, -0.4]].forEach(([x, z], i) => {
      const p = makeLayer('patty', 'low'); p.scale.setScalar(0.62); p.position.set(x, 0.05, z); p.rotation.y = i;
      this.scene.add(p); if (i !== 1) this.patties.push(p);
    });
    const ch = makeLayer('cheese', 'low', 1); ch.scale.setScalar(0.62); ch.position.set(0, 0.36, 0.6); this.scene.add(ch); this.cheese = ch;
    [[-1.2, 1.9], [1.4, 1.9]].forEach(([x, z]) => { const b = makeLayer('bunTop', 'low'); b.scale.setScalar(0.5); b.position.set(x, 0.05, z); this.scene.add(b); });

    // faíscas
    const n = 60; this.sparks = Array.from({ length: n }, () => ({ x: 0, y: 0, z: 0, v: 0, l: Math.random() }));
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    this.sparkPts = new THREE.Points(g, new THREE.PointsMaterial({ color: '#FFB347', size: 0.07, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.scene.add(this.sparkPts);

    this.mouse = new THREE.Vector2(); this.ray = new THREE.Raycaster(); this.clock = new THREE.Clock();
    canvas.addEventListener('pointermove', (e) => { const r = canvas.getBoundingClientRect(); this.mouse.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); });
    canvas.addEventListener('click', (e) => this.click(e));
    this.resize(); addEventListener('resize', () => this.resize());
  }
  click(e) {
    const r = this.canvas.getBoundingClientRect();
    const v = new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    this.ray.setFromCamera(v, this.camera);
    for (const p of this.patties) {
      if (this.ray.intersectObject(p, true).length) { this.flip(p); return; }
    }
  }
  flip(p) {
    if (p.userData.flipping) return; p.userData.flipping = true;
    this.sound?.sizzle(0.9);
    const tl = gsap.timeline({ onComplete: () => (p.userData.flipping = false) });
    tl.to(p.position, { y: 1.6, duration: 0.35, ease: 'power2.out' })
      .to(p.rotation, { x: p.rotation.x + Math.PI, duration: 0.5, ease: 'power1.inOut' }, 0)
      .to(p.position, { y: 0.05, duration: 0.35, ease: 'bounce.out' }, 0.35);
    this.sparks.slice(0, 25).forEach((s) => { s.l = 0; s.x = p.position.x + (Math.random() - 0.5); s.z = p.position.z + (Math.random() - 0.5); s.v = 1.5 + Math.random() * 2; });
  }
  resize() {
    const r = this.canvas.getBoundingClientRect();
    if (!r.width) return;
    this.renderer.setSize(r.width, r.height, false);
    this.camera.aspect = r.width / r.height; this.camera.updateProjectionMatrix();
  }
  frame() {
    if (!this.visible) { this.clock.getDelta(); return; }
    const dt = Math.min(this.clock.getDelta(), 0.05), t = this.clock.elapsedTime, R = this.reduced;
    this.coalU.uTime.value = R ? 0 : t;
    this.coalLight.intensity = 13 + (R ? 0 : Math.sin(t * 9) * 4 + Math.sin(t * 17) * 3);
    this.camera.position.x += ((R ? 0 : this.mouse.x * 1.5) - this.camera.position.x) * 0.05;
    this.camera.position.y += ((R ? 7.5 : 7.5 + this.mouse.y * 0.8) - this.camera.position.y) * 0.05;
    this.camera.lookAt(0, 0, 0.3);
    const pos = this.sparkPts.geometry.attributes.position;
    this.sparks.forEach((s, i) => {
      s.l += dt * 0.5;
      if (s.l > 1) { s.l = 0; s.x = (Math.random() - 0.5) * 7; s.z = (Math.random() - 0.5) * 4; s.v = 0.6 + Math.random() * 1.6; }
      pos.setXYZ(i, s.x + Math.sin(t * 3 + i) * 0.1, -0.6 + s.l * s.v * 2.5, s.z);
    });
    pos.needsUpdate = true; this.sparkPts.visible = !R;
    this.renderer.render(this.scene, this.camera);
  }
}
