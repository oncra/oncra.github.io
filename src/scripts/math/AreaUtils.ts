import { Point } from "../../models/Point";

// polygon area calculation https://mathworld.wolfram.com/PolygonArea.html
export const calculateArea = (polygon: Point[]) => {
  const pointsCount = polygon.length;
  if (pointsCount < 3) return 0;

  let area = 0;
  for (let i=0; i<pointsCount; i++) {
    const x1 = polygon[i].x;
    const y1 = polygon[i].y;
    const x2 = polygon[(i+1) % pointsCount].x;
    const y2 = polygon[(i+1) % pointsCount].y;

    area += x1*y2 - x2*y1;
  }

  return area / 2;
}