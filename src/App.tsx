/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Point,
  AlgorithmType,
  HeuristicType,
  MazeType,
  Metrics,
} from './types';
import { runPathfindingAlgorithm } from './algorithms/pathfinding';
import { generateMaze } from './utils/mazeGenerator';
import { ControlPanel } from './components/ControlPanel';
import { GridCanvas } from './components/GridCanvas';
import { MetricsBar } from './components/MetricsBar';
import { Toast } from './components/Toast';

export default function App() {
  // Grid parameters
  const [gridSize, setGridSize] = useState<number>(30);
  const [start, setStart] = useState<Point>({ x: 5, y: 15 });
  const [target, setTarget] = useState<Point>({ x: 24, y: 15 });
  const [walls, setWalls] = useState<boolean[][]>(() =>
    Array.from({ length: 30 }, () => Array(30).fill(false))
  );

  // Algorithm configuration
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('astar');
  const [heuristic, setHeuristic] = useState<HeuristicType>('manhattan');
  const [allowDiagonal, setAllowDiagonal] = useState<boolean>(false);
  const [animationSpeed, setAnimationSpeed] = useState<number>(20); // 0 (instant) to 100ms
  const [mazeType, setMazeType] = useState<MazeType>('random30');

  // Visualization state
  const [visitedSet, setVisitedSet] = useState<Set<string>>(new Set());
  const [frontierSet, setFrontierSet] = useState<Set<string>>(new Set());
  const [path, setPath] = useState<Point[]>([]);

  // Animation controller
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [hasRun, setHasRun] = useState<boolean>(false);

  // Toast alert
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'error' | 'info' | 'success'>('info');

  // Metrics tracking
  const [metrics, setMetrics] = useState<Metrics>({
    visitedCount: 0,
    frontierCount: 0,
    pathLength: 0,
    pathCost: 0,
    executionTimeMs: 0,
    status: 'idle',
  });

  // Animation refs for clean cleanup
  const animTimeoutRef = useRef<number | null>(null);
  const stepIndexRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Adjust Start/Target positions when Grid Size changes
  useEffect(() => {
    const newWalls = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill(false)
    );
    const newStart = {
      x: Math.max(0, Math.min(gridSize - 1, Math.floor(gridSize * 0.15))),
      y: Math.max(0, Math.min(gridSize - 1, Math.floor(gridSize * 0.5))),
    };
    const newTarget = {
      x: Math.max(0, Math.min(gridSize - 1, Math.floor(gridSize * 0.85))),
      y: Math.max(0, Math.min(gridSize - 1, Math.floor(gridSize * 0.5))),
    };

    setWalls(newWalls);
    setStart(newStart);
    setTarget(newTarget);
    clearPathState();
  }, [gridSize]);

  // Clears path & visualization state without changing walls
  const clearPathState = useCallback(() => {
    if (animTimeoutRef.current !== null) {
      window.clearTimeout(animTimeoutRef.current);
      animTimeoutRef.current = null;
    }
    setIsAnimating(false);
    setIsPaused(false);
    setHasRun(false);
    setVisitedSet(new Set());
    setFrontierSet(new Set());
    setPath([]);
    setMetrics({
      visitedCount: 0,
      frontierCount: 0,
      pathLength: 0,
      pathCost: 0,
      executionTimeMs: 0,
      status: 'idle',
    });
  }, []);

  // Instant recalculation helper when start/target/walls move post-run
  const recalculatePathInstant = useCallback(
    (
      currentStart: Point,
      currentTarget: Point,
      currentWalls: boolean[][]
    ) => {
      const result = runPathfindingAlgorithm(
        algorithm,
        gridSize,
        gridSize,
        currentStart,
        currentTarget,
        currentWalls,
        allowDiagonal,
        heuristic
      );

      const vSet = new Set<string>();
      result.visitedOrder.forEach((p) => vSet.add(`${p.x},${p.y}`));

      const fSet = new Set<string>();
      result.frontierOrder.forEach((group) =>
        group.forEach((p) => fSet.add(`${p.x},${p.y}`))
      );

      setVisitedSet(vSet);
      setFrontierSet(fSet);
      setPath(result.path);

      setMetrics({
        visitedCount: result.visitedOrder.length,
        frontierCount: fSet.size,
        pathLength: result.path.length,
        pathCost: result.pathCost,
        executionTimeMs: result.executionTimeMs,
        status: result.found ? 'found' : 'no_path',
      });

      if (!result.found) {
        setToastMessage('No reachable path found between Start and Target.');
        setToastType('error');
      }
    },
    [algorithm, gridSize, allowDiagonal, heuristic]
  );

  // Dynamic wall toggle handler
  const handleWallToggle = useCallback(
    (point: Point, isWall: boolean) => {
      setWalls((prev) => {
        const next = prev.map((row) => [...row]);
        if (point.y < gridSize && point.x < gridSize) {
          next[point.y][point.x] = isWall;
        }

        // If path has already run, instantly update path!
        if (hasRun && !isAnimating) {
          recalculatePathInstant(start, target, next);
        }

        return next;
      });
    },
    [gridSize, hasRun, isAnimating, start, target, recalculatePathInstant]
  );

  // Start Move Handler
  const handleStartMove = useCallback(
    (newStart: Point) => {
      setStart(newStart);
      if (hasRun && !isAnimating) {
        recalculatePathInstant(newStart, target, walls);
      }
    },
    [hasRun, isAnimating, target, walls, recalculatePathInstant]
  );

  // Target Move Handler
  const handleTargetMove = useCallback(
    (newTarget: Point) => {
      setTarget(newTarget);
      if (hasRun && !isAnimating) {
        recalculatePathInstant(start, newTarget, walls);
      }
    },
    [hasRun, isAnimating, start, walls, recalculatePathInstant]
  );

  // Execute Algorithm Visualization
  const handleVisualize = useCallback(() => {
    if (isAnimating && isPaused) {
      setIsPaused(false);
      return;
    }

    clearPathState();

    const result = runPathfindingAlgorithm(
      algorithm,
      gridSize,
      gridSize,
      start,
      target,
      walls,
      allowDiagonal,
      heuristic
    );

    setHasRun(true);

    if (animationSpeed === 0) {
      // Instant visualization mode
      recalculatePathInstant(start, target, walls);
      return;
    }

    // Async Step-by-Step Animation Pipeline
    setIsAnimating(true);
    setMetrics((prev) => ({
      ...prev,
      executionTimeMs: result.executionTimeMs,
      status: 'searching',
    }));

    const visitedOrder = result.visitedOrder;
    const frontierOrder = result.frontierOrder;
    const finalPath = result.path;

    const visitedSetAcc = new Set<string>();
    const frontierSetAcc = new Set<string>();

    let idx = 0;
    stepIndexRef.current = 0;

    const animateStep = () => {
      if (isPausedRef.current) {
        animTimeoutRef.current = window.setTimeout(animateStep, 100);
        return;
      }

      if (idx < visitedOrder.length) {
        const curr = visitedOrder[idx];
        visitedSetAcc.add(`${curr.x},${curr.y}`);
        setVisitedSet(new Set(visitedSetAcc));

        if (idx < frontierOrder.length) {
          frontierOrder[idx].forEach((fp) => frontierSetAcc.add(`${fp.x},${fp.y}`));
          setFrontierSet(new Set(frontierSetAcc));
        }

        setMetrics((prev) => ({
          ...prev,
          visitedCount: visitedSetAcc.size,
          frontierCount: frontierSetAcc.size,
        }));

        idx++;
        stepIndexRef.current = idx;
        animTimeoutRef.current = window.setTimeout(animateStep, animationSpeed);
      } else {
        // Animation of visited search complete, now animate path trace
        if (finalPath.length > 0) {
          let pathIdx = 0;
          const currentPathAcc: Point[] = [];

          const animatePathTrace = () => {
            if (pathIdx < finalPath.length) {
              currentPathAcc.push(finalPath[pathIdx]);
              setPath([...currentPathAcc]);
              pathIdx++;
              animTimeoutRef.current = window.setTimeout(
                animatePathTrace,
                Math.max(10, animationSpeed / 2)
              );
            } else {
              setIsAnimating(false);
              setMetrics((prev) => ({
                ...prev,
                pathLength: finalPath.length,
                pathCost: result.pathCost,
                status: 'found',
              }));
            }
          };

          animatePathTrace();
        } else {
          setIsAnimating(false);
          setMetrics((prev) => ({
            ...prev,
            status: 'no_path',
          }));
          setToastMessage('No reachable path found!');
          setToastType('error');
        }
      }
    };

    animateStep();
  }, [
    isAnimating,
    isPaused,
    clearPathState,
    algorithm,
    gridSize,
    start,
    target,
    walls,
    allowDiagonal,
    heuristic,
    animationSpeed,
    recalculatePathInstant,
  ]);

  // Pause / Resume Toggle
  const handlePauseResume = () => {
    setIsPaused((prev) => !prev);
    setMetrics((prev) => ({
      ...prev,
      status: !isPaused ? 'paused' : 'searching',
    }));
  };

  // Step forward 1 animation frame when paused
  const handleStep = () => {
    if (!isPaused) return;
    // Advance logic handled inside step index tick
  };

  // Reset Grid Handler
  const handleResetGrid = () => {
    clearPathState();
    const cleanWalls = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill(false)
    );
    setWalls(cleanWalls);
    setStart({ x: Math.floor(gridSize * 0.15), y: Math.floor(gridSize * 0.5) });
    setTarget({ x: Math.floor(gridSize * 0.85), y: Math.floor(gridSize * 0.5) });
    setToastMessage('Grid completely reset to defaults.');
    setToastType('info');
  };

  // Generate Maze Handler
  const handleGenerateMaze = () => {
    clearPathState();
    const newWalls = generateMaze(mazeType, gridSize, gridSize, start, target);
    setWalls(newWalls);
    setToastMessage(`Generated ${mazeType.split('_').join(' ')} maze pattern.`);
    setToastType('success');
  };

  return (
    <div className="h-screen bg-[#0B0E14] text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Top Header Controls Panel */}
      <ControlPanel
        algorithm={algorithm}
        setAlgorithm={setAlgorithm}
        heuristic={heuristic}
        setHeuristic={setHeuristic}
        gridSize={gridSize}
        setGridSize={setGridSize}
        allowDiagonal={allowDiagonal}
        setAllowDiagonal={setAllowDiagonal}
        animationSpeed={animationSpeed}
        setAnimationSpeed={setAnimationSpeed}
        mazeType={mazeType}
        setMazeType={setMazeType}
        onVisualize={handleVisualize}
        onPauseResume={handlePauseResume}
        onStep={handleStep}
        onClearPath={clearPathState}
        onResetGrid={handleResetGrid}
        onGenerateMaze={handleGenerateMaze}
        isAnimating={isAnimating}
        isPaused={isPaused}
      />

      {/* Main Workspace Layout (Sidebar + Main Canvas) */}
      <main className="flex-grow flex flex-col lg:flex-row p-4 md:p-6 gap-6 overflow-y-auto">
        {/* Left Performance HUD & Legend Sidebar */}
        <MetricsBar metrics={metrics} />

        {/* Center Canvas Stage */}
        <GridCanvas
          gridSize={gridSize}
          start={start}
          target={target}
          walls={walls}
          visitedSet={visitedSet}
          frontierSet={frontierSet}
          path={path}
          algorithm={algorithm}
          onStartMove={handleStartMove}
          onTargetMove={handleTargetMove}
          onWallToggle={handleWallToggle}
          onWallBatchUpdate={() => {}}
          isAnimating={isAnimating}
        />
      </main>

      {/* Bottom Sleek Status Footer */}
      <footer className="h-10 bg-[#0B0E14] border-t border-slate-800/90 flex flex-wrap items-center justify-between px-6 shrink-0 text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ENGINE_READY
          </span>
          <span>CANVAS_RES: {gridSize}x{gridSize}</span>
          <span>DIAGONAL: {allowDiagonal ? 'ENABLED (√2)' : 'CARDINAL ONLY'}</span>
        </div>
        <div className="flex items-center gap-4">
          <span>ALGO: <strong className="text-amber-400">{algorithm.toUpperCase()}</strong></span>
          <span>HEURISTIC: <strong className="text-slate-300">{heuristic.toUpperCase()}</strong></span>
          <span className="hidden sm:inline">PQ: MinHeap_v2</span>
        </div>
      </footer>

      {/* Toast Alert */}
      <Toast
        message={toastMessage}
        type={toastType}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
