import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0); // Transparent canvas to show background
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- Restored Lighting ---
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); 
scene.add(ambientLight);

const frontLight = new THREE.DirectionalLight(0xffffff, 1.0);
frontLight.position.set(0, 5, 10); 
scene.add(frontLight);

const modelGroup = new THREE.Group();
scene.add(modelGroup);

// --- Load Model ---
const loader = new GLTFLoader();
const modelUrl = 'https://raw.githubusercontent.com/EnvisagedMyron/EnvisagedMyron.github.io/381a69f58bb395a082d79d4fb746717ae6b64307/anatomy-compressed.glb';

loader.load(modelUrl, (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center); 
    modelGroup.add(model);
}, undefined, (error) => {
    console.error('Error loading model:', error);
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
        // Pan
        modelGroup.position.x += deltaX * 0.005;
        modelGroup.position.y -= deltaY * 0.005;
    } else {
        // Rotate
        modelGroup.rotation.y += deltaX * 0.01;
        modelGroup.rotation.x += deltaY * 0.01;
    }

    previousMousePosition = { x: e.clientX, y: e.clientY };
});

// --- RESTORED ZOOM ---
window.addEventListener('wheel', (e) => {
    // Zoom the model group
    modelGroup.position.z -= e.deltaY * 0.002;
    // Prevent the whole page from scrolling
    e.preventDefault(); 
}, { passive: false });

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
