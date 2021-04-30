//SETUP PARAMETERS
let rhOutGeometry = null;
let rhOutMaterial = null;
let rhOutText = null;
let rhOutTextPt = null;

let pathName = window.location.pathname;
let modelName = pathName.replace("/", "");

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

  // X Y Distance
  // camera.position.set(-10000, 10000, -25000);
  // KORREKT
  // camera.position.set(-10000, 1000, -50000);

  (async () => {
    let model = await getModelFromContentful(modelName);
    let cameraPosition = model.cameraPosition;

    if (cameraPosition) {
      camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    } else {
      camera.position.set(-10000, 1000, -50000);
    }
  })();

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

function createDashboard(data, i) {
  let settingsPage = document.querySelector(".settings-page");
  let id = 0;

  let chartTypes = [
    "doughnut",
    "line",
    "bar",
    "radar",
    "area",
    "bubble",
    "polarArea",
    "scatter",
  ];
  data.forEach((d) => {
    if (d.type == "image") {
      let images = d.data.datasets;
      let imgIndex = 0;
      let dashboardImg = document.querySelector(".dashboard-image");

      images.forEach((i) => {
        let imgDiv = document.createElement("div");
        let img = document.createElement("img");
        let a = document.createElement("a");
        a.setAttribute("data-lightbox", `image-${imgIndex}`);
        a.href = `/images/${d.data.datasets[0].link}`;
        imgDiv.classList.add("img-container");
        a.appendChild(imgDiv);
        settingsPage.appendChild(a);
        imgDiv.appendChild(img);
        img.src = `/images/${d.data.datasets[0].link}`;
        img.classList.add("dashboard-image");
        imgIndex++;
      });
    } else if (chartTypes.includes(d.type)) {
      createChart(d, id);
      id++;
    } else if (d.type == "markdown") {
      let markdownData = document.querySelector(".markdown-data");
      var converter = new showdown.Converter();
      let htmlText = converter.makeHtml(d.data.datasets[0].string);
      let markdownDataDiv = document.createElement("div");
      settingsPage.appendChild(markdownDataDiv);
      markdownDataDiv.classList.add("markdown-data");
      markdownDataDiv.innerHTML = htmlText;
    }
  });
}

function createChart(chart, i) {
  let drawer = document.querySelector(".drawer");
  let chartsDiv = document.querySelector(".charts-section");

  let chartsSection;
  let chartsHeader;

  if (chartsDiv == null) {
    chartsSection = document.createElement("div");
    chartsHeader = document.createElement("div");
    let chartsh3 = document.createElement("h3");
    let settingsPage = document.querySelector(".settings-page");
    let arrowIcon = document.createElement("i");
    chartsHeader.classList.add("charts-header");
    arrowIcon.classList.add("fas");
    arrowIcon.classList.add("fa-chevron-up");
    chartsSection.classList.add("charts-section");
    chartsHeader.appendChild(arrowIcon);
    chartsh3.innerText = "Charts";
    chartsHeader.appendChild(chartsh3);
    chartsSection.appendChild(chartsHeader);
    settingsPage.appendChild(chartsSection);
  } else {
    chartsSection = chartsDiv;
    chartsHeader = document.querySelector(".charts-header");
  }

  let canvas = document.createElement("canvas");
  canvas.classList.add(`chart-canvas`);
  canvas.classList.add(`canvas-number${i}`);
  chartsSection.appendChild(canvas);

  const config = {
    type: chart.type,
    data: chart.data,
    options: {
      responsive: true,
      // maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          // text: "Example header",
        },
      },
    },
  };

  let myChart = new Chart(document.querySelector(`.canvas-number${i}`), config);
  i++;
}

function addObjectsToScene(data, textureImage) {
  const materials = [
    new THREE.MeshStandardMaterial({
      // map: new THREE.TextureLoader().load(`Textures/${textureImage}.jpg`),
      map: new THREE.TextureLoader().load(textureImage),
      side: THREE.DoubleSide,
      metalness: 0.7,
    }),
  ];

  //Add 3d objects to the scene
  let threeMesh = new THREE.Object3D();
  let volumes = data.volumes;
  let labels = data.labels;

  if (labels.length < 1) {
    let showLabelsBtn = document.querySelector(".show-labels-btn");
    showLabelsBtn.classList.add("removed");
  }

  let dashboardData = data.dashBoard;
  let markdownData = document.querySelector(".markdown-data");

  if (dashboardData) {
    createDashboard(dashboardData);
  }

  let chartCanvas = document.querySelectorAll(".chart-canvas");
  let chartsHeader = document.querySelector(".charts-header");
  let chartSectionArrow = document.querySelector(".charts-header .fas");

  if (chartsHeader) {
    chartsHeader.addEventListener("click", (e) => {
      chartCanvas.forEach((chart) => {
        chart.classList.toggle("menuhide");
      });
      chartSectionArrow.classList.toggle("spin");
    });
  }

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

  // fitCameraToSelection(camera, controls, selection);
}

function onShowData() {
  let dataLabels = document.getElementById("labels2d");
  let dataBtn = document.querySelector(".data-btn");
  let showLabels = document.querySelector(".show-labels-btn");
  console.log(showLabels);
  if (dataLabels.style.display == "none") {
    dataLabels.style.display = "block";
    showLabels.classList.add("active");
    // dataBtn.classList.add("data-btn-active");
    // showLabels.textContent = "Hide Data";
  } else {
    dataLabels.style.display = "none";
    showLabels.classList.remove("active");
    // dataBtn.classList.remove("data-btn-active");
    // showLabels.textContent = "Show Data";
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

function init() {
  if (pathName !== "/") {
    modelInit();
    animate();

    (async () => {
      let model = await getModelFromContentful(modelName);
      let inputPassword = window.prompt("Enter password");
      // let inputPassword = "hello";

      if (inputPassword == model.password) {
        let modelHeader = document.querySelector(".model-header");
        modelHeader.innerText = model.Title;
        let modelDescription = document.querySelector(".model-description");
        modelDescription.innerHTML = model.description;
        let textureImage = model.texture;

        if (model.images) {
          createGallery(model.images);
        }

        let m1 = model.params;

        let newArr = [];

        m1.forEach((m) => {
          let parts = m.parts;
          parts.forEach((p) => {
            newArr.push(p.name + "=" + p.defaultValue);
          });
        });

        // params.forEach((p) => {});

        let query = newArr.join("&");

        rhinoCall(query).then((data) => {
          console.log("Geometry recieved");
          document.getElementById("loader").style.display = "none";
          addObjectsToScene(data, textureImage);
          let drawerBtns = document.querySelectorAll(".drawer-btn");
          drawerBtns.forEach((btn) => {
            btn.classList.remove("removed");
          });
        });
      } else {
        window.alert("The password you entered was incorrect");
        window.location.reload();
      }
      await createComponents();
    })();
  } else {
    let canvas = document.querySelector("#canvas");
    let showData = document.querySelector("#showData");
    let showInfo = document.querySelector("#showInfo");
    let modelDescription = document.querySelector(".model-description");
    let sliderSection = document.querySelector(".slider-section");
    let drawer = document.querySelector(".drawer");
    let drawerBtn = document.querySelector(".drawer-btn");
    let drawerSettingsBtn = document.querySelector(".drawer-settings-btn");
    document.body.style.backgroundImage = "url('Textures/Background.jpg')";
    document.body.style.backgroundSize = "cover";
    document.body.style.height = "100vh";
    document.querySelector(".model-header").style.margin = "50px 0px 0px 100px";

    canvas.classList.add("removed");
    drawerBtn.classList.add("removed");
    drawerSettingsBtn.classList.add("removed");
    modelDescription.classList.add("removed");
    sliderSection.classList.add("removed");
    drawer.classList.add("removed");

    (async () => {
      let m = await getModelsFromContentful();
      let models = m.models;
      let modelsContainer = document.createElement("div");
      document.body.appendChild(modelsContainer);
      modelsContainer.classList.add("models-container");
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
        modelsContainer.appendChild(div);
        div.appendChild(a);
        div.appendChild(p);
      });

      document.getElementById("loader").style.display = "none";
    })();
  }
}

function createGallery(modelImages) {
  let infoPage = document.querySelector(".info-page");
  let i = 0;
  modelImages.forEach((image) => {
    let a = document.createElement("a");
    a.setAttribute("data-lightbox", `image-${i}`);
    a.href = image.fields.file.url;
    let imgDiv = document.createElement("div");
    imgDiv.classList.add("gallery-img-container");
    let img = document.createElement("img");
    img.src = image.fields.file.url;
    img.classList.add("gallery-image");

    infoPage.appendChild(a);
    a.appendChild(imgDiv);
    imgDiv.appendChild(img);

    i++;
  });
}

function createComponents() {
  (async () => {
    let model = await getModelFromContentful(modelName);
    let params = model.params;
    let sliderSection = document.querySelector(".slider-section");

    let modules = model.params;

    let logo = document.createElement("img");
    logo.src = model.logo;
    logo.classList.add("logo");

    document.body.appendChild(logo);

    //
    let modelInfoHeader = document.querySelector(".model-info-header");
    modelInfoHeader.addEventListener("click", (e) => {
      let header = e.target;
      let arrow;
      if (header.classList.value.includes("fas")) {
        arrow = header;
      } else {
        arrow = header.children[0];
      }
      arrow.classList.toggle("spin");
      let infoS = header.parentNode;
      let modelDescription = document.querySelector(".model-description");
      modelDescription.classList.toggle("menuhide");
    });

    let drawerInfoBtn = document.querySelector(".drawer-info-btn");
    let drawerSettingsBtn = document.querySelector(".drawer-settings-btn");

    let drawerBtns = document.querySelectorAll(".drawer-btn");

    let drawer = document.querySelector(".drawer");

    let infoPage = document.querySelector(".info-page");
    let settingsPage = document.querySelector(".settings-page");

    let showLabelsBtn = document.querySelector(".show-labels-btn");

    showLabelsBtn.addEventListener("click", () => {
      onShowData();
    });

    drawerBtns.forEach((drawerBtn) => {
      drawerBtn.addEventListener("click", (e) => {
        let btn;
        if (e.target.type !== "submit") {
          btn = e.target.parentNode;
        } else {
          btn = e.target;
        }
        if (btn.classList.contains("drawer-info-btn")) {
          settingsPage.classList.add("removed");
          infoPage.classList.remove("removed");
        } else {
          infoPage.classList.add("removed");
          settingsPage.classList.remove("removed");
        }
        if (drawer.classList.contains("drawer-hide")) {
          drawer.classList.remove("drawer-hide");
          drawerInfoBtn.classList.remove("drawer-btn-hide");
          drawerSettingsBtn.classList.remove("drawer-btn-hide");
          btn.classList.add("active");
        } else {
          if (btn.classList.contains("active")) {
            drawer.classList.add("drawer-hide");
            drawerInfoBtn.classList.add("drawer-btn-hide");
            drawerSettingsBtn.classList.add("drawer-btn-hide");
            drawerBtns.forEach((b) => {
              b.classList.remove("active");
            });
          }
          drawerBtns.forEach((b) => {
            b.classList.remove("active");
          });
          if (!drawer.classList.contains("drawer-hide")) {
            btn.classList.add("active");
          }
        }
      });
    });

    modules.forEach((m) => {
      let moduleSection = document.createElement("div");
      let moduleHeader = document.createElement("div");
      let moduleh3 = document.createElement("h3");

      let arrowIcon = document.createElement("i");
      arrowIcon.classList.add("fas");
      arrowIcon.classList.add("fa-chevron-up");

      moduleHeader.classList.add("module-header");

      moduleHeader.appendChild(arrowIcon);
      moduleHeader.appendChild(moduleh3);

      moduleh3.innerText = m.name;
      moduleh3.addEventListener("click", (e) => {
        toggleMenu(e);
      });
      arrowIcon.addEventListener("click", (e) => {
        toggleMenu(e);
      });
      sliderSection.appendChild(moduleSection);
      moduleSection.appendChild(moduleHeader);
      moduleSection.classList.add("module-section");

      let params = m.parts;

      params.forEach((p) => {
        let componentDiv = document.createElement("div");
        let name = document.createElement("p");
        let componentLowerDiv = document.createElement("div");

        name.innerText = p.displayName;
        componentLowerDiv.appendChild(name);
        componentDiv.classList.add("slider-div");
        componentLowerDiv.classList.add("slider-lower-div");
        moduleSection.appendChild(componentDiv);

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
      });
      let sliders = document.querySelectorAll(".slider");
      console.log("ADDEED LOGIC");

      let labels = document.querySelectorAll("label");

      sliders.forEach((s) => {
        const value = +s.value;
        const label = s.parentNode.previousSibling;
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
    });
  })();
}

function toggleMenu(e) {
  let header = e.target;
  let arrow;
  if (header.classList.value.includes("fas")) {
    arrow = header;
  } else {
    arrow = header.previousSibling;
  }

  arrow.classList.toggle("spin");
  let moduleS = header.parentNode.parentNode;
  let sliders = moduleS.querySelectorAll(".slider-div");
  sliders.forEach((s) => {
    s.classList.toggle("menuhide");
  });
}

function addSliderLogic() {
  let sliders = document.querySelectorAll(".slider");
  // https://stackoverflow.com/questions/10756313/javascript-jquery-map-a-range-of-numbers-to-another-range-of-numbers
  // const scale = (num, in_min, in_max, out_min, out_max) => {
  //   return ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
  // };

  let labels = document.querySelectorAll("label");

  sliders.forEach((s) => {
    s.addEventListener("mouseup", (e) => {
      const label = e.target.nextElementSibling;
      label.classList.remove("show");
    });
  });
}

function onSettingsChange(element) {
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
  });

  let q = sliderParams.map((p) => {
    return `${p.name}=${p.value}`;
  });

  let query = q.join("&");
  (async () => {
    let data = await rhinoCall(query);
    document.getElementById("loader").style.display = "none";
    await removeObjectsFromScene();
    let charts = document.querySelectorAll(".chart-canvas");
    let dashboardImages = document.querySelectorAll(".img-container");
    let markdownDatas = document.querySelectorAll(".markdown-data");

    if (charts) {
      charts.forEach((chart) => {
        chart.remove();
      });
    }
    if (dashboardImages) {
      dashboardImages.forEach((img) => {
        img.remove();
      });
    }
    if (markdownDatas) {
      markdownDatas.forEach((data) => {
        data.remove();
      });
    }

    let model = await getModelFromContentful(modelName);
    let textureImage = model.texture;
    await addObjectsToScene(data, textureImage);
  })();
}
init();

async function rhinoCall(query) {
  let apiUrl = `/modelData/${modelName}?${query}`;
  const response = await fetch(apiUrl);
  const json = await response.json();
  return json;
}
