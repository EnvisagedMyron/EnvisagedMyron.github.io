import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

// --- Headlamp Lighting ---
const headlamp = new THREE.PointLight(0xffffff, 20);
camera.add(headlamp);
scene.add(camera);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// We use a Group to act as a pivot point
const modelGroup = new THREE.Group();
scene.add(modelGroup);

const loader = new GLTFLoader();
const modelUrl = 'https://raw.githubusercontent.com/EnvisagedMyron/EnvisagedMyron.github.io/381a69f58bb395a082d79d4fb746717ae6b64307/anatomy-compressed.glb';

loader.load(modelUrl, (gltf) => {
    const loadedModel = gltf.scene;
    
    // 1. Center the model's geometry inside the group
    const box = new THREE.Box3().setFromObject(loadedModel);
    const center = box.getCenter(new THREE.Vector3());
    loadedModel.position.sub(center); 
    
    modelGroup.add(loadedModel);
});

// --- Interaction Logic ---
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

// Crucial: Update the "previous" position the moment the mouse hits the desk
window.addEventListener('mousedown', (e) => {
    isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mouseup', () => isDragging = false);

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    // Calculate how far the mouse moved since the last frame
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    if (e.shiftKey) {
        // Panning (Movement)
        modelGroup.position.x += deltaX * 0.005;
        modelGroup.position.y -= deltaY * 0.005;
    } else {
        // Rotation: Rotate the group, not the raw model
        modelGroup.rotation.y += deltaX * 0.01;
        
        // Clamp X rotation to 90 degrees up/down to prevent flipping
        const nextRotationX = modelGroup.rotation.x + deltaY * 0.01;
        if (nextRotationX > -Math.PI / 2 && nextRotationX < Math.PI / 2) {
            modelGroup.rotation.x = nextRotationX;
        }
    }

    // Update the position for the next frame calculation
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

// Zoom using the Group's Z position
window.addEventListener('wheel', (e) => {
    modelGroup.position.z -= e.deltaY * 0.002;
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
