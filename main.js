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
let gridCrossDataMatrix;

let file;
function onKMLChange (e) {
  file = e.target.files[0];
  dropZoneError.innerText = "";
  kmlFileName.innerText = file.name;
  kmlReader.parseDocument(file, onKMLParsed);
}
const dataTable_2010 = document.querySelector("#dataTable_2010");
const dataTable_2017 = document.querySelector("#dataTable_2017");
const dataTable_2018 = document.querySelector("#dataTable_2018");
const dataTable_2019 = document.querySelector("#dataTable_2019");
const dataTable_2020 = document.querySelector("#dataTable_2020");

const agbCanvasContainer = document.querySelector("#agbCanvasContainer");
const innerOuterMapCanvasContainer = document.querySelector("#innerOuterMapCanvasContainer");
const partialGridWarning = document.querySelector("#partialGridWarning");

const kmlCanvas = new CanvasService(document.querySelector("#kmlCanvas"));
const agbCanvas = new CanvasService(document.querySelector("#agbCanvas"));
const innerOuterMapCanvas = new CanvasService(document.querySelector("#innerOuterMapCanvas"));
let XYData;
let polygon;

function onKMLParsed() {
  polygon = kmlReader.filePolygon[0];
  [latMin, latMax, lonMin, lonMax] = coordinates.polygon2LatLonRange(polygon);
  XYData = coordinates.polygon2XY(polygon);
  kmlCanvas.drawXY(XYData.xy);

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

  agbCanvas.drawAGB(data2020, polygon, XYData, agbMax);

  innerOuterMapCanvas.drawInnerOuterMap(data2020, polygon, XYData.mPerLat / XYData.mPerLon);
  
  gridCrossDataMatrix = getGridCrossDataMatrixFromAGBPolygon(data2020, polygon);

  showHideOptionalData('block');

  agbValue2010 = getAGBAverageFromGridCrossDataAndAgbData(gridCrossDataMatrix, data2010);
  agbValue2017 = getAGBAverageFromGridCrossDataAndAgbData(gridCrossDataMatrix, data2017);
  agbValue2018 = getAGBAverageFromGridCrossDataAndAgbData(gridCrossDataMatrix, data2018);
  agbValue2019 = getAGBAverageFromGridCrossDataAndAgbData(gridCrossDataMatrix, data2019);
  agbValue2020 = getAGBAverageFromGridCrossDataAndAgbData(gridCrossDataMatrix, data2020);

  dataTable_2010.parentNode.children[1].innerText = toDecimalPlace(agbValue2010, 2);
  dataTable_2017.parentNode.children[1].innerText = toDecimalPlace(agbValue2017, 2);
  dataTable_2018.parentNode.children[1].innerText = toDecimalPlace(agbValue2018, 2);
  dataTable_2019.parentNode.children[1].innerText = toDecimalPlace(agbValue2019, 2);
  dataTable_2020.parentNode.children[1].innerText = toDecimalPlace(agbValue2020, 2);

  dataTable_2010.parentNode.children[2].innerText = getCarbon(agbValue2010);
  dataTable_2017.parentNode.children[2].innerText = getCarbon(agbValue2017);
  dataTable_2018.parentNode.children[2].innerText = getCarbon(agbValue2018);
  dataTable_2019.parentNode.children[2].innerText = getCarbon(agbValue2019);
  dataTable_2020.parentNode.children[2].innerText = getCarbon(agbValue2020);

  dataTable_2010.parentNode.children[3].innerText = getCO2Equivalent(agbValue2010);
  dataTable_2017.parentNode.children[3].innerText = getCO2Equivalent(agbValue2017);
  dataTable_2018.parentNode.children[3].innerText = getCO2Equivalent(agbValue2018);
  dataTable_2019.parentNode.children[3].innerText = getCO2Equivalent(agbValue2019);
  dataTable_2020.parentNode.children[3].innerText = getCO2Equivalent(agbValue2020);
}

function updateDataFetchToLoading(field) {
  field.innerHTML = field.dataset.value + " <div class='loader'></div>";
  for (var i=1; i<=3; i++) {
    field.parentNode.children[i].innerText = "";
  }

  showHideOptionalData('none');
}

function updateDataFetchStatus(field, value) {
  if (value.startsWith("Error")) {
    return field.innerText = field.dataset.value + " ❌";
  }
  field.innerText = field.dataset.value + " ✅";
}

function showHideOptionalData(displayMode) {
  partialGridWarning.style.display = displayMode;
  agbCanvasContainer.style.display = displayMode;
  innerOuterMapCanvasContainer.style.display = displayMode;
}