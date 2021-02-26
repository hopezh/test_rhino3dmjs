// import * as THREE from "../resources/threejs/r125/build/three.module.js";
// import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118.1/build/three.min.js";

var rhino_file_path = "../models/3dm/b02_mesh.3dm";
// var rhino_file_path = "../3dm/hello_mesh.3dm";
let fetchPromise = fetch(rhino_file_path);
console.log("fetch promise:", fetchPromise);

rhino3dm().then(async (m) => {
  console.log("Loaded rhino3dm.");
  let rhino = m;

  let res = await fetchPromise;
  let buffer = await res.arrayBuffer();
  let arr = new Uint8Array(buffer);
  let doc = rhino.File3dm.fromByteArray(arr);

  THREE.Object3D.DefaultUp = new THREE.Vector3(0, 0, 1);
  init();
  let material = new THREE.MeshNormalMaterial();

  let objects = doc.objects();
  for (let i = 0; i < objects.count; i++) {
    let mesh = objects.get(i).geometry();
    //   let layer = objects.get(i).layer(); // not working
    //   console.log(layer);
    if (mesh instanceof rhino.Mesh) {
      // convert all meshes in 3dm model into threejs objects
      let threeMesh = meshToThreejs(mesh, material);
      scene.add(threeMesh);
    }
  }
});

// BOILERPLATE //
var scene, camera, renderer, controls;

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0, 0, 0);
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    100000
  );
  camera.position.set(-10, 10, 50);
  // camera.position.set(1000, 1000, 1000);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  var canvas = document.getElementById("canvas");
  canvas.appendChild(renderer.domElement);

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  window.addEventListener("resize", onWindowResize, false);
  animate();
}

var animate = function () {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  animate();
}

function meshToThreejs(mesh, material) {
  let loader = new THREE.BufferGeometryLoader();
  var geometry = loader.parse(mesh.toThreejsJSON());
  return new THREE.Mesh(geometry, material);
}
