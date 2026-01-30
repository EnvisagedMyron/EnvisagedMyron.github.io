import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// Renderer with alpha enabled to see the CSS background
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0); // Second parameter is opacity (0 = transparent)
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(2, 2, 5);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

const controls = new OrbitControls(camera, renderer.domElement);

// Load the model
const loader = new GLTFLoader();
const modelUrl = 'https://raw.githubusercontent.com/EnvisagedMyron/EnvisagedMyron.github.io/381a69f58bb395a082d79d4fb746717ae6b64307/anatomy-compressed.glb';

loader.load(modelUrl, (gltf) => {
    const model = gltf.scene;
    
    // Automatic Centering
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center); 
    
    scene.add(model);
    
    // Zoom out enough to see the anatomy
    camera.position.z = 2; 
});

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
