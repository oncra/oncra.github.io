import { useEffect, useRef } from "react"
import './ColourMap.css'
import { CedaData } from "../../models/CedaData";
import { Coordinate } from "../../models/Coordinate";
import { availableYears } from "../../App";
import { diff, mean, range } from "../../scripts/MathUtils";
import { XY } from "../../models/XY";

interface Props {
  width: number,
  height: number,
  selectedYear: number | null,
  agbData: (CedaData | null)[],
  polygon: Coordinate[],
  XY: XY | null
}

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

const drawColourMap = (cedaData: CedaData, XY: XY, agbMax: number) => {
  const color0 = [250, 227, 146];
  const color1 = [26, 93, 26];

  const bottomPadding = 120;
  const colorBarHeight = 20;

  const width = canvas.width;
  const height = canvas.height;

  const gridLatRange = range(cedaData.lat) + Math.abs(mean(diff(cedaData.lat)));
  const gridLonRange = range(cedaData.lon) + Math.abs(mean(diff(cedaData.lon)));
  const scaling = Math.min(width / (gridLonRange * XY.mPerLon), 
    (height - bottomPadding) / (gridLatRange * XY.mPerLat));

  let gridX = cedaData.lon.map(lon => (lon - XY.lonMean) * XY.mPerLon * scaling);
  let gridY = cedaData.lat.map(lat => (lat - XY.latMean) * XY.mPerLat * scaling);

  const gridXUnit = mean(diff(gridX));
  const gridYUnit = mean(diff(gridY));

  const shiftGridX = -Math.min(...gridX) + gridXUnit / 2;
  const shiftGridY = Math.max(...gridY) - gridYUnit / 2;

  const centreShift = (width - range(gridX) - gridXUnit) / 2;
  gridX = gridX.map(x => x + shiftGridX + centreShift);
  gridY = gridY.map(y => shiftGridY - y);

  const polygonX = XY.x.map(x => x * scaling + shiftGridX + centreShift);
  const polygonY = XY.y.map(y => shiftGridY - (y * scaling));

  const data = cedaData.agb;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i=0; i<data.length; i++) {
    const y = gridY[i] - gridYUnit / 2;
    
    for (let j=0; j<data[i].length; j++) {
      const x = gridX[j] - gridXUnit / 2;
      
      const value = data[i][j]! / agbMax;
      const r = Math.round(color1[0] * value + color0[0] * (1 - value));
      const g = Math.round(color1[1] * value + color0[1] * (1 - value));
      const b = Math.round(color1[2] * value + color0[2] * (1 - value));

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, y, gridXUnit, gridYUnit);
    }
  }

  drawColourBarOnColourMap(gridY, gridYUnit, width, color1, color0, colorBarHeight, agbMax);

  drawPolygonOnColourMap(polygonX, polygonY);
}

function drawColourBarOnColourMap(gridY: number[], gridYUnit: number, width: number, color1: number[], color0: number[], colorBarHeight: number, agbMax: number) {
  let y = Math.max(...gridY) - gridYUnit/2 + 10;
  for (var i = 0; i < width; i++) {
    const value = i / width;

    const r = Math.round(color1[0] * value + color0[0] * (1 - value));
    const g = Math.round(color1[1] * value + color0[1] * (1 - value));
    const b = Math.round(color1[2] * value + color0[2] * (1 - value));

    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(i, y, 2, colorBarHeight);
  }

  y += colorBarHeight + 20;
  ctx.fillStyle = "#303030";
  ctx.font = "16px sans-serif";
  
  ctx.fillText("0", 0, y);

  let textString = `AGB ${agbMax}`;
  let textWidth = ctx.measureText(textString).width;
  ctx.fillText(textString, width - textWidth, y);

  y += 20;
  textString = `Carbon ${(agbMax)}`;
  textWidth = ctx.measureText(textString).width;
  ctx.fillText(textString, width - textWidth, y);

  y += 20;
  textString = `CO2 Equivalent ${(agbMax)}`;
  textWidth = ctx.measureText(textString).width;
  ctx.fillText(textString, width - textWidth, y);
}

function drawPolygonOnColourMap(polygonX: number[], polygonY: number[]) {
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.beginPath();

  for (let i = 1; i < polygonX.length; i++) {
    ctx.moveTo(polygonX[i - 1], polygonY[i - 1]);
    ctx.lineTo(polygonX[i], polygonY[i]);
  }
  ctx.stroke();
}

const ColourMap = ({width, height, selectedYear, agbData, XY} : Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current == null) return;

    canvas = canvasRef.current;
    ctx = canvas.getContext('2d')!;
    
    if (selectedYear == null) return;

    const selectedYearIndex = availableYears.indexOf(selectedYear);
    const cedaData = agbData[selectedYearIndex];
    if (cedaData == null || XY == null) return;

    const agbMax = Math.max(...agbData.map(cedaData => cedaData == null 
      ? 0 
      : cedaData.agbMax ?? 0));
    
    drawColourMap(cedaData, XY, agbMax);
    
  }, [selectedYear, agbData]);
    
  return (
    <>
      {(selectedYear != null) && <div id="colourMapContainer">
        <h2>AGB Map of Year <div id="mapYear">{selectedYear}</div></h2>
        <canvas id="colourMap" ref={canvasRef} width={width} height={height}></canvas>
      </div>}
    </>
  )
}

export default ColourMap