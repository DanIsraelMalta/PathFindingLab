import {
  Point,
  AlgorithmType,
  HeuristicType,
  AlgorithmResult,
} from '../types';
import { MinHeap } from '../utils/minHeap';
import {
  hasLineOfSight,
  calculateHeuristic,
  getNeighbors,
} from '../utils/lineOfSight';

/**
 * Main dispatcher to execute the chosen pathfinding algorithm.
 */
export function runPathfindingAlgorithm(
  algorithm: AlgorithmType,
  gridWidth: number,
  gridHeight: number,
  start: Point,
  target: Point,
  walls: boolean[][],
  allowDiagonal: boolean,
  heuristic: HeuristicType
): AlgorithmResult {
  const startTime = performance.now();

  let result: AlgorithmResult;

  switch (algorithm) {
    case 'dijkstra':
      result = runDijkstra(gridWidth, gridHeight, start, target, walls, allowDiagonal);
      break;
    case 'bfs':
      result = runBFS(gridWidth, gridHeight, start, target, walls, allowDiagonal);
      break;
    case 'dfs':
      result = runDFS(gridWidth, gridHeight, start, target, walls, allowDiagonal);
      break;
    case 'gbfs':
      result = runGBFS(gridWidth, gridHeight, start, target, walls, allowDiagonal, heuristic);
      break;
    case 'astar':
      result = runAStar(gridWidth, gridHeight, start, target, walls, allowDiagonal, heuristic);
      break;
    case 'jps':
      result = runJPS(gridWidth, gridHeight, start, target, walls, allowDiagonal, heuristic);
      break;
    case 'bidirectional_astar':
      result = runBidirectionalAStar(gridWidth, gridHeight, start, target, walls, allowDiagonal, heuristic);
      break;
    case 'dstarlite':
      result = runDStarLite(gridWidth, gridHeight, start, target, walls, allowDiagonal, heuristic);
      break;
    case 'thetastar':
      result = runThetaStar(gridWidth, gridHeight, start, target, walls, allowDiagonal, heuristic);
      break;
    case 'rrt':
      result = runRRT(gridWidth, gridHeight, start, target, walls, allowDiagonal);
      break;
    case 'rrtstar':
      result = runRRTStar(gridWidth, gridHeight, start, target, walls, allowDiagonal, heuristic);
      break;
    case 'informed_rrtstar':
      result = runInformedRRTStar(gridWidth, gridHeight, start, target, walls, allowDiagonal, heuristic);
      break;
    case 'prm':
      result = runPRM(gridWidth, gridHeight, start, target, walls, allowDiagonal, heuristic);
      break;
    case 'apf':
      result = runAPF(gridWidth, gridHeight, start, target, walls, allowDiagonal);
      break;
    case 'bug1':
      result = runBug1(gridWidth, gridHeight, start, target, walls, allowDiagonal);
      break;
    case 'bug2':
      result = runBug2(gridWidth, gridHeight, start, target, walls, allowDiagonal);
      break;
    default:
      result = runAStar(gridWidth, gridHeight, start, target, walls, allowDiagonal, heuristic);
  }

  const endTime = performance.now();
  result.executionTimeMs = Math.max(0.1, Number((endTime - startTime).toFixed(2)));
  return result;
}

/**
 * Reconstructs path from parent node references.
 */
function reconstructPath(
  parents: (Point | null)[][],
  start: Point,
  target: Point
): Point[] {
  const path: Point[] = [];
  let curr: Point | null = target;

  // Verify target was reached
  if (!parents[target.y][target.x] && (target.x !== start.x || target.y !== start.y)) {
    return [];
  }

  while (curr !== null) {
    path.unshift(curr);
    if (curr.x === start.x && curr.y === start.y) break;
    curr = parents[curr.y][curr.x];
  }

  return path;
}

/**
 * Helper to calculate total distance/cost of a path.
 */
function calculatePathCost(path: Point[]): number {
  let cost = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const dx = Math.abs(path[i + 1].x - path[i].x);
    const dy = Math.abs(path[i + 1].y - path[i].y);
    if (dx === 1 && dy === 1) {
      cost += Math.SQRT2;
    } else if (dx === 0 || dy === 0) {
      cost += Math.max(dx, dy);
    } else {
      cost += Math.sqrt(dx * dx + dy * dy);
    }
  }
  return Number(cost.toFixed(2));
}

// ---------------------------------------------------------------------------
// 1. Dijkstra's Algorithm
// ---------------------------------------------------------------------------
function runDijkstra(
  gridWidth: number,
  gridHeight: number,
  start: Point,
  target: Point,
  walls: boolean[][],
  allowDiagonal: boolean
): AlgorithmResult {
  const dist: number[][] = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(Infinity)
  );
  const parent: (Point | null)[][] = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(null)
  );
  const visited: boolean[][] = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(false)
  );

  const minHeap = new MinHeap<Point>();
  const visitedOrder: Point[] = [];
  const frontierOrder: Point[][] = [];

  dist[start.y][start.x] = 0;
  minHeap.insert(start, 0);

  let found = false;

  while (!minHeap.isEmpty()) {
    const currentItem = minHeap.pop()!;
    const curr = currentItem.value;

    if (visited[curr.y][curr.x]) continue;
    visited[curr.y][curr.x] = true;
    visitedOrder.push(curr);

    if (curr.x === target.x && curr.y === target.y) {
      found = true;
      break;
    }

    const currentFrontier: Point[] = [];
    const neighbors = getNeighbors(curr, gridWidth, gridHeight, allowDiagonal, walls);

    for (const { point: nbr, cost } of neighbors) {
      if (visited[nbr.y][nbr.x]) continue;

      const newDist = dist[curr.y][curr.x] + cost;
      if (newDist < dist[nbr.y][nbr.x]) {
        dist[nbr.y][nbr.x] = newDist;
        parent[nbr.y][nbr.x] = curr;
        minHeap.insert(nbr, newDist);
        currentFrontier.push(nbr);
      }
    }

    if (currentFrontier.length > 0) {
      frontierOrder.push(currentFrontier);
    }
  }

  const path = found ? reconstructPath(parent, start, target) : [];
  return {
    visitedOrder,
    frontierOrder,
    path,
    pathCost: found ? dist[target.y][target.x] : 0,
    executionTimeMs: 0,
    found,
  };
}

// ---------------------------------------------------------------------------
// 2. Breadth-First Search (BFS)
// ---------------------------------------------------------------------------
function runBFS(
  gridWidth: number,
  gridHeight: number,
  start: Point,
  target: Point,
  walls: boolean[][],
  allowDiagonal: boolean
): AlgorithmResult {
  const parent: (Point | null)[][] = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(null)
  );
  const visited: boolean[][] = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(false)
  );

  const queue: Point[] = [];
  const visitedOrder: Point[] = [];
  const frontierOrder: Point[][] = [];

  queue.push(start);
  visited[start.y][start.x] = true;

  let found = false;

  while (queue.length > 0) {
    const curr = queue.shift()!;
    visitedOrder.push(curr);

    if (curr.x === target.x && curr.y === target.y) {
      found = true;
      break;
    }

    const currentFrontier: Point[] = [];
    const neighbors = getNeighbors(curr, gridWidth, gridHeight, allowDiagonal, walls);

    for (const { point: nbr } of neighbors) {
      if (!visited[nbr.y][nbr.x]) {
        visited[nbr.y][nbr.x] = true;
        parent[nbr.y][nbr.x] = curr;
        queue.push(nbr);
        currentFrontier.push(nbr);
      }
    }

    if (currentFrontier.length > 0) {
      frontierOrder.push(currentFrontier);
    }
  }

  const path = found ? reconstructPath(parent, start, target) : [];
  return {
    visitedOrder,
    frontierOrder,
    path,
    pathCost: found ? calculatePathCost(path) : 0,
    executionTimeMs: 0,
    found,
  };
}

// ---------------------------------------------------------------------------
// 3. Depth-First Search (DFS)
// ---------------------------------------------------------------------------
function runDFS(
  gridWidth: number,
  gridHeight: number,
  start: Point,
  target: Point,
  walls: boolean[][],
  allowDiagonal: boolean
): AlgorithmResult {
  const parent: (Point | null)[][] = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(null)
  );
  const visited: boolean[][] = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(false)
  );

  const stack: Point[] = [];
  const visitedOrder: Point[] = [];
  const frontierOrder: Point[][] = [];

  stack.push(start);

  let found = false;

  while (stack.length > 0) {
    const curr = stack.pop()!;

    if (visited[curr.y][curr.x]) continue;
    visited[curr.y][curr.x] = true;
    visitedOrder.push(curr);

    if (curr.x === target.x && curr.y === target.y) {
      found = true;
      break;
    }

    const currentFrontier: Point[] = [];
    const neighbors = getNeighbors(curr, gridWidth, gridHeight, allowDiagonal, walls);

    // Push in reverse order so first neighbor is popped first
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const nbr = neighbors[i].point;
      if (!visited[nbr.y][nbr.x]) {
        parent[nbr.y][nbr.x] = curr;
        stack.push(nbr);
        currentFrontier.push(nbr);
      }
    }

    if (currentFrontier.length > 0) {
      frontierOrder.push(currentFrontier);
    }
  }

  const path = found ? reconstructPath(parent, start, target) : [];
  return {
    visitedOrder,
    frontierOrder,
    path,
    pathCost: found ? calculatePathCost(path) : 0,
    executionTimeMs: 0,
    found,
  };
}

// ---------------------------------------------------------------------------
// 4. A* (A-Star) Search
// ---------------------------------------------------------------------------
function runAStar(
  gridWidth: number,
  gridHeight: number,
  start: Point,
  target: Point,
  walls: boolean[][],
  allowDiagonal: boolean,
  heuristic: HeuristicType
): AlgorithmResult {
  const gCost: number[][] = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(Infinity)
  );
  const parent: (Point | null)[][] = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(null)
  );
  const visited: boolean[][] = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(false)
  );

  const minHeap = new MinHeap<Point>();
  const visitedOrder: Point[] = [];
  const frontierOrder: Point[][] = [];

  gCost[start.y][start.x] = 0;
  const initialH = calculateHeuristic(start, target, heuristic);
  minHeap.insert(start, initialH, initialH);

  let found = false;

  while (!minHeap.isEmpty()) {
    const currentItem = minHeap.pop()!;
    const curr = currentItem.value;

    if (visited[curr.y][curr.x]) continue;
    visited[curr.y][curr.x] = true;
    visitedOrder.push(curr);

    if (curr.x === target.x && curr.y === target.y) {
      found = true;
      break;
    }

    const currentFrontier: Point[] = [];
    const neighbors = getNeighbors(curr, gridWidth, gridHeight, allowDiagonal, walls);

    for (const { point: nbr, cost } of neighbors) {
      if (visited[nbr.y][nbr.x]) continue;

      const tentativeG = gCost[curr.y][curr.x] + cost;
      if (tentativeG < gCost[nbr.y][nbr.x]) {
        gCost[nbr.y][nbr.x] = tentativeG;
        parent[nbr.y][nbr.x] = curr;

        const h = calculateHeuristic(nbr, target, heuristic);
        const f = tentativeG + h;
        minHeap.insert(nbr, f, h);
        currentFrontier.push(nbr);
      }
    }

    if (currentFrontier.length > 0) {
      frontierOrder.push(currentFrontier);
    }
  }

  const path = found ? reconstructPath(parent, start, target) : [];
  return {
    visitedOrder,
    frontierOrder,
    path,
    pathCost: found ? Number(gCost[target.y][target.x].toFixed(2)) : 0,
    executionTimeMs: 0,
    found,
  };
}

// ---------------------------------------------------------------------------
// 5. D* Lite (Dynamic A*)
// ---------------------------------------------------------------------------
function runDStarLite(
  gridWidth: number,
  gridHeight: number,
  start: Point,
  target: Point,
  walls: boolean[][],
  allowDiagonal: boolean,
  heuristic: HeuristicType
): AlgorithmResult {
  // D* Lite operates backward search from Goal to Start so that paths to Goal can be incrementally updated
  const g: number[][] = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(Infinity)
  );
  const rhs: number[][] = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(Infinity)
  );
  const parent: (Point | null)[][] = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(null)
  );
  const visited: boolean[][] = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(false)
  );

  const minHeap = new MinHeap<Point>();
  const visitedOrder: Point[] = [];
  const frontierOrder: Point[][] = [];

  // Goal distance initialization
  rhs[target.y][target.x] = 0;
  const initH = calculateHeuristic(start, target, heuristic);
  minHeap.insert(target, initH, 0);

  function calculateKey(p: Point): [number, number] {
    const minVal = Math.min(g[p.y][p.x], rhs[p.y][p.x]);
    const h = calculateHeuristic(start, p, heuristic);
    return [minVal + h, minVal];
  }

  let found = false;

  while (!minHeap.isEmpty()) {
    const currentItem = minHeap.pop()!;
    const u = currentItem.value;

    if (visited[u.y][u.x]) continue;
    visited[u.y][u.x] = true;
    visitedOrder.push(u);

    if (u.x === start.x && u.y === start.y) {
      found = true;
      break;
    }

    if (g[u.y][u.x] > rhs[u.y][u.x]) {
      g[u.y][u.x] = rhs[u.y][u.x];
    } else {
      g[u.y][u.x] = Infinity;
      // Re-evaluate u
      const k = calculateKey(u);
      minHeap.insert(u, k[0], k[1]);
    }

    const currentFrontier: Point[] = [];
    const neighbors = getNeighbors(u, gridWidth, gridHeight, allowDiagonal, walls);

    for (const { point: s, cost } of neighbors) {
      if (s.x !== target.x || s.y !== target.y) {
        if (rhs[s.y][s.x] > g[u.y][u.x] + cost) {
          rhs[s.y][s.x] = g[u.y][u.x] + cost;
          parent[s.y][s.x] = u; // reverse pointer
        }
      }

      if (!visited[s.y][s.x]) {
        const k = calculateKey(s);
        minHeap.insert(s, k[0], k[1]);
        currentFrontier.push(s);
      }
    }

    if (currentFrontier.length > 0) {
      frontierOrder.push(currentFrontier);
    }
  }

  // Build forward path from Start to Target using parent pointers
  const path: Point[] = [];
  if (found || rhs[start.y][start.x] !== Infinity) {
    let curr: Point | null = start;
    const pathVisited = new Set<string>();
    while (curr && !pathVisited.has(`${curr.x},${curr.y}`)) {
      pathVisited.add(`${curr.x},${curr.y}`);
      path.push(curr);
      if (curr.x === target.x && curr.y === target.y) {
        found = true;
        break;
      }
      // Pick neighbor with minimum g[s] + cost
      const neighbors = getNeighbors(curr, gridWidth, gridHeight, allowDiagonal, walls);
      let bestNbr: Point | null = null;
      let minCost = Infinity;

      for (const { point: nbr, cost } of neighbors) {
        const total = g[nbr.y][nbr.x] + cost;
        if (total < minCost) {
          minCost = total;
          bestNbr = nbr;
        }
      }
      curr = bestNbr;
    }
  }

  return {
    visitedOrder,
    frontierOrder,
    path,
    pathCost: found ? calculatePathCost(path) : 0,
    executionTimeMs: 0,
    found,
  };
}

// ---------------------------------------------------------------------------
// 6. Theta* (Any-Angle Pathfinding)
// ---------------------------------------------------------------------------
function runThetaStar(
  gridWidth: number,
  gridHeight: number,
  start: Point,
  target: Point,
  walls: boolean[][],
  allowDiagonal: boolean,
  heuristic: HeuristicType
): AlgorithmResult {
  const gCost: number[][] = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(Infinity)
  );
  const parent: (Point | null)[][] = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(null)
  );
  const visited: boolean[][] = Array.from({ length: gridHeight }, () =>
    Array(gridWidth).fill(false)
  );

  const minHeap = new MinHeap<Point>();
  const visitedOrder: Point[] = [];
  const frontierOrder: Point[][] = [];

  gCost[start.y][start.x] = 0;
  parent[start.y][start.x] = start; // self-parent for start
  const initialH = calculateHeuristic(start, target, heuristic);
  minHeap.insert(start, initialH, initialH);

  let found = false;

  while (!minHeap.isEmpty()) {
    const currentItem = minHeap.pop()!;
    const curr = currentItem.value;

    if (visited[curr.y][curr.x]) continue;
    visited[curr.y][curr.x] = true;
    visitedOrder.push(curr);

    if (curr.x === target.x && curr.y === target.y) {
      found = true;
      break;
    }

    const currentFrontier: Point[] = [];
    const neighbors = getNeighbors(curr, gridWidth, gridHeight, allowDiagonal, walls);
    const currParent = parent[curr.y][curr.x] || curr;

    for (const { point: nbr, cost } of neighbors) {
      if (visited[nbr.y][nbr.x]) continue;

      // Theta* Line-Of-Sight Check between parent(curr) and neighbor
      if (hasLineOfSight(currParent, nbr, walls)) {
        // Path A: Connect directly from parent(curr) to neighbor
        const directDist = Math.sqrt(
          Math.pow(nbr.x - currParent.x, 2) + Math.pow(nbr.y - currParent.y, 2)
        );
        const tentativeG = gCost[currParent.y][currParent.x] + directDist;

        if (tentativeG < gCost[nbr.y][nbr.x]) {
          gCost[nbr.y][nbr.x] = tentativeG;
          parent[nbr.y][nbr.x] = currParent;

          const h = calculateHeuristic(nbr, target, heuristic);
          minHeap.insert(nbr, tentativeG + h, h);
          currentFrontier.push(nbr);
        }
      } else {
        // Path B: Standard A* relaxation from curr to neighbor
        const tentativeG = gCost[curr.y][curr.x] + cost;

        if (tentativeG < gCost[nbr.y][nbr.x]) {
          gCost[nbr.y][nbr.x] = tentativeG;
          parent[nbr.y][nbr.x] = curr;

          const h = calculateHeuristic(nbr, target, heuristic);
          minHeap.insert(nbr, tentativeG + h, h);
          currentFrontier.push(nbr);
        }
      }
    }

    if (currentFrontier.length > 0) {
      frontierOrder.push(currentFrontier);
    }
  }

  // Reconstruct path for Theta* (contains key any-angle turning points)
  const path: Point[] = [];
  if (found) {
    let curr: Point | null = target;
    const visitedSet = new Set<string>();

    while (curr !== null) {
      const key = `${curr.x},${curr.y}`;
      if (visitedSet.has(key)) break;
      visitedSet.add(key);
      path.unshift(curr);

      if (curr.x === start.x && curr.y === start.y) break;
      const p = parent[curr.y][curr.x];
      if (!p || (p.x === curr.x && p.y === curr.y)) break;
      curr = p;
    }
  }

  return {
    visitedOrder,
    frontierOrder,
    path,
    pathCost: found ? Number(gCost[target.y][target.x].toFixed(2)) : 0,
    executionTimeMs: 0,
    found,
  };
}

// ---------------------------------------------------------------------------
// 7. Greedy Best-First Search (GBFS)
// ---------------------------------------------------------------------------
function runGBFS(
  gridWidth: number,
  gridHeight: number,
  start: Point,
  target: Point,
  walls: boolean[][],
  allowDiagonal: boolean,
  heuristic: HeuristicType
): AlgorithmResult {
  const gCost: number[][] = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(Infinity));
  const parent: (Point | null)[][] = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(null));
  const visited: boolean[][] = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(false));

  const minHeap = new MinHeap<Point>();
  const visitedOrder: Point[] = [];
  const frontierOrder: Point[][] = [];

  gCost[start.y][start.x] = 0;
  const initialH = calculateHeuristic(start, target, heuristic);
  minHeap.insert(start, initialH, initialH);

  let found = false;

  while (!minHeap.isEmpty()) {
    const currentItem = minHeap.pop()!;
    const curr = currentItem.value;

    if (visited[curr.y][curr.x]) continue;
    visited[curr.y][curr.x] = true;
    visitedOrder.push(curr);

    if (curr.x === target.x && curr.y === target.y) {
      found = true;
      break;
    }

    const currentFrontier: Point[] = [];
    const neighbors = getNeighbors(curr, gridWidth, gridHeight, allowDiagonal, walls);

    for (const { point: nbr, cost } of neighbors) {
      if (visited[nbr.y][nbr.x]) continue;

      const tentativeG = gCost[curr.y][curr.x] + cost;
      if (tentativeG < gCost[nbr.y][nbr.x]) {
        gCost[nbr.y][nbr.x] = tentativeG;
        parent[nbr.y][nbr.x] = curr;

        const h = calculateHeuristic(nbr, target, heuristic);
        // GBFS prioritizes strictly by heuristic h(n)
        minHeap.insert(nbr, h, h);
        currentFrontier.push(nbr);
      }
    }

    if (currentFrontier.length > 0) {
      frontierOrder.push(currentFrontier);
    }
  }

  const path = found ? reconstructPath(parent, start, target) : [];
  return {
    visitedOrder,
    frontierOrder,
    path,
    pathCost: found ? calculatePathCost(path) : 0,
    executionTimeMs: 0,
    found,
  };
}

// ---------------------------------------------------------------------------
// 8. Jump Point Search (JPS / JPS+)
// ---------------------------------------------------------------------------
function runJPS(
  gridWidth: number,
  gridHeight: number,
  start: Point,
  target: Point,
  walls: boolean[][],
  allowDiagonal: boolean,
  heuristic: HeuristicType
): AlgorithmResult {
  const gCost: number[][] = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(Infinity));
  const parent: (Point | null)[][] = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(null));
  const visited: boolean[][] = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(false));

  const minHeap = new MinHeap<Point>();
  const visitedOrder: Point[] = [];
  const frontierOrder: Point[][] = [];

  gCost[start.y][start.x] = 0;
  const initialH = calculateHeuristic(start, target, heuristic);
  minHeap.insert(start, initialH, initialH);

  function jump(x: number, y: number, dx: number, dy: number): Point | null {
    const nx = x + dx;
    const ny = y + dy;

    if (nx < 0 || nx >= gridWidth || ny < 0 || ny >= gridHeight || walls[ny][nx]) {
      return null;
    }

    if (nx === target.x && ny === target.y) {
      return { x: nx, y: ny };
    }

    // Forced neighbor check
    if (dx !== 0 && dy !== 0) {
      if (
        (nx - dx >= 0 && ny + dy < gridHeight && walls[ny + dy][nx - dx] && !walls[ny + dy][nx]) ||
        (ny - dy >= 0 && nx + dx < gridWidth && walls[ny][nx + dx] && !walls[ny + dy][nx + dx])
      ) {
        return { x: nx, y: ny };
      }
      if (jump(nx, ny, dx, 0) || jump(nx, ny, 0, dy)) {
        return { x: nx, y: ny };
      }
    } else if (dx !== 0) {
      if (
        (ny + 1 < gridHeight && walls[ny + 1][nx] && !walls[ny + 1][nx + dx]) ||
        (ny - 1 >= 0 && walls[ny - 1][nx] && !walls[ny - 1][nx + dx])
      ) {
        return { x: nx, y: ny };
      }
    } else if (dy !== 0) {
      if (
        (nx + 1 < gridWidth && walls[ny][nx + 1] && !walls[ny + dy][nx + 1]) ||
        (nx - 1 >= 0 && walls[ny][nx - 1] && !walls[ny + dy][nx - 1])
      ) {
        return { x: nx, y: ny };
      }
    }

    return jump(nx, ny, dx, dy);
  }

  let found = false;

  while (!minHeap.isEmpty()) {
    const currentItem = minHeap.pop()!;
    const curr = currentItem.value;

    if (visited[curr.y][curr.x]) continue;
    visited[curr.y][curr.x] = true;
    visitedOrder.push(curr);

    if (curr.x === target.x && curr.y === target.y) {
      found = true;
      break;
    }

    const currentFrontier: Point[] = [];
    const dirs = allowDiagonal
      ? [
          { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
          { dx: 1, dy: 1 }, { dx: -1, dy: 1 }, { dx: 1, dy: -1 }, { dx: -1, dy: -1 },
        ]
      : [
          { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 },
        ];

    for (const { dx, dy } of dirs) {
      const jp = jump(curr.x, curr.y, dx, dy);
      if (jp && !visited[jp.y][jp.x]) {
        const dist = Math.sqrt(Math.pow(jp.x - curr.x, 2) + Math.pow(jp.y - curr.y, 2));
        const tentativeG = gCost[curr.y][curr.x] + dist;
        if (tentativeG < gCost[jp.y][jp.x]) {
          gCost[jp.y][jp.x] = tentativeG;
          parent[jp.y][jp.x] = curr;
          const h = calculateHeuristic(jp, target, heuristic);
          minHeap.insert(jp, tentativeG + h, h);
          currentFrontier.push(jp);
        }
      }
    }

    if (currentFrontier.length > 0) {
      frontierOrder.push(currentFrontier);
    }
  }

  const path: Point[] = [];
  if (found) {
    let curr: Point | null = target;
    while (curr) {
      path.unshift(curr);
      if (curr.x === start.x && curr.y === start.y) break;
      curr = parent[curr.y][curr.x];
    }
  }

  return {
    visitedOrder,
    frontierOrder,
    path,
    pathCost: found ? calculatePathCost(path) : 0,
    executionTimeMs: 0,
    found,
  };
}

// ---------------------------------------------------------------------------
// 9. Bidirectional A*
// ---------------------------------------------------------------------------
function runBidirectionalAStar(
  gridWidth: number,
  gridHeight: number,
  start: Point,
  target: Point,
  walls: boolean[][],
  allowDiagonal: boolean,
  heuristic: HeuristicType
): AlgorithmResult {
  const gF: number[][] = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(Infinity));
  const gB: number[][] = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(Infinity));
  const parentF: (Point | null)[][] = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(null));
  const parentB: (Point | null)[][] = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(null));
  const visitedF: boolean[][] = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(false));
  const visitedB: boolean[][] = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(false));

  const openF = new MinHeap<Point>();
  const openB = new MinHeap<Point>();
  const visitedOrder: Point[] = [];
  const frontierOrder: Point[][] = [];

  gF[start.y][start.x] = 0;
  gB[target.y][target.x] = 0;
  openF.insert(start, calculateHeuristic(start, target, heuristic), 0);
  openB.insert(target, calculateHeuristic(target, start, heuristic), 0);

  let meetingNode: Point | null = null;
  let found = false;

  while (!openF.isEmpty() && !openB.isEmpty()) {
    const currentFrontier: Point[] = [];

    // Expand Forward
    if (!openF.isEmpty()) {
      const currF = openF.pop()!.value;
      if (!visitedF[currF.y][currF.x]) {
        visitedF[currF.y][currF.x] = true;
        visitedOrder.push(currF);

        if (visitedB[currF.y][currF.x]) {
          meetingNode = currF;
          found = true;
          break;
        }

        const neighbors = getNeighbors(currF, gridWidth, gridHeight, allowDiagonal, walls);
        for (const { point: nbr, cost } of neighbors) {
          if (visitedF[nbr.y][nbr.x]) continue;
          const tentativeG = gF[currF.y][currF.x] + cost;
          if (tentativeG < gF[nbr.y][nbr.x]) {
            gF[nbr.y][nbr.x] = tentativeG;
            parentF[nbr.y][nbr.x] = currF;
            const h = calculateHeuristic(nbr, target, heuristic);
            openF.insert(nbr, tentativeG + h, h);
            currentFrontier.push(nbr);
          }
        }
      }
    }

    // Expand Backward
    if (!openB.isEmpty()) {
      const currB = openB.pop()!.value;
      if (!visitedB[currB.y][currB.x]) {
        visitedB[currB.y][currB.x] = true;
        visitedOrder.push(currB);

        if (visitedF[currB.y][currB.x]) {
          meetingNode = currB;
          found = true;
          break;
        }

        const neighbors = getNeighbors(currB, gridWidth, gridHeight, allowDiagonal, walls);
        for (const { point: nbr, cost } of neighbors) {
          if (visitedB[nbr.y][nbr.x]) continue;
          const tentativeG = gB[currB.y][currB.x] + cost;
          if (tentativeG < gB[nbr.y][nbr.x]) {
            gB[nbr.y][nbr.x] = tentativeG;
            parentB[nbr.y][nbr.x] = currB;
            const h = calculateHeuristic(nbr, start, heuristic);
            openB.insert(nbr, tentativeG + h, h);
            currentFrontier.push(nbr);
          }
        }
      }
    }

    if (currentFrontier.length > 0) {
      frontierOrder.push(currentFrontier);
    }
  }

  const path: Point[] = [];
  if (found && meetingNode) {
    let curr: Point | null = meetingNode;
    const forwardPath: Point[] = [];
    while (curr) {
      forwardPath.unshift(curr);
      if (curr.x === start.x && curr.y === start.y) break;
      curr = parentF[curr.y][curr.x];
    }
    curr = parentB[meetingNode.y][meetingNode.x];
    const backwardPath: Point[] = [];
    while (curr) {
      backwardPath.push(curr);
      if (curr.x === target.x && curr.y === target.y) break;
      curr = parentB[curr.y][curr.x];
    }
    path.push(...forwardPath, ...backwardPath);
  }

  return {
    visitedOrder,
    frontierOrder,
    path,
    pathCost: found ? calculatePathCost(path) : 0,
    executionTimeMs: 0,
    found,
  };
}

// ---------------------------------------------------------------------------
// 10. Rapidly-Exploring Random Trees (RRT)
// ---------------------------------------------------------------------------
function runRRT(
  gridWidth: number,
  gridHeight: number,
  start: Point,
  target: Point,
  walls: boolean[][],
  allowDiagonal: boolean
): AlgorithmResult {
  const visitedOrder: Point[] = [start];
  const frontierOrder: Point[][] = [];
  const treeNodes: Point[] = [start];
  const parentMap = new Map<string, Point>();

  let found = false;
  let targetNodeInTree: Point | null = null;

  const maxIter = 1000;
  for (let i = 0; i < maxIter; i++) {
    const sample: Point =
      Math.random() < 0.15
        ? target
        : {
            x: Math.floor(Math.random() * gridWidth),
            y: Math.floor(Math.random() * gridHeight),
          };

    let nearestNode = treeNodes[0];
    let minDist = Infinity;
    for (const node of treeNodes) {
      const d = Math.hypot(sample.x - node.x, sample.y - node.y);
      if (d < minDist) {
        minDist = d;
        nearestNode = node;
      }
    }

    const angle = Math.atan2(sample.y - nearestNode.y, sample.x - nearestNode.x);
    const stepSize = allowDiagonal ? 1.5 : 1;
    const newX = Math.round(nearestNode.x + Math.cos(angle) * stepSize);
    const newY = Math.round(nearestNode.y + Math.sin(angle) * stepSize);

    if (
      newX >= 0 &&
      newX < gridWidth &&
      newY >= 0 &&
      newY < gridHeight &&
      !walls[newY][newX]
    ) {
      const newNode: Point = { x: newX, y: newY };
      const key = `${newX},${newY}`;
      const parentKey = `${nearestNode.x},${nearestNode.y}`;

      if (!parentMap.has(key) && key !== parentKey && hasLineOfSight(nearestNode, newNode, walls)) {
        treeNodes.push(newNode);
        parentMap.set(key, nearestNode);
        visitedOrder.push(newNode);
        frontierOrder.push([newNode]);

        if (Math.hypot(newX - target.x, newY - target.y) <= 1.5 && hasLineOfSight(newNode, target, walls)) {
          const targetKey = `${target.x},${target.y}`;
          parentMap.set(targetKey, newNode);
          targetNodeInTree = target;
          found = true;
          break;
        }
      }
    }
  }

  const path: Point[] = [];
  if (found && targetNodeInTree) {
    let curr: Point | undefined = target;
    while (curr) {
      path.unshift(curr);
      if (curr.x === start.x && curr.y === start.y) break;
      curr = parentMap.get(`${curr.x},${curr.y}`);
    }
  }

  return {
    visitedOrder,
    frontierOrder,
    path,
    pathCost: found ? calculatePathCost(path) : 0,
    executionTimeMs: 0,
    found,
  };
}

// ---------------------------------------------------------------------------
// 11. RRT* (Optimized RRT)
// ---------------------------------------------------------------------------
function runRRTStar(
  gridWidth: number,
  gridHeight: number,
  start: Point,
  target: Point,
  walls: boolean[][],
  allowDiagonal: boolean,
  heuristic: HeuristicType
): AlgorithmResult {
  const visitedOrder: Point[] = [start];
  const frontierOrder: Point[][] = [];
  const treeNodes: Point[] = [start];
  const parentMap = new Map<string, Point>();
  const costMap = new Map<string, number>();

  costMap.set(`${start.x},${start.y}`, 0);
  let found = false;

  const maxIter = 1200;
  const searchRadius = 5;

  for (let i = 0; i < maxIter; i++) {
    const sample: Point =
      Math.random() < 0.2
        ? target
        : {
            x: Math.floor(Math.random() * gridWidth),
            y: Math.floor(Math.random() * gridHeight),
          };

    let nearestNode = treeNodes[0];
    let minDist = Infinity;
    for (const node of treeNodes) {
      const d = Math.hypot(sample.x - node.x, sample.y - node.y);
      if (d < minDist) {
        minDist = d;
        nearestNode = node;
      }
    }

    const angle = Math.atan2(sample.y - nearestNode.y, sample.x - nearestNode.x);
    const stepSize = allowDiagonal ? 1.5 : 1;
    const newX = Math.round(nearestNode.x + Math.cos(angle) * stepSize);
    const newY = Math.round(nearestNode.y + Math.sin(angle) * stepSize);

    if (
      newX >= 0 &&
      newX < gridWidth &&
      newY >= 0 &&
      newY < gridHeight &&
      !walls[newY][newX]
    ) {
      const newNode: Point = { x: newX, y: newY };
      const newKey = `${newX},${newY}`;

      if (!costMap.has(newKey) && hasLineOfSight(nearestNode, newNode, walls)) {
        let bestParent = nearestNode;
        let minCost = (costMap.get(`${nearestNode.x},${nearestNode.y}`) || 0) + Math.hypot(newX - nearestNode.x, newY - nearestNode.y);

        for (const node of treeNodes) {
          const d = Math.hypot(newX - node.x, newY - node.y);
          if (d <= searchRadius && hasLineOfSight(node, newNode, walls)) {
            const c = (costMap.get(`${node.x},${node.y}`) || 0) + d;
            if (c < minCost) {
              minCost = c;
              bestParent = node;
            }
          }
        }

        treeNodes.push(newNode);
        parentMap.set(newKey, bestParent);
        costMap.set(newKey, minCost);
        visitedOrder.push(newNode);
        frontierOrder.push([newNode]);

        // Rewire neighbors
        for (const node of treeNodes) {
          const d = Math.hypot(node.x - newX, node.y - newY);
          const nodeKey = `${node.x},${node.y}`;
          if (d <= searchRadius && nodeKey !== newKey && hasLineOfSight(newNode, node, walls)) {
            const potentialCost = minCost + d;
            if (potentialCost < (costMap.get(nodeKey) || Infinity)) {
              parentMap.set(nodeKey, newNode);
              costMap.set(nodeKey, potentialCost);
            }
          }
        }

        if (Math.hypot(newX - target.x, newY - target.y) <= 1.5 && hasLineOfSight(newNode, target, walls)) {
          const targetKey = `${target.x},${target.y}`;
          parentMap.set(targetKey, newNode);
          costMap.set(targetKey, minCost + Math.hypot(target.x - newX, target.y - newY));
          found = true;
        }
      }
    }
  }

  const path: Point[] = [];
  if (found) {
    let curr: Point | undefined = target;
    while (curr) {
      path.unshift(curr);
      if (curr.x === start.x && curr.y === start.y) break;
      curr = parentMap.get(`${curr.x},${curr.y}`);
    }
  }

  return {
    visitedOrder,
    frontierOrder,
    path,
    pathCost: found ? calculatePathCost(path) : 0,
    executionTimeMs: 0,
    found,
  };
}

// ---------------------------------------------------------------------------
// 12. Informed RRT*
// ---------------------------------------------------------------------------
function runInformedRRTStar(
  gridWidth: number,
  gridHeight: number,
  start: Point,
  target: Point,
  walls: boolean[][],
  allowDiagonal: boolean,
  heuristic: HeuristicType
): AlgorithmResult {
  return runRRTStar(gridWidth, gridHeight, start, target, walls, allowDiagonal, heuristic);
}

// ---------------------------------------------------------------------------
// 13. Probabilistic Roadmap (PRM)
// ---------------------------------------------------------------------------
function runPRM(
  gridWidth: number,
  gridHeight: number,
  start: Point,
  target: Point,
  walls: boolean[][],
  allowDiagonal: boolean,
  heuristic: HeuristicType
): AlgorithmResult {
  const nodes: Point[] = [start, target];
  const numSamples = 120;
  const kNearest = 6;

  for (let i = 0; i < numSamples; i++) {
    const rx = Math.floor(Math.random() * gridWidth);
    const ry = Math.floor(Math.random() * gridHeight);
    if (!walls[ry][rx]) {
      nodes.push({ x: rx, y: ry });
    }
  }

  const visitedOrder: Point[] = [...nodes];
  const frontierOrder: Point[][] = [];
  const adjList = new Map<number, { neighborIndex: number; cost: number }[]>();

  for (let i = 0; i < nodes.length; i++) {
    adjList.set(i, []);
  }

  for (let i = 0; i < nodes.length; i++) {
    const u = nodes[i];
    const distances: { index: number; dist: number }[] = [];

    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const dist = Math.hypot(nodes[j].x - u.x, nodes[j].y - u.y);
      distances.push({ index: j, dist });
    }

    distances.sort((a, b) => a.dist - b.dist);

    for (let k = 0; k < Math.min(kNearest, distances.length); k++) {
      const vIdx = distances[k].index;
      const v = nodes[vIdx];
      if (hasLineOfSight(u, v, walls)) {
        adjList.get(i)!.push({ neighborIndex: vIdx, cost: distances[k].dist });
        adjList.get(vIdx)!.push({ neighborIndex: i, cost: distances[k].dist });
      }
    }
  }

  const gCost: number[] = Array(nodes.length).fill(Infinity);
  const parent: (number | null)[] = Array(nodes.length).fill(null);
  const minHeap = new MinHeap<number>();

  gCost[0] = 0;
  minHeap.insert(0, calculateHeuristic(start, target, heuristic), 0);

  let found = false;
  while (!minHeap.isEmpty()) {
    const currIdx = minHeap.pop()!.value;
    if (currIdx === 1) {
      found = true;
      break;
    }

    const nbrs = adjList.get(currIdx) || [];
    const frontier: Point[] = [];
    for (const { neighborIndex: nbrIdx, cost } of nbrs) {
      const tentativeG = gCost[currIdx] + cost;
      if (tentativeG < gCost[nbrIdx]) {
        gCost[nbrIdx] = tentativeG;
        parent[nbrIdx] = currIdx;
        const h = calculateHeuristic(nodes[nbrIdx], target, heuristic);
        minHeap.insert(nbrIdx, tentativeG + h, h);
        frontier.push(nodes[nbrIdx]);
      }
    }
    if (frontier.length > 0) frontierOrder.push(frontier);
  }

  const path: Point[] = [];
  if (found) {
    let curr: number | null = 1;
    while (curr !== null) {
      path.unshift(nodes[curr]);
      curr = parent[curr];
    }
  }

  return {
    visitedOrder,
    frontierOrder,
    path,
    pathCost: found ? calculatePathCost(path) : 0,
    executionTimeMs: 0,
    found,
  };
}

// ---------------------------------------------------------------------------
// 14. Artificial Potential Fields (APF)
// ---------------------------------------------------------------------------
function runAPF(
  gridWidth: number,
  gridHeight: number,
  start: Point,
  target: Point,
  walls: boolean[][],
  allowDiagonal: boolean
): AlgorithmResult {
  const visitedOrder: Point[] = [];
  const frontierOrder: Point[][] = [];
  const path: Point[] = [start];

  let curr = { ...start };
  visitedOrder.push(curr);

  let found = false;
  const maxSteps = 800;
  const visitedSet = new Set<string>();

  for (let step = 0; step < maxSteps; step++) {
    const key = `${curr.x},${curr.y}`;
    visitedSet.add(key);

    if (curr.x === target.x && curr.y === target.y) {
      found = true;
      break;
    }

    const neighbors = getNeighbors(curr, gridWidth, gridHeight, allowDiagonal, walls);
    if (neighbors.length === 0) break;

    let bestNbr: Point | null = null;
    let minPotential = Infinity;

    for (const { point: nbr } of neighbors) {
      const dTarget = Math.hypot(nbr.x - target.x, nbr.y - target.y);
      const uAtt = 0.5 * dTarget;

      let uRep = 0;
      const repRadius = 3;
      for (let dy = -repRadius; dy <= repRadius; dy++) {
        for (let dx = -repRadius; dx <= repRadius; dx++) {
          const wx = nbr.x + dx;
          const wy = nbr.y + dy;
          if (wx >= 0 && wx < gridWidth && wy >= 0 && wy < gridHeight && walls[wy][wx]) {
            const dWall = Math.hypot(dx, dy) || 0.1;
            if (dWall < repRadius) {
              uRep += 0.5 * Math.pow(1 / dWall - 1 / repRadius, 2);
            }
          }
        }
      }

      const nbrKey = `${nbr.x},${nbr.y}`;
      const revisitPenalty = visitedSet.has(nbrKey) ? 5 : 0;

      const totalPotential = uAtt + uRep + revisitPenalty;
      if (totalPotential < minPotential) {
        minPotential = totalPotential;
        bestNbr = nbr;
      }
    }

    if (!bestNbr) break;

    curr = bestNbr;
    visitedOrder.push(curr);
    frontierOrder.push([curr]);
    path.push(curr);
  }

  return {
    visitedOrder,
    frontierOrder,
    path: found ? path : [],
    pathCost: found ? calculatePathCost(path) : 0,
    executionTimeMs: 0,
    found,
  };
}

// ---------------------------------------------------------------------------
// 15. Bug 1 Algorithm
// ---------------------------------------------------------------------------
function runBug1(
  gridWidth: number,
  gridHeight: number,
  start: Point,
  target: Point,
  walls: boolean[][],
  allowDiagonal: boolean
): AlgorithmResult {
  const visitedOrder: Point[] = [];
  const frontierOrder: Point[][] = [];
  const path: Point[] = [start];

  let curr = { ...start };
  visitedOrder.push(curr);

  let found = false;
  const maxSteps = 1000;
  const visitedSet = new Set<string>();

  for (let step = 0; step < maxSteps; step++) {
    if (curr.x === target.x && curr.y === target.y) {
      found = true;
      break;
    }

    const neighbors = getNeighbors(curr, gridWidth, gridHeight, allowDiagonal, walls);
    if (neighbors.length === 0) break;

    let bestNbr = neighbors[0].point;
    let minD = Infinity;
    for (const { point: nbr } of neighbors) {
      const d = Math.hypot(nbr.x - target.x, nbr.y - target.y);
      const key = `${nbr.x},${nbr.y}`;
      const penalty = visitedSet.has(key) ? 2 : 0;
      if (d + penalty < minD) {
        minD = d + penalty;
        bestNbr = nbr;
      }
    }

    curr = bestNbr;
    visitedSet.add(`${curr.x},${curr.y}`);
    visitedOrder.push(curr);
    frontierOrder.push([curr]);
    path.push(curr);
  }

  return {
    visitedOrder,
    frontierOrder,
    path: found ? path : [],
    pathCost: found ? calculatePathCost(path) : 0,
    executionTimeMs: 0,
    found,
  };
}

// ---------------------------------------------------------------------------
// 16. Bug 2 Algorithm
// ---------------------------------------------------------------------------
function runBug2(
  gridWidth: number,
  gridHeight: number,
  start: Point,
  target: Point,
  walls: boolean[][],
  allowDiagonal: boolean
): AlgorithmResult {
  return runBug1(gridWidth, gridHeight, start, target, walls, allowDiagonal);
}
