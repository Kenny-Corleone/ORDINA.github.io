<!-- README.md -->
# <div align="center"><img src="assets/logo ORDINA.png" width="160" alt="ORDINA Logo" /></div>

<p align="center">
  <img src="https://img.shields.io/badge/status-active-success.svg" /> 
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" />
  <img src="https://img.shields.io/badge/version-3.0.0-blueviolet.svg" />
</p>

<p align="center">
  <img src="assets/readme-hero-typing.svg" alt="ORDINA — Your life. Simplified." />
</p>

---

<!-- Hero GIF (replace with generated GIF) -->
<p align="center">
  <img src="assets/ordina-3d-mockup.gif" alt="ORDINA 3D Mockup — Parallax + Vision Pro style" width="820" />
</p>

---

## ORDINA 3.0 — Pocket Life Assistant (Apple Vision Pro Edition)

*Designed with depth. Built with intention. Polished like a product page.*

---

<!-- Animated SVG divider -->
<div align="center">
  <!-- Inline animated svg (see /assets/divider.svg) -->
  <img src="assets/divider-animated.svg" alt="divider" />
</div>

## What you get
- Luxurious Apple-like landing README with **parallax sections**.
- **3D Three.js mockup** rendered into GIF — perfect for README hero.
- Transparent glass layers, soft shadows, subtle animations — Vision Pro aesthetic.
- Full instructions to **generate** the GIF locally and embed it.

---

## How the repo is organized
/assets
├─ logo ORDINA.png
├─ ordina-3d-mockup.gif # generated (replace)
├─ divider-animated.svg
└─ readme-hero-typing.svg
/src
├─ threejs-mockup.html
├─ parallax-demo.html
└─ styles/
└─ vision-pro.css
README.md

yaml
Копировать код

---

## Quick preview (copy/paste to run locally)
Open `/src/parallax-demo.html` for the parallax landing demo.  
Open `/src/threejs-mockup.html` to preview the 3D mockup and record GIF.

---

## Design notes — Apple Vision Pro feel
- Base palette — off-white / soft grey, subtle gradient accents.
- Heavy use of translucency: `backdrop-filter: blur(18px);` + `background: rgba(255,255,255,0.06)`.
- Soft depth via layered shadows and z-offsets.
- Animations: micro interactions only (no flashy loops).
- 3D mockup: floating device card with bloom, soft lighting, subtle rotation.

---

## Generate the 3D mockup GIF — step-by-step

### Requirements
- Node.js (for simple static server) or Python `http.server`.
- `ffmpeg` installed (to convert mp4 → gif).
- Browser (Chrome/Edge) with WebGL.
- (Optional) `npx http-server` or `serve`.

### Files you need
- `/src/threejs-mockup.html` (code provided below).
- CDN access for Three.js and CCapture (included in file).

### Steps
1. Run a local server in the repo root:
   - Node: `npx http-server . -p 8080`
   - Python: `python -m http.server 8080`
2. Open `http://localhost:8080/src/threejs-mockup.html` in Chrome.
3. Click **Start Capture** (UI in page). The page records the canvas to an mp4 file via CCapture.
4. After recording, click **Stop & Save**. Download `capture.webm` or `capture.mp4`.
5. Convert to optimized GIF:
   ```bash
   ffmpeg -i capture.mp4 -vf "fps=30,scale=960:-1:flags=lanczos" -loop 0 -ss 0 -t 8 ordina-3d-mockup.gif
Move ordina-3d-mockup.gif to /assets/ and update README image path.

threejs-mockup.html — full page (self-contained)
Save as src/threejs-mockup.html.

html
Копировать код
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>ORDINA — 3D Mockup</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    :root{
      --bg:#f6f7f8;
      --glass: rgba(255,255,255,0.06);
      --accent: #5F7FFF;
      --shadow: rgba(15,20,30,0.12);
    }
    html,body{height:100%;margin:0;background:linear-gradient(180deg,#fbfbfc, #f2f4f7);}
    .wrap{display:flex;align-items:center;justify-content:center;height:100vh;gap:32px;flex-direction:column;}
    .card{
      width:880px; max-width:90vw;
      padding:28px;
      border-radius:26px;
      backdrop-filter: blur(14px) saturate(120%);
      background: linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.35));
      box-shadow: 0 40px 80px var(--shadow), inset 0 1px 0 rgba(255,255,255,0.6);
      display:grid; grid-template-columns: 1fr 420px; gap:24px; align-items:center;
    }
    .left{padding:8px;}
    h1{font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto; margin:0; font-weight:600; color:#111; letter-spacing:-0.2px;}
    p.lead{color:#444; margin-top:8px; font-size:15px;}
    .controls{display:flex; gap:10px; margin-top:16px;}
    button{padding:10px 14px;border-radius:12px;border:0;cursor:pointer;font-weight:600;background:var(--accent);color:white;box-shadow:0 6px 22px rgba(95,127,255,0.18);}
    canvas{width:100%;height:100%;display:block;border-radius:18px; background:transparent;}
    .mockup{display:flex;align-items:center;justify-content:center;}
    .hint{font-size:13px;color:#666;margin-top:6px;}
    .smallbtn{background:transparent;color:var(--accent);border:1px solid rgba(95,127,255,0.12);padding:8px 10px;border-radius:10px;}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card" role="main" aria-label="ORDINA 3D Mockup">
      <div class="left">
        <h1>ORDINA — Apple Vision Pro Mockup</h1>
        <p class="lead">A floating, glassy device mockup with soft lighting and interactive parallax. Use this to create a hero GIF for README.</p>
        <div class="controls">
          <button id="start">Start Capture</button>
          <button id="stop" class="smallbtn">Stop & Save</button>
        </div>
        <div class="hint">Use Chrome for best capture results. Click Start → Move mouse slightly → Stop → Convert to GIF.</div>
      </div>

      <div class="mockup" style="width:420px; height:320px;">
        <!-- Canvas for Three.js -->
        <canvas id="glcanvas"></canvas>
      </div>
    </div>
  </div>

  <!-- Three.js + CCapture via CDN -->
  <script type="module">
    import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js';
    import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/controls/OrbitControls.js';
    // Postprocessing imports optional; we keep scene lightweight for recording.

    // CCapture
    // we load CCapture via a simple script tag fallback
  </script>

  <script src="https://cdn.jsdelivr.net/npm/ccapture.js@1.1.0/build/CCapture.all.min.js"></script>
  <script type="module">
    import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.154.0/build/three.module.js';
    import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.154.0/examples/jsm/controls/OrbitControls.js';

    const canvas = document.getElementById('glcanvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(420, 320, false);
    renderer.outputEncoding = THREE.sRGBEncoding;

    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(40, 420/320, 0.1, 2000);
    camera.position.set(0, 0.6, 2.6);

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x222222, 0.6);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 1.1);
    dir.position.set(2,3,1);
    scene.add(dir);

    // Floor (soft)
    const floorGeo = new THREE.PlaneGeometry(8,8);
    const floorMat = new THREE.MeshStandardMaterial({ color:0xffffff, metalness:0.05, roughness:0.6 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI/2;
    floor.position.y = -1.1;
    scene.add(floor);

    // Glassy card (the floating device)
    const cardGeo = new THREE.BoxGeometry(1.9, 1.2, 0.08);
    const cardMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.75,
      thickness: 0.2,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      reflectivity: 0.6
    });
    const card = new THREE.Mesh(cardGeo, cardMat);
    card.position.set(0,0,0);
    card.scale.set(0.9,0.9,0.9);
    scene.add(card);

    // Inner screen texture (simple gradient shader using canvas texture)
    const screenCanvas = document.createElement('canvas');
    screenCanvas.width = 1024; screenCanvas.height = 768;
    const ctx = screenCanvas.getContext('2d');
    const grad = ctx.createLinearGradient(0,0,screenCanvas.width,screenCanvas.height);
    grad.addColorStop(0,'#f6f8ff'); grad.addColorStop(1,'#eef2ff');
    ctx.fillStyle = grad; ctx.fillRect(0,0,screenCanvas.width,screenCanvas.height);
    ctx.fillStyle = '#5F7FFF';
    ctx.font = '80px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ORDINA', screenCanvas.width/2, screenCanvas.height/2);
    const screenTex = new THREE.CanvasTexture(screenCanvas);
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
    const screenPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.6,0.9), screenMat);
    screenPlane.position.set(0,0,0.045);
    scene.add(screenPlane);

    // subtle floating animation
    let t = 0;

    // Controls (for demo only, but disable rotate for recording smoothness)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.6;

    // Handle resize
    window.addEventListener('resize', () => {
      const w = renderer.domElement.clientWidth;
      const h = renderer.domElement.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    });

    // CCapture recorder
    let capturer;
    document.getElementById('start').addEventListener('click', () => {
      capturer = new CCapture({
        format: 'webm',
        framerate: 60,
        verbose: true,
        workersPath: 'https://cdn.jsdelivr.net/npm/ccapture.js@1.1.0/build/'
      });
      capturer.start();
      recording = true;
    });

    document.getElementById('stop').addEventListener('click', async () => {
      if (capturer) {
        capturer.stop();
        capturer.save();
        recording = false;
      }
    });

    let recording = false;
    function animate(){
      t += 0.01;
      card.rotation.y = Math.sin(t*0.6)*0.08;
      card.position.y = Math.sin(t*0.8)*0.04;
      controls.update();
      renderer.render(scene, camera);
      if (capturer && recording) capturer.capture(renderer.domElement);
      requestAnimationFrame(animate);
    }
    animate();
  </script>
</body>
</html>
Примечание: preserveDrawingBuffer: true и renderer.outputEncoding помогают сохранить качество при захвате. CCapture сохраняет в webm (или mp4) — затем ffmpeg → gif.

parallax-demo.html — параллакс секции для лендинга (вставлять в docs или demo)
Save as src/parallax-demo.html.

html
Копировать код
<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>ORDINA — Parallax Demo</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="stylesheet" href="styles/vision-pro.css" />
<style>
  body{font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto; margin:0; background:linear-gradient(180deg,#fbfbfd,#f4f6f8);}
  .section{min-height:80vh; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden;}
  .hero{display:flex; flex-direction:column; align-items:center; gap:12px; text-align:center;}
  h1{font-size:48px;margin:0; color:#0b0b0b}
  p{color:#505050;max-width:720px}
  .parallax-layer{position:absolute; left:0; top:0; width:100%; height:100%; pointer-events:none; transform-origin:center;}
  .floating-card{
    width:760px; max-width:90%;
    border-radius:22px;
    padding:22px;
    background:linear-gradient(180deg, rgba(255,255,255,0.65), rgba(255,255,255,0.4));
    backdrop-filter: blur(12px) saturate(120%);
    box-shadow: 0 20px 60px rgba(12,18,30,0.08);
    transform: translateZ(0);
  }
</style>
</head>
<body>
  <section class="section" id="s1">
    <div class="parallax-layer" data-speed="0.02" style="z-index:1;">
      <!-- softly animated background blob -->
      <svg width="100%" height="100%" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0" stop-color="#f3f6ff"/>
            <stop offset="1" stop-color="#eef2ff"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="1200" height="700" fill="url(#g1)"/>
      </svg>
    </div>

    <div class="parallax-layer" data-speed="0.1" style="z-index:2; opacity:0.95;">
      <div class="floating-card" style="margin:0 auto;">
        <h2 style="margin:0">ORDINA — Your pocket HQ</h2>
        <p>Polished UI, Glass layers, and depth-driven interactions crafted in the Apple Vision Pro spirit.</p>
      </div>
    </div>

    <div class="parallax-layer" data-speed="0.25" style="z-index:3;">
      <!-- 3D mockup placeholder (link to generated gif) -->
      <img src="../assets/ordina-3d-mockup.gif" alt="ORDINA mockup" style="width:420px; border-radius:18px; display:block; margin:40px auto;">
    </div>
  </section>

<script>
  // Simple parallax: move layers based on scroll and mouse
  const layers = document.querySelectorAll('.parallax-layer');
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e)=> {
    mouseX = (e.clientX - window.innerWidth/2);
    mouseY = (e.clientY - window.innerHeight/2);
    layers.forEach(layer => {
      const speed = parseFloat(layer.dataset.speed || 0.05);
      const x = -(mouseX * speed / 30);
      const y = -(mouseY * speed / 30);
      layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  });

  window.addEventListener('scroll', ()=>{
    const st = window.scrollY;
    layers.forEach(layer=>{
      const speed = parseFloat(layer.dataset.speed || 0.05);
      const y = -(st * speed * 0.25);
      layer.style.transform = `translate3d(0, ${y}px, 0)`;
    });
  });
</script>
</body>
</html>
vision-pro.css — стеклянные слои и перспективы
Save as src/styles/vision-pro.css.

css
Копировать код
/* vision-pro.css */
:root{
  --glass-bg: rgba(255,255,255,0.35);
  --glass-strong: rgba(255,255,255,0.6);
  --accent: #5F7FFF;
  --muted: #6b7280;
}

.glass {
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.30));
  backdrop-filter: blur(16px) saturate(120%);
  box-shadow: 0 30px 60px rgba(18,24,40,0.06), inset 0 1px 0 rgba(255,255,255,0.6);
}

.glow {
  box-shadow: 0 10px 30px rgba(95,127,255,0.12);
}

.depth {
  transform-style: preserve-3d;
  perspective: 1400px;
}
Animated SVG divider (save as assets/divider-animated.svg)
svg
Копировать код

Tips & Best Practices
Keep GIF length short: 5–8 seconds, 30 fps. Use fps=30 and scale=960:-1 for README hero.

Optimize GIF with gifsicle or ffmpeg palette method for smaller size.

Use large static PNGs for desktop screenshots, GIF only for hero animation.

Add alt text to GIF for accessibility.

Example ffmpeg optimize pipeline
bash
Копировать код
# create palette
ffmpeg -i capture.mp4 -vf fps=30,scale=960:-1:flags=lanczos,palettegen palette.png
# produce gif using palette
ffmpeg -i capture.mp4 -i palette.png -filter_complex "fps=30,scale=960:-1:flags=lanczos[x];[x][1:v]paletteuse" -loop 0 ordina-3d-mockup.gif
Want me to do it for you?
Я могу:

Сгенерировать готовый GIF прямо из твоих мокапов (дай доступ к изображению/цветовой палитре) — но помни: я не могу запускать процессы на твоей машине. Я могу сгенерировать конфигурацию и код, и дать точную команду для локального выполнения.

Создать тонко настроенную визуализацию Three.js (HDR light, bloom, DOF) и уменьшить цену GIF в размере.

License
MIT — use freely.

<p align="center">Made with meticulous detail • ORDINA • <a href="https://github.com/Kenny-Corleone">Kenny Corleone</a></p> `
