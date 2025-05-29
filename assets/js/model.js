// model.js - 3D water model handling with Three.js

// Global variables for Three.js
let scene, camera, renderer, container;
let waterMesh, glassMesh, waterMaterial;
let isModelInitialized = false;

// Initialize the 3D water model
function initWaterModel() {
    container = document.getElementById('waterModel');
    
    // If container doesn't exist, stop initialization
    if (!container) return;
    
    // Setup scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    
    // Setup camera
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
    
    // Setup renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Add renderer to container
    if (container.childElementCount === 0) {
        container.appendChild(renderer.domElement);
    }
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Create glass container
    createGlass();
    
    // Create water
    createWater();
    
    // Initial water level based on consumed percentage
    const percentage = Math.min(Math.round((waterData.consumed / waterData.goal) * 100), 100) / 100;
    updateWaterLevel(percentage);
    
    // Add animation
    animate();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    isModelInitialized = true;
}

// Create glass mesh
function createGlass() {
    const glassGeometry = new THREE.CylinderGeometry(1, 0.8, 2, 32, 1, true);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        roughness: 0.1,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });
    
    glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
    scene.add(glassMesh);
    
    // Add a bottom to the glass
    const bottomGeometry = new THREE.CircleGeometry(0.8, 32);
    const bottomMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.4,
        roughness: 0.1,
        metalness: 0.1
    });
    
    const bottomMesh = new THREE.Mesh(bottomGeometry, bottomMaterial);
    bottomMesh.rotation.x = -Math.PI / 2;
    bottomMesh.position.y = -1;
    scene.add(bottomMesh);
}

// Create water mesh
function createWater() {
    const waterGeometry = new THREE.CylinderGeometry(0.9, 0.7, 0, 32);
    waterMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x0891b2,
        transparent: true,
        opacity: 0.8,
        roughness: 0.0,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });
    
    waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
    waterMesh.position.y = -1; // Start at bottom
    scene.add(waterMesh);
}

// Update water level based on percentage (0 to 1)
function updateWaterLevel(percentage) {
    if (!isModelInitialized || !waterMesh) return;
    
    // Calculate height (0 to 1.8 - leaving some space at top)
    const height = percentage * 1.8;
    
    // Update water geometry
    scene.remove(waterMesh);
    const waterGeometry = new THREE.CylinderGeometry(0.9, 0.7, height, 32);
    waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
    
    // Position water (bottom of glass is at y = -1)
    waterMesh.position.y = -1 + (height / 2);
    
    scene.add(waterMesh);
    
    // Update color based on level
    updateWaterColor(percentage);
}

// Update water color based on percentage
function updateWaterColor(percentage) {
    if (!waterMesh || !waterMaterial) return;
    
    // Color ranges from light blue (low) to deep cyan-blue (high)
    let color;
    
    if (percentage < 0.3) {
        // Light blue for low levels
        color = new THREE.Color(0x7dd3fc);
    } else if (percentage < 0.7) {
        // Medium blue for mid levels
        color = new THREE.Color(0x38bdf8);
    } else {
        // Deep blue for high levels
        color = new THREE.Color(0x0891b2);
    }
    
    waterMaterial.color = color;
}

// Handle window resize
function onWindowResize() {
    if (!container || !camera || !renderer) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    
    renderer.setSize(width, height);
}

// Animation loop
function animate() {
    if (!isModelInitialized) return;
    
    requestAnimationFrame(animate);
    
    // Rotate glass slightly for better visual effect
    if (glassMesh) {
        glassMesh.rotation.y += 0.005;
    }
    
    // Add gentle bobbing effect to water
    if (waterMesh) {
        waterMesh.position.y += Math.sin(Date.now() * 0.001) * 0.0005;
    }
    
    renderer.render(scene, camera);
}