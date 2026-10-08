import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DeviationItem, DeviationSeverity } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ShieldAlert, Download, CheckCircle2, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { exportToCSV } from '../../services/exportService';

export const DeviationRegisterView: React.FC = () => {
  const { deviations, updateDeviation, showToast, project, currentUser } = useApp();

  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState<string>('all');
  const [activeDispositionModal, setActiveDispositionModal] = useState<DeviationItem | null>(null);
  const [dispositionStatus, setDispositionStatus] = useState<DeviationItem['status']>('Under Review');
  const [dispositionNotes, setDispositionNotes] = useState<string>('');

  const filteredDeviations = deviations.filter(
    (d) => selectedSeverityFilter === 'all' || d.severity === selectedSeverityFilter
  );

  const handleOpenDisposition = (item: DeviationItem) => {
    setActiveDispositionModal(item);
    setDispositionStatus(item.status);
    setDispositionNotes(item.engineerDisposition || '');
  };

  const handleSaveDisposition = () => {
    if (!activeDispositionModal) return;
    updateDeviation(activeDispositionModal.id, {
      status: dispositionStatus,
      engineerDisposition: dispositionNotes,
      dispositionBy: currentUser.name,
      dispositionDate: new Date().toISOString(),
    });
    setActiveDispositionModal(null);
  };

  const handleExportCSV = () => {
    const headers = [
      'Deviation ID',
      'Vendor',
      'Parameter',
      'MDS Baseline Requirement',
      'Vendor Proposed Deviation',
      'Deviation Description',
      'Technical Impact',
      'Severity',
      'Status',
      'Engineer Disposition',
      'Disposition By',
    ];
    const rows = deviations.map((d) => [
      d.deviationNumber,
      d.vendorName,
      d.parameterName,
      d.mdsRequirement,
      d.vendorProposal,
      d.deviationDescription,
      d.technicalImpact,
      d.severity,
      d.status,
      d.engineerDisposition || 'Pending',
      d.dispositionBy || '—',
    ]);
    exportToCSV(`Vendor_Deviation_Register_${project.equipmentTag}`, headers, rows);
    showToast('Exported Deviation Register to CSV', 'success');
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            Vendor Deviation Register & Technical Disposition
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Classified by severity: Critical, Major, Minor.
            <strong className="text-slate-700 dark:text-slate-300"> Commercial acceptability is never determined automatically.</strong>
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors self-start"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Register CSV</span>
        </button>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        {['all', 'Critical', 'Major', 'Minor'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSelectedSeverityFilter(sev)}
            className={`px-3 py-1 rounded font-mono text-[11px] uppercase transition-colors ${
              selectedSeverityFilter === sev
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {sev === 'all' ? 'All Severities' : sev}
          </button>
        ))}
      </div>

      {/* Deviations Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px] uppercase">
              <th className="py-2.5 px-4 font-semibold">Dev ID / Vendor</th>
              <th className="py-2.5 px-4 font-semibold">Parameter</th>
              <th className="py-2.5 px-3 font-semibold">MDS Requirement</th>
              <th className="py-2.5 px-3 font-semibold">Vendor Proposal</th>
              <th className="py-2.5 px-3 font-semibold">Severity</th>
              <th className="py-2.5 px-4 font-semibold">Technical Impact</th>
              <th className="py-2.5 px-3 font-semibold">Status</th>
              <th className="py-2.5 px-3 font-semibold text-right">Disposition</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredDeviations.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4">
                  <div className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                    {d.deviationNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate max-w-[140px] mt-0.5">
                    {d.vendorName}
                  </div>
                </td>
                <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                  {d.parameterName}
                </td>
                <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {d.mdsRequirement}
                </td>
                <td className="py-3 px-3 font-mono text-rose-600 dark:text-rose-400 font-bold tabular-nums">
                  {d.vendorProposal}
                </td>
                <td className="py-3 px-3">
                  <StatusBadge status={d.severity} size="sm" />
                </td>
                <td className="py-3 px-4 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs">
                  {d.technicalImpact}
                </td>
                <td className="py-3 px-3">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                    d.status === 'Accepted with Conditions'
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : d.status === 'Rejected'
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                  }`}>
                    {d.status}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => handleOpenDisposition(d)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 rounded text-xs font-medium transition-colors"
                  >
                    Action
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Engineer Disposition Modal */}
      {activeDispositionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-lg w-full p-5 text-xs flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Engineering Disposition: {activeDispositionModal.deviationNumber}
              </h3>
              <button onClick={() => setActiveDispositionModal(null)}>✕</button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded border border-slate-200 dark:border-slate-700 flex flex-col gap-1 text-[11px] font-mono">
              <div><strong>Vendor:</strong> {activeDispositionModal.vendorName}</div>
              <div><strong>Parameter:</strong> {activeDispositionModal.parameterName}</div>
              <div><strong>Specified MDS:</strong> {activeDispositionModal.mdsRequirement}</div>
              <div><strong>Vendor Quoted:</strong> {activeDispositionModal.vendorProposal}</div>
              <div><strong>Severity:</strong> {activeDispositionModal.severity}</div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Discipline Disposition Action
              </label>
              <select
                value={dispositionStatus}
                onChange={(e) => setDispositionStatus(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2 text-slate-900 dark:text-slate-100 font-medium"
              >
                <option value="Under Review">Under Review (Discipline Evaluation)</option>
                <option value="Accepted with Conditions">Accepted with Conditions (Concession Granted)</option>
                <option value="Rejected">Rejected (Vendor Must Resubmit Compliant Solution)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Technical Justification & Concession Conditions
              </label>
              <textarea
                rows={3}
                value={dispositionNotes}
                onChange={(e) => setDispositionNotes(e.target.value)}
                placeholder="State engineering basis for acceptance or rejection..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2.5 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveDispositionModal(null)}
                className="px-3 py-1.5 text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDisposition}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
              >
                Record Disposition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
