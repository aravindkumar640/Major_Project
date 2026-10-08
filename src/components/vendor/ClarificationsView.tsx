import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ClarificationItem, ClarificationPriority } from '../../types';
import {
  HelpCircle,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
} from 'lucide-react';
import { exportToCSV } from '../../services/exportService';

export const ClarificationsView: React.FC = () => {
  const { clarifications, updateClarification, addClarification, showToast, project, vendors } = useApp();

  const [activeTabFilter, setActiveTabFilter] = useState<'All' | 'Open' | 'Resolved'>('All');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New TQ form
  const [selectedVendorId, setSelectedVendorId] = useState<string>(vendors[0]?.id || '');
  const [tqParameter, setTqParameter] = useState<string>('Design Pressure');
  const [tqCategory, setTqCategory] = useState<string>('process');
  const [tqPriority, setTqPriority] = useState<ClarificationPriority>('High');
  const [tqQuestion, setTqQuestion] = useState<string>('');
  const [tqBackground, setTqBackground] = useState<string>('');

  // Response modal
  const [activeItemForResponse, setActiveItemForResponse] = useState<ClarificationItem | null>(null);
  const [vendorResponseText, setVendorResponseText] = useState<string>('');
  const [resolutionStatus, setResolutionStatus] = useState<ClarificationItem['status']>('Resolved');

  const filteredClarifications = clarifications.filter((c) => {
    if (activeTabFilter === 'Open') return c.status === 'Open' || c.status === 'Awaiting Vendor';
    if (activeTabFilter === 'Resolved') return c.status === 'Resolved' || c.status === 'Closed';
    return true;
  });

  const handleExportCSV = () => {
    const headers = [
      'TQ Number',
      'Vendor',
      'Parameter',
      'Priority',
      'Clarification Question',
      'Background / Source Issue',
      'Vendor Response',
      'Status',
      'Owner',
      'Due Date',
    ];
    const rows = clarifications.map((c) => [
      c.clarificationNumber,
      c.vendorName,
      c.parameterName,
      c.priority,
      c.question,
      c.background,
      c.vendorResponse || 'Pending',
      c.status,
      c.owner,
      c.dueDate,
    ]);
    exportToCSV(`Technical_Clarifications_${project.equipmentTag}`, headers, rows);
    showToast('Exported Clarifications to CSV', 'success');
  };

  const handleSaveNewTQ = () => {
    if (!tqQuestion.trim()) return;
    const vendor = vendors.find((v) => v.id === selectedVendorId) || vendors[0];
    const count = clarifications.length + 1;
    const newTQ: ClarificationItem = {
      id: `CLR-MANUAL-${count}`,
      clarificationNumber: `TQ-${vendor.vendorName.substring(0, 3).toUpperCase()}-${String(count).padStart(3, '0')}`,
      vendorId: vendor.id,
      vendorName: vendor.vendorName,
      parameterName: tqParameter,
      category: tqCategory,
      priority: tqPriority,
      question: tqQuestion,
      background: tqBackground || 'Raised by Lead Engineer during technical bid evaluation.',
      status: 'Open',
      owner: 'Lead Mechanical Engineer',
      dueDate: '2026-10-18',
    };
    addClarification(newTQ);
    setShowAddModal(false);
    setTqQuestion('');
    setTqBackground('');
  };

  const handleSaveResponse = () => {
    if (!activeItemForResponse) return;
    updateClarification(activeItemForResponse.id, {
      vendorResponse: vendorResponseText,
      responseDate: new Date().toISOString().split('T')[0],
      status: resolutionStatus,
      resolution: `Technical response accepted by Engineer on ${new Date().toLocaleDateString()}`,
    });
    setActiveItemForResponse(null);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            Technical Query (TQ) & Clarification Generator
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-generated from missing parameters, deviations, and unclear statements per Section 20.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Raise Technical Query</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        {(['All', 'Open', 'Resolved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTabFilter(tab)}
            className={`px-3 py-1 rounded font-mono text-[11px] uppercase transition-colors ${
              activeTabFilter === tab
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab} Queries
          </button>
        ))}
      </div>

      {/* Clarification Items List */}
      <div className="flex flex-col gap-3">
        {filteredClarifications.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-4 flex flex-col gap-3 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                  {item.clarificationNumber}
                </span>
                <span className="text-slate-400">·</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  {item.vendorName}
                </span>
                <span className="text-slate-400">·</span>
                <span className="font-mono text-[11px] text-slate-500">
                  {item.parameterName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                  item.priority === 'High'
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {item.priority} Priority
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                  item.status === 'Resolved'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                }`}>
                  {item.status}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-900 dark:text-slate-100 leading-relaxed font-medium">
              {item.question}
            </div>

            <div className="text-[11px] text-slate-500 italic bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded border border-slate-100 dark:border-slate-800">
              <strong>Context / Background:</strong> {item.background}
            </div>

            {item.vendorResponse && (
              <div className="text-xs text-emerald-900 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded border border-emerald-200 dark:border-emerald-800">
                <div className="font-semibold mb-1 flex items-center justify-between">
                  <span>Vendor Response ({item.responseDate || 'Received'}):</span>
                  <span className="text-[10px] font-mono text-emerald-600">DISPOSITION ACCEPTED</span>
                </div>
                <div className="leading-relaxed">{item.vendorResponse}</div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 font-mono">
              <div>Owner: {item.owner} · Due: {item.dueDate}</div>
              {item.status !== 'Resolved' && (
                <button
                  onClick={() => {
                    setActiveItemForResponse(item);
                    setVendorResponseText('');
                  }}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Record Vendor Response →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Record Response Modal */}
      {activeItemForResponse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-lg w-full p-5 text-xs flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Record Response: {activeItemForResponse.clarificationNumber}
              </h3>
              <button onClick={() => setActiveItemForResponse(null)}>✕</button>
            </div>

            <div className="text-slate-700 dark:text-slate-300 font-medium">
              {activeItemForResponse.question}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Vendor Formal Reply & Technical Submission
              </label>
              <textarea
                rows={4}
                value={vendorResponseText}
                onChange={(e) => setVendorResponseText(e.target.value)}
                placeholder="Enter vendor's formal response text or technical clarification..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2.5 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Resolution Status
              </label>
              <select
                value={resolutionStatus}
                onChange={(e) => setResolutionStatus(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2 text-slate-900 dark:text-slate-100"
              >
                <option value="Resolved">Resolved (Technical Acceptance)</option>
                <option value="Awaiting Vendor">Awaiting Further Evidence</option>
                <option value="Closed">Closed without Concession</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveItemForResponse(null)}
                className="px-3 py-1.5 text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveResponse}
                disabled={!vendorResponseText.trim()}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium disabled:opacity-40"
              >
                Submit Response
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New TQ Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-lg w-full p-5 text-xs flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Raise New Technical Query (TQ)
              </h3>
              <button onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Vendor
                </label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2 text-slate-900 dark:text-slate-100"
                >
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.vendorName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Parameter Name
                </label>
                <input
                  type="text"
                  value={tqParameter}
                  onChange={(e) => setTqParameter(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Clarification Question
              </label>
              <textarea
                rows={3}
                value={tqQuestion}
                onChange={(e) => setTqQuestion(e.target.value)}
                placeholder="State technical inquiry clearly..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button onClick={() => setShowAddModal(false)} className="px-3 py-1.5 text-slate-600">
                Cancel
              </button>
              <button
                onClick={handleSaveNewTQ}
                disabled={!tqQuestion.trim()}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium disabled:opacity-40"
              >
                Issue Query
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
