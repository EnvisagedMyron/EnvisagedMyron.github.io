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

// --- The Final Lighting System ---

// 1. Ambient Light (Your Request): Softly fills every corner of the model
// Setting this to a lower intensity (0.4) keeps it from looking "flat"
const generalAmbient = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(generalAmbient);

// 2. Hemisphere Light: Natural sky-to-ground gradient
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222222, 1.0);
scene.add(hemiLight);

// 3. Sun/Sky Light: Powerful parallel light from above
const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(0, 10, 0); 
scene.add(sunLight);

// 4. Fill Light: Stays in front to ensure the details facing the camera are clear
const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
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
        // Panning (Move model)
        modelGroup.position.x += deltaX * 0.005;
        modelGroup.position.y -= deltaY * 0.005;
    } else {
        // Rotation (Rotate model)
        modelGroup.rotation.y += deltaX * 0.01;
        const nextRotationX = modelGroup.rotation.x + deltaY * 0.01;
        // Keep from flipping upside down
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
    
    // Keep the "Sun" over the model as you pan
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
