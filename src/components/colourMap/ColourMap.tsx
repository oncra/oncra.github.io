import { useEffect, useRef } from "react"
import './ColourMap.css'
import { CedaData } from "../../models/CedaData";
import { Coordinate } from "../../models/Coordinate";
import { availableYears } from "../../App";
import { diff, mean } from "../../scripts/MathUtils";

interface Props {
  width: number,
  height: number,
  selectedYear: number | null,
  agbData: (CedaData | null)[],
  polygon: Coordinate[]
}

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

const drawAGB = (cedaData: CedaData, polygon: Coordinate[], agbMax: number) => {
  const color0 = [250, 227, 146];
  const color1 = [26, 93, 26];

  const bottomPadding = 120;
  const colorBarHeight = 20;

  const width = canvas.width;
  const height = canvas.height;

  const latUnit = Math.abs(mean(diff(cedaData.lat)));
  const lonUnit = Math.abs(mean(diff(cedaData.lon)));
  const scaling = Math.min(width  / (cedaData.lon.length * lonUnit), 
    (height - bottomPadding) / (cedaData.lat.length * latUnit));
  
  const data = cedaData.agb;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (var i=0; i<data.length; i++) {
    const y = i * latUnit * scaling;
    
    for (var j=0; j<data[i].length; j++) {
      const x = j * lonUnit * scaling;
      
      const value = data[i][j]! / agbMax;
      const r = Math.round(color1[0] * value + color0[0] * (1 - value));
      const g = Math.round(color1[1] * value + color0[1] * (1 - value));
      const b = Math.round(color1[2] * value + color0[2] * (1 - value));

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, y, lonUnit * scaling, latUnit * scaling);
    }
  }
}

const ColourMap = ({width, height, selectedYear, agbData, polygon} : Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    canvas = canvasRef.current!;
    ctx = canvas.getContext('2d')!;
  }, []);

  useEffect(() => {
    
    if (selectedYear == null) return;

    const selectedYearIndex = availableYears.indexOf(selectedYear);
    const cedaData = agbData[selectedYearIndex];
    if (cedaData == null) return;

    const agbMax = Math.max(...agbData.map(cedaData => cedaData == null 
      ? 0 
      : cedaData.agbMax ?? 0));
    
    drawAGB(cedaData, polygon, agbMax);
    
  }, [selectedYear, agbData]);
    
  return (
    <>
      <h2>AGB Map of Year <div id="mapYear">2019</div></h2>
      <canvas id="colourMap" ref={canvasRef} width={width} height={height}></canvas>
    </>
  )
}

export default ColourMap