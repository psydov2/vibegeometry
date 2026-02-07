import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// 1. SETUP
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg"),
  antialias: true,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// 2. OBJEKT (Ein Platzhalter-Würfel für den Anfang)
const geometry = new THREE.BoxGeometry(10, 10, 10);
const material = new THREE.MeshStandardMaterial({
  color: 0x00ff88,
  wireframe: true,
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// 3. LICHT
const pointLight = new THREE.PointLight(0xffffffff);
pointLight.position.set(5, 5, 5);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(pointLight, ambientLight);

// 4. ANIMATION LOOP
function animate() {
  requestAnimationFrame(animate);

  // Einfache Rotation zum Testen
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.005;

  renderer.render(scene, camera);
}

// Fenstergröße anpassen
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
