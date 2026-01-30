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

// --- Lighting ---
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 1.0));
const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(0, 10, 0); 
scene.add(sunLight);
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

// --- Configurable Sensitivities ---
const PANSPEED = 0.002;
const ROTSPEED = 0.008;
const ZOOMSPEED = 0.001;

// --- Interaction Logic ---
let isDragging = false;
let activeSlider = null; // Track if we are dragging a UI slider
let previousMousePosition = { x: 0, y: 0 };

const imgActive = "https://raw.githubusercontent.com/EnvisagedMyron/EnvisagedMyron.github.io/main/assets/scroll_tab/scroll_bar_active.png";
const imgInactive = "https://raw.githubusercontent.com/EnvisagedMyron/EnvisagedMyron.github.io/main/assets/scroll_tab/scroll_bar.png";

// Setup UI Sliders
document.querySelectorAll('.scroll-bar').forEach(bar => {
    bar.addEventListener('mousedown', (e) => {
        activeSlider = bar;
        bar.src = imgActive;
        e.stopPropagation();
    });
});

window.addEventListener('mousedown', (e) => {
    if (!activeSlider) isDragging = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    if (activeSlider) {
        activeSlider.src = imgInactive;
        activeSlider = null;
    }
});

window.addEventListener('mousemove', (e) => {
    // 1. Handle UI Slider Dragging
    if (activeSlider) {
        let newX = e.clientX;
        if (newX < 24) newX = 24;
        if (newX > 140) newX = 140;
        activeSlider.style.left = newX + 'px';

        // Opacity Logic: X=140 is 1.0, X=24 is 0.2
        const logoId = activeSlider.getAttribute('data-logo');
        const percentage = (newX - 24) / (140 - 24);
        document.getElementById(logoId).style.opacity = 0.2 + (percentage * 0.8);
        return; // Don't rotate model if sliding UI
    }

    // 2. Handle 3D Model Rotation/Panning
    if (!isDragging) return;
    const deltaX = e.clientX - previousMousePosition.x;
    const deltaY = e.clientY - previousMousePosition.y;

    if (e.shiftKey) {
        modelGroup.position.x += deltaX * PANSPEED;
        modelGroup.position.y -= deltaY * PANSPEED;
    } else {
        modelGroup.rotation.y += deltaX * ROTSPEED;
        const nextRotationX = modelGroup.rotation.x + deltaY * ROTSPEED;
        if (nextRotationX > -Math.PI / 2 && nextRotationX < Math.PI / 2) {
            modelGroup.rotation.x = nextRotationX;
        }
    }
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

window.addEventListener('wheel', (e) => {
    modelGroup.position.z -= e.deltaY * ZOOMSPEED;
}, { passive: true });

function animate() {
    requestAnimationFrame(animate);
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
