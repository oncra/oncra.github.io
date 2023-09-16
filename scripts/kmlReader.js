class KMLReader {
  filePolygon;

  parseDocument(file, callback) {
    if (file == undefined) return;

    let fileReader = new FileReader()
    fileReader.onload = async (e) => {
      let result = await this.extractMapCoords(e.target.result)

      this.filePolygon = result;
      callback();
    }
    fileReader.readAsText(file)
  }

  async extractMapCoords(plainText) {
    let parser = new DOMParser()
    let xmlDoc = parser.parseFromString(plainText, "text/xml")
    let mapPolygons = []

    if (xmlDoc.documentElement.nodeName == "kml") {

      for (const item of xmlDoc.getElementsByTagName('Placemark')) {
        let polygons = item.getElementsByTagName('Polygon')      
        for (const polygon of polygons) {
          let coords = polygon.getElementsByTagName('coordinates')[0].childNodes[0].nodeValue.trim()
          let points = coords.split(" ")

          let mapPolygonsPaths = []
          for (const point of points) {
            let coord = point.split(",")
            mapPolygonsPaths.push({ lat: +coord[1], lon: +coord[0] })
          }
          mapPolygons.push(mapPolygonsPaths)
        }
      }
    } else {
      throw "error while parsing"
    }

    return mapPolygons;
  }
}