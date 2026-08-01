import React from 'react';
import {
  AlgorithmType,
  HeuristicType,
  MazeType,
} from '../types';
import {
  Play,
  Pause,
  RotateCcw,
  Eraser,
  Sparkles,
  StepForward,
} from 'lucide-react';

interface ControlPanelProps {
  algorithm: AlgorithmType;
  setAlgorithm: (algo: AlgorithmType) => void;
  heuristic: HeuristicType;
  setHeuristic: (h: HeuristicType) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  allowDiagonal: boolean;
  setAllowDiagonal: (allow: boolean) => void;
  animationSpeed: number; // 0 (fastest/instant) to 100 (slowest)
  setAnimationSpeed: (speed: number) => void;
  mazeType: MazeType;
  setMazeType: (maze: MazeType) => void;
  onVisualize: () => void;
  onPauseResume: () => void;
  onStep: () => void;
  onClearPath: () => void;
  onResetGrid: () => void;
  onGenerateMaze: () => void;
  isAnimating: boolean;
  isPaused: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  algorithm,
  setAlgorithm,
  heuristic,
  setHeuristic,
  gridSize,
  setGridSize,
  allowDiagonal,
  setAllowDiagonal,
  animationSpeed,
  setAnimationSpeed,
  mazeType,
  setMazeType,
  onVisualize,
  onPauseResume,
  onStep,
  onClearPath,
  onResetGrid,
  onGenerateMaze,
  isAnimating,
  isPaused,
}) => {
  const supportsHeuristic =
    algorithm === 'astar' ||
    algorithm === 'gbfs' ||
    algorithm === 'jps' ||
    algorithm === 'bidirectional_astar' ||
    algorithm === 'thetastar' ||
    algorithm === 'dstarlite' ||
    algorithm === 'rrtstar' ||
    algorithm === 'informed_rrtstar' ||
    algorithm === 'prm';

  return (
    <header className="w-full bg-[#161B22] border-b border-slate-800 p-4 md:px-6 md:py-4 flex flex-col gap-4 shrink-0 rounded-xl shadow-xl">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">


        {/* Diagonal Toggle */}
        <div className="flex items-center gap-3 bg-[#21262D] border border-slate-700 px-3 py-1.5 rounded-lg">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Diagonal
          </span>
          <button
            onClick={() => !isAnimating && setAllowDiagonal(!allowDiagonal)}
            disabled={isAnimating}
            className="flex items-center gap-2 cursor-pointer focus:outline-none select-none disabled:opacity-50"
          >
            <span
              className={`text-[10px] font-mono ${
                !allowDiagonal ? 'text-white font-bold' : 'text-slate-500'
              }`}
            >
              OFF
            </span>
            <div
              className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${
                allowDiagonal ? 'bg-amber-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                  allowDiagonal ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
            <span
              className={`text-[10px] font-mono ${
                allowDiagonal ? 'text-amber-400 font-bold' : 'text-slate-500'
              }`}
            >
              ON
            </span>
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-wrap items-end gap-4 justify-between pt-2 border-t border-slate-800/80">
        <div className="flex flex-wrap items-end gap-3 flex-grow">
          {/* 1. Algorithm Selector */}
          <div className="flex flex-col gap-1 min-w-[170px]">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Algorithm
            </label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value as AlgorithmType)}
              disabled={isAnimating}
              className="bg-[#21262D] border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition disabled:opacity-50 cursor-pointer"
            >
              <optgroup label="Graph-Based Algorithms">
                <option value="astar">A* (A-Star)</option>
                <option value="dijkstra">Dijkstra's Algorithm</option>
                <option value="gbfs">Greedy Best-First Search (GBFS)</option>
                <option value="jps">Jump Point Search (JPS)</option>
                <option value="bidirectional_astar">Bidirectional A*</option>
                <option value="dstarlite">D* Lite / Lifelong Planning A*</option>
                <option value="thetastar">Theta* (Any-Angle)</option>
                <option value="bfs">Breadth-First Search (BFS)</option>
                <option value="dfs">Depth-First Search (DFS)</option>
              </optgroup>
              <optgroup label="Sample-Based Algorithms">
                <option value="rrt">Rapidly-Exploring Random Trees (RRT)</option>
                <option value="rrtstar">RRT* (Optimized RRT)</option>
                <option value="informed_rrtstar">Informed RRT*</option>
                <option value="prm">Probabilistic Roadmap (PRM)</option>
              </optgroup>
              <optgroup label="Reactive & Physics-Based">
                <option value="apf">Artificial Potential Fields (APF)</option>
                <option value="bug1">Bug 1 Algorithm</option>
                <option value="bug2">Bug 2 Algorithm</option>
              </optgroup>
            </select>
          </div>

          {/* 2. Heuristic Selector */}
          <div className="flex flex-col gap-1 min-w-[140px]">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Heuristic
            </label>
            <select
              value={heuristic}
              onChange={(e) => setHeuristic(e.target.value as HeuristicType)}
              disabled={!supportsHeuristic || isAnimating}
              className={`bg-[#21262D] border border-slate-700 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 transition ${
                !supportsHeuristic ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <option value="euclidean">Euclidean</option>
              <option value="manhattan">Manhattan</option>
              <option value="chebyshev">Chebyshev</option>
            </select>
          </div>

          {/* 3. Grid Resolution */}
          <div className="flex flex-col gap-1 min-w-[120px]">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Grid ({gridSize}×{gridSize})
            </label>
            <input
              type="range"
              min="10"
              max="80"
              step="5"
              value={gridSize}
              onChange={(e) => setGridSize(Number(e.target.value))}
              disabled={isAnimating}
              className="accent-amber-500 w-full h-6 cursor-pointer disabled:opacity-50"
            />
          </div>

          {/* 4. Speed Delay */}
          <div className="flex flex-col gap-1 min-w-[110px]">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex justify-between">
              <span>Speed</span>
              <span className="text-amber-500 font-mono">{animationSpeed}ms</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(Number(e.target.value))}
              className="accent-amber-500 w-full h-6 cursor-pointer"
            />
          </div>

          {/* 5. Maze Select */}
          <div className="flex flex-col gap-1 min-w-[130px]">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Maze Generator
            </label>
            <div className="flex items-center gap-1">
              <select
                value={mazeType}
                onChange={(e) => setMazeType(e.target.value as MazeType)}
                disabled={isAnimating}
                className="bg-[#21262D] border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 w-full cursor-pointer"
              >
                <option value="random30">30% Random</option>
                <option value="recursive_division">Recursive Division</option>
                <option value="prims">Prim's Maze</option>
                <option value="dfs_backtracker">DFS Backtracker</option>
                <option value="kruskals">Kruskal's Maze</option>
                <option value="ellers">Eller's Algorithm</option>
                <option value="wilsons">Wilson's Algorithm</option>
                <option value="sidewinder">Sidewinder</option>
                <option value="spiral">Spiral Pattern</option>
              </select>
              <button
                onClick={onGenerateMaze}
                disabled={isAnimating}
                className="bg-[#21262D] hover:bg-[#30363D] text-amber-400 border border-slate-700 font-bold text-xs p-1.5 rounded transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
                title="Generate Maze"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons Group */}
        <div className="flex items-center gap-2">
          {/* Visualize / Resume Button */}
          <button
            onClick={onVisualize}
            disabled={isAnimating && !isPaused}
            className={`font-bold text-xs uppercase px-5 py-2.5 rounded transition-all tracking-wide flex items-center gap-2 cursor-pointer ${
              isAnimating && !isPaused
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-amber-600 hover:bg-amber-500 text-black shadow-lg active:scale-95'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isPaused ? 'Resume Path' : 'Visualize Path'}</span>
          </button>

          {/* Pause / Step Buttons when animating */}
          {isAnimating && (
            <>
              <button
                onClick={onPauseResume}
                className="bg-[#21262D] hover:bg-[#30363D] text-amber-400 border border-slate-700 font-bold text-xs uppercase px-3 py-2.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              {isPaused && (
                <button
                  onClick={onStep}
                  className="bg-[#21262D] hover:bg-[#30363D] text-sky-400 border border-slate-700 font-bold text-xs uppercase px-3 py-2.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <StepForward className="w-3.5 h-3.5" />
                  <span>Step</span>
                </button>
              )}
            </>
          )}

          {/* Clear Path */}
          <button
            onClick={onClearPath}
            disabled={isAnimating && !isPaused}
            className="bg-[#21262D] hover:bg-[#30363D] text-white border border-slate-700 font-bold text-xs uppercase px-3.5 py-2.5 rounded transition-colors tracking-wide flex items-center gap-1 disabled:opacity-50 cursor-pointer"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          {/* Reset Grid */}
          <button
            onClick={onResetGrid}
            disabled={isAnimating && !isPaused}
            className="bg-[#21262D] hover:bg-[#30363D] text-white border border-slate-700 font-bold text-xs uppercase px-3.5 py-2.5 rounded transition-colors tracking-wide flex items-center gap-1 disabled:opacity-50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};

