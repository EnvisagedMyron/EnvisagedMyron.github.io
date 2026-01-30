import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5; // Start a bit further back

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

// --- Headlamp Lighting ---
const headlamp = new THREE.PointLight(0xffffff, 50); // Increased intensity for distance
camera.add(headlamp); 
scene.add(camera); 

const fillLight = new THREE.AmbientLight(0xffffff, 0.3);
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

// --- Interaction State ---
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// 1. Mouse Down/Up
window.addEventListener('mousedown', () => isDragging = true);
window.addEventListener('mouseup', () => isDragging = false);

// 2. Rotation and Panning
window.addEventListener('mousemove', (e) => {
    if (!isDragging || !model) {
        previousMousePosition = { x: e.offsetX, y: e.offsetY };
        return;
    }

    const deltaMove = {
        x: e.offsetX - previousMousePosition.x,
        y: e.offsetY - previousMousePosition.y
    };

    if (e.shiftKey) {
        // Shift + Drag: Move the model (Panning)
        model.position.x += deltaMove.x * 0.005;
        model.position.y -= deltaMove.y * 0.005;
    } else {
        // Left Click + Drag: Rotate
        model.rotation.y += deltaMove.x * 0.01;
        
        // Clamp vertical rotation to prevent flipping upside down
        const newRotationX = model.rotation.x + deltaMove.y * 0.01;
        if (newRotationX > -Math.PI / 2 && newRotationX < Math.PI / 2) {
            model.rotation.x = newRotationX;
        }
    }

    previousMousePosition = { x: e.offsetX, y: e.offsetY };
});

// 3. Zoom (Scroll)
window.addEventListener('wheel', (e) => {
    if (!model) return;
    // Move model closer or further on Z axis
    // e.deltaY is positive when scrolling down, negative when up
    model.position.z -= e.deltaY * 0.005;
}, { passive: true });

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
