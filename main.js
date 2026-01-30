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

// 1. Create the Top Light (Outside the model group)
const topLight = new THREE.SpotLight(0xffffff, 20);
topLight.angle = Math.PI / 4;
topLight.penumbra = 0.5;
scene.add(topLight);

// 2. Create a Fill Light (So the bottom isn't pitch black)
const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
scene.add(fillLight);

const modelGroup = new THREE.Group();
scene.add(modelGroup);

let model;
let modelHeight = 0;
const loader = new GLTFLoader();
const modelUrl = 'https://raw.githubusercontent.com/EnvisagedMyron/EnvisagedMyron.github.io/381a69f58bb395a082d79d4fb746717ae6b64307/anatomy-compressed.glb';

loader.load(modelUrl, (gltf) => {
    model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    modelHeight = size.y;
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

// --- The Animation Loop (Light Follower) ---
function animate() {
    requestAnimationFrame(animate);

    if (model) {
        // Position the light exactly above the modelGroup's current position
        topLight.position.set(
            modelGroup.position.x, 
            modelGroup.position.y + (modelHeight / 2) + 1, 
            modelGroup.position.z
        );
        
        // Make the light shine directly at the center of the model
        topLight.target = modelGroup;

        // Make the fill light follow the camera's view but stay with the model
        fillLight.position.set(
            modelGroup.position.x,
            modelGroup.position.y,
            modelGroup.position.z + 2
        );
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
