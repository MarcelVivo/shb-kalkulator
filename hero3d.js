import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

(() => {
  'use strict';

  const container = document.querySelector('#hero-canvas-wrap');
  const canvas = document.querySelector('#hero-canvas');
  const fallbackImg = document.querySelector('#hero-fallback-img');
  const heroSection = document.querySelector('.hero');
  if (!container || !canvas || !heroSection) return;

  let supportsWebGL = false;
  try {
    const test = document.createElement('canvas');
    supportsWebGL = !!(window.WebGLRenderingContext && (test.getContext('webgl') || test.getContext('experimental-webgl')));
  } catch (e) { supportsWebGL = false; }
  if (!supportsWebGL) return;

  // scroll-scrubbed image sequence — frames are pre-extracted from the
  // source clip so scrubbing is instant and reliable (native <video>
  // seeking is unreliable for this use case). The clip has a plain light
  // background rather than a green screen, and the cake's own cream
  // fondant is too close in colour to key it out safely — so instead of
  // chroma-keying, the frame is "cover"-fit to fill the frame and its
  // outer edge is softly feathered so it blends into the page.
  const FRAME_COUNT = 147;
  const IMAGE_ASPECT = 960 / 540;
  const framePath = i => `frames/frame-${String(i + 1).padStart(3, '0')}.webp`;

  const frameImages = new Array(FRAME_COUNT).fill(null);
  let highestLoaded = -1;

  function loadFrame(i) {
    if (frameImages[i]) return;
    const img = new Image();
    img.onload = () => {
      frameImages[i] = img;
      while (highestLoaded + 1 < FRAME_COUNT && frameImages[highestLoaded + 1]) highestLoaded++;
    };
    img.src = framePath(i);
  }
  for (let i = 0; i < FRAME_COUNT; i++) loadFrame(i);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0, 9);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const texture = new THREE.Texture();
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const material = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      planeAspect: { value: 1 },
      imageAspect: { value: IMAGE_ASPECT }
    },
    transparent: true,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D map;
      uniform float planeAspect;
      uniform float imageAspect;
      varying vec2 vUv;
      void main() {
        // object-fit: cover — crop the wider axis so the frame always
        // fills the plane without stretching
        vec2 uv = vUv;
        if (imageAspect > planeAspect) {
          float scale = planeAspect / imageAspect;
          uv.x = (uv.x - 0.5) * scale + 0.5;
        } else {
          float scale = imageAspect / planeAspect;
          uv.y = (uv.y - 0.5) * scale + 0.5;
        }
        vec4 color = texture2D(map, uv);
        gl_FragColor = vec4(color.rgb, 1.0);
      }
    `
  });

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  scene.add(plane);

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w === 0 || h === 0) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);

    // the plane fills the entire frustum edge-to-edge (cover strategy for
    // the image's own aspect happens in the fragment shader) so the frame
    // spans the full site width
    const dist = camera.position.z;
    const frustumHeight = 2 * dist * Math.tan((camera.fov * Math.PI / 180) / 2);
    const frustumWidth = frustumHeight * camera.aspect;
    plane.scale.set(frustumWidth, frustumHeight, 1);
    plane.position.x = 0;
    plane.position.y = 0;
    material.uniforms.planeAspect.value = camera.aspect;
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  function scrollProgress() {
    const rect = heroSection.getBoundingClientRect();
    const total = rect.height + window.innerHeight;
    const passed = window.innerHeight - rect.top;
    return Math.min(1, Math.max(0, passed / total));
  }

  let currentFrame = -1;
  let revealed = false;

  function setFrame(i) {
    if (i === currentFrame) return;
    const img = frameImages[i];
    if (!img) return;
    texture.image = img;
    texture.needsUpdate = true;
    currentFrame = i;
  }

  function tick() {
    const progress = scrollProgress();
    let target = Math.round(progress * (FRAME_COUNT - 1));
    // never jump ahead of what's actually loaded yet
    target = Math.min(target, Math.max(highestLoaded, 0));
    setFrame(target);
    if (currentFrame >= 0) {
      renderer.render(scene, camera);
      if (!revealed) {
        revealed = true;
        canvas.classList.add('is-ready');
        if (fallbackImg) fallbackImg.classList.add('is-hidden');
      }
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
