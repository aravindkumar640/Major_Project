import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage, toastType } = useApp();

  if (!toastMessage) return null;

  const bgMap = {
    info: 'bg-slate-900 text-slate-100 border-slate-700',
    success: 'bg-emerald-900 text-emerald-100 border-emerald-700',
    warning: 'bg-amber-900 text-amber-100 border-amber-700',
    error: 'bg-rose-900 text-rose-100 border-rose-700',
  };

  const IconMap = {
    info: Info,
    success: CheckCircle2,
    warning: AlertTriangle,
    error: AlertCircle,
  };

  const IconComponent = IconMap[toastType];

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-fade-in">
      <div className={`flex items-start gap-3 px-4 py-3 rounded shadow-lg border text-xs ${bgMap[toastType]}`}>
        <IconComponent className="w-4 h-4 shrink-0 mt-0.5" />
        <div className="flex-1 font-medium leading-relaxed">{toastMessage}</div>
      </div>
    </div>
  );
};
