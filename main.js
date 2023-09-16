const coordinates = new Coordinates({
  lat0: 80,
  lat1: -60,
  latCount: 157500,
  lon0: -180,
  lon1: 180,
  lonCount: 405000
});

const cedaClient = new CedaClient();
const cedaDataParser = new CedaDataParser();
const kmlReader = new KMLReader();
let latMin;
let latMax;
let lonMin;
let lonMax;

const dropZoneError = document.querySelector("#dropZoneError");
const kmlFileName = document.querySelector("#kmlFileName");

const apiButton = document.querySelector("#apiButton");

let data2010;
let data2017;
let data2018;
let data2019;
let data2020;

let file;
function onKMLChange (e) {
  file = e.target.files[0];
  dropZoneError.innerText = "";
  kmlFileName.innerText = file.name;
  kmlReader.parseDocument(file, onKMLParsed);
}
const agbMaxValueField = document.querySelector("#agbMaxValue");
const dataTable_2010 = document.querySelector("#dataTable_2010");
const dataTable_2017 = document.querySelector("#dataTable_2017");
const dataTable_2018 = document.querySelector("#dataTable_2018");
const dataTable_2019 = document.querySelector("#dataTable_2019");
const dataTable_2020 = document.querySelector("#dataTable_2020");

const kmlCanvas = new CanvasService(document.querySelector("#kmlCanvas"));
const colourScaleCanvas = new CanvasService(document.querySelector("#colourScaleCanvas"));
const agbCanvas_2010 = new CanvasService(document.querySelector("#agbCanvas_2010"));
const agbCanvas_2017 = new CanvasService(document.querySelector("#agbCanvas_2017"));
const agbCanvas_2018 = new CanvasService(document.querySelector("#agbCanvas_2018"));
const agbCanvas_2019 = new CanvasService(document.querySelector("#agbCanvas_2019"));
const agbCanvas_2020 = new CanvasService(document.querySelector("#agbCanvas_2020"));

colourScaleCanvas.drawColourBar();

function onKMLParsed() {
  const polygon = kmlReader.filePolygon[0];
  [latMin, latMax, lonMin, lonMax] = coordinates.polygon2LatLonRange(polygon);
  const {xy, mPerLat, mPerLon} = coordinates.polygon2XY(polygon);
  kmlCanvas.drawXY(xy);

  apiButton.click();
}

async function callCedaEndpoints() {
  const latIndexMin = coordinates.lat2Index(latMin);
  const latIndexMax = coordinates.lat2Index(latMax);
  const lonIndexMin = coordinates.lon2Index(lonMin);
  const lonIndexMax = coordinates.lon2Index(lonMax);

  updateDataFetchToLoading(dataTable_2010);
  updateDataFetchToLoading(dataTable_2017);
  updateDataFetchToLoading(dataTable_2018);
  updateDataFetchToLoading(dataTable_2019);
  updateDataFetchToLoading(dataTable_2020);

  const [response2010, response2017, response2018, response2019, response2020] = await Promise.all([
    cedaClient.getAGB(2010, latIndexMax, latIndexMin, lonIndexMin, lonIndexMax).then(function(val) { updateDataFetchStatus(dataTable_2010, val); return val}),
    cedaClient.getAGB(2017, latIndexMax, latIndexMin, lonIndexMin, lonIndexMax).then(function(val) { updateDataFetchStatus(dataTable_2017, val); return val}),
    cedaClient.getAGB(2018, latIndexMax, latIndexMin, lonIndexMin, lonIndexMax).then(function(val) { updateDataFetchStatus(dataTable_2018, val); return val}),
    cedaClient.getAGB(2019, latIndexMax, latIndexMin, lonIndexMin, lonIndexMax).then(function(val) { updateDataFetchStatus(dataTable_2019, val); return val}),
    cedaClient.getAGB(2020, latIndexMax, latIndexMin, lonIndexMin, lonIndexMax).then(function(val) { updateDataFetchStatus(dataTable_2020, val); return val}),
  ]);

  data2010 = cedaDataParser.parse(response2010);
  data2017 = cedaDataParser.parse(response2017);
  data2018 = cedaDataParser.parse(response2018);
  data2019 = cedaDataParser.parse(response2019);
  data2020 = cedaDataParser.parse(response2020);

  const agbMax = Math.max(data2010.agbMax, data2017.agbMax, data2018.agbMax, data2019.agbMax, data2020.agbMax);
  agbMaxValueField.innerText = `${agbMax} Mg/ha`;

  agbCanvas_2010.drawAGB(data2010, agbMax);
  agbCanvas_2017.drawAGB(data2017, agbMax);
  agbCanvas_2018.drawAGB(data2018, agbMax);
  agbCanvas_2019.drawAGB(data2019, agbMax);
  agbCanvas_2020.drawAGB(data2020, agbMax);
}

function updateDataFetchToLoading(field) {
  field.innerText = field.dataset.value + " ⏳";
}

function updateDataFetchStatus(field, value) {
  if (value.startsWith("Error")) {
    return field.innerText = field.dataset.value + " ❌";
  }
  field.innerText = field.dataset.value + " ✅";
}