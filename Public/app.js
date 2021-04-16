//SETUP PARAMETERS
let rhOutGeometry = null;
let rhOutMaterial = null;
let rhOutText = null;
let rhOutTextPt = null;
let textureImage = "oak";

// const materialsGhNames = ["WoodMissing", "Wood", "Transparent"];
const materialsGhNames = ["WoodMissing"];

// materialImages = ["oak.jpg", "red-cardboard.jpg", "blk.jpg"];

//const materialLines = new THREE.LineBasicMaterial( { color: 0x000000 } );
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  alphaMap: new THREE.TextureLoader().load("Textures/plane_opacity.jpg"),
  transparent: true,
});

// THREE.JS setup
var scene, camera, renderer, controls;

function modelInit() {
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("canvas"),
    antialias: true,
  });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap; // default THREE.PCFShadowMap
  renderer.setClearColor(0x66ccff, 1.0);

  labelRenderer = new THREE.CSS2DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = "0px";
  labelRenderer.domElement.id = "labels2d";
  labelRenderer.domElement.style.display = "none";
  document.body.appendChild(labelRenderer.domElement);

  //Funkar för Humt
  // camera = new THREE.PerspectiveCamera(45, 2, 1, 50000);
  // camera = new THREE.PerspectiveCamera(
  //   45,
  //   window.innerWidth / window.innerHeight,
  //   1000,
  //   300000
  // );
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1000,
    300000
  );

  camera.position.set(-10000, 1000, -50000);
  // camera.position.set(50000, 50000, -50000);

  // funkar för 200
  // camera = new THREE.PerspectiveCamera(45, 2, 1, 50000);
  // camera.position.set(-8000, 2000, -10000);

  scene = new THREE.Scene();

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
  labelRenderer.render(scene, camera);
};

function maxObjSize(obj) {
  obj.geometry.computeBoundingBox();
  let bb = obj.geometry.boundingBox;
  let size = [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z];
  let maxSize = size.sort()[2];
  return maxSize;
}

function addObjectsToScene(data, textureImage) {
  const materials = [
    new THREE.MeshStandardMaterial({
      map: new THREE.TextureLoader().load(`Textures/${textureImage}.jpg`),
      side: THREE.DoubleSide,
      metalness: 0.7,
    }),
  ];

  //Add 3d objects to the scene
  let threeMesh = new THREE.Object3D();
  let volumes = data.volumes;
  let labels = data.labels;

  for (let i = 0; i < volumes.length; i++) {
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
  for (let i = 0; i < labels.length; i++) {
    var labeldiv = document.createElement("div");
    labeldiv.className = "label2d";
    labeldiv.textContent = labels[i].label;
    labeldiv.style.marginTop = "-1em";
    var label2d = new THREE.CSS2DObject(labeldiv);
    label2d.position.set(
      labels[i].labelPosition.X,
      labels[i].labelPosition.Z,
      -labels[i].labelPosition.Y
    );
    threeMesh.add(label2d);
  }
  scene.add(threeMesh);
}
function onShowData() {
  let dataLabels = document.getElementById("labels2d");
  let showData = document.getElementById("showData");
  if (dataLabels.style.display == "none") {
    dataLabels.style.display = "block";
    showData.innerHTML = "Hide Data";
  } else {
    dataLabels.style.display = "none";
    showData.innerHTML = "Show Data";
  }
}

function onShowInfo() {
  let description = document.querySelector(".model-description");
  console.log(description);
  let showInfo = document.getElementById("showInfo");
  if (description.style.display == "none") {
    description.style.display = "block";
    showInfo.innerHTML = "Hide Info";
  } else {
    description.style.display = "none";
    showInfo.innerHTML = "Show Info";
  }
}

function removeObjectsFromScene() {
  //throws error with multiple objects to remove, no idea why
  scene.traverse((child) => {
    if (child.type === "Object3D") {
      scene.remove(child);
    }
  });
  document.getElementById("labels2d").innerHTML = "";
}

async function getModelFromContentful(modelName) {
  let contentUrl = `/contentful/${modelName}`;

  // request model info from backend
  const response = await fetch(contentUrl);
  const json = await response.json();

  return json;
}

async function getModelsFromContentful() {
  let contentUrl = "/contentful";
  const response = await fetch(contentUrl);
  const json = await response.json();

  return json;
}

let pathName = window.location.pathname;
let modelName = pathName.replace("/", "");

function init() {
  if (pathName !== "/") {
    modelInit();
    animate();

    (async () => {
      let model = await getModelFromContentful(modelName);
      // let inputPassword = window.prompt("Enter password");
      let inputPassword = "hello";

      if (inputPassword == model.password) {
        let modelHeader = document.querySelector(".model-header");
        modelHeader.innerText = model.Title;
        let modelDescription = document.querySelector(".model-description");
        modelDescription.innerHTML = model.description;
        // let defaultTexture = "oak";
        // let textureImage = defaultTexture;

        let params = model.params;
        let q = params.map((p) => {
          return `${p.name}=${p.defaultValue}`;
        });

        let query = q.join("&");

        rhinoCall(query).then((data) => {
          console.log("Geometry recieved");
          document.getElementById("loader").style.display = "none";
          addObjectsToScene(data, textureImage);
        });

        await createComponents();
      } else {
        window.alert("The password you entered was incorrect");
        window.location.reload();
      }
    })();
  } else {
    let canvas = document.querySelector("#canvas");
    let showData = document.querySelector("#showData");
    let showInfo = document.querySelector("#showInfo");
    let modelDescription = document.querySelector(".model-description");
    let sliderSection = document.querySelector(".slider-section");
    let drawer = document.querySelector(".drawer");

    canvas.classList.add("removed");
    showData.classList.add("removed");
    showInfo.classList.add("removed");
    modelDescription.classList.add("removed");
    sliderSection.classList.add("removed");
    drawer.classList.add("removed");

    (async () => {
      let m = await getModelsFromContentful();
      let models = m.models;
      models.forEach((m) => {
        let div = document.createElement("div");
        div.classList.add("model-div");
        let a = document.createElement("a");
        let h = document.createElement("h3");
        let p = document.createElement("p");
        h.innerText = m.fields.title;
        p.innerText = m.fields.shortDescription;
        a.href = m.fields.slug;
        a.appendChild(h);
        document.body.appendChild(div);
        div.appendChild(a);
        div.appendChild(p);
      });
      document.getElementById("loader").style.display = "none";
    })();
  }
}

function createComponents() {
  (async () => {
    let model = await getModelFromContentful(modelName);
    let params = model.params;
    let sliderSection = document.querySelector(".slider-section");

    params.forEach((p) => {
      let componentDiv = document.createElement("div");
      let name = document.createElement("p");
      let componentLowerDiv = document.createElement("div");

      name.innerText = p.displayName;
      componentLowerDiv.appendChild(name);
      componentDiv.classList.add("slider-div");
      componentLowerDiv.classList.add("slider-lower-div");
      sliderSection.appendChild(componentDiv);

      let input;
      if (p.type == "range") {
        input = document.createElement("input");
        input.type = p.type;
        input.classList.add("slider");

        input.min = p.minValue;
        input.max = p.maxValue;
        input.onchange = function () {
          onSettingsChange();
        };

        input.step = p.stepSize;
        input.value = p.defaultValue;

        let label = document.createElement("label");
        label.setAttribute("for", p.name);
        label.innerText = p.defaultValue;
        componentDiv.appendChild(label);
      } else if (p.type == "singleSelect") {
        input = document.createElement("select");
        input.classList.add("select-list");
        for (var i = 0; i < p.options.length; i++) {
          var option = document.createElement("option");
          option.value = p.options[i].value;
          option.text = p.options[i].name;

          input.appendChild(option);
        }
      }
      input.onchange = function () {
        onSettingsChange();
      };

      componentLowerDiv.appendChild(input);
      componentDiv.appendChild(componentLowerDiv);
      input.classList.add("component");
      input.name = p.name;

      //////
    });
    let sliders = document.querySelectorAll(".slider");
    console.log("ADDEED LOGIC");

    // https://stackoverflow.com/questions/10756313/javascript-jquery-map-a-range-of-numbers-to-another-range-of-numbers
    // const scale = (num, in_min, in_max, out_min, out_max) => {
    //   return (
    //     ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
    //   );
    // };

    let labels = document.querySelectorAll("label");
    console.log(sliders);

    sliders.forEach((s) => {
      const value = +s.value;
      const label = s.parentNode.previousSibling;
      console.log(label);
      label.classList.add("hidden");
    });

    sliders.forEach((s) => {
      s.addEventListener("input", (e) => {
        const value = +e.target.value;
        const label = e.target.parentNode.previousSibling;
        label.classList.remove("hidden");
        label.classList.add("show");
        label.innerHTML = value;
      });
      s.addEventListener("mouseup", (e) => {
        const label = e.target.parentNode.previousSibling;
        label.classList.remove("show");
        label.classList.add("hidden");
      });
    });
  })();
}

function addSliderLogic() {
  let sliders = document.querySelectorAll(".slider");
  // https://stackoverflow.com/questions/10756313/javascript-jquery-map-a-range-of-numbers-to-another-range-of-numbers
  // const scale = (num, in_min, in_max, out_min, out_max) => {
  //   return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  // };

  let labels = document.querySelectorAll("label");
  console.log(sliders);

  // sliders.forEach((s) => {
  //   const value = +s.value;
  //   const label = s.previousSibling;
  //   console.log(label);
  //   label.classList.add("hidden");
  //   const rangeWidth = getComputedStyle(s).getPropertyValue("width");
  //   console.log(rangeWidth);
  //   const labelWidth = getComputedStyle(label).getPropertyValue("width");
  //   const numWidth = +rangeWidth.substring(0, rangeWidth.length - 2);
  //   const numLabelWidth = +labelWidth.substring(0, labelWidth.length - 2);
  //   const max = +s.max;
  //   const min = +s.min;
  //   const left =
  //     value * (numWidth / max) -
  //     numLabelWidth / 2 +
  //     scale(value, min, max, 10, -10);
  //   label.style.left = `${left}px`;
  // });

  sliders.forEach((s) => {
    // s.addEventListener("input", (e) => {
    //   const value = +e.target.value;
    //   const label = e.target.nextElementSibling;
    //   label.classList.add("show");

    //   const rangeWidth = getComputedStyle(e.target).getPropertyValue("width");
    //   const labelWidth = getComputedStyle(label).getPropertyValue("width");
    //   // remove px
    //   const numWidth = +rangeWidth.substring(0, rangeWidth.length - 2);
    //   const numLabelWidth = +labelWidth.substring(0, labelWidth.length - 2);
    //   const max = +e.target.max;
    //   const min = +e.target.min;
    //   const left =
    //     value * (numWidth / max) -
    //     numLabelWidth / 2 +
    //     scale(value, min, max, 10, -10);
    //   label.style.left = `${left}px`;
    //   label.innerHTML = value;
    // });
    s.addEventListener("mouseup", (e) => {
      const label = e.target.nextElementSibling;
      label.classList.remove("show");
    });
  });
}

function onSettingsChange(element) {
  // if (element) {
  //   textureImage = element.value;
  // } else {
  //   // let select = document.querySelector("#texture-select");
  //   // textureImage = select.value;
  // }

  document.getElementById("loader").style.display = "block";
  let sliders = document.querySelectorAll(".component");
  let sliderParams = [];
  sliders.forEach((s) => {
    let name = s.name;
    let value = s.value;
    let obj = {};
    let key = "name";
    obj[key] = name;
    obj["value"] = value;
    sliderParams.push(obj);
    console.log(name + " " + value);
  });

  let q = sliderParams.map((p) => {
    return `${p.name}=${p.value}`;
  });

  let query = q.join("&");
  rhinoCall(query).then((data) => {
    console.log("Geometry recieved");
    document.getElementById("loader").style.display = "none";
    removeObjectsFromScene();
    addObjectsToScene(data, textureImage);
  });
}
init();

async function rhinoCall(query) {
  let apiUrl = `/modelData/${modelName}?${query}`;
  const response = await fetch(apiUrl);
  const json = await response.json();
  return json;
}
