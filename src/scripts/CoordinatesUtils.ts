export const latMean2MPerLatLon = (latMean: number): number[] => {
  const latMeanRadians = latMean * Math.PI / 180;
  const mPerLat = 111132.92 - 559.82*Math.cos(2*latMeanRadians) + 1.175*Math.cos(4*latMeanRadians) - 0.0023*Math.cos(6*latMeanRadians);
  const mPerLon = 111412.84*Math.cos(latMeanRadians) - 93.5*Math.cos(3*latMeanRadians) + 0.118*Math.cos(5*latMeanRadians);

  return [mPerLat, mPerLon];
}