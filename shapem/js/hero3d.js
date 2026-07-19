/* ═══════════════════════════════════════════
   SHAPEM — Three.js Hero Scene
═══════════════════════════════════════════ */
(function() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  // Guard against zero dimensions (can happen before layout on live servers)
  var cw = canvas.clientWidth  || window.innerWidth;
  var ch = canvas.clientHeight || window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(cw, ch);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 14);

  // ── Lights ──────────────────────────────
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const goldLight = new THREE.PointLight(0xC9963A, 2.5, 30);
  goldLight.position.set(5, 5, 5);
  scene.add(goldLight);

  const tealLight = new THREE.PointLight(0x1D9E75, 1.5, 25);
  tealLight.position.set(-6, -3, 4);
  scene.add(tealLight);

  const fillLight = new THREE.DirectionalLight(0xffeedd, 0.8);
  fillLight.position.set(0, 10, 10);
  scene.add(fillLight);

  // ── Food Orbs (stylised food items as 3D shapes) ─────────────
  const foodItems = [
    // [geometry, color, x, y, z, scale, speed]
    { geo: new THREE.TorusGeometry(1, 0.38, 16, 60),      color: 0xC9963A, x: -4,   y:  1.5, z: -2, s: 0.9,  sp: 0.4  }, // donut
    { geo: new THREE.SphereGeometry(0.9, 32, 32),          color: 0xD85A30, x:  3.5, y:  2,   z: -1, s: 1.0,  sp: 0.3  }, // tomato
    { geo: new THREE.IcosahedronGeometry(0.8, 1),           color: 0x1D9E75, x:  5,   y: -1.5, z: -3, s: 0.8,  sp: 0.5  }, // herb
    { geo: new THREE.SphereGeometry(0.7, 32, 32),          color: 0xFFD700, x: -5.5, y: -2,   z: -1, s: 0.85, sp: 0.35 }, // lemon
    { geo: new THREE.TorusKnotGeometry(0.55, 0.18, 64, 8), color: 0x8B5A2B, x:  1.5, y:  3.5, z: -4, s: 0.75, sp: 0.25 }, // bread twist
    { geo: new THREE.OctahedronGeometry(0.7, 0),            color: 0xFF6B35, x: -2,   y: -3,   z: -2, s: 0.8,  sp: 0.45 }, // spice
    { geo: new THREE.CylinderGeometry(0.2, 0.5, 1.2, 8),   color: 0x4A7C59, x:  6.5, y:  0.5, z: -5, s: 0.7,  sp: 0.3  }, // herb stem
    { geo: new THREE.SphereGeometry(0.55, 32, 32),          color: 0xC41E3A, x: -6.5, y:  3,   z: -4, s: 0.65, sp: 0.55 }, // cherry
    { geo: new THREE.TorusGeometry(0.7, 0.25, 12, 40),      color: 0xF4C430, x:  0,   y: -4,   z: -3, s: 0.75, sp: 0.28 }, // ring
  ];

  const meshes = foodItems.map(item => {
    const mat  = new THREE.MeshStandardMaterial({
      color: item.color,
      roughness: 0.4,
      metalness: 0.2,
      emissive: item.color,
      emissiveIntensity: 0.06,
    });
    const mesh = new THREE.Mesh(item.geo, mat);
    mesh.position.set(item.x, item.y, item.z);
    mesh.scale.setScalar(item.s);
    mesh.userData = { speed: item.sp, originY: item.y, originX: item.x, phase: Math.random() * Math.PI * 2 };
    scene.add(mesh);
    return mesh;
  });

  // ── Particle dust ────────────────────────
  const particleCount = 180;
  const particleGeo   = new THREE.BufferGeometry();
  const positions      = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 24;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xC9963A,
    size: 0.06,
    transparent: true,
    opacity: 0.5,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ── Mouse parallax ───────────────────────
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Resize ───────────────────────────────
  function onResize() {
    const w = canvas.clientWidth  || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);

  // ── Animate ──────────────────────────────
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Float each mesh
    meshes.forEach((mesh, i) => {
      const d = mesh.userData;
      mesh.rotation.x += 0.003 * d.speed;
      mesh.rotation.y += 0.005 * d.speed;
      mesh.position.y  = d.originY + Math.sin(t * 0.6 + d.phase) * 0.35;
      mesh.position.x  = d.originX + Math.cos(t * 0.4 + d.phase) * 0.2;
    });

    // Slow particle drift
    particles.rotation.y = t * 0.018;
    particles.rotation.x = t * 0.009;

    // Camera parallax
    camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY * 0.8 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);

    // Pulsing lights
    goldLight.intensity = 2.2 + Math.sin(t * 1.2) * 0.4;
    tealLight.intensity = 1.4 + Math.cos(t * 0.9) * 0.3;

    renderer.render(scene, camera);
  }
  animate();
})();
