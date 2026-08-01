export type NodeType = 'empty' | 'wall' | 'start' | 'target' | 'visited' | 'frontier' | 'path';

export type AlgorithmType =
  // Graph-Based Algorithms
  | 'astar'
  | 'dijkstra'
  | 'gbfs'
  | 'bfs'
  | 'dfs'
  | 'jps'
  | 'bidirectional_astar'
  | 'thetastar'
  | 'dstarlite'
  // Sample-Based Algorithms
  | 'rrt'
  | 'rrtstar'
  | 'informed_rrtstar'
  | 'prm'
  // Reactive & Physics-Based Methods
  | 'apf'
  | 'bug1'
  | 'bug2';

export type HeuristicType = 'manhattan' | 'euclidean' | 'chebyshev';

export type MovementType = '4-way' | '8-way';

export type MazeType =
  | 'random30'
  | 'recursive_division'
  | 'prims'
  | 'dfs_backtracker'
  | 'kruskals'
  | 'ellers'
  | 'wilsons'
  | 'sidewinder'
  | 'spiral';

export interface Point {
  x: number;
  y: number;
}

export interface NodeData {
  x: number;
  y: number;
  type: NodeType;
  gCost: number;
  hCost: number;
  fCost: number;
  parent: NodeData | null;
  // D* Lite specific attributes
  rhs?: number;
  key?: [number, number];
}

export interface AlgorithmStep {
  visitedPoint?: Point;
  frontierPoints?: Point[];
  type: 'visit' | 'frontier' | 'path';
}

export interface AlgorithmResult {
  visitedOrder: Point[];
  frontierOrder: Point[][];
  path: Point[];
  pathCost: number;
  executionTimeMs: number;
  found: boolean;
}

export interface Metrics {
  visitedCount: number;
  frontierCount: number;
  pathLength: number;
  pathCost: number;
  executionTimeMs: number;
  status: 'idle' | 'searching' | 'paused' | 'found' | 'no_path';
}
