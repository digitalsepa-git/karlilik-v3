import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { cn } from '../../../lib/utils';

export function MarginAlertBanner({ warnings }) {
  if (!warnings || warnings.length === 0) return null;
  
  return (
    <div className="space-y-2 mb-6">
      {warnings.map((w, i) => (
        <div
          key={i}
          className={cn(
            "p-3 rounded-lg flex items-start gap-2.5 text-sm font-medium border",
            w.severity === "danger" && "bg-red-50 border-red-200 text-red-800",
            w.severity === "warn" && "bg-amber-50 border-amber-200 text-amber-800",
            w.severity === "info" && "bg-blue-50 border-blue-200 text-blue-800"
          )}
        >
          {w.severity === "danger" || w.severity === "warn" ? (
            <AlertTriangle className={cn("w-4 h-4 mt-0.5 shrink-0", w.severity === "danger" ? "text-red-600" : "text-amber-600")} />
          ) : (
            <Info className="w-4 h-4 mt-0.5 shrink-0 text-blue-600" />
          )}
          <span>{w.message}</span>
        </div>
      ))}
    </div>
  );
}
