import React from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type: 'error' | 'info' | 'success';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  if (!message) return null;

  const bgStyle =
    type === 'error'
      ? 'bg-rose-950/90 border-rose-800 text-rose-200'
      : type === 'success'
      ? 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
      : 'bg-slate-900/90 border-sky-800 text-sky-200';

  const Icon = type === 'error' ? AlertTriangle : Info;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 transform translate-y-0 ${bgStyle}`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="text-xs font-medium">{message}</span>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/10 rounded-lg transition"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
