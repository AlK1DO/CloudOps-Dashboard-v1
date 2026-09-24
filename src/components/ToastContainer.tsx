import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, X } from 'lucide-react';
import { useToast, ToastType } from '../context/ToastContext';

type ToastConfig = {
  bg: string;
  border: string;
  titleColor: string;
  msgColor: string;
  icon: React.ReactNode;
};

const CONFIG: Record<ToastType, ToastConfig> = {
  success: {
    bg:         'bg-white dark:bg-slate-800',
    border:     'border-l-4 border-l-[#16A34A] border-t border-r border-b border-t-slate-200 border-r-slate-200 border-b-slate-200 dark:border-t-slate-600 dark:border-r-slate-600 dark:border-b-slate-600',
    titleColor: 'text-slate-900 dark:text-slate-50',
    msgColor:   'text-slate-600 dark:text-slate-300',
    icon: <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />,
  },
  warning: {
    bg:         'bg-white dark:bg-slate-800',
    border:     'border-l-4 border-l-[#F59E0B] border-t border-r border-b border-t-slate-200 border-r-slate-200 border-b-slate-200 dark:border-t-slate-600 dark:border-r-slate-600 dark:border-b-slate-600',
    titleColor: 'text-slate-900 dark:text-slate-50',
    msgColor:   'text-slate-600 dark:text-slate-300',
    icon: <AlertTriangle className="w-5 h-5 text-[#F59E0B] shrink-0" />,
  },
  error: {
    bg:         'bg-white dark:bg-slate-800',
    border:     'border-l-4 border-l-[#DC2626] border-t border-r border-b border-t-slate-200 border-r-slate-200 border-b-slate-200 dark:border-t-slate-600 dark:border-r-slate-600 dark:border-b-slate-600',
    titleColor: 'text-slate-900 dark:text-slate-50',
    msgColor:   'text-slate-600 dark:text-slate-300',
    icon: <AlertOctagon className="w-5 h-5 text-[#DC2626] shrink-0" />,
  },
  info: {
    bg:         'bg-white dark:bg-slate-800',
    border:     'border-l-4 border-l-[#2563EB] border-t border-r border-b border-t-slate-200 border-r-slate-200 border-b-slate-200 dark:border-t-slate-600 dark:border-r-slate-600 dark:border-b-slate-600',
    titleColor: 'text-slate-900 dark:text-slate-50',
    msgColor:   'text-slate-600 dark:text-slate-300',
    icon: <Info className="w-5 h-5 text-[#2563EB] shrink-0" />,
  },
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 w-80 pointer-events-none">
      {toasts.map(toast => {
        const cfg = CONFIG[toast.type];
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-xl
              ${cfg.bg} ${cfg.border}`}
          >
            <div className="mt-0.5">{cfg.icon}</div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold leading-snug ${cfg.titleColor}`}>
                {toast.title}
              </p>
              {toast.message && (
                <p className={`text-xs mt-0.5 leading-relaxed ${cfg.msgColor}`}>
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-1 rounded-md transition-colors text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
