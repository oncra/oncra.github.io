dropZone = document.querySelector("#dropZone");

function dropHandler(ev) {
  ev.preventDefault();
  dropZone.classList.remove("active");

  if (ev.dataTransfer.items.length > 1) {
    dropZoneError.innerText = "Cannot upload more than 1 file."
    return;
  }

  const item = ev.dataTransfer.items[0];
  if (item.kind !== "file" || item.type !== 'application/vnd.google-earth.kml+xml') {
    dropZoneError.innerText = "Upload must be a .kml file."
    return;
  }

  const file = item.getAsFile();
  dropZoneError.innerText = "";
  kmlFileName.innerText = file.name;
  kmlReader.parseDocument(file, onKMLParsed);
}

function dragOverHandler(ev) {
  ev.preventDefault();

  dropZone.classList.add("active");
}

function dragLeaveHandler() {
  dropZone.classList.remove("active");
}

window.addEventListener("dragover",function(e){
  e = e
  e.preventDefault();
},false);
window.addEventListener("drop",function(e){
  e = e
  e.preventDefault();
},false);