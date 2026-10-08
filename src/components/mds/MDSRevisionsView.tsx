import React from 'react';
import { useApp } from '../../context/AppContext';
import { History, CheckCircle2, Clock, GitCompare, ArrowRight } from 'lucide-react';

export const MDSRevisionsView: React.FC = () => {
  const { mdsRevisions, activeRevision } = useApp();

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          MDS Revision Control & Version Differential
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable revision history tracking changes, previous vs new values, source citations, and discipline sign-offs.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {mdsRevisions.map((rev, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-5 flex flex-col gap-3 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {rev.revision}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                    rev.status === 'APPROVED'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                  }`}>
                    {rev.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1 font-mono">
                  Created by {rev.createdBy} on {new Date(rev.createdAt).toLocaleString()}
                </div>
              </div>

              {rev.approvedBy && (
                <div className="text-right text-xs">
                  <div className="text-emerald-600 font-semibold flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Stamped & Authorized
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">{rev.approvedBy}</div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic border border-slate-100 dark:border-slate-800">
              "{rev.comment}"
            </div>

            {/* Differential summary if Rev > 0 */}
            {rev.revisionNumber > 0 && (
              <div className="mt-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5 font-mono">
                  <GitCompare className="w-3.5 h-3.5 text-blue-500" />
                  Key Parameter Differential (Old Value → New Value):
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500">Design Pressure</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-rose-600 line-through">16 bar(g)</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-emerald-600 font-bold">18 bar(g)</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">SPEC-014 Clause 4.2 surge margin</div>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500">Design Temperature</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-amber-600 italic">Missing</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-emerald-600 font-bold">200 °C</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Coincident maximum process upset</div>
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                    <div className="text-[11px] text-slate-500">Corrosion Allowance</div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-amber-600 italic">Missing</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="text-emerald-600 font-bold">3.0 mm</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Sour service 25-yr design life</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
