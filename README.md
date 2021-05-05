# Documentation

White out is a web application that dynamically handles 3d-models in grasshopper-files along with information regarding the model. The application generates a web page which can be reached by a third party through password where the third party can interact with the model and make adjustments according to parameters given in the grasshopper-file.

It was built with great help from [Express.js](https://github.com/expressjs/express), [RhinoCompute](https://github.com/mcneel/compute.rhino3d), [three.js](https://github.com/mrdoob/three.js/) and [Contentful](https://www.contentful.com/).

### INSTALLATION

-- Download the project --

1.  Go to the root folder of the project
2.  Check version of node by writing node -v in the terminal. You will need a version that is 14.0 or newer.
3.  Write npm install in the terminal.
    (the dependencies should be installed)
4.  Start the project by writing node index.js in the terminal.
5.  The project will start and the page should be available in the browser at localhost:3000.
    (If you wish to change the port you do it by changing the PORT value in the .env-file.)

### ADD A NEW MODEL

1. Add the gh-file to the project folder called “Models”. Save the name of the file for later.

   <img src="/readme-images/gh-model.png" width="100%">

2. Go to Contentful and press “Add Model”.

   <img src="/readme-images/add-model.jpg" width="100%">

3. Fill out Title, Short description and Description.

   <img src="/readme-images/title-description.png" width="100%">

4. When you get to field named slug **make sure that you fill out the exact same name as you gave the model**. IE: if the model file is named 200-yr-pavilion.gh, then the slug should be 200-yr-pavilion. The slug is what connects to the model, so this step is very important.

   <img src="/readme-images/slug.png" width="100%">

5. On params, you fill out the models parameters which you declared in the gh-file. For example of how the file should be built, see previous models. **Make sure that you name the parameters the exact way that you do in the gh-file.**

   <img src="/readme-images/json.png" width="100%">

6. Fill out the password that will be required to view the model in the browser

   <img src="/readme-images/password.png" width="100%">

7. Add an image for the texture of the model by pressing "+ Add media". You can either choose an image that you've uploaded before by choosing "Add existing media", or upload a new image by choosing "Add new media". If you choose add new media, new page will pop up where you have a menu out to the left where you can choose which image to use.

   <img src="/readme-images/choose-image.png" width="100%">

8. Add a logo that will be visible along with the model in the browser by pressing "+ Add media". Please see instructions in #7 for a more detailed description on how contentful handles media.

Below you see how the logo will be displayed on the website.

   <img src="/readme-images/logo.png" width="100%">

9. Choose images that will be added as a gallery along with information regarding the model. Do so by pressing "+ Add media". Please see instructions in #7 for a more detailed description on how contentful handles media.

   Below you see how it will look when the title, description and images are displayed on the web page:

   <img src="/readme-images/menu.png" width="100%">

10. If you wish, set a starting camera position for the model. This will edit the angle of which the model is displayed in the browser. It takes a JSON-object with x y and z-parameters. Example: {"x": -20000, "y": 70000, "z": -150000}. If you leave this field empty, a standardised camera angle will be set.

    <img src="/readme-images/json.png" width="100%">

### ADD DASHBOARD VIA GRASSHOPPER

There are 3 types of dashboard-data that are acceptable to include in the grasshopper-file - images, charts and markdown-text. These should be declared in JSON-format with structure according to the example below. If you add images to the model via the gh-file, the image it self must be put into the folder named images within the Public-folder of the application.

`[{“type":"image","data":{"datasets":[{"link":["dash_001.jpg"]}]}},{"type":"doughnut","data":{"labels":["Office","Commercial"],"datasets":[{"label":"Program Distribution","backgroundColor":["rgb(112,146,255,1.0)","rgb(80,171,41,1.0)"],"hoverOffset":4,"data":[54000,5000]}]}},{"type":"markdown","data":{"datasets":[{"string":"**Total Height: 59m**"}]}},{"type":"markdown","data":{"datasets":[{"string":"# Areas\r\n## Option 04\r\n**Total Area :14956sqm**\r\n-----\nFloor 1\nFloor 2\nFloor 3\nFloor 4\nFloor 5\nFloor 6\nFloor 7\nFloor 8\nFloor 9\nFloor 10\nFloor 11\nFloor 12\nFloor 13\nFloor 14\nFloor 15\nFloor 16\nFloor 17\nFloor 18\nFloor 19\nFloor 20"}]}},{"type":"line","data":{"labels":["Floor 1","Floor 2","Floor 3","Floor 4","Floor 5","Floor 6","Floor 7","Floor 8","Floor 9","Floor 10","Floor 11","Floor 12","Floor 13","Floor 14","Floor 15","Floor 16","Floor 17","Floor 18","Floor 19","Floor 20"],"datasets":[{"label":"Area per Floor (sqm)","tension":0.1,"fill":"false","borderColor":"rgb(0,0,0,1.0)","data":[886,929,955,981,1000,1009,1008,996,973,936,886,821,741,657,573,489,405,321,237,153]}]}}]`

**The available chart types are:**
`"doughnut","line", "bar", "radar","area", "bubble","polarArea","scatter"`

### REMOVE A MODEL

1. Go to contentful

2. Press the “Content”-tab to get a list of all published models.

   <img src="/readme-images/delete-1.jpg" width="100%">

3. Click on the one that you wish to remove

4. Press the three dots “…” up to the right and then delete.

   <img src="/readme-images/delete-2.jpg" width="100%">

5. Remove the gh-file from the projects "Models"-folder

### GET ERRORS? MAKE SURE:

- that the name of the model-file is the same as the slug in contentful. If you named the model “200-yr-pavilion.gh”, the slug must be 200-yr-pavilion.

- that the parameters in the grasshopper file is the same as the ones you put in the JSON-object in contentful.

### BACKLOG

- Interact with model (mouse over)
- Model for external links
- Get visual info regarding functionality when adjusting parameters in model.
- Ability to add dropdowns in grasshopper file.
- Introduce additional environment to view model in
- Ability to save model settings scene
- Ability to set different shadows and lighting
- Ability to download model
- Build pipeline (CI/CD)
- Performance / Caching model calculations
- Real security for customer password
- Improvements to support a way of working process to be able to distribute 100 models rather than 20
