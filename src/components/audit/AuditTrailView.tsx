import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScrollText, Search, Filter, ShieldCheck, Download } from 'lucide-react';
import { exportToCSV } from '../../services/exportService';

export const AuditTrailView: React.FC = () => {
  const { auditLogs, showToast, project } = useApp();
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = auditLogs.filter((log) => {
    const matchEntity = selectedEntityFilter === 'all' || log.entityType === selectedEntityFilter;
    const matchSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details.reason && log.details.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchEntity && matchSearch;
  });

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'User Name', 'Role', 'Action', 'Entity Type', 'Entity ID', 'Previous Value', 'New Value', 'Reason / Justification', 'Source Reference'];
    const rows = auditLogs.map((l) => [
      l.timestamp,
      l.userName,
      l.userRole,
      l.action,
      l.entityType,
      l.entityId,
      l.details.previousValue ?? '',
      l.details.newValue ?? '',
      l.details.reason ?? l.details.comment ?? '',
      l.details.source ?? '',
    ]);
    exportToCSV(`Engineering_Audit_Trail_${project.equipmentTag}`, headers, rows);
    showToast('Exported Audit Trail to CSV', 'success');
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-blue-600" />
            Immutable Engineering Audit Trail
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically sealed chronological log of every engineering modification, parameter override, and digital approval.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors self-start"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit Log</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search action, user, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent focus:outline-none w-full text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-mono text-[11px]">Entity:</span>
            <select
              value={selectedEntityFilter}
              onChange={(e) => setSelectedEntityFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="all">All Entities</option>
              <option value="MDS">MDS Revisions</option>
              <option value="PARAMETER">Parameters</option>
              <option value="CONFLICT">Conflicts</option>
              <option value="DEVIATION">Deviations</option>
              <option value="CLARIFICATION">Clarifications</option>
              <option value="TBE">TBE Scoring</option>
              <option value="DOCUMENT">Documents</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          {filteredLogs.length} logged entries
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px] uppercase">
              <th className="py-2.5 px-4 font-semibold">Timestamp</th>
              <th className="py-2.5 px-4 font-semibold">User / Role</th>
              <th className="py-2.5 px-4 font-semibold">Action Performed</th>
              <th className="py-2.5 px-3 font-semibold">Entity</th>
              <th className="py-2.5 px-4 font-semibold">Old Value → New Value</th>
              <th className="py-2.5 px-4 font-semibold">Engineering Justification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                    {log.userName}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase">
                    [{log.userRole}]
                  </div>
                </td>
                <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200">
                  {log.action}
                </td>
                <td className="py-3 px-3">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {log.entityType}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-[11px]">
                  {log.details.previousValue ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 line-through truncate max-w-[100px]" title={String(log.details.previousValue)}>
                        {String(log.details.previousValue)}
                      </span>
                      <span>→</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold truncate max-w-[120px]" title={String(log.details.newValue)}>
                        {String(log.details.newValue)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {String(log.details.newValue || '—')}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
                  {log.details.reason || log.details.comment || 'System operation'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
