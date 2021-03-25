var contentful = require("contentful");

//SETUP PARAMETERS
let rhOutGeometry = null;
let rhOutMaterial = null;
let rhOutText = null;
let rhOutTextPt = null;

// const materialsGhNames = ["WoodMissing", "Wood", "Transparent"];
const materialsGhNames = ["CardBoard"];

const materials = [
  new THREE.MeshStandardMaterial({
    map: new THREE.TextureLoader().load("Textures/red-cardboard.jpg"),
    side: THREE.DoubleSide,
    metalness: 0.7,
  }),
];

//const materialLines = new THREE.LineBasicMaterial( { color: 0x000000 } );
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  alphaMap: new THREE.TextureLoader().load("Textures/plane_opacity.jpg"),
  transparent: true,
});

// THREE.JS setup
var scene, camera, renderer, controls;

function init() {
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("canvas"),
    antialias: true,
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // default THREE.PCFShadowMap
  renderer.setClearColor(0x66ccff, 1.0);
  // camera = new THREE.PerspectiveCamera(45, 2, 1, 50000);
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1000,
    200000
  );
  camera.position.set(-10000, 1000, -50000);

  let d = 47000;

  scene = new THREE.Scene();

  scene.background = new THREE.TextureLoader().load("Textures/Background.jpg");

  //lightning

  lightCamera = new THREE.OrthographicCamera(-d, d, d, -d, 1, 20000);
  var spotLight = new THREE.DirectionalLight(0xffffff, 5);
  spotLight.position.set(120000, 200000, 130000); //Option 02
  spotLight.shadow.camera = lightCamera;
  spotLight.castShadow = true;
  camera.add(spotLight);
  scene.add(camera);

  //scene.add( spotLight );

  spotLight.shadow.mapSize.width = 8192;
  spotLight.shadow.mapSize.height = 8192;
  spotLight.shadow.camera.near = 1000;
  spotLight.shadow.camera.far = 2500000;
  spotLight.shadow.radius = 20;

  var ambientLight = new THREE.AmbientLight(0x404040, 3.5);
  scene.add(ambientLight);

  //Create a helper for the shadow camera (optional)
  //var helper = new THREE.CameraHelper( spotLight.shadow.camera );

  // Create a plane that receives shadows (but does not cast them)
  var planeGeometry = new THREE.PlaneBufferGeometry(150000, 150000, 1, 1);

  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.receiveShadow = true;
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = -5;
  scene.add(plane);

  //add controls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target = new THREE.Vector3(0, 1000, 0);
  controls.maxPolarAngle = Math.PI / 2; // prevent the camera from going under the ground
  controls.enableDamping = true; //damping
  controls.dampingFactor = 0.2;
}

function resizeCanvasToDisplaySize() {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;

  if (canvas.width !== width || canvas.height !== height) {
    // you must pass false here or three.js sadly fights the browser
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
}

var animate = function () {
  resizeCanvasToDisplaySize();
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  //   labelRenderer.render(scene, camera);
};

function maxObjSize(obj) {
  obj.geometry.computeBoundingBox();
  let bb = obj.geometry.boundingBox;
  let size = [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z];
  let maxSize = size.sort()[2];
  return maxSize;
}

function addObjectsToScene(data) {
  //Add 3d objects to the scene
  let threeMesh = new THREE.Object3D();
  let volumes = data.volumes;
  let labels = data.labels;

  for (let i = 0; i < volumes.length; i++) {
    //is this still valid  in latest build?
    let mesh = volumes[i].meshThree;
    let matName = volumes[i].material;

    let materialToAssign = null;
    for (let j = 0; j < materialsGhNames.length; j++) {
      if (materialsGhNames[j] === matName) {
        materialToAssign = materials[j];
      }
    }

    if (materialToAssign === null) {
      materialToAssign = materials[0];
    }

    let loader = new THREE.BufferGeometryLoader();
    var geometry = loader.parse(mesh);
    let obj = new THREE.Mesh(geometry, materialToAssign);
    let textureRepeat = Math.ceil(maxObjSize(obj) / 500);
    obj.material.map.wrapS = THREE.RepeatWrapping;
    obj.material.map.wrapT = THREE.RepeatWrapping;
    obj.material.map.repeat.set(textureRepeat, textureRepeat);
    obj.castShadow = true;
    obj.receiveShadow = true;
    threeMesh.add(obj);
  }

  scene.add(threeMesh);
}

//RUN FUNCTIONS
init();
animate();

// let params = {
//   panelX: 5000,
//   panelY: 5000,
// };

function getQueryFromParams(params) {
  let paramsArray = Object.keys(params).map((key) => [key, params[key]]);

  let q = paramsArray.map((a) => {
    return `${a[0]}=${a[1]}`;
  });

  let query = q.join("&");
  return query;
}

let projectName = "200yrPavilion";

let params = {
  m1width: 0,
  m1top1: 0,
  m1top2: 0,
  m2width: 0,
  m2top1: 0,
  m2top2: 0,
  m3width: 0,
  m3top1: 0,
  m3top2: 0,
};

let query = getQueryFromParams(params);

async function rhinoCall(query) {
  let apiUrl = `/modelData/${projectName}?${query}`;
  const response = await fetch(apiUrl);
  const json = await response.json();
  return json;
}

//get rhino objects
rhinoCall(query).then((data) => {
  console.log("Geometry recieved");

  document.getElementById("loader").style.display = "none";

  addObjectsToScene(data);
});
