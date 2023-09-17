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
const mapYear = document.querySelector("#mapYear");

let agbData = {};
let gridCrossDataMatrix;
let agbMax;

let file;
function onKMLChange (e) {
  file = e.target.files[0];
  dropZoneError.innerText = "";
  kmlFileName.innerText = file.name;
  kmlReader.parseDocument(file, onKMLParsed);
}

const dataTableYearCell = [
  document.querySelector("#dataTable_2010"),
  document.querySelector("#dataTable_2017"),
  document.querySelector("#dataTable_2018"),
  document.querySelector("#dataTable_2019"),
  document.querySelector("#dataTable_2020"),
];
const agbDataFieldNames = ["data2010", "data2017", "data2018", "data2019", "data2020"];
const years = [2010, 2017, 2018, 2019, 2020];

dataTableYearCell.forEach((tableField, index) => {
  tableField.parentNode.onclick = () => drawAGBDataIfExist(tableField, agbData[agbDataFieldNames[index]]);
});

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

  dataTableYearCell.forEach(tableField => updateDataFetchToLoading(tableField));

  await Promise.all(dataTableYearCell.map((tableField, index) => 
    cedaClient.getAGB(years[index], latIndexMax, latIndexMin, lonIndexMin, lonIndexMax)
      .then(function(val) { 
        handleFetchYearComplete(tableField, val, agbDataFieldNames[index]); 
        return val
      })
  ));

  agbMax = Math.max(
    agbData.data2010?.agbMax ?? 0, 
    agbData.data2017?.agbMax ?? 0, 
    agbData.data2018?.agbMax ?? 0, 
    agbData.data2019?.agbMax ?? 0, 
    agbData.data2020?.agbMax ?? 0);
  

  [latestData, latestDataIndex] = getLatestYearAgbData(agbData);
  dataTableYearCell[latestDataIndex].parentNode.click();

  innerOuterMapCanvas.drawInnerOuterMap(latestData, polygon, XYData.mPerLat / XYData.mPerLon);

  showHideOptionalData('block');
}

function getLatestYearAgbData(agbData) {
  for (var i=agbDataFieldNames.length-1; i>=0; i--) {
    const data = agbData[agbDataFieldNames[i]];
    if (data !== undefined) {
      return [data, i];
    }
  }
}

function getAgbMax(agbData) {
  let agbMax = 0;
  for (var i=0; i<agbDataFieldNames.length; i++) {
    const data = agbData[agbDataFieldNames[i]];
    const dataAgbMax = data?.agbMax ?? 0;
    if (dataAgbMax > agbMax) {
      agbMax = dataAgbMax;
    }
  }
  return agbMax;
}

function updateDataFetchToLoading(field) {
  field.innerHTML = field.dataset.value + " <div class='loader'></div>";
  for (var i=1; i<=3; i++) {
    field.parentNode.children[i].innerText = "";
  }

  field.parentNode.classList.remove("active");
  showHideOptionalData('none');
}

function handleFetchYearComplete(tableField, value, agbDataFieldName) {
  const isSuccess = updateDataFetchStatus(tableField, value);
  if (!isSuccess) return;
  
  parsedData = cedaDataParser.parse(value);
  agbData[agbDataFieldName] = parsedData;
  gridCrossDataMatrix = getGridCrossDataMatrixFromAGBPolygon(parsedData, polygon);
  agbValue = getAGBAverageFromGridCrossDataAndAgbData(gridCrossDataMatrix, parsedData);

  tableField.parentNode.children[1].innerText = toDecimalPlace(agbValue, 2);
  tableField.parentNode.children[2].innerText = getCarbon(agbValue);
  tableField.parentNode.children[3].innerText = getCO2Equivalent(agbValue);
}

function updateDataFetchStatus(tableField, value) {
  if (value.startsWith("Error")) {
    tableField.innerText = tableField.dataset.value + " ❌";
    return false;
  }
  tableField.innerText = tableField.dataset.value + " ✅";
  return true;
}

function showHideOptionalData(displayMode) {
  partialGridWarning.style.display = displayMode;
  agbCanvasContainer.style.display = displayMode;
  innerOuterMapCanvasContainer.style.display = displayMode;
}

function drawAGBDataIfExist(childCell, data) {
  console.log("plot data: ")
  console.log(data);

  if (data == undefined) return;
  
  const currentRow = document.querySelector("tr.active");
  if (currentRow !== null) currentRow.classList.remove("active");

  const selectedRow = childCell.parentNode;
  selectedRow.classList.add("active");
  mapYear.innerText = selectedRow.children[0].dataset.value
  

  agbCanvas.drawAGB(data, polygon, XYData, agbMax);
}