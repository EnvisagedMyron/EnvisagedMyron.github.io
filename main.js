import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

// FIX: Ensure Alpha is true and clear color is 0 opacity
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0); 
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
document.body.appendChild(renderer.domElement);

// --- Lighting ---
scene.add(new THREE.AmbientLight(0xffffff, 0.4));
scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, 1.0));
const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(0, 10, 0); 
scene.add(sunLight);

const modelGroup = new THREE.Group();
scene.add(modelGroup);

const loader = new GLTFLoader();
const modelUrl = 'https://raw.githubusercontent.com/EnvisagedMyron/EnvisagedMyron.github.io/381a69f58bb395a082d79d4fb746717ae6b64307/anatomy-compressed.glb';

loader.load(modelUrl, (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center); 
    modelGroup.add(model);
});

// --- UI / Interaction ---
let activeSlider = null;
let isDraggingModel = false;
let prevMouse = { x: 0, y: 0 };

const imgActive = "https://raw.githubusercontent.com/EnvisagedMyron/EnvisagedMyron.github.io/main/assets/scroll_tab/scroll_bar_active.png";
const imgInactive = "https://raw.githubusercontent.com/EnvisagedMyron/EnvisagedMyron.github.io/main/assets/scroll_tab/scroll_bar.png";

document.querySelectorAll('.scroll-bar').forEach(bar => {
    bar.addEventListener('mousedown', (e) => {
        activeSlider = bar;
        bar.src = imgActive;
        e.stopPropagation();
    });
});

window.addEventListener('mousedown', (e) => {
    if (!activeSlider) isDraggingModel = true;
    prevMouse = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mouseup', () => {
    if (activeSlider) activeSlider.src = imgInactive;
    activeSlider = null;
    isDraggingModel = false;
});

window.addEventListener('mousemove', (e) => {
    // 1. Slider Logic
    if (activeSlider) {
        let newX = e.clientX;
        if (newX < 24) newX = 24;
        if (newX > 140) newX = 140;
        activeSlider.style.left = newX + 'px';

        const logo = document.getElementById(activeSlider.dataset.logo);
        const percent = (newX - 24) / (140 - 24); // 0 at left, 1 at right
        logo.style.opacity = 0.2 + (percent * 0.8);
        return;
    }

    // 2. 3D Model Logic
    if (isDraggingModel) {
        const deltaX = e.clientX - prevMouse.x;
        const deltaY = e.clientY - prevMouse.y;
        
        if (e.shiftKey) {
            modelGroup.position.x += deltaX * 0.002;
            modelGroup.position.y -= deltaY * 0.002;
        } else {
            modelGroup.rotation.y += deltaX * 0.008;
            const nextX = modelGroup.rotation.x + deltaY * 0.008;
            if (nextX > -Math.PI/2 && nextX < Math.PI/2) modelGroup.rotation.x = nextX;
        }
        prevMouse = { x: e.clientX, y: e.clientY };
    }
});

window.addEventListener('wheel', (e) => {
    modelGroup.position.z -= e.deltaY * 0.001;
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
