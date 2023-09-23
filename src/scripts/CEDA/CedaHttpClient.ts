import { getSecondsElapsed } from "../TimeUtils";

const retryTimeoutSeconds = 1;

export const callCedaEndpoint = async (year: number, latIndexEnd: number, latIndexStart: number, lonIndexStart: number, lonIndexEnd: number, ): Promise<string | null> => {
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