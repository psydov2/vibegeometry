import * as THREE from "three";

export function setupAudio(camera) {
  const listener = new THREE.AudioListener();
  camera.add(listener);

  const sound = new THREE.Audio(listener);
  const analyser = new THREE.AudioAnalyser(sound, 128);

  const handleUpload = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const audioContext = THREE.AudioContext.getContext();
      audioContext.resume().then(() => {
        audioContext.decodeAudioData(e.target.result, (buffer) => {
          sound.setBuffer(buffer);
          sound.setLoop(true);
          sound.play();
          if (callback) callback();
        });
      });
    };
    reader.readAsArrayBuffer(file);
  };

  return { sound, analyser, handleUpload };
}
