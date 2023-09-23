import { CedaData } from "../../models/CedaData";
import { LatLonRange } from "../../models/LatLonRange";
import { callCedaEndpoint } from "./CedaHttpClient";
import { parseCedaResponse } from "./CedaResponseParser";

export const clientParams = {
  lat0: 80,
  lat1: -60,
  latCount: 157500,
  lon0: -180,
  lon1: 180,
  lonCount: 405000
};

export const getCedaData = async (year: number, latLonRange: LatLonRange) : Promise<CedaData | null> => {
  const latIndexStart = lat2Index(latLonRange.latMin);
  const latIndexEnd = lat2Index(latLonRange.latMax);
  const lonIndexStart = lon2Index(latLonRange.lonMin);
  const lonIndexEnd = lon2Index(latLonRange.lonMax);

  if (lonIndexEnd < clientParams.lonCount) {
    const cedaResponse = await callCedaEndpoint(year, latIndexStart, latIndexEnd, lonIndexStart, lonIndexEnd);
    if (cedaResponse == null) return null;
  
    const cedaData = parseCedaResponse(cedaResponse, year);
    return cedaData;
  }

  const lonIndexEnd1 = Math.min(lonIndexEnd, clientParams.lonCount - 1);
  const lonIndexEnd2 = lonIndexEnd % clientParams.lonCount;

  const [cedaResponse1, cedaResponse2] = await Promise.all([
    callCedaEndpoint(year, latIndexStart, latIndexEnd, lonIndexStart, lonIndexEnd1),
    callCedaEndpoint(year, latIndexStart, latIndexEnd, 0, lonIndexEnd2)
  ]);

  if (cedaResponse1 == null || cedaResponse2 == null) return null;

  const cedaData1 = parseCedaResponse(cedaResponse1, year);
  const cedaData2 = parseCedaResponse(cedaResponse2, year);
  
  for (let i=0; i<cedaData1.agb.length; i++) {
    cedaData1.agb[i].push.apply(cedaData1.agb[i], cedaData2.agb[i]);
  }
  cedaData1.lon.push.apply(cedaData1.lon, cedaData2.lon.map(v => v + 360));
  cedaData1.agbMax = Math.max(cedaData1.agbMax ?? 0, cedaData2.agbMax ?? 0);
  return cedaData1;
}

export const lat2Index = (lat: number): number => {
  const index = (lat - clientParams.lat0) * clientParams.latCount / 
    (clientParams.lat1 - clientParams.lat0);

  return Math.floor(index);
}

export const lon2Index = (lon: number): number => {
  const index = (lon - clientParams.lon0) * clientParams.lonCount / 
    (clientParams.lon1 - clientParams.lon0);

  return Math.floor(index);
}