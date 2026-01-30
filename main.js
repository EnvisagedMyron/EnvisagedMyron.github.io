// ... existing Three.js setup ...

// --- Interaction Logic ---
let isDragging = false;
let activeSlider = null; 
let previousMousePosition = { x: 0, y: 0 };

const imgActive = "https://raw.githubusercontent.com/EnvisagedMyron/EnvisagedMyron.github.io/main/assets/scroll_tab/scroll_bar_active.png";
const imgInactive = "https://raw.githubusercontent.com/EnvisagedMyron/EnvisagedMyron.github.io/main/assets/scroll_tab/scroll_bar.png";

// Set up UI Sliders
document.querySelectorAll('.scroll-bar').forEach(bar => {
    bar.addEventListener('mousedown', (e) => {
        activeSlider = bar;
        bar.src = imgActive;
        e.preventDefault(); 
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
        // We use clientX directly for the horizontal position
        let newX = e.clientX;
        
        // Hard limits as requested: X24 to X140
        if (newX < 24) newX = 24;
        if (newX > 140) newX = 140;
        
        activeSlider.style.left = newX + 'px';

        // Opacity Logic
        const logoId = activeSlider.getAttribute('data-logo');
        const logo = document.getElementById(logoId);
        
        // Percentage: 140 is 100%, 24 is 20%
        const range = 140 - 24;
        const currentPos = newX - 24;
        const percentage = currentPos / range;
        
        logo.style.opacity = 0.2 + (percentage * 0.8);
        return; 
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

// ... rest of animate() and resize functions ...
