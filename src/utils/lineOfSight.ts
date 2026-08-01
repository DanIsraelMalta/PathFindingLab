import { Point, HeuristicType } from '../types';

/**
 * Checks Line Of Sight (LOS) between two points (p1 and p2) on a grid using Bresenham's line algorithm.
 * Returns true if the straight line path is clear of any wall obstacles.
 */
export function hasLineOfSight(
  p1: Point,
  p2: Point,
  walls: boolean[][]
): boolean {
  let x0 = p1.x;
  let y0 = p1.y;
  let x1 = p2.x;
  let y1 = p2.y;

  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);

  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;

  let err = dx - dy;

  const gridHeight = walls.length;
  const gridWidth = walls[0] ? walls[0].length : 0;

  while (true) {
    // Check current cell bound & wall
    if (
      y0 < 0 ||
      y0 >= gridHeight ||
      x0 < 0 ||
      x0 >= gridWidth ||
      walls[y0][x0]
    ) {
      return false;
    }

    if (x0 === x1 && y0 === y1) break;

    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y0 += sy;
    }

    // Corner cutting check: if both x and y changed in step, check diagonal cell corners
    if (e2 > -dy && e2 < dx) {
      // Checked diagonal, ensure adjacent cells aren't both walls
      const checkX = x0 - sx;
      const checkY = y0 - sy;
      if (
        checkY >= 0 &&
        checkY < gridHeight &&
        checkX >= 0 &&
        checkX < gridWidth &&
        walls[checkY][checkX]
      ) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Calculates heuristic distance between point p and target point target.
 */
export function calculateHeuristic(
  p: Point,
  target: Point,
  heuristic: HeuristicType
): number {
  const dx = Math.abs(p.x - target.x);
  const dy = Math.abs(p.y - target.y);

  switch (heuristic) {
    case 'manhattan':
      return dx + dy;
    case 'euclidean':
      return Math.sqrt(dx * dx + dy * dy);
    case 'chebyshev':
      return Math.max(dx, dy);
    default:
      return dx + dy;
  }
}

/**
 * Returns valid neighbor coordinates for a given cell (x, y) considering 4-way or 8-way movement rules.
 */
export function getNeighbors(
  p: Point,
  gridWidth: number,
  gridHeight: number,
  allowDiagonal: boolean,
  walls: boolean[][]
): { point: Point; cost: number }[] {
  const neighbors: { point: Point; cost: number }[] = [];

  // Cardinal directions: Right, Left, Down, Up
  const cardinalDirs = [
    { x: 1, y: 0, cost: 1 },
    { x: -1, y: 0, cost: 1 },
    { x: 0, y: 1, cost: 1 },
    { x: 0, y: -1, cost: 1 },
  ];

  for (const dir of cardinalDirs) {
    const nx = p.x + dir.x;
    const ny = p.y + dir.y;

    if (
      nx >= 0 &&
      nx < gridWidth &&
      ny >= 0 &&
      ny < gridHeight &&
      !walls[ny][nx]
    ) {
      neighbors.push({ point: { x: nx, y: ny }, cost: dir.cost });
    }
  }

  // Diagonal directions if enabled
  if (allowDiagonal) {
    const SQRT2 = Math.SQRT2; // ~1.414
    const diagonalDirs = [
      { x: 1, y: 1, dx1: 1, dy1: 0, dx2: 0, dy2: 1 },
      { x: -1, y: 1, dx1: -1, dy1: 0, dx2: 0, dy2: 1 },
      { x: 1, y: -1, dx1: 1, dy1: 0, dx2: 0, dy2: -1 },
      { x: -1, y: -1, dx1: -1, dy1: 0, dx2: 0, dy2: -1 },
    ];

    for (const dir of diagonalDirs) {
      const nx = p.x + dir.x;
      const ny = p.y + dir.y;

      if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
        if (!walls[ny][nx]) {
          // Prevent squeezing through diagonal wall corners (corner-cutting rule)
          const adj1Blocked = walls[p.y + dir.dy1]?.[p.x + dir.dx1];
          const adj2Blocked = walls[p.y + dir.dy2]?.[p.x + dir.dx2];

          if (!adj1Blocked || !adj2Blocked) {
            neighbors.push({ point: { x: nx, y: ny }, cost: SQRT2 });
          }
        }
      }
    }
  }

  return neighbors;
}
