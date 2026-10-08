import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ComplianceResult, ComplianceStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  TableProperties,
  Search,
  Filter,
  Download,
  Info,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { exportToCSV } from '../../services/exportService';

export const ComplianceMatrixView: React.FC = () => {
  const { complianceResults, vendors, showToast, project } = useApp();

  const [selectedVendorFilter, setSelectedVendorFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const filteredResults = complianceResults.filter((item) => {
    const matchVendor = selectedVendorFilter === 'all' || item.vendorId === selectedVendorFilter;
    const matchStatus = selectedStatusFilter === 'all' || item.status === selectedStatusFilter;
    const matchSearch = item.parameterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchVendor && matchStatus && matchSearch;
  });

  const handleExportCSV = () => {
    const headers = [
      'Vendor',
      'Parameter',
      'Category',
      'Approved MDS Requirement',
      'Vendor Quotation Value',
      'Vendor Unit',
      'Compliance Status',
      'Rule Applied',
      'Source Page',
      'AI / Engineering Explanation',
    ];
    const rows = filteredResults.map((r) => [
      r.vendorName,
      r.parameterName,
      r.category,
      `${r.mdsRequirement.value} ${r.mdsRequirement.unit}`,
      r.vendorOffer.value ?? 'MISSING',
      r.vendorOffer.unit ?? '—',
      r.status,
      r.ruleApplied ?? 'Standard Equality',
      r.vendorOffer.sourcePage ?? '—',
      r.explanation,
    ]);
    exportToCSV(`Vendor_Compliance_Matrix_${project.equipmentTag}`, headers, rows);
    showToast('Exported Compliance Matrix to CSV', 'success');
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col gap-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TableProperties className="w-5 h-5 text-blue-600" />
            Vendor Technical Compliance Matrix
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict 4-state evaluation: <strong className="text-emerald-600">COMPLIANT</strong> · <strong className="text-rose-600">DEVIATING</strong> · <strong className="text-amber-600">UNCLEAR</strong> · <strong className="text-slate-600">MISSING</strong>.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors self-start"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Matrix CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1.5 w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search parameter or vendor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent focus:outline-none w-full text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-mono text-[11px]">Vendor:</span>
            <select
              value={selectedVendorFilter}
              onChange={(e) => setSelectedVendorFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="all">All Vendors ({vendors.length})</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vendorName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-mono text-[11px]">Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2.5 py-1 text-slate-700 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="COMPLIANT">Compliant Only</option>
              <option value="DEVIATING">Deviating Only</option>
              <option value="UNCLEAR">Unclear Only</option>
              <option value="MISSING">Missing Only</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          Showing {filteredResults.length} / {complianceResults.length} evaluated items
        </div>
      </div>

      {/* Main Compliance Matrix Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px] uppercase">
              <th className="py-2.5 px-4 font-semibold">Vendor</th>
              <th className="py-2.5 px-4 font-semibold">Parameter / Category</th>
              <th className="py-2.5 px-4 font-semibold">Approved MDS Baseline</th>
              <th className="py-2.5 px-4 font-semibold">Vendor Quoted Offer</th>
              <th className="py-2.5 px-3 font-semibold">Status</th>
              <th className="py-2.5 px-3 font-semibold">Rule Applied</th>
              <th className="py-2.5 px-4 font-semibold text-right">Evidence / Explanation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredResults.map((item) => {
              const isExpanded = expandedRowId === item.id;
              return (
                <React.Fragment key={item.id}>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800 dark:text-slate-200 max-w-[160px] truncate">
                      {item.vendorName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.parameterName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">
                        {item.category}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {item.mdsRequirement.value} {item.mdsRequirement.unit}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                      {item.vendorOffer.value !== null ? (
                        <span>
                          {item.vendorOffer.value} {item.vendorOffer.unit || ''}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not Provided (Missing)</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                      {item.ruleApplied || 'EQUALITY-CHECK'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setExpandedRowId(isExpanded ? null : item.id)}
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:underline text-[11px]"
                      >
                        <span>{isExpanded ? 'Hide Reason' : 'Explain'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </td>
                  </tr>

                  {/* Explainable AI Detail Row */}
                  {isExpanded && (
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-700">
                      <td colSpan={7} className="p-4 text-xs">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-4 flex flex-col gap-2">
                          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-b border-slate-100 dark:border-slate-800 pb-2">
                            <span>EXPLAINABLE AI REASONING AUDIT</span>
                            <span>EVALUATION ID: {item.id}</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                            <div>
                              <div className="font-semibold text-slate-800 dark:text-slate-200">
                                Engineering Finding & Reason:
                              </div>
                              <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
                                {item.explanation}
                              </p>
                              {item.uncertaintyReason && (
                                <div className="mt-2 text-amber-700 dark:text-amber-400 font-mono text-[11px]">
                                  ⚠ Uncertainty note: {item.uncertaintyReason}
                                </div>
                              )}
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded border border-slate-200 dark:border-slate-700 text-[11px] font-mono flex flex-col gap-1">
                              <div><strong>Vendor Citation:</strong> Page {item.vendorOffer.sourcePage ?? 'N/A'}</div>
                              {item.vendorOffer.sourceText && (
                                <div className="italic text-slate-500">"{item.vendorOffer.sourceText}"</div>
                              )}
                              <div className="mt-1 text-blue-600 dark:text-blue-400">
                                <strong>Rule Applied:</strong> {item.ruleApplied || 'Direct Equality Rule'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
