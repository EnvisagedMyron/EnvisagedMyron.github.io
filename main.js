import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- Scene Setup ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(5, 10, 7.5);
scene.add(sunLight);

const modelPivot = new THREE.Group();
scene.add(modelPivot);

const loader = new GLTFLoader();
const modelUrl = 'https://raw.githubusercontent.com/EnvisagedMyron/EnvisagedMyron.github.io/381a69f58bb395a082d79d4fb746717ae6b64307/anatomy-compressed.glb';

loader.load(modelUrl, (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center); 
    modelPivot.add(model);
});

// --- UI Interaction Logic ---
const setupDraggableBar = (barSelector, logoSelector) => {
    const bar = document.querySelector(barSelector);
    const logo = document.querySelector(logoSelector);
    if (!bar || !logo) return;

    let activeDrag = false;
    const startX = 137; // Original position from CSS
    const targetX = 24;  // Your requested end position
    const range = startX - targetX;

    bar.addEventListener('mousedown', (e) => {
        activeDrag = true;
        e.stopPropagation(); // Prevents rotating the 3D model while sliding
    });

    window.addEventListener('mousemove', (e) => {
        if (!activeDrag) return;

        const frame = document.querySelector('.frame');
        const rect = frame.getBoundingClientRect();
        let currentX = e.clientX - rect.left;

        // Constraint movement
        if (currentX < targetX) currentX = targetX;
        if (currentX > startX) currentX = startX;

        bar.style.left = `${currentX}px`;

        // Opacity Logic: 100% at 137, 20% at 24
        const ratio = (currentX - targetX) / range;
        const opacity = 0.2 + (ratio * 0.8);
        logo.style.opacity = opacity;
    });

    window.addEventListener('mouseup', () => activeDrag = false);
};

setupDraggableBar('.scroll-bar-bone', '.bone-logo');
setupDraggableBar('.scroll-bar-ligament', '.ligament-logo');
setupDraggableBar('.scroll-bar-muscle', '.muscle-logo');

// --- 3D Control Logic ---
const SENSITIVITY = { rotate: 0.007, pan: 0.005, zoom: 0.002 };
let isDragging3D = false;
let prevMouse = { x: 0, y: 0 };

window.addEventListener('mousedown', (e) => {
    // Only drag 3D if we aren't clicking a UI element
    if (e.target.tagName === 'CANVAS' || e.target === document.body) {
        isDragging3D = true;
        prevMouse = { x: e.clientX, y: e.clientY };
    }
});

window.addEventListener('mouseup', () => isDragging3D = false);

window.addEventListener('mousemove', (e) => {
    if (!isDragging3D) return;

    const deltaX = e.clientX - prevMouse.x;
    const deltaY = e.clientY - prevMouse.y;

    if (e.shiftKey) {
        modelPivot.position.x += deltaX * SENSITIVITY.pan;
        modelPivot.position.y -= deltaY * SENSITIVITY.pan;
    } else {
        modelPivot.rotation.y += deltaX * SENSITIVITY.rotate;
        const newRotX = modelPivot.rotation.x + deltaY * SENSITIVITY.rotate;
        modelPivot.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, newRotX));
    }
    prevMouse = { x: e.clientX, y: e.clientY };
});

window.addEventListener('wheel', (e) => {
    modelPivot.position.z -= e.deltaY * SENSITIVITY.zoom;
}, { passive: true });

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
