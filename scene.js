import * as THREE from "three";

export function setupScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x020205);

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(15, 12, 15);

  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#bg"),
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // --- DIE SÄULEN ---
  const gridCount = 20;
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.1,
    metalness: 0.9,
  });

  const mesh = new THREE.InstancedMesh(
    geometry,
    material,
    gridCount * gridCount,
  );
  const colorArray = new Float32Array(gridCount * gridCount * 3);
  mesh.instanceColor = new THREE.InstancedBufferAttribute(colorArray, 3);
  scene.add(mesh);

  // --- DER REFLEKTIERENDE BODEN ---
  const floorGeo = new THREE.PlaneGeometry(100, 100);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x050505,
    roughness: 0.1,
    metalness: 0.8,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2; // Flach hinlegen
  floor.position.y = -0.1; // Ganz leicht unter den Säulen
  scene.add(floor);

  // --- PARTIKEL ---
  const particlesCount = 5000;
  const posArray = new Float32Array(particlesCount * 3);
  for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 100;
  }
  const partGeo = new THREE.BufferGeometry();
  partGeo.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
  const particlesMesh = new THREE.Points(
    partGeo,
    new THREE.PointsMaterial({ size: 0.05, color: 0xffffff }),
  );
  scene.add(particlesMesh);

  // --- LICHT SETUP (Sehr hell) ---
  const mainLight = new THREE.DirectionalLight(0xffffff, 4);
  mainLight.position.set(10, 20, 10);
  scene.add(mainLight);

  const sideLight = new THREE.PointLight(0x00ff88, 100, 50);
  sideLight.position.set(-15, 10, -15);
  scene.add(sideLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  return { scene, camera, renderer, mesh, particlesMesh, gridCount, material };
}
