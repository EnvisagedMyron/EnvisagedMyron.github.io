// Change this line to include alpha: true
const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true  // This allows the CSS background to show through
});
renderer.setClearColor(0x000000, 0); // Set background to transparent
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ... (Rest of your loading code remains the same) ...

// 6. UI Logic
let anatomyModel; // Global reference for the model

loader.load(modelUrl, (gltf) => {
    anatomyModel = gltf.scene;
    // ... centering logic ...
    scene.add(anatomyModel);
});

document.getElementById('reset-btn').addEventListener('click', () => {
    controls.reset();
});

document.getElementById('toggle-wireframe').addEventListener('click', () => {
    anatomyModel.traverse((child) => {
        if (child.isMesh) {
            child.material.wireframe = !child.material.wireframe;
        }
    });
});
