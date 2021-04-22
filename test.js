let rhOutDashboard = [
  {
    type: "System.String",
    data: `"{'type': 'image', 'data': {'datasets': [{'link': ['dash_001.jpg']}]}}"`,
    ResolvedData: null,
  },
  {
    type: "System.String",
    data: `"{'type': 'doughnut', 'data': {'labels': ['Office', 'Commercial'], 'datasets': [{'label': 'Program Distribution', 'backgroundColor': ['rgb(112,146,255,1.0)', 'rgb(80,171,41,1.0)'], 'hoverOffset': 4, 'data': [54000.0, 5000.0]}]}}"`,
    ResolvedData: null,
  },
  {
    type: "System.String",
    data: `"{'type': 'markdown', 'data': {'datasets': [{'string': '**Total Height: 59m**'}]}}"`,
    ResolvedData: null,
  },
  {
    type: "System.String",
    data: `"{'type': 'markdown', 'data': {'datasets': [{'string': '# Areas\\\\r\\\\n## Option 04\\\\r\\\\n**Total Area :14956sqm**\\\\r\\\\n-----\\\\nFloor 1\\\\nFloor 2\\\\nFloor 3\\\\nFloor 4\\\\nFloor 5\\\\nFloor 6\\\\nFloor 7\\\\nFloor 8\\\\nFloor 9\\\\nFloor 10\\\\nFloor 11\\\\nFloor 12\\\\nFloor 13\\\\nFloor 14\\\\nFloor 15\\\\nFloor 16\\\\nFloor 17\\\\nFloor 18\\\\nFloor 19\\\\nFloor 20'}]}}"`,
    ResolvedData: null,
  },
  {
    type: "System.String",
    data: `"{'type': 'line', 'data': {'labels': ['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4', 'Floor 5', 'Floor 6', 'Floor 7', 'Floor 8', 'Floor 9', 'Floor 10', 'Floor 11', 'Floor 12', 'Floor 13', 'Floor 14', 'Floor 15', 'Floor 16', 'Floor 17', 'Floor 18', 'Floor 19', 'Floor 20'], 'datasets': [{'label': 'Area per Floor (sqm)', 'tension': 0.10000000000000001, 'fill': 'false', 'borderColor': 'rgb(0,0,0,1.0)', 'data': [886.0, 929.0, 955.0, 981.0, 1000.0, 1009.0, 1008.0, 996.0, 973.0, 936.0, 886.0, 821.0, 741.0, 657.0, 573.0, 489.0, 405.0, 321.0, 237.0, 153.0]}]}}"`,
    ResolvedData: null,
  },
];

let a = rhOutDashboard.map((r) => {
  let data = r.data;

  let c = JSON.parse(data);

  let d = c.split("'");

  let e = d.join('"');
  let f = JSON.parse(e);

  return f;
});

let b = a.filter((o) => {
  return o.type == "doughnut" || o.type == "line";
});

console.log(b);

// let b = a[1];

// let c = JSON.parse(b);

// let d = c.split("'");

// let e = d.join('"');
// let f = JSON.parse(e);

// let hej1 = rhOutDashboard.map((r) => {
//   let data = r.data;
//   let arr = data.split("'");
//   let joinedArr = arr.join('"');
//   return joinedArr;
//   // let newStuff = JSON.parse(joinedArr[0]);
//   // joinedArr.forEach((a) => {
//   //   let b = JSON.parse(a);
//   //   jsonBlob.push(b);
//   // });
// });

// let a = hej1[0];

// let b = JSON.parse(a);

// console.log(a);

// hej2 = JSON.parse(hej1[1]);

// let hej2 = hej1[2];

// let hej3 = hej2
//   .replace(/\\n/g, "\\n")
//   .replace(/\\'/g, "\\'")
//   .replace(/\\"/g, '\\"')
//   .replace(/\\&/g, "\\&")
//   .replace(/\\r/g, "\\r")
//   .replace(/\\t/g, "\\t")
//   .replace(/\\b/g, "\\b")
//   .replace(/\\f/g, "\\f");
// // remove non-printable and other non-valid JSON chars
// let hej4 = hej3.replace(/[\u0000-\u0019]+/g, "");

// hej5 = JSON.stringify(hej4);

// let hej6 = JSON.parse(hej5);
