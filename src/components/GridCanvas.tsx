import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Point, NodeType, AlgorithmType } from '../types';

interface GridCanvasProps {
  gridSize: number; // N for NxN grid
  start: Point;
  target: Point;
  walls: boolean[][];
  visitedSet: Set<string>;
  frontierSet: Set<string>;
  path: Point[];
  algorithm: AlgorithmType;
  onStartMove: (newStart: Point) => void;
  onTargetMove: (newTarget: Point) => void;
  onWallToggle: (point: Point, isWall: boolean) => void;
  onWallBatchUpdate: (updates: { point: Point; isWall: boolean }[]) => void;
  isAnimating: boolean;
}

export const GridCanvas: React.FC<GridCanvasProps> = ({
  gridSize,
  start,
  target,
  walls,
  visitedSet,
  frontierSet,
  path,
  algorithm,
  onStartMove,
  onTargetMove,
  onWallToggle,
  onWallBatchUpdate,
  isAnimating,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [dragState, setDragState] = useState<'none' | 'start' | 'target' | 'draw_wall' | 'erase_wall'>('none');
  const [hoverPoint, setHoverPoint] = useState<Point | null>(null);

  // Measure canvas size to maintain crisp resolution
  const [cellSize, setCellSize] = useState<number>(20);

  const updateCanvasDimensions = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const availableWidth = rect.width;
    const availableHeight = Math.min(window.innerHeight * 0.65, availableWidth);
    const minSize = Math.min(availableWidth, availableHeight);

    const calculatedCellSize = Math.max(8, Math.floor((minSize - 16) / gridSize));
    setCellSize(calculatedCellSize);
  }, [gridSize]);

  useEffect(() => {
    updateCanvasDimensions();
    window.addEventListener('resize', updateCanvasDimensions);
    return () => window.removeEventListener('resize', updateCanvasDimensions);
  }, [updateCanvasDimensions]);

  // Convert canvas pixel coordinates to grid (x, y)
  const getGridPointFromMouseEvent = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>): Point | null => {
      if (!canvasRef.current) return null;
      const rect = canvasRef.current.getBoundingClientRect();
      const pixelX = e.clientX - rect.left;
      const pixelY = e.clientY - rect.top;

      const x = Math.floor(pixelX / cellSize);
      const y = Math.floor(pixelY / cellSize);

      if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        return { x, y };
      }
      return null;
    },
    [cellSize, gridSize]
  );

  // Primary Canvas Render Pass
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasWidth = gridSize * cellSize;
    const canvasHeight = gridSize * cellSize;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    ctx.scale(dpr, dpr);

    // 1. Background Fill (Dark Glass Slate)
    ctx.fillStyle = '#0F1318';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 2. Draw Grid Lines
    ctx.strokeStyle = '#161B22';
    ctx.lineWidth = 1;

    for (let i = 0; i <= gridSize; i++) {
      const pos = i * cellSize;
      // Vertical line
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, canvasHeight);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(canvasWidth, pos);
      ctx.stroke();
    }

    // 3. Draw Visited Nodes (Closed set)
    visitedSet.forEach((key) => {
      const [x, y] = key.split(',').map(Number);
      if (
        (x === start.x && y === start.y) ||
        (x === target.x && y === target.y) ||
        walls[y]?.[x]
      ) {
        return;
      }

      ctx.fillStyle = 'rgba(59, 130, 246, 0.45)'; // blue-500 semi-transparent
      ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);

      ctx.fillStyle = 'rgba(139, 92, 246, 0.6)'; // violet inner accent
      const inset = Math.max(1, cellSize * 0.2);
      ctx.fillRect(
        x * cellSize + inset,
        y * cellSize + inset,
        cellSize - inset * 2,
        cellSize - inset * 2
      );
    });

    // 4. Draw Frontier Nodes (Open set)
    frontierSet.forEach((key) => {
      const [x, y] = key.split(',').map(Number);
      if (
        (x === start.x && y === start.y) ||
        (x === target.x && y === target.y) ||
        walls[y]?.[x]
      ) {
        return;
      }

      ctx.fillStyle = 'rgba(6, 182, 212, 0.55)'; // cyan-500
      ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);

      ctx.strokeStyle = '#10b981'; // emerald border highlight
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x * cellSize + 2, y * cellSize + 2, cellSize - 4, cellSize - 4);
    });

    // 5. Draw Walls
    ctx.fillStyle = '#334155'; // slate-700
    ctx.strokeStyle = '#475569'; // slate-600
    ctx.lineWidth = 1;

    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (walls[y]?.[x]) {
          const px = x * cellSize + 1;
          const py = y * cellSize + 1;
          const size = cellSize - 2;

          ctx.fillStyle = '#1e293b';
          ctx.fillRect(px, py, size, size);

          // Subtle rounded border inset
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(px + 2, py + 2, size - 4, size - 4);

          ctx.strokeStyle = '#475569';
          ctx.strokeRect(px + 1, py + 1, size - 2, size - 2);
        }
      }
    }

    // 6. Draw Path
    if (path.length > 0) {
      if (algorithm === 'thetastar') {
        // Theta* Any-Angle Vector Line Path
        ctx.strokeStyle = '#f59e0b'; // amber-500 neon line
        ctx.lineWidth = Math.max(2, cellSize * 0.25);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        path.forEach((p, idx) => {
          const cx = p.x * cellSize + cellSize / 2;
          const cy = p.y * cellSize + cellSize / 2;
          if (idx === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        });
        ctx.stroke();

        // Highlight any-angle turning point vertices
        path.forEach((p) => {
          if (
            (p.x === start.x && p.y === start.y) ||
            (p.x === target.x && p.y === target.y)
          ) {
            return;
          }
          const cx = p.x * cellSize + cellSize / 2;
          const cy = p.y * cellSize + cellSize / 2;
          ctx.fillStyle = '#fbbf24'; // amber-400
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(3, cellSize * 0.2), 0, Math.PI * 2);
          ctx.fill();
        });
      } else {
        // Standard Grid Path Cell Highlights & Line
        path.forEach((p) => {
          if (
            (p.x === start.x && p.y === start.y) ||
            (p.x === target.x && p.y === target.y)
          ) {
            return;
          }
          ctx.fillStyle = 'rgba(245, 158, 11, 0.7)'; // amber glow fill
          ctx.fillRect(
            p.x * cellSize + 1,
            p.y * cellSize + 1,
            cellSize - 2,
            cellSize - 2
          );
        });

        // Center connecting vector path line
        ctx.strokeStyle = '#fef08a'; // yellow-200
        ctx.lineWidth = Math.max(2, cellSize * 0.2);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        path.forEach((p, idx) => {
          const cx = p.x * cellSize + cellSize / 2;
          const cy = p.y * cellSize + cellSize / 2;
          if (idx === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        });
        ctx.stroke();
      }
    }

    // 7. Draw Start Node (Green Flag / Pin)
    const startCx = start.x * cellSize + cellSize / 2;
    const startCy = start.y * cellSize + cellSize / 2;
    const nodeRadius = Math.max(4, cellSize * 0.38);

    // Outer glow
    ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
    ctx.beginPath();
    ctx.arc(startCx, startCy, nodeRadius + 3, 0, Math.PI * 2);
    ctx.fill();

    // Solid start node
    ctx.fillStyle = '#22c55e'; // green-500
    ctx.beginPath();
    ctx.arc(startCx, startCy, nodeRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(10, Math.floor(cellSize * 0.45))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', startCx, startCy);

    // 8. Draw Target Node (Red Bullseye)
    const targetCx = target.x * cellSize + cellSize / 2;
    const targetCy = target.y * cellSize + cellSize / 2;

    // Outer glow
    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.beginPath();
    ctx.arc(targetCx, targetCy, nodeRadius + 3, 0, Math.PI * 2);
    ctx.fill();

    // Solid target node
    ctx.fillStyle = '#ef4444'; // red-500
    ctx.beginPath();
    ctx.arc(targetCx, targetCy, nodeRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillText('T', targetCx, targetCy);

    // 9. Draw Hover Highlight Cursor Box
    if (hoverPoint) {
      ctx.strokeStyle = '#38bdf8'; // sky-400
      ctx.lineWidth = 2;
      ctx.strokeRect(
        hoverPoint.x * cellSize,
        hoverPoint.y * cellSize,
        cellSize,
        cellSize
      );
    }
  }, [
    gridSize,
    cellSize,
    start,
    target,
    walls,
    visitedSet,
    frontierSet,
    path,
    algorithm,
    hoverPoint,
  ]);

  // Mouse Input Event Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (isAnimating) return; // Lock inputs during search animation

    const point = getGridPointFromMouseEvent(e);
    if (!point) return;

    // Right-click or Shift + Left-click to erase
    const isEraseMode = e.button === 2 || e.shiftKey;

    if (point.x === start.x && point.y === start.y) {
      setDragState('start');
    } else if (point.x === target.x && point.y === target.y) {
      setDragState('target');
    } else if (isEraseMode) {
      setDragState('erase_wall');
      onWallToggle(point, false);
    } else {
      setDragState('draw_wall');
      const currentWallState = walls[point.y]?.[point.x];
      onWallToggle(point, !currentWallState);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getGridPointFromMouseEvent(e);
    setHoverPoint(point);

    if (dragState === 'none' || isAnimating || !point) return;

    if (dragState === 'start') {
      if (
        (point.x !== target.x || point.y !== target.y) &&
        !walls[point.y]?.[point.x]
      ) {
        onStartMove(point);
      }
    } else if (dragState === 'target') {
      if (
        (point.x !== start.x || point.y !== start.y) &&
        !walls[point.y]?.[point.x]
      ) {
        onTargetMove(point);
      }
    } else if (dragState === 'draw_wall') {
      if (
        !(point.x === start.x && point.y === start.y) &&
        !(point.x === target.x && point.y === target.y)
      ) {
        if (!walls[point.y]?.[point.x]) {
          onWallToggle(point, true);
        }
      }
    } else if (dragState === 'erase_wall') {
      if (walls[point.y]?.[point.x]) {
        onWallToggle(point, false);
      }
    }
  };

  const handleMouseUp = () => {
    setDragState('none');
  };

  const handleMouseLeave = () => {
    setDragState('none');
    setHoverPoint(null);
  };

  const handleContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Disable default context menu for smooth erasing
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-grow flex flex-col items-center justify-center w-full min-h-[420px] p-4 bg-[#0F1318] rounded-xl border border-slate-800 shadow-2xl overflow-hidden select-none"
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onContextMenu={handleContextMenu}
        className="cursor-crosshair rounded-lg touch-none border border-slate-800/80 shadow-2xl"
      />

      {/* Grid Coordinates & Hint HUD Overlay */}
      <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-700/80 flex items-center gap-3 text-[10px] text-slate-400 font-mono shadow-xl pointer-events-none">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          START: <strong className="text-emerald-400 font-bold">({start.x},{start.y})</strong>
        </span>
        <span className="text-slate-600">|</span>
        <span>
          TARGET: <strong className="text-rose-400 font-bold">({target.x},{target.y})</strong>
        </span>
        <span className="text-slate-600">|</span>
        <span>
          HOVER: <strong className="text-amber-400">{hoverPoint ? `(${hoverPoint.x},${hoverPoint.y})` : 'N/A'}</strong>
        </span>
      </div>
    </div>
  );
};
