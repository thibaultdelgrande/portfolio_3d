import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";

/*
// Changer d'url
window.history.pushState("object or string", "Title", "/new-url");

// Event listener changement d'url
window.addEventListener("popstate", (e) => {
});
*/

const manager = new THREE.LoadingManager();
const loading = document.querySelector("#loading");
const urlElement = document.querySelector("#url");

manager.onStart = function (url, itemsLoaded, itemsTotal) {
    loading.innerText = `Chargement : ${itemsLoaded}/${itemsTotal} fichiers`;
    urlElement.innerText = url;
};

manager.onLoad = function () {
	loading.innerText = "Chargement terminé !";
    urlElement.innerText = "";
	document.querySelector("#spinner-container").classList.add("hidden");
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    loading.innerText = `Chargement : ${itemsLoaded}/${itemsTotal} fichiers`;
    urlElement.innerText = url;
};

manager.onError = function (url) {
    loading.innerText = `Une erreur est survenue lors du chargement de ${url}`;
    urlElement.innerText = "";
};

let positions;
await fetch("/build/json/positions_paysage.json")
	.then((response) => response.json())
	.then((json) => (positions = json));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	positions.camera.base.fov,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

// Impost json file to get the positions of the objects

// Plane for the floor
const planeGeometry = new THREE.PlaneGeometry(100, 100, 32);
const planeMaterial = new THREE.MeshPhongMaterial({
	color: 0xfdcae1,
	side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 10, 10);
light.shadow.radius = 5;
light.shadow.mapSize.width = 2048;
light.shadow.mapSize.height = 2048;
light.shadow.camera.left = -10;
light.shadow.camera.right = 10;
light.shadow.camera.top = 10;
light.shadow.camera.bottom = -10;
light.castShadow = true;
scene.add(light);

// Second light
const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
light2.position.set(-10, 10, -10);
light2.shadow.radius = 5;
light2.shadow.mapSize.width = 2048;
light2.shadow.mapSize.height = 2048;
light2.shadow.camera.left = -10;
light2.shadow.camera.right = 10;
light2.shadow.camera.top = 10;
light2.shadow.camera.bottom = -10;
light2.castShadow = true;
scene.add(light2);

// Ambient light
const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(ambientLight);

// Load the objects

for (let object in positions.objects) {
	let obj;
	const loader = new GLTFLoader(manager);

	loader.load(
		"/build" + positions.objects[object].model,
		function (gltf) {
			scene.add(gltf.scene);
			obj = gltf.scene;

			obj.position.x = positions.objects[object].position.x;
			obj.position.y = positions.objects[object].position.y;
			obj.position.z = positions.objects[object].position.z;
			obj.rotation.y = positions.objects[object].rotation.y;
			obj.rotation.x = positions.objects[object].rotation.x;
			obj.rotation.z = positions.objects[object].rotation.z;
			obj.scale.x = positions.objects[object].scale.x;
			obj.scale.y = positions.objects[object].scale.y;
			obj.scale.z = positions.objects[object].scale.z;

			/*
                human.position.x = 1;
                human.position.y = 1.05;
                human.position.z = 2;
                human.rotation.y = -1;
                */
			// Set the shadow
			obj.traverse(function (child) {
				if (child.isMesh) {
					child.castShadow = true;
					child.receiveShadow = true;
				}
			});
		},
		undefined,
		function (error) {
			console.error(error);
		}
	);
}

// Title
const loader = new FontLoader(manager);

loader.load("/build/fonts/ubuntu_regular.json", function (font) {
	const geometry = new TextGeometry("thibault delgrande", {
		font: font,
		size: 0.5,
		depth: 0.1,
	});

	const material = new THREE.MeshPhongMaterial({ color: 0x3e747d });
	const text = new THREE.Mesh(geometry, material);
	scene.add(text);
	text.position.x = -3;
	text.position.y = 3;
	text.position.z = 3;
	text.rotation.y = 0.5;
	text.rotation.x = -0.5;
	text.rotation.z = 0.25;
});

// Set the camera position
camera.position.z = 16;
camera.position.y = 8;
camera.position.x = 8;
camera.rotation.y = 0.5;
camera.rotation.x = -0.5;
camera.rotation.z = 0.25;

// Camera controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();
/*
    // Camera helper
    const cameraHelper = new THREE.CameraHelper(light.shadow.camera);
    scene.add(cameraHelper);

    const cameraHelper2 = new THREE.CameraHelper(light2.shadow.camera);
    scene.add(cameraHelper2);
    */

// Animation loop
function animate() {
	/*
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
    */
	renderer.render(scene, camera);
}
