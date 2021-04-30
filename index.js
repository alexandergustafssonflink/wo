const express = require("express");
const app = express();
const fetch = require("node-fetch");
const rhino3dm = require("rhino3dm");
const RhinoCompute = require("compute-rhino3d");
require("dotenv").config();
var fs = require("file-system");
const contentful = require("contentful");
const richText = require("@contentful/rich-text-html-renderer");

const client = contentful.createClient({
  space: "ixvvc8rtq4c0",
  accessToken: "3yRd8Ffv9EgAFYey8-ij76coveHRFL13hgPv07aOQgg",
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening at ${port}`);
});
app.use(express.static("Public"));
app.use(express.json({ limit: "100mb" }));

let richTextToHtmlString = richText.documentToHtmlString;

app.get("/contentful", async (req, res) => {
  client
    .getEntries({
      content_type: "model",
    })
    .then((entries) => {
      let models = entries.items;
      res.json({
        models,
      });
    }, []);
});

app.get("/contentful/:slug", async (req, res) => {
  const slug = req.params.slug;

  client
    .getEntries({
      content_type: "model",
      "fields.slug": slug,
    })
    .then((entries) => {
      let model = entries.items[0];
      let description = richTextToHtmlString(model.fields.description);
      res.json({
        Title: model.fields.title,
        description: description,
        shortDescription: model.fields.shortDescription,
        slug: model.fields.slug,
        params: model.fields.params, // model: model.fields.model.fields.file.url,
        password: model.fields.password,
        texture: model.fields.texture.fields.file.url,
        logo: model.fields.logo.fields.file.url,
        images: model.fields.modelImages,
        cameraPosition: model.fields.cameraPosition,
      });
    }, []);
});

app.get("/modelData/:modelName/", async (request, response) => {
  const modelName = request.params.modelName;

  //implement Rhino Compute
  let args = {
    algo: null,
    pointer: null,
    values: [],
  };

  let definition = null;

  rhino3dm().then(async (m) => {
    console.log("Loaded rhino3dm.");

    rhino = m; // global

    // authenticate
    // Token owned by White Arkitekter AB
    RhinoCompute.authToken = process.env.RC_KEY;

    //' load a .gh (binary) file!
    let { Response } = fetch;
    let url = `Models/${modelName}.gh`;
    let stream = await fs.createReadStream(url);
    let res = new Response(stream);
    let buffer = await res.arrayBuffer();
    let arr = new Uint8Array(buffer);
    definition = arr;

    //call rhino comptute to process grasshopper function
    let trees = [];

    for (var propName in request.query) {
      if (request.query.hasOwnProperty(propName)) {
        let par = new RhinoCompute.Grasshopper.DataTree("RH_IN:" + propName);

        let paramValue = request.query[propName];
        // if (propName == "Building_Type") {
        //   paramValue = "1";
        //   par.append([0], [paramValue]);
        // } else if (propName == "Options") {
        //   paramValue = "Option 01";
        //   par.append([0], [paramValue]);
        // } else {
        //   par.append([0], [paramValue]);
        // }

        par.append([0], [paramValue]);

        trees.push(par);
      }
    }
    RhinoCompute.Grasshopper.evaluateDefinition(definition, trees).then(
      (result) => {
        let rhOutGeometry = null;
        let rhOutGeometry2 = null;
        let rhOutMaterial = null;
        let rhOutText = null;
        let rhOutTextPt = null;
        let rhOutDashboard = null;

        for (let i = 0; i < result.values.length; i++) {
          let outputParamValue = result.values[i].InnerTree["{0}"];
          if (outputParamValue == null) {
            outputParamValue = result.values[i].InnerTree["{ 0; }"];
          }

          if (
            result.values[i].ParamName === "RH_OUT:Mesh" ||
            result.values[i].ParamName === "RH_OUT:MESH" ||
            result.values[i].ParamName === "RH_OUT:GEO"
          ) {
            rhOutGeometry = outputParamValue;
          }
          if (result.values[i].ParamName === "RH_OUT:Material") {
            rhOutMaterial = outputParamValue;
          }
          if (result.values[i].ParamName === "RH_OUT:Text") {
            rhOutText = outputParamValue;
          }
          if (result.values[i].ParamName === "RH_OUT:TextPt") {
            rhOutTextPt = outputParamValue;
          }
          if (result.values[i].ParamName === "RH_OUT:Dashboard") {
            rhOutDashboard = outputParamValue;
          }
        }

        let rhinoResult = [];
        //unpack rhino to mesh
        for (let i = 0; i < rhOutGeometry.length; i++) {
          let data = JSON.parse(rhOutGeometry[i].data);

          let mesh = rhino.CommonObject.decode(data);

          //create threejsJnson and swithces Y and Z for meshes
          let meshThree = mesh.toThreejsJSON(true);

          let materialToAssign = null;

          let matName = null;
          if (rhOutMaterial && rhOutMaterial[i].data) {
            matName = JSON.parse(rhOutMaterial[i].data);
          }

          rhinoResult.push({ meshThree: meshThree, material: matName });
        }

        let dataDashboard;

        if (rhOutDashboard) {
          let a = rhOutDashboard.map((r) => {
            let data = r.data;
            let c = JSON.parse(data);
            let d = c.split("'");
            let e = d.join('"');
            let f = JSON.parse(e);

            return f;
          });

          dataDashboard = a;
        }

        //second half of tags does not return points
        let rhinoLabels = [];

        if (rhOutText) {
          for (let i = 0; i < rhOutText.length; i++) {
            if (!(rhOutText[i] == null || rhOutTextPt[i] == null)) {
              let text = JSON.parse(rhOutText[i].data);
              let tetxPt = JSON.parse(rhOutTextPt[i].data);
              rhinoLabels.push({ label: text, labelPosition: tetxPt });
            }
          }
        }

        let json = {
          volumes: rhinoResult,
          labels: rhinoLabels,
          dashBoard: dataDashboard,
        };
        response.json(json);
      }
    );
  });
});

app.get("*", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});
