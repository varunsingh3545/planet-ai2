import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let scene, camera, renderer, controls;
let earthModel;
const hotspots = [];

init();
animate();

function init() {
  // Scene & Camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 2.5);

  // Renderer
  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('globe'), alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.rotateSpeed = 0.5;

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambient);

  const pointLight = new THREE.PointLight(0x44ffff, 2, 100);
  pointLight.position.set(5, 3, 5);
  scene.add(pointLight);

  // Load Earth model
  const loader = new GLTFLoader();
  loader.load('earth.glb', glb => {
    earthModel = glb.scene;
    earthModel.scale.set(1.5, 1.5, 1.5);
    scene.add(earthModel);
  });

  // Example hotspot positions (3D vector relative to Earth model center)
  const hotspotData = [
    {
      id: 'hub1',
      label: 'Wildlife AI',
      position: new THREE.Vector3(0.3, 0.2, 0.9),
      description: 'Monitoring forests via AI.',
    },
    {
      id: 'hub2',
      label: 'Climate Node',
      position: new THREE.Vector3(-0.6, 0.3, -0.7),
      description: 'Climate data AI center.',
    },
  ];

  hotspotData.forEach(data => {
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.015, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x00ffff })
    );
    marker.position.copy(data.position);
    marker.userData = data;
    scene.add(marker);

    const label = document.createElement('div');
    label.className = 'floating-card';
    label.innerHTML = `<strong>${data.label}</strong>`;
    label.style.position = 'absolute';
    label.style.transform = 'translate(-50%, -50%)';
    label.style.pointerEvents = 'none';
    label.style.display = 'none';
    document.body.appendChild(label);

    marker.userData.dom = label;
    hotspots.push(marker);

    // Click handler
    marker.callback = () => {
      alert(`${data.label}: ${data.description}`);
    };
  });

  // Mouse click
  window.addEventListener('click', onDocumentClick, false);
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onDocumentClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(hotspots);

  if (intersects.length > 0) {
    const object = intersects[0].object;
    object.callback && object.callback();
  }
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  hotspots.forEach(marker => {
    const screenPos = marker.position.clone().project(camera);
    const x = (screenPos.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-screenPos.y * 0.5 + 0.5) * window.innerHeight;

    marker.userData.dom.style.left = `${x}px`;
    marker.userData.dom.style.top = `${y}px`;

    // Show label only if it's in front
    const isVisible = screenPos.z < 1;
    marker.userData.dom.style.display = isVisible ? 'block' : 'none';
  });

  renderer.render(scene, camera);
}
