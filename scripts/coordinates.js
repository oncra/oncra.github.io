class Coordinates {
  constructor(coordinatesConfig) {
    this.coordinatesConfig = coordinatesConfig;
  }

  lat2Index(lat) {
    let index = (lat - this.coordinatesConfig.lat0) * this.coordinatesConfig.latCount / 
      (this.coordinatesConfig.lat1 - this.coordinatesConfig.lat0);

    return Math.round(index);
  }

  lon2Index(lon) {
    let index = (lon - this.coordinatesConfig.lon0) * this.coordinatesConfig.lonCount / 
      (this.coordinatesConfig.lon1 - this.coordinatesConfig.lon0);

    return Math.round(index);
  }
}