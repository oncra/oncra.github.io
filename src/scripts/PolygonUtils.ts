import { Coordinate } from "../models/Coordinate";
import { LatLonRange } from "../models/LatLonRange";
import { XY } from "../models/XY";
import { latMean2MPerLatLon } from "./CoordinatesUtils";
import { mean } from "./MathUtils";

export const polygon2LatLonRange = (polygon: Coordinate[]) : LatLonRange => {
  const lats = polygon.map(x => x.lat);
  const lons = polygon.map(x => x.lon);

  return {
    latMin: Math.min(...lats), 
    latMax: Math.max(...lats), 
    lonMin: Math.min(...lons), 
    lonMax: Math.max(...lons)
  };
}

export const polygon2XY = (polygon: Coordinate[]) : XY => {
  const lats = polygon.map(x => x.lat);
  const lons = polygon.map(x => x.lon);

  const latMean = mean(lats);
  const lonMean = mean(lons);
  const [mPerLat, mPerLon] = latMean2MPerLatLon(latMean);

  const x = lons.map(val => (val - lonMean) * mPerLon);
  const y = lats.map(val => (val - latMean) * mPerLat);

  return {
    x: x, 
    y: y, 
    mPerLat: mPerLat, 
    mPerLon: mPerLon,
    latMean: latMean,
    lonMean: lonMean
  };
}