import { Coordinate } from "../models/Coordinate";

export const parseKMLFile = (file: File) => {
  return new Promise<Coordinate[]>((resolve, reject) => {
    let kmlRawText: string;
    const fileReader = new FileReader();

    fileReader.onloadend = (e) => {
      kmlRawText = e.target?.result as string;
      const polygon = extractKMLMapCoords(kmlRawText);
      resolve(polygon);
    }
    fileReader.onerror = (e) => { reject(e); }

    fileReader.readAsText(file);
  });
}

const extractKMLMapCoords = (plainText: string) : Coordinate[] => {
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(plainText, "text/xml")
  const mapPolygon = []

  if (xmlDoc.documentElement.nodeName == "kml") {
    for (const item of xmlDoc.getElementsByTagName('Placemark')) {
      const polygon = item.getElementsByTagName('Polygon')[0];
      const coords = polygon.getElementsByTagName('coordinates')[0].childNodes[0].nodeValue!.trim();
      const points = coords.split(" ");
      for (const point of points) {
        const coord = point.split(",");
        mapPolygon.push({ lat: +coord[1], lon: +coord[0] });
      }
    }
  } else {
    throw "error while parsing";
  }

  return mapPolygon;
}