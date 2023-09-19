import { Coordinate } from "../models/Coordinate";
import { GridData } from "../models/GridData";
import { clientParams, lat2Index, lon2Index } from "./CEDA/CedaHttpClient";
import { makeArray } from "./MathUtils";
import { polygon2LatLonRange } from "./PolygonUtils";

export const getGridCrossDataMatrixFromAGBPolygon = (polygon: Coordinate[]) => {
  const latUnit = Math.abs(clientParams.lat1 - clientParams.lat0) / clientParams.latCount
  const lonUnit = Math.abs(clientParams.lon1 - clientParams.lon0) / clientParams.lonCount

  const xPolygon = polygon.map(v => v.lon);
  const yPolygon = polygon.map(v => v.lat);

  const latLonRange = polygon2LatLonRange(polygon);

  const latIndexStart = lat2Index(latLonRange.latMax);
  const latIndexEnd = lat2Index(latLonRange.latMin);
  const lonIndexStart = lon2Index(latLonRange.lonMin);
  const lonIndexEnd = lon2Index(latLonRange.lonMax);

  const xGrids = makeArray(lonIndexStart, lonIndexEnd + 1).map(v => v * lonUnit + clientParams.lon0);
  const yGrids = makeArray(latIndexStart, latIndexEnd + 1).map(v => clientParams.lat0 - v * latUnit);
  
  const horizontalCrossCountMatrix = getHorizontalCrossCountMatrix(xGrids, yGrids, xPolygon, yPolygon);
  const verticalCrossCountMatrix = getVerticalCrossCountMatrix(xGrids, yGrids, xPolygon, yPolygon);
  const gridCrossDataMatrix = getGridCrossDataMatrix(horizontalCrossCountMatrix, verticalCrossCountMatrix);

  return {
    gridCrossDataMatrix: gridCrossDataMatrix,
    xGrids: xGrids,
    yGrids: yGrids
  };
}

export const getHorizontalCrossCountMatrix = (xGrids: number[], yGrids: number[], xPolygon: number[], yPolygon: number[]) => {
  const horizontalCrossCountMatrix = yGrids.map(() => xGrids.map(() => 0));

  for (let i=0; i<yGrids.length; i++) {
    const y = yGrids[i];
    for (let p=0; p<xPolygon.length; p++) {
      const xPa = xPolygon[p];
      const yPa = yPolygon[p];
      const pNext = (p + 1) % xPolygon.length;
      const xPb = xPolygon[pNext];
      const yPb = yPolygon[pNext];

      if (y < yPa == y < yPb) {
        continue;
      }

      const xIntercept = xPa + (y - yPa) * (xPb - xPa) / (yPb - yPa);

      for (let j=0; j<xGrids.length; j++) {
        const x = xGrids[j];
        if (x > xIntercept) {
          horizontalCrossCountMatrix[i][j]++
        }
      }
    }
  }
  return horizontalCrossCountMatrix;
}

export const getVerticalCrossCountMatrix = (xGrids: number[], yGrids: number[], xPolygon: number[], yPolygon: number[]) => {
  const verticalCrossCountMatrix = yGrids.map(() => xGrids.map(() => 0));

  for (let i=0; i<xGrids.length; i++) {
    const x = xGrids[i];
    for (let p=0; p<xPolygon.length; p++) {
      const xPa = xPolygon[p];
      const yPa = yPolygon[p];
      const pNext = (p + 1) % xPolygon.length;
      const xPb = xPolygon[pNext];
      const yPb = yPolygon[pNext];

      if (x < xPa == x < xPb) {
        continue;
      }

      const yIntercept = yPa + (x - xPa) * (yPb - yPa) / (xPb - xPa);

      for (let j=0; j<yGrids.length; j++) {
        const y = yGrids[j];
        if (y > yIntercept) {
          verticalCrossCountMatrix[j][i]++
        }
      }
    }
  }
  return verticalCrossCountMatrix;
}

export const getGridCrossDataMatrix = (horizontalCrossCountMatrix: number[][], verticalCrossCountMatrix: number[][]) => {
  const gridCrossDataMatrix: (GridData | null)[][] = horizontalCrossCountMatrix.slice(1).map(() => 
    horizontalCrossCountMatrix[0].slice(1).map(() => null));

  for (let i=0; i<verticalCrossCountMatrix.length-1; i++) {
    for (let j=0; j<verticalCrossCountMatrix[0].length-1; j++) {
      const corners = {
        topLeft: {
          horizontalCrossCount: horizontalCrossCountMatrix[i][j],
          verticalCrossCount: verticalCrossCountMatrix[i][j]
        }, 
        topRight: {
          horizontalCrossCount: horizontalCrossCountMatrix[i][j+1],
          verticalCrossCount: verticalCrossCountMatrix[i][j+1]
        }, 
        bottomLeft: {
          horizontalCrossCount: horizontalCrossCountMatrix[i+1][j],
          verticalCrossCount: verticalCrossCountMatrix[i+1][j]
        }, 
        bottomRight: {
          horizontalCrossCount: horizontalCrossCountMatrix[i+1][j+1],
          verticalCrossCount: verticalCrossCountMatrix[i+1][j+1]
        }
      }

      const edges = {
        top: {
          crossCount: corners.topRight.horizontalCrossCount - corners.topLeft.horizontalCrossCount,
        },
        bottom: {
          crossCount: corners.bottomRight.horizontalCrossCount - corners.bottomLeft.horizontalCrossCount,
        },
        left: {
          crossCount: corners.topLeft.verticalCrossCount - corners.bottomLeft.verticalCrossCount,
        },
        right: {
          crossCount: corners.topRight.verticalCrossCount - corners.bottomRight.verticalCrossCount,
        }
      }

      const isPartial = !(edges.top.crossCount == 0 && edges.bottom.crossCount == 0 && edges.left.crossCount == 0 && edges.right.crossCount == 0);
      const isFullyInside = !isPartial && corners.topLeft.horizontalCrossCount % 2 != 0;
      const isFullyOutside = !isPartial && corners.topLeft.horizontalCrossCount % 2 == 0;

      const gridData = {
        corners: corners,
        edges: edges,
        isPartial: isPartial,
        isFullyInside: isFullyInside,
        isFullyOutside: isFullyOutside
      }

      gridCrossDataMatrix[i][j] = gridData;
    }
  }
  return gridCrossDataMatrix;
}