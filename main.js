import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- Scene Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; // Backed up slightly for better framing

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.getElementById('ui-container').appendChild(renderer.domElement);
// --- Lighting ---
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(5, 10, 7.5);
scene.add(sunLight);

// --- Model Setup ---
const modelPivot = new THREE.Group(); // This is what we rotate/move
scene.add(modelPivot);

const loader = new GLTFLoader();
const modelUrl = 'https://raw.githubusercontent.com/EnvisagedMyron/EnvisagedMyron.github.io/381a69f58bb395a082d79d4fb746717ae6b64307/anatomy-compressed.glb';

loader.load(modelUrl, (gltf) => {
    const model = gltf.scene;
    
    // Auto-center the geometry inside the pivot group
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center); 
    
    modelPivot.add(model);
});

// --- Constants & State ---
const SENSITIVITY = {
    rotate: 0.007,
    pan: 0.005,
    zoom: 0.002
};

let isDragging = false;
let prevMouse = { x: 0, y: 0 };

// --- Input Logic ---
window.addEventListener('mousedown', (e) => {
    isDragging = true;
    prevMouse = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mouseup', () => isDragging = false);

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - prevMouse.x;
    const deltaY = e.clientY - prevMouse.y;

    if (e.shiftKey) {
        // Shift + Drag: Pan (Move the pivot)
        modelPivot.position.x += deltaX * SENSITIVITY.pan;
        modelPivot.position.y -= deltaY * SENSITIVITY.pan;
    } else {
        // Left Click: Rotate (Rotate the pivot)
        modelPivot.rotation.y += deltaX * SENSITIVITY.rotate;
        
        // Vertical rotation with clamping to prevent flipping
        const newRotationX = modelPivot.rotation.x + deltaY * SENSITIVITY.rotate;
        modelPivot.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, newRotationX));
    }

    prevMouse = { x: e.clientX, y: e.clientY };
});

window.addEventListener('wheel', (e) => {
    // Scroll: Zoom (Move pivot on Z axis)
    modelPivot.position.z -= e.deltaY * SENSITIVITY.zoom;
}, { passive: true });

// --- Resize & Animation ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
