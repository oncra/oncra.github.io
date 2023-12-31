import { useEffect, useRef } from "react";
import { XY } from "../../models/XY";
import { Coordinate } from "../../models/Coordinate";
import { getGridCrossDataMatrixFromAGBPolygon } from "../../scripts/math/RayCastingUtils";
import { diff, mean, range } from "../../scripts/math/MathUtils";
import { GridType } from "../../models/GridData";

interface Props {
  width: number,
  height: number,
  polygon: Coordinate[],
  XY: XY | null
}

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

const drawInnerOuterMap = (polygon: Coordinate[], XY: XY) => {
  const width = canvas.width;
  const height = canvas.height;

  const bottomPadding = 120;

  const {gridCrossDataMatrix, xGrids, yGrids} = getGridCrossDataMatrixFromAGBPolygon(polygon);

  const xGridsRange = range(xGrids);
  const yGridsRange = range(yGrids);
  
  const scaling = Math.min(width / (xGridsRange * XY.mPerLon), 
    (height - bottomPadding) / (yGridsRange * XY.mPerLat));

  let gridX = xGrids.map(lon => (lon - XY.lonMean) * XY.mPerLon * scaling);
  let gridY = yGrids.map(lat => (lat - XY.latMean) * XY.mPerLat * scaling);

  const gridXUnit = mean(diff(gridX));
  const gridYUnit = Math.abs(mean(diff(gridY)));

  const shiftGridX = -Math.min(...gridX);
  const shiftGridY = Math.max(...gridY);

  const centreShift = (width - range(gridX)) / 2;
  gridX = gridX.map(x => x + shiftGridX + centreShift);
  gridY = gridY.map(y => shiftGridY - y);

  const polygonX = XY.x.map(x => x * scaling + shiftGridX + centreShift);
  const polygonY = XY.y.map(y => shiftGridY - (y * scaling));

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i=0; i<gridCrossDataMatrix.length; i++) {
    const y = gridY[i];

    for (let j=0; j<gridCrossDataMatrix[0].length; j++) {
      const x = gridX[j];

      const gcd = gridCrossDataMatrix[i][j];
      ctx.fillStyle = 'black';
      if (gcd == GridType.isFullyInside) ctx.fillStyle = "green";
      if (gcd == GridType.isFullyOutside) ctx.fillStyle = "red";
      if (gcd == GridType.isPartial) ctx.fillStyle = "orange";

      ctx.fillRect(x, y, gridXUnit - 0.5, gridYUnit - 0.5);
    }
  }

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let i=1; i<polygonX.length; i++) {
    ctx.moveTo(polygonX[i-1], polygonY[i-1]);
    ctx.lineTo(polygonX[i], polygonY[i]);
  }
  ctx.stroke();
  ctx.closePath();

  addLegend(gridY, gridX);
}

const InnerOuterMap = ({width, height, polygon, XY}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current == null) return;

    canvas = canvasRef.current;
    ctx = canvas.getContext('2d')!;

    if (XY == null) return;

    drawInnerOuterMap(polygon, XY);

  }, [polygon, XY]);

  return (
    <>
      {(polygon.length > 0) && <div id="colourMapContainer">
        <h2>Data Grid Polygon Map</h2>
        <canvas ref={canvasRef} width={width} height={height}></canvas>
      </div>}
    </>
  )
}

export default InnerOuterMap

const addLegend = (gridY: number[], gridX: number[]) => {
  let y = Math.max(...gridY) + 10;

  let colourGridSize = 12;
  let x = gridX[gridX.length - 1] - colourGridSize;
  let textPadding = 5;

  y += 10;
  ctx.fillStyle = "#303030";
  ctx.font = "16px inter";

  let textString = `Fully Inside`;
  let textWidth = ctx.measureText(textString).width;
  ctx.fillText(textString, x - textWidth - textPadding, y);
  ctx.fillStyle = "green";
  ctx.fillRect(x, y - colourGridSize, colourGridSize, colourGridSize);
  ctx.fillStyle = "#303030";

  y += 20;
  textString = `Partial`;
  textWidth = ctx.measureText(textString).width;
  ctx.fillText(textString, x - textWidth - textPadding, y);
  ctx.fillStyle = "orange";
  ctx.fillRect(x, y - colourGridSize, colourGridSize, colourGridSize);
  ctx.fillStyle = "#303030";

  y += 20;
  textString = `Fully Outside`;
  textWidth = ctx.measureText(textString).width;
  ctx.fillText(textString, x - textWidth - textPadding, y);
  ctx.fillStyle = "red";
  ctx.fillRect(x, y - colourGridSize, colourGridSize, colourGridSize);
  ctx.fillStyle = "#303030";
}
