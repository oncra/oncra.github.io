import { LineDirection } from "../../models/LineDirection";
import { Point } from "../../models/Point";
import { calculateArea } from "./AreaUtils"

// Weiler-Atherton Polygon Clipping Algorithm
export const getPolygonsIntersection = (polygonA: Point[], polygonB: Point[]): Point[][] => {
  if (polygonA.length < 3 || polygonB.length < 3) return [];

  const isPolygonAClockwise = calculateArea(polygonA) > 0;
  const isPolygonBClockwise = calculateArea(polygonB) > 0;
  
  // ensure both polygons are clockwise
  let polyA = isPolygonAClockwise ? polygonA.slice() : polygonA.slice().reverse();
  let polyB = isPolygonBClockwise ? polygonB.slice() : polygonB.slice().reverse();
  
  let { list: listA, listDirection: listADirection } = GetListAndDirection(polyA, polyB);
  let { list: listB, listDirection: listBDirection } = GetListAndDirection(polyB, polyA);

  if (listA.length == polyA.length) {
    const isAInB = isPointInsidePolygon(polyA[0], polyB);
    const isBInA = isPointInsidePolygon(polyB[0], polyA);

    if (isAInB) return [polyA];
    if (isBInA) return [polyB];
    return [];
  }

  let polygons: Point[][] = [];

  let dealtWithEntryPointsIndices: number[] = [];
  let polygonToInsert: Point[] = [];

  for (let i=0; i<listA.length; i++) {
    
    if (listADirection[i] == LineDirection.entering) {
      if (dealtWithEntryPointsIndices.includes(i)) continue;
      dealtWithEntryPointsIndices.push(i);
      
      let listAExitIndex = listADirection.findIndex((v, index) => index > i && v == LineDirection.leaving);
      if (listAExitIndex == -1) listAExitIndex = listADirection.findIndex(v => v == LineDirection.leaving);
      let listAEntryToExit = listA.slice(i, listAExitIndex+1);
      if (listAEntryToExit.length == 0) {
        listAEntryToExit = listA.slice(i);
        listAEntryToExit.push.apply(listAEntryToExit, listA.slice(0, listAExitIndex+1));
      }
      polygonToInsert = listAEntryToExit.slice();
      
      let loopCount = 0;
      const reasonableLoopLimit = 20;
      while (true) {
        const listBEntryIndex = listB.findIndex(v => v.x == polygonToInsert[polygonToInsert.length-1].x && 
          v.y == polygonToInsert[polygonToInsert.length-1].y);

        let listBExitIndex = listBDirection.findIndex((v, index) => index > listBEntryIndex && v == LineDirection.leaving);
        if (listBExitIndex == -1) listBExitIndex = listBDirection.findIndex(v => v == LineDirection.leaving);
        let listBEntryToExit = listB.slice(listBEntryIndex, listBExitIndex+1);
        if (listBEntryToExit.length == 0) {
          listBEntryToExit = listB.slice(listBEntryIndex);
          listBEntryToExit.push.apply(listBEntryToExit, listB.slice(0, listBExitIndex+1));
        }

        polygonToInsert.push.apply(polygonToInsert, listBEntryToExit.slice(1));
        
        if (polygonToInsert[0].x == polygonToInsert[polygonToInsert.length-1].x && 
          polygonToInsert[0].y == polygonToInsert[polygonToInsert.length-1].y ) {
            polygons.push(polygonToInsert.slice(0, -1));
            break;
        }

        const listAEntryIndex = listA.findIndex(v => v.x == polygonToInsert[polygonToInsert.length-1].x && 
          v.y == polygonToInsert[polygonToInsert.length-1].y);

        dealtWithEntryPointsIndices.push(listAEntryIndex);

        let listAExitIndex = listADirection.findIndex((v, index) => index > listAEntryIndex && v == LineDirection.leaving);
        if (listAExitIndex == -1) listAExitIndex = listADirection.findIndex(v => v == LineDirection.leaving);
        let listAEntryToExit = listA.slice(listAEntryIndex, listAExitIndex+1);
        if (listAEntryToExit.length == 0) {
          listAEntryToExit = listA.slice(listAEntryIndex);
          listAEntryToExit.push.apply(listAEntryToExit, listA.slice(0, listAExitIndex+1));
        }

        polygonToInsert.push.apply(polygonToInsert, listAEntryToExit.slice(1));
        
        if (polygonToInsert[0].x == polygonToInsert[polygonToInsert.length-1].x && 
          polygonToInsert[0].y == polygonToInsert[polygonToInsert.length-1].y ) {
            polygons.push(polygonToInsert.slice(0, -1));
            break;
        }

        loopCount++;
        if (loopCount >= reasonableLoopLimit) {
          break;
        }
      }
      polygonToInsert = [];
    }
  }
  return polygons;
}

const getPolygonLineIntersections = (polygon: Point[], linePointA: Point, linePointB: Point): Point[] => {
  let intersectionPoints: Point[] = [];
  let pointDistancesAlongLine: number[] = [];

  for (let i=0; i<polygon.length; i++) {
    const pointC = polygon[i];
    const pointD = polygon[(i+1) % polygon.length];

    const intersection = getLinesIntersection(linePointA, linePointB, pointC, pointD);
    if (intersection == null) continue;

    const alongLine = pointAlongLine(intersection, linePointA, linePointB);
    if (alongLine == null) continue;

    intersectionPoints.push(intersection);
    pointDistancesAlongLine.push(alongLine);
  }

  intersectionPoints.sort((m, n) => pointDistancesAlongLine[intersectionPoints.indexOf(m)] - 
    pointDistancesAlongLine[intersectionPoints.indexOf(n)]);
  
  return intersectionPoints;
}

// https://www.geeksforgeeks.org/program-for-point-of-intersection-of-two-lines/
const getLinesIntersection = (A: Point, B: Point, C: Point, D: Point): Point | null => {
  const a1 = B.y - A.y;
  const b1 = A.x - B.x;
  
  const a2 = D.y - C.y;
  const b2 = C.x - D.x;

  const determinant = a1*b2 - a2*b1;
  if (determinant == 0) return null;
  
  const c1 = a1*(A.x) + b1*(A.y);
  const c2 = a2*(C.x)+ b2*(C.y);

  const x = (b2*c1 - b1*c2) / determinant;
  const y = (a1*c2 - a2*c1) / determinant;

  const smallGap = 0.00000001;  

  if (x < Math.min(A.x, B.x) - smallGap || x > Math.max(A.x, B.x) + smallGap) return null;
  if (y < Math.min(A.y, B.y) - smallGap || y > Math.max(A.y, B.y) + smallGap) return null;

  if (x < Math.min(C.x, D.x) - smallGap || x > Math.max(C.x, D.x) + smallGap) return null;
  if (y < Math.min(C.y, D.y) - smallGap || y > Math.max(C.y, D.y) + smallGap) return null;

  return {x: x, y: y};
}

const pointAlongLine = (point: Point, linePointA: Point, linePointB: Point): number | null => {
  if (linePointA.x !== linePointB.x) return (point.x - linePointA.x) / (linePointB.x - linePointA.x);
  if (linePointA.y !== linePointB.y) return (point.y - linePointA.y) / (linePointB.y - linePointA.y);
  return null; 
}

const isPointInsidePolygon = (point: Point, polygon: Point[]) => {
  let crossCount = 0;
  for (let i=0; i<polygon.length; i++) {
    const xPa = polygon[i].x;
    const yPa = polygon[i].y;
    const pNext = (i + 1) % polygon.length;
    const xPb = polygon[pNext].x;
    const yPb = polygon[pNext].y;

    if (point.x < xPa == point.x < xPb) {
      continue;
    }

    const yIntercept = yPa + (point.x - xPa) * (yPb - yPa) / (xPb - xPa);

    if (point.y > yIntercept) {
      crossCount++
    }
  }
  return crossCount % 2 == 1;
}

function GetListAndDirection(polyA: Point[], polyB: Point[]) {
  let list: Point[] = [];
  let listDirection: LineDirection[] = [];
  for (let i = 0; i < polyA.length; i++) {
    const pa = polyA[i];
    const pb = polyA[(i + 1) % polyA.length];
    const intersectionPoints = getPolygonLineIntersections(polyB, pa, pb);

    list.push(pa);
    listDirection.push(LineDirection.notIntersection);

    list.push.apply(list, intersectionPoints);

    const isPointAIn = isPointInsidePolygon(pa, polyB);
    const intersectionPointsDirection: LineDirection[] = intersectionPoints.map((_, index) => {
      if (isPointAIn) {
        return index % 2 == 1 ? LineDirection.entering : LineDirection.leaving;
      }
      return index % 2 == 0 ? LineDirection.entering : LineDirection.leaving;
    });
    listDirection.push.apply(listDirection, intersectionPointsDirection);
  }
  return { list: list, listDirection: listDirection };
}
