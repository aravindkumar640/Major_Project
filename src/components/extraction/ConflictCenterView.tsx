import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertOctagon, CheckCircle2, FileText, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const ConflictCenterView: React.FC = () => {
  const { conflicts, resolveConflict, currentUser, setActiveTab } = useApp();

  const [selectedConflictId, setSelectedConflictId] = useState<string>(conflicts[0]?.id || '');
  const [selectedSourceChoice, setSelectedSourceChoice] = useState<'source1' | 'source2' | 'custom'>('source2');
  const [customValue, setCustomValue] = useState<string>('');
  const [justificationReason, setJustificationReason] = useState<string>(
    'Project Engineering Specification SPEC-014 Clause 4.2 mandates 18.0 bar(g) to accommodate compressor emergency trip surge envelope, superseding preliminary PDS-001.'
  );

  const activeConflict = conflicts.find((c) => c.id === selectedConflictId) || conflicts[0];

  const handleResolve = () => {
    if (!activeConflict) return;
    let chosenVal: string | number;
    if (selectedSourceChoice === 'source1') {
      chosenVal = 16;
    } else if (selectedSourceChoice === 'source2') {
      chosenVal = 18;
    } else {
      chosenVal = parseFloat(customValue) || customValue;
    }

    resolveConflict(activeConflict.id, chosenVal, justificationReason);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            Engineering Conflict Resolution Center
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-document validation engine detected disparities between project documents.
            <strong className="text-slate-700 dark:text-slate-300"> Accountable engineer review is mandatory before MDS approval.</strong>
          </p>
        </div>
      </div>

      {conflicts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-12 text-center text-xs">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
            No Discrepancies Detected
          </div>
          <p className="text-slate-500 mt-1">
            All extracted parameters are consistent across uploaded specifications.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conflict List */}
          <div className="flex flex-col gap-3">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
              Detected Conflicts ({conflicts.length})
            </div>
            {conflicts.map((conflict) => (
              <div
                key={conflict.id}
                onClick={() => setSelectedConflictId(conflict.id)}
                className={`p-4 rounded border cursor-pointer transition-colors text-xs ${
                  selectedConflictId === conflict.id
                    ? 'bg-white dark:bg-slate-900 border-rose-500 shadow-sm ring-1 ring-rose-400/40'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                    {conflict.parameterName}
                  </span>
                  {conflict.isResolved ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> Resolved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                      <AlertOctagon className="w-3 h-3" /> Action Required
                    </span>
                  )}
                </div>

                <div className="mt-2 text-slate-500 font-mono text-[11px]">
                  {conflict.source1.documentName} vs {conflict.source2.documentName}
                </div>
              </div>
            ))}
          </div>

          {/* Active Conflict Resolution Workspace */}
          {activeConflict && (
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-6 flex flex-col gap-6 shadow-sm">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Conflict: {activeConflict.parameterName}
                  </h3>
                  <span className="font-mono text-xs text-slate-400">ID: {activeConflict.id}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {activeConflict.recommendedAction}
                </p>
              </div>

              {/* Side-by-Side Source Discrepancy Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Source 1 Box */}
                <div className={`p-4 rounded border text-xs flex flex-col justify-between ${
                  selectedSourceChoice === 'source1' && !activeConflict.isResolved
                    ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-400'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                }`}>
                  <div>
                    <div className="flex items-center justify-between font-mono text-[11px] text-slate-500 mb-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">SOURCE 1 (PDS)</span>
                      <span>Page {activeConflict.source1.page}</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mb-2">
                      {activeConflict.source1.value}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs italic bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                      "{activeConflict.source1.text}"
                    </div>
                  </div>

                  {!activeConflict.isResolved && (
                    <button
                      onClick={() => setSelectedSourceChoice('source1')}
                      className={`mt-4 w-full py-1.5 px-3 rounded text-xs font-medium border transition-colors ${
                        selectedSourceChoice === 'source1'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {selectedSourceChoice === 'source1' ? '✓ Selected as Basis' : 'Adopt Source 1 (16 bar)'}
                    </button>
                  )}
                </div>

                {/* Source 2 Box (Recommended / Superseding) */}
                <div className={`p-4 rounded border text-xs flex flex-col justify-between ${
                  selectedSourceChoice === 'source2' && !activeConflict.isResolved
                    ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-400'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                }`}>
                  <div>
                    <div className="flex items-center justify-between font-mono text-[11px] text-slate-500 mb-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">SOURCE 2 (PROJECT SPEC)</span>
                      <span>Page {activeConflict.source2.page}</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100 mb-2">
                      {activeConflict.source2.value}
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs italic bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-800">
                      "{activeConflict.source2.text}"
                    </div>
                  </div>

                  {!activeConflict.isResolved && (
                    <button
                      onClick={() => setSelectedSourceChoice('source2')}
                      className={`mt-4 w-full py-1.5 px-3 rounded text-xs font-medium border transition-colors ${
                        selectedSourceChoice === 'source2'
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {selectedSourceChoice === 'source2' ? '✓ Selected as Basis' : 'Adopt Source 2 (18 bar)'}
                    </button>
                  )}
                </div>
              </div>

              {/* Already Resolved Banner or Decision Form */}
              {activeConflict.isResolved ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded text-xs text-emerald-900 dark:text-emerald-200 flex flex-col gap-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Conflict Resolved: Approved Value = {activeConflict.resolvedValue} bar(g)
                  </div>
                  <div><strong>Resolved by:</strong> {activeConflict.resolvedBy} on {new Date(activeConflict.resolvedAt || '').toLocaleString()}</div>
                  <div><strong>Engineering Basis:</strong> {activeConflict.resolutionReason}</div>
                </div>
              ) : (
                <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-col gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Engineering Justification & Code Reference (Mandatory for Audit Trail)
                    </label>
                    <textarea
                      rows={3}
                      value={justificationReason}
                      onChange={(e) => setJustificationReason(e.target.value)}
                      placeholder="Specify rationale (e.g. superseding engineering specification clause, process safety review, compressor discharge surge envelope)..."
                      className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-500 font-mono">
                      Stamping as: {currentUser.name} ({currentUser.role})
                    </span>

                    <button
                      onClick={handleResolve}
                      disabled={!justificationReason.trim()}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors disabled:opacity-40"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Formally Resolve & Update MDS Draft</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
