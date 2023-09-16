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

  polygon2LatLonRange(polygon) {
    const lats = polygon.map(x => x.lat);
    const lons = polygon.map(x => x.lon);

    return [Math.min(...lats), Math.max(...lats), Math.min(...lons), Math.max(...lons)];
  }

  polygon2XY(polygon) {
    const lats = polygon.map(x => x.lat);
    const lons = polygon.map(x => x.lon);

    const latMean= lats.reduce((x, y) => x+y) / lats.length;
    const lonMean= lons.reduce((x, y) => x+y) / lons.length;
    const latMeanRadians = latMean * Math.PI / 180;
    const mPerLat = 111132.92 - 559.82*Math.cos(2*latMeanRadians) + 1.175*Math.cos(4*latMeanRadians) - 0.0023*Math.cos(6*latMeanRadians);
    const mPerLon = 111412.84*Math.cos(latMeanRadians) - 93.5*Math.cos(3*latMeanRadians) + 0.118*Math.cos(5*latMeanRadians);

    const x = lons.map(val => (val - lonMean) * mPerLon);
    const y = lats.map(val => (val - latMean) * mPerLat);

    const xy = x.map((v, i) => [v, y[i]]);

    return {xy: xy, mPerLat: mPerLat, mPerLon: mPerLon};
  }
}