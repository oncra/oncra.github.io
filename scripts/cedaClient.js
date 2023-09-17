class CedaClient {
  async getAGB(year, latIndexStart, latIndexEnd, lonIndexStart, lonIndexEnd) {
    const url = "https://dap.ceda.ac.uk/thredds/dodsC/neodc/esacci/biomass/data/agb/maps/v4.0/netcdf/" + 
      `ESACCI-BIOMASS-L4-AGB-MERGED-100m-${year}-fv4.0.nc.ascii` + 
      `?agb[0:1:0][${latIndexStart}:1:${latIndexEnd}][${lonIndexStart}:1:${lonIndexEnd}]`;

    const retryTimeoutSeconds = 60;

    const startTime = new Date();
    let response = await fetch(url);
    let timeNow = new Date();

    while (response.status !== 200 && response.status !== 400 && timeNow - startTime < retryTimeoutSeconds * 1000) {
      response = await fetch(url);
      timeNow = new Date();
    }

    const str = await response.text();
    return str;
  }
}