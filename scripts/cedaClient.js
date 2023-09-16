class CedaClient {
  async getAGB(year, latIndexStart, latIndexEnd, lonIndexStart, lonIndexEnd) {
    const url = "https://dap.ceda.ac.uk/thredds/dodsC/neodc/esacci/biomass/data/agb/maps/v4.0/netcdf/" + 
      `ESACCI-BIOMASS-L4-AGB-MERGED-100m-${year}-fv4.0.nc.ascii` + 
      `?agb[0:1:0][${latIndexStart}:1:${latIndexEnd}][${lonIndexStart}:1:${lonIndexEnd}]`;

    const response = await fetch(url);
    const str = await response.text();
    return str;
  }
}