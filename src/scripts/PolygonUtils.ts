import { Coordinate } from "../models/Coordinate";
import { LatLonRange } from "../models/LatLonRange";

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