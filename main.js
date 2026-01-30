import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0; 
document.body.appendChild(renderer.domElement);

// --- The "Sky Light" System ---

// 1. Hemisphere Light: Provides the "Global" sky feel (Top: White, Bottom: Dark Gray)
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
scene.add(hemiLight);

// 2. Main Directional Light: Acts like the sun, hitting everything from above
const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(0, 10, 0); // Positioned high above
scene.add(sunLight);

// 3. Fill Light: Stays in front of the model so the "face" is never in shadow
const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
fillLight.position.set(0, 0, 5); 
scene.add(fillLight);

const modelGroup = new THREE.Group();
scene.add(modelGroup);

let model;
const loader = new GLTFLoader();
const modelUrl = 'https://raw.githubusercontent.com/EnvisagedMyron/EnvisagedMyron.github.io/381a69f58bb395a082d79d4fb746717ae6b64307/anatomy-compressed.glb';

loader.load(modelUrl, (gltf) => {
    model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center); 
    modelGroup.add(model);
});

// --- Interaction Logic ---
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

window.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
});
window.addEventListener('mouseup', () => isDragging = false);

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    if (e.shiftKey) {
        modelGroup.position.x += deltaX * 0.005;
        modelGroup.position.y -= deltaY * 0.005;
    } else {
        modelGroup.rotation.y += deltaX * 0.01;
        const nextRotationX = modelGroup.rotation.x + deltaY * 0.01;
        if (nextRotationX > -Math.PI / 2 && nextRotationX < Math.PI / 2) {
            modelGroup.rotation.x = nextRotationX;
        }
    }
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

window.addEventListener('wheel', (e) => {
    modelGroup.position.z -= e.deltaY * 0.002;
}, { passive: true });

function animate() {
    requestAnimationFrame(animate);
    
    // Make the lights "follow" the model's X/Z position so it's always under the "sky"
    // but keep them high up so the light rays stay parallel
    sunLight.position.x = modelGroup.position.x;
    sunLight.position.z = modelGroup.position.z;
    sunLight.target = modelGroup;

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
