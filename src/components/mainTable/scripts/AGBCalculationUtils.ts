import { Coordinate } from "../../../models/Coordinate";
import { GridData } from "../../../models/GridData";
import { Point } from "../../../models/Point";
import { calculateArea } from "../../../scripts/math/AreaUtils";
import { getPolygonsIntersection } from "../../../scripts/math/IntersectionUtils";
import { range } from "../../../scripts/math/MathUtils";

export const GetGridMultiplier = (
    gridCrossDataMatrix: (GridData | null)[][], 
    xGrids: number[], 
    yGrids: number[], 
    polygon: Coordinate[]) => {
  
  let gridMultiplier: number[][] = [];
  let polygonXY: Point[] | undefined = undefined;

  if (polygon.length == 0) return { polygonXY, gridMultiplier };

  gridMultiplier = gridCrossDataMatrix.map(line => line.map(() => 0));
  const xGridMin = Math.min(...xGrids);
  const yGridMax = Math.max(...yGrids);
  const xGridRange = range(xGrids);
  const yGridRange = range(yGrids);

  polygonXY = polygon.map(p => ({
    x: (p.lon - xGridMin) / xGridRange * (xGrids.length - 1),
    y: (yGridMax - p.lat) / yGridRange * (yGrids.length - 1),
  }));

  if (polygonXY[0].x == polygonXY[polygonXY.length - 1].x && polygonXY[0].y == polygonXY[polygonXY.length - 1].y) {
    polygonXY = polygonXY.slice(1);
  }

  for (let i = 0; i < gridMultiplier.length; i++) {
    for (let j = 0; j < gridMultiplier[0].length; j++) {
      const gridData = gridCrossDataMatrix[i][j];
      if (gridData == null || gridData.isFullyOutside) {
        continue;
      }

      if (gridData.isFullyInside) {
        gridMultiplier[i][j] = 1;
      }

      if (gridData.isPartial) {
        const gridPolygon: Point[] = [
          { x: j, y: i },
          { x: j + 1, y: i },
          { x: j + 1, y: i + 1 },
          { x: j, y: i + 1 }
        ];

        const intersectionPolygon = getPolygonsIntersection(gridPolygon, polygonXY);
        let intersectionPolygonArea = 0;
        for (let p = 0; p < intersectionPolygon.length; p++) {
          intersectionPolygonArea += Math.abs(calculateArea(intersectionPolygon[p]));
        }
        gridMultiplier[i][j] = intersectionPolygonArea;
        if (intersectionPolygonArea > 1) {
          console.log(`unexpected area value calculated: ${intersectionPolygon}`);
        }
      }
    }
  }
  return { polygonXY, gridMultiplier };
}
