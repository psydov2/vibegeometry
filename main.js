import * as THREE from "three";
import { setupScene } from "./scene.js";
import { setupAudio } from "./audio.js";

const { scene, camera, renderer, mesh, particlesMesh, gridCount, material } =
  setupScene();
const { sound, analyser, handleUpload } = setupAudio(camera);
const dummy = new THREE.Object3D();
const color = new THREE.Color();

lucide.createIcons();

// UI Elements
const uiContainer = document.getElementById("ui");
const uiToggle = document.getElementById("ui-toggle");
const audioInput = document.getElementById("audio-input");
const playPauseBtn = document.getElementById("play-pause");
const volumeSlider = document.getElementById("volume-slider");
const volumeValue = document.querySelector(".volume-value");
const seekBar = document.getElementById("seek-bar");
const seekProgress = document.querySelector(".seek-progress");
const rewindBtn = document.getElementById("rewind");
const ffBtn = document.getElementById("fast-forward");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");
const trackNameEl = document.querySelector(".track-name");

// UI Toggle
uiToggle.addEventListener("click", () => {
  uiContainer.classList.toggle("hidden-ui");
  const icon = uiContainer.classList.contains("hidden-ui") ? "menu" : "x";
  uiToggle.innerHTML = `<i data-lucide="${icon}"></i>`;
  lucide.createIcons();
});

// Audio Upload
audioInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    trackNameEl.textContent = file.name.replace(/\.[^/.]+$/, "");
    handleUpload(file, () => {
      document.getElementById("upload-section").classList.add("hidden");
      document.getElementById("controls").classList.remove("hidden");

      // Set duration once loaded
      if (sound.buffer) {
        durationEl.textContent = formatTime(sound.buffer.duration);
      }
    });
  }
});

// Play/Pause
playPauseBtn.addEventListener("click", () => {
  if (sound.isPlaying) {
    sound.pause();
    playPauseBtn.innerHTML = `<i data-lucide="play"></i>`;
  } else {
    sound.play();
    playPauseBtn.innerHTML = `<i data-lucide="pause"></i>`;
  }
  lucide.createIcons();
});

// Volume Control
volumeSlider.addEventListener("input", (e) => {
  const volume = parseFloat(e.target.value);
  sound.setVolume(volume);
  volumeValue.textContent = Math.round(volume * 100) + "%";
});

// Seek Control
seekBar.addEventListener("input", (e) => {
  if (sound.buffer) {
    const seekTime = (e.target.value / 100) * sound.buffer.duration;
    if (sound.isPlaying) {
      sound.stop();
      sound.play();
      sound.offset = seekTime;
    }
  }
});

// Rewind (10 seconds)
rewindBtn.addEventListener("click", () => {
  if (sound.buffer && sound.isPlaying) {
    const currentTime = sound.context.currentTime - sound.startTime;
    const newTime = Math.max(0, currentTime - 10);
    sound.stop();
    sound.play();
    sound.offset = newTime;
  }
});

// Fast Forward (10 seconds)
ffBtn.addEventListener("click", () => {
  if (sound.buffer && sound.isPlaying) {
    const currentTime = sound.context.currentTime - sound.startTime;
    const newTime = Math.min(sound.buffer.duration, currentTime + 10);
    sound.stop();
    sound.play();
    sound.offset = newTime;
  }
});

// Format time helper
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// Animation Loop
function animate(time) {
  requestAnimationFrame(animate);
  const t = time * 0.001;

  // Camera Movement
  camera.position.x = Math.sin(t * 0.1) * 28;
  camera.position.z = Math.cos(t * 0.1) * 28;
  camera.lookAt(0, 2, 0);

  // Audio Visualization
  if (analyser && sound.isPlaying) {
    const data = analyser.getFrequencyData();
    let i = 0;
    for (let x = 0; x < gridCount; x++) {
      for (let z = 0; z < gridCount; z++) {
        const freqIndex = (x + z) % data.length;
        const val = data[freqIndex] / 255;
        const h = val * 16 + 0.2;

        dummy.position.set(x - gridCount / 2, h / 2, z - gridCount / 2);
        dummy.scale.set(0.7, h, 0.7);
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);

        // Color Gradient
        const hue = 0.6 - val * 0.5;
        color.setHSL(hue, 0.9, 0.5);
        mesh.setColorAt(i, color);

        i++;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;

    // Update Progress
    const currentTime = sound.context.currentTime - sound.startTime;
    const progress = currentTime / sound.buffer.duration;

    if (!isNaN(progress) && progress >= 0) {
      const progressPercent = (progress * 100) % 100;
      seekBar.value = progressPercent;
      seekProgress.style.width = progressPercent + "%";
      currentTimeEl.textContent = formatTime(currentTime);
    }
  }

  particlesMesh.rotation.y = t * 0.02;
  renderer.render(scene, camera);
}

// Window Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start Animation
animate();
