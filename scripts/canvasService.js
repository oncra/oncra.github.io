class CanvasService {
  canvas;
  ctx;
  #padding;
  color0 = [250, 227, 146];
  color1 = [26, 93, 26];
  
  constructor(canvas, padding = 5) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.#padding = padding;
  }

  drawXY(xy) {
    const xyTranslated = this.translateXY(xy);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.strokeStyle = "#86C8B8";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();

    for (var i=1; i<xyTranslated.length; i++)
    {
      this.ctx.moveTo(xyTranslated[i-1][0], xyTranslated[i-1][1])
      this.ctx.lineTo(xyTranslated[i][0], xyTranslated[i][1]);
    }

    this.ctx.stroke();
  }

  translateXY(xy) {
    const x = xy.map(v => v[0]);
    const y = xy.map(v => v[1]);
    const xMin = Math.min(...x);
    const xMax = Math.max(...x);
    const yMin = Math.min(...y);
    const yMax = Math.max(...y);

    const width = this.canvas.width;
    const height = this.canvas.height;

    const shiftX = (xMin + xMax) / 2;
    const shiftY = (yMin + yMax) / 2;
    const scaling = Math.min((width - this.#padding * 2) / (xMax - xMin), (height - this.#padding * 2) / (yMax - yMin));

    const xyTranslated = xy.map(v => [(v[0] - shiftX) * scaling + width / 2, (shiftY - v[1]) * scaling + height / 2]);
    return xyTranslated;
  }

  drawAGB(agbData, polygon, XYData, agbMax) {
    const bottomPadding = 120;
    const colorBarHeight = 20;

    const width = this.canvas.width;
    const height = this.canvas.height;

    const latUnit = Math.abs(mean(diff(agbData.lat)));
    const lonUnit = Math.abs(mean(diff(agbData.lon)));
    const scaling = Math.min(width  / (agbData.lon.length * lonUnit * XYData.mPerLon), 
      (height - bottomPadding) / (agbData.lat.length * latUnit * XYData.mPerLat));
    
    const data = agbData.agb;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (var i=0; i<data.length; i++) {
      const y = i * latUnit * XYData.mPerLat * scaling;
      
      for (var j=0; j<data[i].length; j++) {
        const x = j * lonUnit * XYData.mPerLon * scaling;
        
        const value = data[i][j] / agbMax;
        const r = Math.round(this.color1[0] * value + this.color0[0] * (1 - value));
        const g = Math.round(this.color1[1] * value + this.color0[1] * (1 - value));
        const b = Math.round(this.color1[2] * value + this.color0[2] * (1 - value));

        this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        this.ctx.fillRect(x, y, lonUnit * XYData.mPerLon * scaling, latUnit * XYData.mPerLat * scaling);
      }
    }

    this.drawColourBarOnAGB(data, latUnit, XYData, scaling, width, colorBarHeight, agbMax);

    this.drawPolygonOnAGB(agbData, lonUnit, latUnit, polygon, XYData, scaling);
  }

  drawColourBarOnAGB(data, latUnit, XYData, scaling, width, colorBarHeight, agbMax) {
    let y = (data.length) * latUnit * XYData.mPerLat * scaling + 5;
    for (var i = 0; i < width; i++) {
      const value = i / width;

      const r = Math.round(this.color1[0] * value + this.color0[0] * (1 - value));
      const g = Math.round(this.color1[1] * value + this.color0[1] * (1 - value));
      const b = Math.round(this.color1[2] * value + this.color0[2] * (1 - value));

      this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      this.ctx.fillRect(i, y, 2, colorBarHeight);
    }

    y += colorBarHeight + 20;
    this.ctx.fillStyle = "#303030";
    this.ctx.font = "16px Inter";
    this.ctx.fillText("0", 0, y);

    let textString = `AGB ${agbMax}`;
    let textWidth = this.ctx.measureText(textString).width;
    this.ctx.fillText(textString, width - textWidth, y);

    y += 20;
    textString = `Carbon ${getCarbon(agbMax)}`;
    textWidth = this.ctx.measureText(textString).width;
    this.ctx.fillText(textString, width - textWidth, y);

    y += 20;
    textString = `CO2 Equivalent ${getCO2Equivalent(agbMax)}`;
    textWidth = this.ctx.measureText(textString).width;
    this.ctx.fillText(textString, width - textWidth, y);
  }

  drawPolygonOnAGB(agbData, lonUnit, latUnit, polygon, XYData, scaling) {
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();

    const lonMin = Math.min(...agbData.lon) - lonUnit / 2;
    const latMax = Math.max(...agbData.lat) + latUnit / 2;

    let xPrev = (polygon[0].lon - lonMin) * XYData.mPerLon * scaling;
    let yPrev = -(polygon[0].lat - latMax) * XYData.mPerLat * scaling;
    for (var i = 1; i < polygon.length; i++) {
      const x = (polygon[i].lon - lonMin) * XYData.mPerLon * scaling;
      const y = -(polygon[i].lat - latMax) * XYData.mPerLat * scaling;

      this.ctx.moveTo(xPrev, yPrev);
      this.ctx.lineTo(x, y);

      xPrev = x; yPrev = y;
    }
    this.ctx.stroke();
  }

  drawInnerOuterMap(agbData, polygon, latOverLonScaling) {
    const width = this.canvas.width;
    const height = this.canvas.height;

    const latUnit = Math.abs(mean(diff(agbData.lat)));
    const lonUnit = Math.abs(mean(diff(agbData.lon)));

    const xPolygon = polygon.map(v => v.lon);
    const yPolygon = polygon.map(v => v.lat);

    let xGrids = agbData.lon.map(v => v - lonUnit / 2);
    xGrids.push(xGrids[xGrids.length-1] + lonUnit);
    
    let yGrids = agbData.lat.map(v => v + latUnit / 2);
    yGrids.push(yGrids[yGrids.length-1] - latUnit);
    
    const horizontalCrossCountMatrix = getHorizontalCrossCountMatrix(xGrids, yGrids, xPolygon, yPolygon);
    const verticalCrossCountMatrix = getVerticalCrossCountMatrix(xGrids, yGrids, xPolygon, yPolygon);
    const gridCrossDataMatrix = getGridCrossDataMatrix(horizontalCrossCountMatrix, verticalCrossCountMatrix);
    
    const xGridsRange = xGrids[xGrids.length-1] - xGrids[0];
    const yGridsRange = yGrids[0] - yGrids[yGrids.length-1];
    
    const shiftX = xGrids[0];
    const yGridsMax = yGrids[0];

    const scaling = Math.min(width / xGridsRange, height / (yGridsRange * latOverLonScaling));

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (var i=0; i<gridCrossDataMatrix.length; i++) {
      const y = (yGridsMax - yGrids[i]) * scaling * latOverLonScaling;

      for (var j=0; j<gridCrossDataMatrix[0].length; j++) {
        const x = (xGrids[j] - shiftX) * scaling;

        let gcd = gridCrossDataMatrix[i][j];
        if (gcd.isFullyInside) this.ctx.fillStyle = "green";
        if (gcd.isFullyOutside) this.ctx.fillStyle = "red";
        if (gcd.isPartial) this.ctx.fillStyle = "orange";

        this.ctx.fillRect(x, y, lonUnit * scaling - 0.5, latUnit * scaling * latOverLonScaling - 0.5);
      }
    }


    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();

    let xPrev = (xPolygon[0] - shiftX) * scaling;
    let yPrev = (yGridsMax - yPolygon[0]) * scaling * latOverLonScaling;
    for (var i=0; i<xPolygon.length; i++) {
      const x = (xPolygon[i] - shiftX) * scaling;
      const y = (yGridsMax - yPolygon[i]) * scaling * latOverLonScaling;

      this.ctx.moveTo(xPrev, yPrev);
      this.ctx.lineTo(x, y);

      xPrev = x; yPrev = y;
    }
    this.ctx.stroke();
    this.ctx.closePath();
  }
}