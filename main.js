import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0); 
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// --- Lighting Restore ---
const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); 
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
sunLight.position.set(5, 10, 7.5);
scene.add(sunLight);

const modelGroup = new THREE.Group();
scene.add(modelGroup);

const loader = new GLTFLoader();
loader.load('https://raw.githubusercontent.com/EnvisagedMyron/EnvisagedMyron.github.io/381a69f58bb395a082d79d4fb746717ae6b64307/anatomy-compressed.glb', (gltf) => {
    const model = gltf.scene;
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center); 
    modelGroup.add(model);
});

// --- Interaction Logic ---
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
    if (activeSlider) {
        let relativeX = e.clientX - 32;
        if (relativeX < -8) relativeX = -8;
        if (relativeX > 108) relativeX = 108;
        activeSlider.style.left = relativeX + 'px';

        const logo = document.getElementById(activeSlider.dataset.logo);
        const percent = (relativeX + 8) / 116; 
        logo.style.opacity = 0.2 + (percent * 0.8);
        return;
    }

    if (isDraggingModel) {
        const deltaX = e.clientX - prevMouse.x;
        const deltaY = e.clientY - prevMouse.y;
        
        if (e.shiftKey) {
            modelGroup.position.x += deltaX * 0.005;
            modelGroup.position.y -= deltaY * 0.005;
        } else {
            modelGroup.rotation.y += deltaX * 0.01;
            modelGroup.rotation.x += deltaY * 0.01;
        }
        prevMouse = { x: e.clientX, y: e.clientY };
    }
});

// --- Scroll Zoom Restore ---
window.addEventListener('wheel', (e) => {
    modelGroup.position.z -= e.deltaY * 0.002;
}, { passive: true });

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
