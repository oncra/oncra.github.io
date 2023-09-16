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

  drawColourBar() {
    const width = this.canvas.width;
    const height = this.canvas.height;

    for (var i=0; i<width; i++) {
      const value = i / width;

      const r = Math.round(this.color1[0] * value + this.color0[0] * (1 - value));
      const g = Math.round(this.color1[1] * value + this.color0[1] * (1 - value));
      const b = Math.round(this.color1[2] * value + this.color0[2] * (1 - value));

      this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      this.ctx.fillRect(i, 0, 2, height);
    }
  }

  drawAGB(agbData, agbMax) {
    const width = this.canvas.width;
    const height = this.canvas.height;

    const scaling = Math.min((width - this.#padding * 2)  / agbData.lon.length, (height- this.#padding * 2) / agbData.lat.length);

    const data = agbData.agb;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (var i=0; i<data.length; i++) {
      for (var j=0; j<data[i].length; j++) {
        const value = data[i][j] / agbMax;
        const x = j * scaling;
        const y = i * scaling;

        const r = Math.round(this.color1[0] * value + this.color0[0] * (1 - value));
        const g = Math.round(this.color1[1] * value + this.color0[1] * (1 - value));
        const b = Math.round(this.color1[2] * value + this.color0[2] * (1 - value));

        this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        this.ctx.fillRect(x, y, scaling, scaling);
      }
    }
  }
}