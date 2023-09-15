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

const apiButton = document.querySelector("#apiButton");
const latMinField = document.querySelector("#latMin");
const latMaxField = document.querySelector("#latMax");
const lonMinField = document.querySelector("#lonMin");
const lonMaxField = document.querySelector("#lonMax");
const viewer = document.querySelector("#viewer");

let data2010;
let data2017;
let data2018;
let data2019;
let data2020;

async function handleApiButtonClick() {
  const latIndexMin = coordinates.lat2Index(parseFloat(latMinField.value));
  const latIndexMax = coordinates.lat2Index(parseFloat(latMaxField.value));
  const lonIndexMin = coordinates.lat2Index(parseFloat(lonMinField.value));
  const lonIndexMax = coordinates.lat2Index(parseFloat(lonMaxField.value));

  viewer.innerHTML = "Calling API to get AGB data... (could take up to 60 seconds)"

  console.log([latIndexMax, latIndexMin, lonIndexMin, lonIndexMax]);
  console.log("calling api...");

  const [response2010, response2017, response2018, response2019, response2020] = await Promise.all([
    cedaClient.getAGB(2010, latIndexMax, latIndexMin, lonIndexMin, lonIndexMax).then(function(val) { viewer.innerHTML += "<br>2010 done"; return val}),
    cedaClient.getAGB(2017, latIndexMax, latIndexMin, lonIndexMin, lonIndexMax).then(function(val) { viewer.innerHTML += "<br>2017 done"; return val}),
    cedaClient.getAGB(2018, latIndexMax, latIndexMin, lonIndexMin, lonIndexMax).then(function(val) { viewer.innerHTML += "<br>2018 done"; return val}),
    cedaClient.getAGB(2019, latIndexMax, latIndexMin, lonIndexMin, lonIndexMax).then(function(val) { viewer.innerHTML += "<br>2019 done"; return val}),
    cedaClient.getAGB(2020, latIndexMax, latIndexMin, lonIndexMin, lonIndexMax).then(function(val) { viewer.innerHTML += "<br>2020 done"; return val}),
  ]);

  data2010 = cedaDataParser.parse(response2010);
  data2017 = cedaDataParser.parse(response2017);
  data2018 = cedaDataParser.parse(response2018);
  data2019 = cedaDataParser.parse(response2019);
  data2020 = cedaDataParser.parse(response2020);

  viewer.innerHTML = "Year: 2010" + dataToComponentsTable(data2010) + "<br>";
  viewer.innerHTML += "Year: 2017" + dataToComponentsTable(data2017) + "<br>";
  viewer.innerHTML += "Year: 2018" + dataToComponentsTable(data2018) + "<br>";
  viewer.innerHTML += "Year: 2019" + dataToComponentsTable(data2019) + "<br>";
  viewer.innerHTML += "Year: 2020" + dataToComponentsTable(data2020) + "<br>";
}

function dataToComponentsTable(data) {
  return data.agb.map(line => "<div>" + line.map(value => "<div class='tableCell'>" + value + "</div>").join("") + "</div>").join("");
}