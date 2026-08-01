import { Point, MazeType } from '../types';

/**
 * Generates a boolean 2D grid of walls (true = wall, false = passage).
 * Preserves Start and Target points as non-wall cells.
 */
export function generateMaze(
  mazeType: MazeType,
  width: number,
  height: number,
  start: Point,
  target: Point
): boolean[][] {
  const walls: boolean[][] = Array.from({ length: height }, () =>
    Array(width).fill(false)
  );

  switch (mazeType) {
    case 'random30':
      generateRandom30(walls, width, height, start, target);
      break;
    case 'recursive_division':
      generateRecursiveDivision(walls, width, height, start, target);
      break;
    case 'prims':
      generatePrims(walls, width, height, start, target);
      break;
    case 'dfs_backtracker':
      generateDFSBacktracker(walls, width, height, start, target);
      break;
    case 'kruskals':
      generateKruskals(walls, width, height, start, target);
      break;
    case 'ellers':
      generateEllers(walls, width, height, start, target);
      break;
    case 'wilsons':
      generateWilsons(walls, width, height, start, target);
      break;
    case 'sidewinder':
      generateSidewinder(walls, width, height, start, target);
      break;
    case 'spiral':
      generateSpiral(walls, width, height, start, target);
      break;
    default:
      generateRandom30(walls, width, height, start, target);
  }

  // Ensure start and target remain clear
  walls[start.y][start.x] = false;
  walls[target.y][target.x] = false;

  return walls;
}

/**
 * 30% Random Obstacles
 */
function generateRandom30(
  walls: boolean[][],
  width: number,
  height: number,
  start: Point,
  target: Point
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (
        (x === start.x && y === start.y) ||
        (x === target.x && y === target.y)
      ) {
        continue;
      }
      if (Math.random() < 0.3) {
        walls[y][x] = true;
      }
    }
  }
}

/**
 * Recursive Division Maze Generation
 */
function generateRecursiveDivision(
  walls: boolean[][],
  width: number,
  height: number,
  start: Point,
  target: Point
): void {
  // Fill outer border
  for (let x = 0; x < width; x++) {
    walls[0][x] = true;
    walls[height - 1][x] = true;
  }
  for (let y = 0; y < height; y++) {
    walls[y][0] = true;
    walls[y][width - 1] = true;
  }

  function addDivision(
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
  ) {
    if (maxX - minX < 3 || maxY - minY < 3) return;

    const horizontal = (maxX - minX) < (maxY - minY);

    if (horizontal) {
      // Choose wall y coordinate (even number)
      const possibleY: number[] = [];
      for (let y = minY + 1; y < maxY; y++) {
        if (y % 2 === 0) possibleY.push(y);
      }
      if (possibleY.length === 0) return;
      const wy = possibleY[Math.floor(Math.random() * possibleY.length)];

      // Choose hole x coordinate (odd number)
      const possibleHoles: number[] = [];
      for (let x = minX; x <= maxX; x++) {
        if (x % 2 !== 0) possibleHoles.push(x);
      }
      const holeX =
        possibleHoles.length > 0
          ? possibleHoles[Math.floor(Math.random() * possibleHoles.length)]
          : Math.floor((minX + maxX) / 2);

      for (let x = minX; x <= maxX; x++) {
        if (x !== holeX) {
          if (
            !(x === start.x && wy === start.y) &&
            !(x === target.x && wy === target.y)
          ) {
            walls[wy][x] = true;
          }
        }
      }

      addDivision(minX, maxX, minY, wy - 1);
      addDivision(minX, maxX, wy + 1, maxY);
    } else {
      // Choose wall x coordinate (even number)
      const possibleX: number[] = [];
      for (let x = minX + 1; x < maxX; x++) {
        if (x % 2 === 0) possibleX.push(x);
      }
      if (possibleX.length === 0) return;
      const wx = possibleX[Math.floor(Math.random() * possibleX.length)];

      // Choose hole y coordinate (odd number)
      const possibleHoles: number[] = [];
      for (let y = minY; y <= maxY; y++) {
        if (y % 2 !== 0) possibleHoles.push(y);
      }
      const holeY =
        possibleHoles.length > 0
          ? possibleHoles[Math.floor(Math.random() * possibleHoles.length)]
          : Math.floor((minY + maxY) / 2);

      for (let y = minY; y <= maxY; y++) {
        if (y !== holeY) {
          if (
            !(wx === start.x && y === start.y) &&
            !(wx === target.x && y === target.y)
          ) {
            walls[y][wx] = true;
          }
        }
      }

      addDivision(minX, wx - 1, minY, maxY);
      addDivision(wx + 1, maxX, minY, maxY);
    }
  }

  addDivision(1, width - 2, 1, height - 2);
}

/**
 * Randomized Prim's Maze Algorithm
 */
function generatePrims(
  walls: boolean[][],
  width: number,
  height: number,
  start: Point,
  target: Point
): void {
  // Fill all with walls
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      walls[y][x] = true;
    }
  }

  const frontier: { x: number; y: number; px: number; py: number }[] = [];

  // Start carving from start point
  walls[start.y][start.x] = false;

  function addFrontier(x: number, y: number) {
    const dirs = [
      { dx: 2, dy: 0 },
      { dx: -2, dy: 0 },
      { dx: 0, dy: 2 },
      { dx: 0, dy: -2 },
    ];
    for (const d of dirs) {
      const nx = x + d.dx;
      const ny = y + d.dy;
      if (nx >= 0 && nx < width && ny >= 0 && ny < height && walls[ny][nx]) {
        frontier.push({ x: nx, y: ny, px: x + d.dx / 2, py: y + d.dy / 2 });
      }
    }
  }

  addFrontier(start.x, start.y);

  while (frontier.length > 0) {
    const randIdx = Math.floor(Math.random() * frontier.length);
    const f = frontier.splice(randIdx, 1)[0];

    if (walls[f.y][f.x]) {
      walls[f.y][f.x] = false;
      walls[f.py][f.px] = false; // carve passage between
      addFrontier(f.x, f.y);
    }
  }

  // Clear area around target to ensure connectivity
  walls[target.y][target.x] = false;
}

/**
 * Spiral pattern maze
 */
function generateSpiral(
  walls: boolean[][],
  width: number,
  height: number,
  start: Point,
  target: Point
): void {
  let top = 1;
  let bottom = height - 2;
  let left = 1;
  let right = width - 2;

  let step = 0;
  while (top < bottom && left < right) {
    if (step % 2 === 0) {
      for (let x = left; x <= right; x++) walls[top][x] = true;
      for (let y = top; y <= bottom; y++) walls[y][right] = true;
      for (let x = right; x >= left; x--) walls[bottom][x] = true;
      for (let y = bottom; y >= top + 2; y--) walls[y][left] = true;
    }

    top += 2;
    bottom -= 2;
    left += 2;
    right -= 2;
    step++;
  }
}

/**
 * Recursive Backtracking (DFS) Maze Generation
 */
function generateDFSBacktracker(
  walls: boolean[][],
  width: number,
  height: number,
  start: Point,
  target: Point
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      walls[y][x] = true;
    }
  }

  const stack: Point[] = [{ x: 1, y: 1 }];
  walls[1][1] = false;

  const dirs = [
    { dx: 0, dy: -2 },
    { dx: 2, dy: 0 },
    { dx: 0, dy: 2 },
    { dx: -2, dy: 0 },
  ];

  while (stack.length > 0) {
    const curr = stack[stack.length - 1];
    const neighbors: { x: number; y: number; mx: number; my: number }[] = [];

    for (const d of dirs) {
      const nx = curr.x + d.dx;
      const ny = curr.y + d.dy;
      if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && walls[ny][nx]) {
        neighbors.push({ x: nx, y: ny, mx: curr.x + d.dx / 2, my: curr.y + d.dy / 2 });
      }
    }

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      walls[next.my][next.mx] = false;
      walls[next.y][next.x] = false;
      stack.push({ x: next.x, y: next.y });
    } else {
      stack.pop();
    }
  }
}

/**
 * Randomized Kruskal's Maze Generation
 */
function generateKruskals(
  walls: boolean[][],
  width: number,
  height: number,
  start: Point,
  target: Point
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      walls[y][x] = true;
    }
  }

  const parent = new Map<string, string>();
  function find(id: string): string {
    if (!parent.has(id)) parent.set(id, id);
    if (parent.get(id) !== id) {
      parent.set(id, find(parent.get(id)!));
    }
    return parent.get(id)!;
  }
  function union(id1: string, id2: string): boolean {
    const root1 = find(id1);
    const root2 = find(id2);
    if (root1 !== root2) {
      parent.set(root1, root2);
      return true;
    }
    return false;
  }

  const edges: { u: Point; v: Point; wall: Point }[] = [];

  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      walls[y][x] = false;
      const u = { x, y };

      if (x + 2 < width - 1) {
        edges.push({ u, v: { x: x + 2, y }, wall: { x: x + 1, y } });
      }
      if (y + 2 < height - 1) {
        edges.push({ u, v: { x, y: y + 2 }, wall: { x, y: y + 1 } });
      }
    }
  }

  for (let i = edges.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [edges[i], edges[j]] = [edges[j], edges[i]];
  }

  for (const { u, v, wall } of edges) {
    const keyU = `${u.x},${u.y}`;
    const keyV = `${v.x},${v.y}`;
    if (union(keyU, keyV)) {
      walls[wall.y][wall.x] = false;
    }
  }
}

/**
 * Eller's Row-by-Row Set Maze Algorithm
 */
function generateEllers(
  walls: boolean[][],
  width: number,
  height: number,
  start: Point,
  target: Point
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      walls[y][x] = true;
    }
  }

  let nextSetId = 1;
  const numCells = Math.floor((width - 1) / 2);
  const rowSets: number[] = Array(numCells).fill(0);

  for (let r = 1; r < height - 1; r += 2) {
    for (let c = 0; c < rowSets.length; c++) {
      if (rowSets[c] === 0) {
        rowSets[c] = nextSetId++;
      }
      walls[r][c * 2 + 1] = false;
    }

    for (let c = 0; c < rowSets.length - 1; c++) {
      if (rowSets[c] !== rowSets[c + 1]) {
        if (Math.random() < 0.5 || r >= height - 3) {
          const targetSet = rowSets[c + 1];
          const sourceSet = rowSets[c];
          rowSets[c + 1] = sourceSet;
          for (let k = 0; k < rowSets.length; k++) {
            if (rowSets[k] === targetSet) rowSets[k] = sourceSet;
          }
          walls[r][c * 2 + 2] = false;
        }
      }
    }

    if (r + 2 < height - 1) {
      const setMembers = new Map<number, number[]>();
      for (let c = 0; c < rowSets.length; c++) {
        const set = rowSets[c];
        if (!setMembers.has(set)) setMembers.set(set, []);
        setMembers.get(set)!.push(c);
      }

      const nextRowSets = Array(rowSets.length).fill(0);
      for (const [set, members] of setMembers.entries()) {
        const connects = members.filter(() => Math.random() < 0.5);
        if (connects.length === 0) {
          connects.push(members[Math.floor(Math.random() * members.length)]);
        }
        for (const c of connects) {
          walls[r + 1][c * 2 + 1] = false;
          nextRowSets[c] = set;
        }
      }

      for (let c = 0; c < rowSets.length; c++) {
        rowSets[c] = nextRowSets[c];
      }
    }
  }
}

/**
 * Wilson's Loop-Erased Random Walk Maze
 */
function generateWilsons(
  walls: boolean[][],
  width: number,
  height: number,
  start: Point,
  target: Point
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      walls[y][x] = true;
    }
  }

  const unvisited: Point[] = [];
  const visited = new Set<string>();

  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      unvisited.push({ x, y });
    }
  }

  if (unvisited.length === 0) return;

  const first = unvisited.pop()!;
  visited.add(`${first.x},${first.y}`);
  walls[first.y][first.x] = false;

  const dirs = [
    { dx: 0, dy: -2 },
    { dx: 2, dy: 0 },
    { dx: 0, dy: 2 },
    { dx: -2, dy: 0 },
  ];

  while (unvisited.length > 0) {
    const startWalk = unvisited[Math.floor(Math.random() * unvisited.length)];
    let curr = startWalk;

    const walk = new Map<string, { dx: number; dy: number }>();

    let steps = 0;
    while (!visited.has(`${curr.x},${curr.y}`) && steps < 2000) {
      steps++;
      const validDirs = dirs.filter((d) => {
        const nx = curr.x + d.dx;
        const ny = curr.y + d.dy;
        return nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1;
      });
      if (validDirs.length === 0) break;
      const d = validDirs[Math.floor(Math.random() * validDirs.length)];
      walk.set(`${curr.x},${curr.y}`, d);
      curr = { x: curr.x + d.dx, y: curr.y + d.dy };
    }

    let trace = startWalk;
    while (!visited.has(`${trace.x},${trace.y}`)) {
      const key = `${trace.x},${trace.y}`;
      const d = walk.get(key);
      if (!d) break;

      visited.add(key);
      walls[trace.y][trace.x] = false;
      walls[trace.y + d.dy / 2][trace.x + d.dx / 2] = false;

      const uIdx = unvisited.findIndex((p) => p.x === trace.x && p.y === trace.y);
      if (uIdx !== -1) unvisited.splice(uIdx, 1);

      trace = { x: trace.x + d.dx, y: trace.y + d.dy };
    }
  }
}

/**
 * Sidewinder Maze Generation
 */
function generateSidewinder(
  walls: boolean[][],
  width: number,
  height: number,
  start: Point,
  target: Point
): void {
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      walls[y][x] = true;
    }
  }

  for (let r = 1; r < height - 1; r += 2) {
    let run: Point[] = [];

    for (let c = 1; c < width - 1; c += 2) {
      walls[r][c] = false;
      run.push({ x: c, y: r });

      const atEastBoundary = c + 2 >= width - 1;
      const atNorthBoundary = r === 1;
      const shouldCloseRun = atEastBoundary || (!atNorthBoundary && Math.random() < 0.5);

      if (shouldCloseRun) {
        if (!atNorthBoundary) {
          const member = run[Math.floor(Math.random() * run.length)];
          walls[member.y - 1][member.x] = false;
        }
        run = [];
      } else {
        walls[r][c + 1] = false;
      }
    }
  }
}
