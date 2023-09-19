import { useEffect, useRef } from 'react';
import './KMLFilePreviewer.css'
import { XY } from '../../models/XY';

interface Props {
  width: number,
  height: number,
  kmlFileName: string | null,
  XY: XY | null
}

const translateXY = (XY: XY, canvas: HTMLCanvasElement) =>  {
  const padding = 5;

  let x = XY.x;
  let y = XY.y;
  const xMin = Math.min(...x);
  const xMax = Math.max(...x);
  const yMin = Math.min(...y);
  const yMax = Math.max(...y);

  const width = canvas.width;
  const height = canvas.height;

  const shiftX = (xMin + xMax) / 2;
  const shiftY = (yMin + yMax) / 2;
  const scaling = Math.min((width - padding * 2) / (xMax - xMin), (height - padding * 2) / (yMax - yMin));

  x = x.map(v => (v - shiftX) * scaling + width / 2);
  y = y.map(v => (shiftY - v) * scaling + height / 2);

  return [x, y];
}

const KMLFilePreviewer = ({width, height, kmlFileName, XY}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current == null ) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    if (XY == null) return;

    const [x, y] = translateXY(XY, canvas);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#86C8B8";
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (var i=1; i<x.length; i++)
    {
      ctx.moveTo(x[i-1], y[i-1])
      ctx.lineTo(x[i], y[i]);
    }

    ctx.stroke();
    
  }, [XY]);

  return (
    <>
      <div id="kmlFileName">{kmlFileName}</div>
      <canvas ref={canvasRef} width={width} height={height}></canvas>
    </>
  )
}

export default KMLFilePreviewer