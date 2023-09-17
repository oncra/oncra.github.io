function getHorizontalCrossCountMatrix(xGrids, yGrids, xPolygon, yPolygon) {
  let horizontalCrossCountMatrix = yGrids.map(_ => xGrids.map(_ => 0));

  for (var i=0; i<yGrids.length; i++) {
    const y = yGrids[i];
    for (var p=0; p<xPolygon.length; p++) {
      const xPa = xPolygon[p];
      const yPa = yPolygon[p];
      const pNext = (p + 1) % xPolygon.length;
      const xPb = xPolygon[pNext];
      const yPb = yPolygon[pNext];

      if (y < yPa == y < yPb) {
        continue;
      }

      const xIntercept = xPa + (y - yPa) * (xPb - xPa) / (yPb - yPa);

      for (var j=0; j<xGrids.length; j++) {
        const x = xGrids[j];
        if (x > xIntercept) {
          horizontalCrossCountMatrix[i][j]++
        }
      }
    }
  }
  return horizontalCrossCountMatrix;
}

function getVerticalCrossCountMatrix(xGrids, yGrids, xPolygon, yPolygon) {
  let verticalCrossCountMatrix = yGrids.map(_ => xGrids.map(_ => 0));

  for (var i=0; i<xGrids.length; i++) {
    const x = xGrids[i];
    for (var p=0; p<xPolygon.length; p++) {
      const xPa = xPolygon[p];
      const yPa = yPolygon[p];
      const pNext = (p + 1) % xPolygon.length;
      const xPb = xPolygon[pNext];
      const yPb = yPolygon[pNext];

      if (x < xPa == x < xPb) {
        continue;
      }

      const yIntercept = yPa + (x - xPa) * (yPb - yPa) / (xPb - xPa);

      for (var j=0; j<yGrids.length; j++) {
        const y = yGrids[j];
        if (y > yIntercept) {
          verticalCrossCountMatrix[j][i]++
        }
      }
    }
  }
  return verticalCrossCountMatrix;
}

function getGridCrossDataMatrix(horizontalCrossCountMatrix, verticalCrossCountMatrix) {
  let gridCrossDataMatrix = horizontalCrossCountMatrix.slice(1).map(_ => 
    horizontalCrossCountMatrix[0].slice(1).map(_ => {}));

  for (var i=0; i<verticalCrossCountMatrix.length-1; i++) {
    for (var j=0; j<verticalCrossCountMatrix[0].length-1; j++) {
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