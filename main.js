// --- Constants for the track limits relative to the container ---
const MIN_X = -8;  // Left limit (X24 relative to world)
const MAX_X = 108; // Right limit (X140 relative to world)

document.querySelectorAll('.scroll-bar').forEach(bar => {
    bar.addEventListener('mousedown', (e) => {
        activeSlider = bar;
        bar.src = imgActive;
        e.preventDefault();
        e.stopPropagation();
    });
});

window.addEventListener('mousemove', (e) => {
    if (activeSlider) {
        // Calculate mouse position relative to the .filter-group container (32px from left)
        let relativeX = e.clientX - 32;

        // Clamp values
        if (relativeX < MIN_X) relativeX = MIN_X;
        if (relativeX > MAX_X) relativeX = MAX_X;

        activeSlider.style.left = relativeX + 'px';

        // Opacity Logic
        const logoId = activeSlider.getAttribute('data-logo');
        const range = MAX_X - MIN_X;
        const percent = (relativeX - MIN_X) / range;
        
        document.getElementById(logoId).style.opacity = 0.2 + (percent * 0.8);
        return;
    }
    
    // ... rest of model dragging logic ...
});
