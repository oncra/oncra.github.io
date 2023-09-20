import { useEffect, useRef } from 'react';
import './AreaCanvas.css'

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

const squareLength = 200;
const width = 600;
const height = 600;

const squareCoordinates = [
  [width/2 - squareLength/2, height/2 - squareLength/2],
  [width/2 - squareLength/2, height/2 + squareLength/2],
  [width/2 + squareLength/2, height/2 + squareLength/2],
  [width/2 + squareLength/2, height/2 - squareLength/2]
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

function drawPixel(squareCoordinates: number[][]) {
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.beginPath();

  for (let i = 0; i < squareCoordinates.length; i++) {
    const prevPoint = squareCoordinates[(i - 1 + squareCoordinates.length) % squareCoordinates.length];
    ctx.moveTo(prevPoint[0], prevPoint[1]);
    ctx.lineTo(squareCoordinates[i][0], squareCoordinates[i][1]);
  }
  ctx.stroke();
  ctx.closePath();
}

interface Point {
  x: number,
  y: number
}

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
      ctx.moveTo(p.x + 4,p.y);
      ctx.arc(p.x,p.y,4,0,Math.PI *2);
    }
    ctx.stroke();
  },
  closest(pos: Point, dist = 8) {
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
  
  function drawCircle(pos: Point,color="red",size=8){
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(pos.x,pos.y,size,0,Math.PI *2);
    ctx.stroke();
  }
  
  var activePoint: (Point | undefined),cursor: string;
  var dragging= false;

  function update(){
    if (mouse.update) {
      cursor = "crosshair";
      ctx.clearRect(0,0,canvas.width,canvas.height);
      drawPixel(squareCoordinates);

      if (!dragging) {  activePoint = polygon.closest(mouse) }
      if (activePoint === undefined && mouse.button) {
          polygon.addPoint(mouse);
          mouse.button = false;
      } else if(activePoint) {
          if (mouse.button) {
              if(dragging) {
                  activePoint.x += mouse.x - mouse.lx;
                  activePoint.y += mouse.y - mouse.ly;
              } else {  dragging = true }
          } else { dragging = false }
      }
      polygon.draw();
      if (activePoint) { 
          drawCircle(activePoint);
          cursor = "move";
      }

      mouse.lx = mouse.x;
      mouse.ly = mouse.y;
      canvas.style.cursor = cursor;
      mouse.update = false;
    }
    requestAnimationFrame(update)
  }
}