import { LatLonRange } from "../../models/LatLonRange";
import { getSecondsElapsed } from "../TimeUtils";

const retryTimeoutSeconds = 1;

const clientParams = {
  lat0: 80,
  lat1: -60,
  latCount: 157500,
  lon0: -180,
  lon1: 180,
  lonCount: 405000
};

export const callCedaEndpoint = async (year: number, latLonRange: LatLonRange): Promise<string | null> => {
  const latIndexStart = lat2Index(latLonRange.latMax);
  const latIndexEnd = lat2Index(latLonRange.latMin);
  const lonIndexStart = lon2Index(latLonRange.lonMin);
  const lonIndexEnd = lon2Index(latLonRange.lonMax);

  const url ="https://dap.ceda.ac.uk/thredds/dodsC/neodc/esacci/biomass/data/agb/maps/v4.0/netcdf/" + 
  `ESACCI-BIOMASS-L4-AGB-MERGED-100m-${year}-fv4.0.nc.ascii` + 
  `?agb[0:1:0][${latIndexStart}:1:${latIndexEnd}][${lonIndexStart}:1:${lonIndexEnd}]`;

  const startTime = new Date();
  let response = await fetch(url);

  while (response.status !== 200 && response.status !== 400 && getSecondsElapsed(startTime) < retryTimeoutSeconds) {
    response = await fetch(url);
  }

  if (response.status !== 200) return null;
  
  const str = await response.text();
  return str;
}

const lat2Index = (lat: number): number => {
  const index = (lat - clientParams.lat0) * clientParams.latCount / 
    (clientParams.lat1 - clientParams.lat0);

  return Math.floor(index);
}

const lon2Index = (lon: number): number => {
  const index = (lon - clientParams.lon0) * clientParams.lonCount / 
    (clientParams.lon1 - clientParams.lon0);

  return Math.floor(index);
}