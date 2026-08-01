import React from 'react';
import { Metrics } from '../types';
import { Activity, Clock, Layers, Footprints, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MetricsBarProps {
  metrics: Metrics;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ metrics }) => {
  const getStatusBadge = () => {
    switch (metrics.status) {
      case 'searching':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-950/80 text-amber-400 border border-amber-800 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            SEARCHING...
          </span>
        );
      case 'paused':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-950/60 text-amber-300 border border-amber-800">
            PAUSED
          </span>
        );
      case 'found':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            PATH FOUND
          </span>
        );
      case 'no_path':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-950/80 text-rose-400 border border-rose-800">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            NO PATH
          </span>
        );
      case 'idle':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            READY / IDLE
          </span>
        );
    }
  };

  return (
    <aside className="w-full lg:w-72 flex flex-col gap-5 shrink-0">
      {/* 1. Performance HUD Card */}
      <div className="bg-[#161B22] border border-slate-800 rounded-lg p-5 flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold font-mono flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-amber-500" /> Performance HUD
          </span>
          {getStatusBadge()}
        </div>

        {/* Compute Time */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
            Execution Time
          </span>
          <div className="text-2xl font-mono text-amber-500 font-bold flex items-baseline gap-1">
            {metrics.executionTimeMs} <span className="text-xs text-slate-500 font-normal">ms</span>
          </div>
        </div>

        {/* Nodes Visited */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
            Nodes Visited
          </span>
          <div className="text-2xl font-mono text-white font-bold flex items-baseline gap-2">
            {metrics.visitedCount}
            <span className="text-xs text-slate-500 font-normal font-sans">
              ({metrics.frontierCount} open)
            </span>
          </div>
        </div>

        {/* Path Cost / Length */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">
            Path Cost / Length
          </span>
          <div className="text-2xl font-mono text-white font-bold flex items-baseline gap-1">
            {metrics.pathCost > 0
              ? metrics.pathCost.toFixed(2)
              : metrics.pathLength > 0
              ? metrics.pathLength
              : '0.00'}
            <span className="text-xs text-slate-500 font-normal">units</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Legend Card */}
      <div className="bg-[#161B22] border border-slate-800 rounded-lg p-5 flex flex-col gap-3 shadow-xl">
        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold font-mono border-b border-slate-800 pb-2">
          Grid Legend
        </span>

        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full bg-[#22c55e] flex items-center justify-center text-[9px] font-bold text-white shadow-emerald-500/50 shadow shrink-0">
              S
            </div>
            <span>Start Node</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full bg-[#ef4444] flex items-center justify-center text-[9px] font-bold text-white shadow-rose-500/50 shadow shrink-0">
              T
            </div>
            <span>Target Node</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded bg-[#1e293b] border border-slate-700 shrink-0" />
            <span>Wall / Obstacle</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded bg-[#f59e0b] border border-amber-300 shadow-amber-500/50 shadow shrink-0" />
            <span>Final Path</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded bg-blue-500/40 border border-violet-500/60 shrink-0" />
            <span>Explored (Visited)</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded bg-cyan-500/50 border border-emerald-400 shrink-0" />
            <span>Frontier (Open)</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

