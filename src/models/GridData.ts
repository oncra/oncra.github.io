export enum GridType {
  isPartial,
  isFullyInside,
  isFullyOutside
}

export interface corners {
  topLeft: corner,
  topRight: corner,
  bottomLeft: corner,
  bottomRight: corner
}

export interface corner {
  horizontalCrossCount: number,
  verticalCrossCount: number
}

export interface edges {
  top: edge,
  bottom: edge,
  left: edge,
  right: edge
}

export interface edge {
  crossCount: number
}