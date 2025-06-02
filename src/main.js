import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import GUI from "lil-gui";

import { UtilCamera } from "./UtilCamera.js";

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff); // Set background color to white

// Lights
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 1);
hemiLight.position.set(0, 100, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.position.set(0, 10, 20);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 10;
dirLight.shadow.camera.bottom = -10;
dirLight.shadow.camera.left = -25;
dirLight.shadow.camera.right = 25;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 200;
dirLight.shadow.mapSize.set(1024, 1024);

scene.add(dirLight);
// scene.add(new THREE.CameraHelper(dirLight.shadow.camera));

// Camera
const camera = new UtilCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 30;
camera.position.y = 1;

// Objects
const manager = new THREE.LoadingManager();
const loader = new GLTFLoader(manager);
loader.load(
  "src/models/Volumenes.glb",
  (gltf) => {
    const model = gltf.scene;

    // Obtenemos la geometría de los meshes del modelo
    let modelGeometries = [];
    console.log("Model structure:", model);
    model.traverse((child) => {
      console.log("Child:", child.type, child.name);
      // Tinkercad le mete otros objetos al modelo, así que nos quedamos solo con los meshes
      if (child.isMesh && child.geometry) {
        modelGeometries.push(child.geometry);
      }
    });
    if (modelGeometries.length === 0) {
      console.error(
        "No model geometries found. Please ensure the GLB file contains mesh objects."
      );
      return;
    }
    const modelGeometry = modelGeometries[0]; // Use first geometry or merge if needed

    // MeshStandardMaterial  - Material sin brillo
    const meshStandardGeometry = modelGeometry.clone();
    // Calcula las normales de las caras para que se pueda iluminar correctamente
    meshStandardGeometry.computeVertexNormals();
    const meshStandardMaterial = new THREE.MeshPhongMaterial({
      color: 0xffc231,
      shininess: 150,
      specular: 0x222222,
    });

    const standardMesh = new THREE.Mesh(
      meshStandardGeometry,
      meshStandardMaterial
    );
    standardMesh.scale.set(100, 100, 100);
    standardMesh.rotation.set(-Math.PI / 2, 0, 0);
    standardMesh.position.set(0, 0, 0);

    standardMesh.castShadow = true;
    standardMesh.receiveShadow = true;

    scene.add(standardMesh);
  },
  undefined,
  (error) => {
    console.error("An error occurred while loading the model:", error);
  }
);
manager.onLoad = function () {
  render();
};

// Ground
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(1000, 1000),
  new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;
ground.receiveShadow = true;
scene.add(ground);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

camera.addEventListener("change", function () {
  console.log("Camera changed:", camera.position, camera.quaternion);
});

const gui = new GUI();
gui.add(camera, "frontal").name("Frontal");
gui.add(camera, "planta").name("Planta");
gui.add(camera, "lateral").name("Lateral");
gui.add(camera, "isometric").name("Isométrica");

function render() {
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  render();
}
animate();
