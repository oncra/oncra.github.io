import { useEffect, useRef } from 'react';
import './AreaCanvas.css'
import { calculateArea } from '../../scripts/math/AreaUtils';
import { getPolygonsIntersection } from '../../scripts/math/IntersectionUtils';
import { sum } from '../../scripts/math/MathUtils';
import { Point } from '../../models/Point';

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

const squareLength = 200;
const width = 600;
const height = 600;

const point = (x: number,y: number) : Point => ({x,y});

const poly = () => ({
  points : [] as Point[],
  addPoint(p: {x: number,y: number}){ this.points.push(point(p.x,p.y)) },
  draw() {
    ctx.lineWidth = 2;
    ctx.strokeStyle = "blue";
    ctx.beginPath();
    for (const p of this.points) { ctx.lineTo(p.x,p.y) }
    ctx.closePath();
    for (const p of this.points) {
      ctx.moveTo(p.x + 6,p.y);
      ctx.arc(p.x,p.y,6,0,Math.PI *2);
    }
    ctx.stroke();
  },
  closest(pos: Point, dist = 12) {
    var i = 0, index = -1;
    dist *= dist;
    for (const p of this.points) {
      var x = pos.x - p.x;
      var y = pos.y - p.y;
      var d2 =  x * x + y * y;
      if (d2 < dist) {
        dist = d2;
        index = i;
      }
      i++;
    }
    if (index > -1) { return this.points[index] }
  }
});

const polygon = poly();

const pixel: Point[] = [
  {x: width/2 - squareLength/2, y: height/2 - squareLength/2},
  {x: width/2 - squareLength/2, y: height/2 + squareLength/2},
  {x: width/2 + squareLength/2, y: height/2 + squareLength/2},
  {x: width/2 + squareLength/2, y: height/2 - squareLength/2}
];

const AreaCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current == null) return;

    canvas = canvasRef.current;
    ctx = canvas.getContext('2d')!;

    drawDraggablePolygon();
  }, []);

  return (
    <>
      <h2>Draggable Polygon Area Experiment</h2>
      <canvas id='areaCanvas' ref={canvasRef} width={width} height={height}></canvas>
    </>
  )
}

export default AreaCanvas

function drawPolygon(polygon: Point[], colour: string = "#000", lineWidth: number = 1) {
  if (polygon == undefined) return;

  ctx.strokeStyle = colour;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();

  for (let i = 0; i < polygon.length; i++) {
    const prevPoint = polygon[(i - 1 + polygon.length) % polygon.length];
    ctx.moveTo(prevPoint.x, prevPoint.y);
    ctx.lineTo(polygon[i].x, polygon[i].y);
    ctx.stroke();
    
    drawCircle(polygon[i],colour,lineWidth+5)
  }
  ctx.stroke();
  ctx.closePath();
}

function drawCircle(pos: Point,color="red",size=12) {
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.arc(pos.x,pos.y,size,0,Math.PI *2);
  ctx.stroke();
}

function drawDraggablePolygon() {
  requestAnimationFrame(update)

  let mouse = {x : 0, y : 0, button : false, lx : 0, ly : 0, update : true};
  function mouseEvents(e: MouseEvent){
    const bounds = canvas.getBoundingClientRect();
    mouse.x = e.pageX - bounds.left - scrollX;
    mouse.y = e.pageY - bounds.top - scrollY;
    mouse.button = e.type === "mousedown" ? true : e.type === "mouseup" ? false : mouse.button;    
    mouse.update = true;
  }

  canvas.addEventListener('mousedown',mouseEvents);
  canvas.addEventListener('mouseup',mouseEvents);
  canvas.addEventListener('mousemove',mouseEvents);

  ctx.lineWidth = 2;
  ctx.strokeStyle = "blue";
  
  var activePoint: (Point | undefined),cursor: string;
  var dragging= false;

  function update(){
    if (mouse.update) {
      cursor = "crosshair";
      ctx.clearRect(0,0,canvas.width,canvas.height);
      drawPolygon(pixel);

      if (!dragging) {  activePoint = polygon.closest(mouse) }
      if (activePoint === undefined && mouse.button) {
          polygon.addPoint(mouse);
          mouse.button = false;
      } else if(activePoint) {
          if (mouse.button) {
              if(dragging) {
                  activePoint.x = mouse.x;
                  activePoint.y = mouse.y;
              } else {  dragging = true }
          } else { dragging = false }
      }
      polygon.draw();
      if (activePoint) { 
          drawCircle(activePoint);
          cursor = "move";
      }

      const intersectionPolys = getPolygonsIntersection(polygon.points, pixel); 
      for (let i=0; i<intersectionPolys.length; i++) {
        drawPolygon(intersectionPolys[i], "green", 3);
      }

      mouse.lx = mouse.x;
      mouse.ly = mouse.y;
      canvas.style.cursor = cursor;
      mouse.update = false;

      if (polygon.points.length > 2) {
        const area = calculateArea(polygon.points);
        const pixelArea = calculateArea(pixel);

        const intersectionArea = sum(intersectionPolys.map(p => calculateArea(p)));

        ctx.fillStyle = "#303030";
        ctx.font = "16px inter";

        ctx.fillText(`Pixel's Area: 1.00`, 10, 25);

        ctx.fillStyle = "blue";
        ctx.fillText(`Polygon's Area: ${(Math.abs(area / pixelArea))}`, 10, 50);

        ctx.fillStyle = "green";
        ctx.fillText(`Overlap Area: ${Math.abs(intersectionArea / pixelArea)}`, 10, 75);
      }
    }
    requestAnimationFrame(update)
  }
}