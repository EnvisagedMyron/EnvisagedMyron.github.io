import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

// --- "Headlamp" Lighting ---
// This light stays with the camera, so it always shines on what you see.
const headlamp = new THREE.PointLight(0xffffff, 5);
camera.add(headlamp); 
scene.add(camera); 

// Subtle fill light so the edges aren't too harsh
const fillLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.5);
scene.add(fillLight);

let model;
const loader = new GLTFLoader();
const modelUrl = 'https://raw.githubusercontent.com/EnvisagedMyron/EnvisagedMyron.github.io/381a69f58bb395a082d79d4fb746717ae6b64307/anatomy-compressed.glb';

loader.load(modelUrl, (gltf) => {
    model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center); 
    scene.add(model);
});

// --- Custom Interaction Logic ---
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

window.addEventListener('mousedown', () => isDragging = true);
window.addEventListener('mouseup', () => isDragging = false);

window.addEventListener('mousemove', (e) => {
    if (!isDragging || !model) return;

    const deltaMove = {
        x: e.offsetX - previousMousePosition.x,
        y: e.offsetY - previousMousePosition.y
    };

    if (e.shiftKey) {
        // Shift + Drag: Move the model (Panning)
        model.position.x += deltaMove.x * 0.005;
        model.position.y -= deltaMove.y * 0.005;
    } else {
        // Left Click + Drag: Rotate the model
        model.rotation.y += deltaMove.x * 0.01;
        model.rotation.x += deltaMove.y * 0.01;
    }

    previousMousePosition = { x: e.offsetX, y: e.offsetY };
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
