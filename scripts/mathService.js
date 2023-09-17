function diff(arr) {
  return arr.slice(1).map(function(n, i) { return n - arr[i]; });
}

function sum(arr) {
  return arr.reduce((x, y) => x + y);
}

function mean(arr) {
  return sum(arr) / arr.length;
}

function toDecimalPlace(value, dp) {
  const scale = 10**dp;
  return Math.round(value * scale) / scale; 
}

function getCarbon(AGB) {
  return toDecimalPlace(AGB / 2, 2);
}

function getCO2Equivalent(AGB) {
  return toDecimalPlace(AGB / 2 * 44 / 12, 2);
}

function getAGBAverageFromGridCrossDataAndAgbData(gridCrossDataMatrix, agbData) {
  let fullGridCount = 0;
  let totalAGB = 0;
  const agb = agbData.agb;

  for (var i=0; i<agb.length; i++) {
    for (var j=0; j<agb[0].length; j++) {
      const isGridFullyInside = gridCrossDataMatrix[i][j].isFullyInside;

      if (isGridFullyInside) {
        totalAGB += agb[i][j];
        fullGridCount++;
      }
    }
  }
  
  return totalAGB / fullGridCount;
}