import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExtractedParameter } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertOctagon,
  HelpCircle,
  Edit2,
  ExternalLink,
  ShieldCheck,
  Printer,
  Download,
  AlertTriangle,
  History,
  Lock,
} from 'lucide-react';
import { generateMDSPrintHtml, printEngineeringReport, exportToCSV } from '../../services/exportService';

export const MDSSheetView: React.FC = () => {
  const {
    project,
    parameters,
    activeRevision,
    conflicts,
    approveMDS,
    updateParameter,
    currentUser,
    setSelectedDocId,
    setSelectedParamForViewer,
    setActiveTab,
    showToast,
  } = useApp();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [approvalComment, setApprovalComment] = useState<string>(
    'Mechanical Data Sheet reviewed and approved for issue for enquiry (IFE) / vendor technical tendering.'
  );
  const [approvalError, setApprovalError] = useState<string | null>(null);

  // Edit modal state for missing/existing parameters
  const [editingParam, setEditingParam] = useState<ExtractedParameter | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editUnit, setEditUnit] = useState<string>('');
  const [editReason, setEditReason] = useState<string>('');
  const [editSourceDoc, setEditSourceDoc] = useState<string>('SPEC-014-PV.pdf');
  const [editSourcePage, setEditSourcePage] = useState<number>(12);

  const unresolvedConflicts = conflicts.filter((c) => !c.isResolved);
  const missingMandatory = parameters.filter((p) => p.status === 'Missing');

  const filteredParameters = parameters.filter(
    (p) => activeCategoryFilter === 'all' || p.category === activeCategoryFilter
  );

  const handleOpenEdit = (param: ExtractedParameter) => {
    setEditingParam(param);
    setEditValue(param.originalValue !== null ? String(param.originalValue) : '');
    setEditUnit(param.originalUnit || '');
    setEditReason(
      param.status === 'Missing'
        ? `Adopted from approved project specification SPEC-014 Clause 4.2 for ${param.parameterName}.`
        : 'Engineering correction during technical review.'
    );
  };

  const handleSaveEdit = () => {
    if (!editingParam) return;
    updateParameter(
      editingParam.id,
      {
        originalValue: isNaN(Number(editValue)) ? editValue : Number(editValue),
        originalUnit: editUnit,
        status: 'Available',
        requiresReview: false,
        source: {
          documentId: 'doc-spec-014',
          documentName: editSourceDoc,
          page: editSourcePage,
          section: 'Clause 4.2',
          sourceText: `Clause 4.2: Mandated specification value for ${editingParam.parameterName}: ${editValue} ${editUnit}`,
        },
      },
      editReason
    );
    setEditingParam(null);
  };

  const handleApprove = () => {
    setApprovalError(null);
    const result = approveMDS(approvalComment);
    if (!result.success) {
      setApprovalError(result.error || 'Approval rejected.');
    } else {
      setShowApprovalModal(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Parameter', 'Category', 'Specified Value', 'Unit', 'Normalized Value', 'Normalized Unit', 'Source Document', 'Source Page', 'Status'];
    const rows = parameters.map((p) => [
      p.parameterName,
      p.category,
      p.originalValue ?? '',
      p.originalUnit ?? '',
      p.normalizedValue ?? '',
      p.normalizedUnit ?? '',
      p.source?.documentName ?? 'None',
      p.source?.page ?? '',
      p.status,
    ]);
    exportToCSV(`MDS_${project.equipmentTag}_${activeRevision.revision.replace(/\s+/g, '_')}`, headers, rows);
    showToast('Exported MDS to CSV', 'success');
  };

  const handlePrint = () => {
    const html = generateMDSPrintHtml(project, activeRevision);
    printEngineeringReport(`MDS - ${project.equipmentTag}`, html);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col gap-6">
      {/* Header and Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              Mechanical Data Sheet (MDS)
            </h2>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {activeRevision.revision}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Equipment: {project.equipmentTag} ({project.equipmentName}) · Template: MDS-V101.xlsx (Approved API/ASME Standard)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Formatted</span>
          </button>

          {activeRevision.status !== 'APPROVED' ? (
            <button
              onClick={() => setShowApprovalModal(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-sm transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Digital Sign-Off & Approve MDS</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 rounded text-xs font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>Immutable Approved Revision</span>
            </div>
          )}
        </div>
      </div>

      {/* Warning Checklist if Draft not ready for approval */}
      {activeRevision.status !== 'APPROVED' && (unresolvedConflicts.length > 0 || missingMandatory.length > 0) && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded p-4 text-xs flex flex-col gap-2">
          <div className="font-semibold text-amber-900 dark:text-amber-200 flex items-center gap-2 text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Approval Guardrails: Unresolved Issues Detected
          </div>
          <div className="text-amber-800 dark:text-amber-300 leading-relaxed">
            Per Safety Principle (Sec. 2 & 36), an MDS cannot be approved while mandatory data is missing or source conflicts exist:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
            {unresolvedConflicts.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                <div>
                  <strong className="text-rose-600">Source Conflict:</strong> {unresolvedConflicts[0].parameterName} (16 vs 18 bar)
                </div>
                <button
                  onClick={() => setActiveTab('conflicts')}
                  className="text-blue-600 font-semibold underline text-[11px]"
                >
                  Resolve Now
                </button>
              </div>
            )}
            {missingMandatory.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-2.5 rounded border border-amber-200 dark:border-amber-800 flex items-center justify-between">
                <div>
                  <strong className="text-amber-700">Missing Parameters:</strong> {missingMandatory.map((m) => m.parameterName).join(', ')}
                </div>
                <span className="text-slate-500 text-[11px]">Click 'Edit' in table</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        {['all', 'general', 'process', 'mechanical', 'safety'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded uppercase font-mono text-[11px] transition-colors ${
              activeCategoryFilter === cat
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {cat === 'all' ? 'All Sections' : cat}
          </button>
        ))}
      </div>

      {/* Mechanical Data Sheet Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px] uppercase">
              <th className="py-2.5 px-4 font-semibold">Parameter</th>
              <th className="py-2.5 px-3 font-semibold">Category</th>
              <th className="py-2.5 px-4 font-semibold">Specified Value</th>
              <th className="py-2.5 px-3 font-semibold">Unit</th>
              <th className="py-2.5 px-4 font-semibold">Normalized Unit (SI)</th>
              <th className="py-2.5 px-4 font-semibold">Source Evidence (Traceability)</th>
              <th className="py-2.5 px-3 font-semibold">Status</th>
              <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredParameters.map((param) => (
              <tr key={param.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                  {param.parameterName}
                  {param.unitValidationIssue && (
                    <div className="text-[10px] text-amber-600 font-sans font-normal mt-0.5">
                      ⚠ {param.unitValidationIssue}
                    </div>
                  )}
                </td>
                <td className="py-3 px-3 font-mono text-[11px] uppercase text-slate-500">
                  {param.category}
                </td>
                <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100 text-sm tabular-nums">
                  {param.originalValue !== null ? param.originalValue : '—'}
                </td>
                <td className="py-3 px-3 font-mono text-slate-600 dark:text-slate-400">
                  {param.originalUnit ?? '—'}
                </td>
                <td className="py-3 px-4 font-mono text-[11px] text-blue-700 dark:text-blue-300">
                  {param.normalizedValue ? `${param.normalizedValue} ${param.normalizedUnit || ''}` : '—'}
                  {param.conversionFormula && (
                    <div className="text-[9px] text-slate-400">{param.conversionFormula}</div>
                  )}
                </td>
                <td className="py-3 px-4 text-[11px] font-mono">
                  {param.source ? (
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium">
                        <span>{param.source.documentName}</span>
                        <span className="text-slate-400">p.{param.source.page}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 italic truncate max-w-xs" title={param.source.sourceText}>
                        "{param.source.sourceText}"
                      </span>
                    </div>
                  ) : (
                    <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" /> No Source Found
                    </span>
                  )}
                </td>
                <td className="py-3 px-3">
                  <StatusBadge status={param.status} size="sm" />
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {param.source && (
                      <button
                        onClick={() => {
                          setSelectedDocId(param.source!.documentId);
                          setSelectedParamForViewer(param);
                          setActiveTab('document_viewer');
                        }}
                        className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="View Source in Document"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {activeRevision.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleOpenEdit(param)}
                        className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit / Resolve Field"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Field Modal */}
      {editingParam && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-5 text-xs flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Edit Parameter: {editingParam.parameterName}
              </h3>
              <button
                onClick={() => setEditingParam(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Value
                  </label>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="e.g. 200 or SS316L"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    placeholder="e.g. °C, mm, bar(g)"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Traceable Source Document Reference
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={editSourceDoc}
                    onChange={(e) => setEditSourceDoc(e.target.value)}
                    className="col-span-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2 text-slate-900 dark:text-slate-100 font-mono text-[11px]"
                  />
                  <input
                    type="number"
                    value={editSourcePage}
                    onChange={(e) => setEditSourcePage(Number(e.target.value))}
                    placeholder="Page"
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2 text-slate-900 dark:text-slate-100 font-mono text-[11px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Revision / Engineering Justification
                </label>
                <textarea
                  rows={2}
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setEditingParam(null)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium"
              >
                Save & Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-lg w-full p-6 text-xs flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Digital Engineering Sign-Off & Approval (MDS Rev 1)
              </h3>
              <button
                onClick={() => setShowApprovalModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {approvalError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded text-xs">
                {approvalError}
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded border border-slate-200 dark:border-slate-700 flex flex-col gap-1.5 font-mono text-[11px]">
              <div><strong>Engineer Signer:</strong> {currentUser.name}</div>
              <div><strong>Title & Authority:</strong> {currentUser.title} ({currentUser.role.toUpperCase()})</div>
              <div><strong>Equipment Tag:</strong> {project.equipmentTag} ({project.equipmentName})</div>
              <div><strong>Target Revision:</strong> Rev 1 (Approved for Inquiry)</div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Approval Notes & Discipline Endorsement
              </label>
              <textarea
                rows={3}
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2.5 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="text-[11px] text-slate-500 leading-relaxed">
              By digitally signing, an immutable revision record is published to the project audit trail. Vendor offers will now be benchmarked against this approved baseline.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowApprovalModal(false)}
                className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold shadow-sm"
              >
                Digitally Authorize Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
