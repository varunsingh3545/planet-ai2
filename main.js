// main.js

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const globeContainer = document.getElementById('globe-container');

    // Check if the container element exists
    if (!globeContainer) {
        console.error("Error: The element with id 'globe-container' was not found in the DOM.");
        return;
    }

    // --- Scene, Camera, and Renderer Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, globeContainer.clientWidth / globeContainer.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true // Make renderer background transparent
    });

    renderer.setSize(globeContainer.clientWidth, globeContainer.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    globeContainer.appendChild(renderer.domElement);

    // --- Lighting ---
    // Ambient light to softly illuminate the entire scene
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
    scene.add(ambientLight);

    // Directional light to simulate a light source like the sun
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // --- Controls ---
    // OrbitControls allow the camera to orbit around a target.
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1.5;
    controls.maxDistance = 5;
    controls.enablePan = false; // Restrict panning

    // --- Model Loading ---
    const loader = new THREE.GLTFLoader();
    let globe;

    // IMPORTANT: This assumes your 'earth.glb' file is in a 'models' directory.
    // If it's in the same directory as index.html, change the path to 'earth.glb'.
    loader.load(
        'models/earth.glb',
        (gltf) => {
            globe = gltf.scene;
            scene.add(globe);
            // Now that the globe is loaded, we can get the hotspot positions
            initializeHotspots();
        },
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
            console.error('An error occurred while loading the model:', error);
            globeContainer.innerHTML = `<p style="color: white; text-align: center;">Failed to load 3D model.<br>Please ensure 'models/earth.glb' is accessible.</p>`;
        }
    );

    // Set initial camera position
    camera.position.z = 2.5;

    // --- Hotspots ---
    const hotspotElements = document.querySelectorAll('.hotspot');
    const hotspots = [];

    function initializeHotspots() {
        hotspotElements.forEach(element => {
            const positionArray = element.dataset.position.split(' ').map(Number);
            hotspots.push({
                element: element,
                position: new THREE.Vector3(...positionArray)
            });
        });
    }

    // --- Animation Loop ---
