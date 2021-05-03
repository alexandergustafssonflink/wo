## Documentation

White out is a web application that dynamically handles 3d-models in grasshoper-files along with information regarding the model. The application generates a web page which can be reached by a customer through password where the customer can interact with the model and make adjustments according to parameters given in the grasshopper-file.

It was built with great help from express.js, rhinocompute, three.js and contentful.

### ADD A NEW MODEL

1. Add the gh-file to the folder called “models”. Save the name of the file.
2. Go to Contentful and press “Add Model”.
3. Fill out Title, short description and Description.
4. When you get to slug **make sure that you fill out the exact same name as you gave the model**. IE: if the model file is named 200-yr-pavilion.gh, then the slug should be 200-yr-pavilion. The slug is what connects to the model, so this step is very important.
5. On params, you fill out the models parameters which you declared in the gh-file. For example of how the file should be built, see previous models. **Make sure that you name the parameters the exact way that you do in the gh-file.**
6. Fill out the password that will be required to view the model in the browser
7. Add an image for the texture of the model.
8. Add a logo that will be visible along with the model In the browser
9. Choose images that will be added as a gallery along with information regarding the model
10. If you wish, set a starting camera position for the model. This will edit the angle of which the model is displayed in the browser. It takes a JSON-object with x y and z-parameters. Example: {"x": -20000, "y": 70000, "z": -150000}. If you leave this field empty, a standardised camera angle will be set.

### ADD DASHBOARD VIA GRASSHOPPER

There are 3 types of dashboard-data that are acceptable to include in the grasshopper-file - images, charts and markdown-text. These should be declared in JSON-format with structure according to the example below. If you add images to the model via the gh-file, the image it self must be put into the folder named images within the Public-folder of the application.

`[{“type":"image","data":{"datasets":[{"link":["dash_001.jpg"]}]}},{"type":"doughnut","data":{"labels":["Office","Commercial"],"datasets":[{"label":"Program Distribution","backgroundColor":["rgb(112,146,255,1.0)","rgb(80,171,41,1.0)"],"hoverOffset":4,"data":[54000,5000]}]}},{"type":"markdown","data":{"datasets":[{"string":"**Total Height: 59m**"}]}},{"type":"markdown","data":{"datasets":[{"string":"# Areas\r\n## Option 04\r\n**Total Area :14956sqm**\r\n-----\nFloor 1\nFloor 2\nFloor 3\nFloor 4\nFloor 5\nFloor 6\nFloor 7\nFloor 8\nFloor 9\nFloor 10\nFloor 11\nFloor 12\nFloor 13\nFloor 14\nFloor 15\nFloor 16\nFloor 17\nFloor 18\nFloor 19\nFloor 20"}]}},{"type":"line","data":{"labels":["Floor 1","Floor 2","Floor 3","Floor 4","Floor 5","Floor 6","Floor 7","Floor 8","Floor 9","Floor 10","Floor 11","Floor 12","Floor 13","Floor 14","Floor 15","Floor 16","Floor 17","Floor 18","Floor 19","Floor 20"],"datasets":[{"label":"Area per Floor (sqm)","tension":0.1,"fill":"false","borderColor":"rgb(0,0,0,1.0)","data":[886,929,955,981,1000,1009,1008,996,973,936,886,821,741,657,573,489,405,321,237,153]}]}}]`

### REMOVE A MODEL

1. Go to contentful
2. Press the “Content-tab” to get a list of all published models.
3. Click on the one that you wish to remove
4. Press the three dots “…” up to the right and then delete.
5. Remove the gh-file from the Models-folder

### CHECKLIST IF ERRORS

- Make sure that the name of the model-file is the same as the slug in contenful. If you named the model “200-yr-pavilion.gh”, the slug must be 200-yr-pavilion.
- Make sure that the parameters in the grasshopper file is the same as the ones you put in the JSON-blob in contentful
