import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  AlertOctagon,
  FileSpreadsheet,
  Building2,
  TableProperties,
  HelpCircle,
  ShieldAlert,
  Award,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    project,
    documents,
    conflicts,
    parameters,
    activeRevision,
    vendors,
    deviations,
    clarifications,
    tbeScores,
    setActiveTab,
    executeDemoStep,
  } = useApp();

  const unresolvedConflicts = conflicts.filter((c) => !c.isResolved).length;
  const missingParameters = parameters.filter((p) => p.status === 'Missing').length;
  const criticalDeviations = deviations.filter((d) => d.severity === 'Critical').length;
  const openClarifications = clarifications.filter((c) => c.status === 'Open').length;

  const statCards = [
    {
      title: 'Ingested Documents',
      value: documents.length,
      unit: 'PDS & Specs',
      statusText: 'All hashes verified',
      icon: FileText,
      tab: 'documents' as const,
      color: 'border-slate-300 dark:border-slate-800',
    },
    {
      title: 'Source Conflicts',
      value: unresolvedConflicts,
      unit: 'Unresolved',
      statusText: unresolvedConflicts > 0 ? 'Action required in Center' : 'All resolved',
      icon: AlertOctagon,
      tab: 'conflicts' as const,
      isAlert: unresolvedConflicts > 0,
    },
    {
      title: 'MDS Status',
      value: activeRevision.revision,
      unit: activeRevision.status,
      statusText: missingParameters > 0 ? `${missingParameters} parameters missing` : 'All parameters populated',
      icon: FileSpreadsheet,
      tab: 'mds_draft' as const,
    },
    {
      title: 'Vendor Offers',
      value: vendors.length,
      unit: 'Bids under eval',
      statusText: 'Alpha, Beta, Gamma',
      icon: Building2,
      tab: 'vendor_offers' as const,
    },
    {
      title: 'Identified Deviations',
      value: deviations.length,
      unit: `${criticalDeviations} Critical`,
      statusText: 'Requires engineer disposition',
      icon: ShieldAlert,
      tab: 'deviations' as const,
      isAlert: criticalDeviations > 0,
    },
    {
      title: 'Clarification TQs',
      value: clarifications.length,
      unit: `${openClarifications} Open`,
      statusText: 'Technical queries generated',
      icon: HelpCircle,
      tab: 'clarifications' as const,
    },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col gap-6">
      {/* Safety Notice & Engineering Principle Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded p-4 text-xs text-slate-300 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-950 border border-blue-800 rounded text-blue-400 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-slate-100 text-sm">
              AI Decision-Support System · Accountable Engineering Principle
            </div>
            <p className="mt-1 text-slate-400 leading-relaxed max-w-4xl">
              This platform extracts engineering parameters, performs deterministic unit normalization, flags cross-document source discrepancies, and classifies vendor technical compliance.
              <strong className="text-slate-200"> It must NEVER replace professional engineering judgment or automatically authorize procurement decisions.</strong>
            </p>
          </div>
        </div>
        <div className="text-right shrink-0 font-mono text-[11px] text-slate-400 hidden lg:block">
          <div>EQUIPMENT: {project.equipmentTag}</div>
          <div>STANDARD: ASME VIII / API 650</div>
        </div>
      </div>

      {/* Workflow Progress Stepper */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-5">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 font-mono">
          End-to-End Workflow Status (PDS → MDS → TBE)
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded flex flex-col gap-1">
            <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">01. INGESTION</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">Documents Stored</span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> PDS & Specs Hashed
            </span>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded flex flex-col gap-1">
            <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">02. EXTRACTION</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">AI Parsed & Normalized</span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 100% Traceability
            </span>
          </div>

          <div className={`p-3 rounded flex flex-col gap-1 border ${
            unresolvedConflicts > 0
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
          }`}>
            <span className={`font-mono text-[10px] ${unresolvedConflicts > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              03. CONFLICTS
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">Cross-Source Check</span>
            <span className={`text-[11px] flex items-center gap-1 ${unresolvedConflicts > 0 ? 'text-rose-700 font-medium' : 'text-emerald-700'}`}>
              {unresolvedConflicts > 0 ? <AlertOctagon className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
              {unresolvedConflicts > 0 ? `${unresolvedConflicts} Conflict Open` : 'Resolved'}
            </span>
          </div>

          <div className={`p-3 rounded flex flex-col gap-1 border ${
            activeRevision.status === 'APPROVED'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
              : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
          }`}>
            <span className={`font-mono text-[10px] ${activeRevision.status === 'APPROVED' ? 'text-emerald-600' : 'text-amber-600'}`}>
              04. MDS APPROVAL
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">Mechanical Data Sheet</span>
            <span className={`text-[11px] flex items-center gap-1 ${activeRevision.status === 'APPROVED' ? 'text-emerald-700' : 'text-amber-700 font-medium'}`}>
              {activeRevision.status === 'APPROVED' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
              {activeRevision.revision}
            </span>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded flex flex-col gap-1">
            <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">05. COMPLIANCE</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">Vendor Matrix</span>
            <span className="text-[11px] text-blue-700 dark:text-blue-400 flex items-center gap-1">
              3 Vendors Evaluated
            </span>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded flex flex-col gap-1">
            <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400">06. QUERIES & DEVS</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">TQs & Deviations</span>
            <span className="text-[11px] text-blue-700 dark:text-blue-400">
              {deviations.length} Devs · {clarifications.length} TQs
            </span>
          </div>

          <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded flex flex-col gap-1">
            <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400">07. TBE SCORING</span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">Technical Ranking</span>
            <span className="text-[11px] text-slate-600 dark:text-slate-400">
              Top: Alpha (91.0)
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              onClick={() => setActiveTab(card.tab)}
              className={`bg-white dark:bg-slate-900 border rounded p-4 flex flex-col justify-between hover:border-blue-500 cursor-pointer transition-colors shadow-sm ${
                card.isAlert
                  ? 'border-rose-300 dark:border-rose-900 bg-rose-50/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium">{card.title}</div>
                  <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 mt-1 tabular-nums">
                    {card.value}
                  </div>
                </div>
                <div className={`p-2 rounded ${card.isAlert ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>{card.statusText}</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  View <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Master Demo Quick Walkthrough Panel */}
      <div className="bg-gradient-to-r from-blue-950 to-slate-900 border border-blue-900/60 rounded p-5 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Scenario Runner (Master Prompt Section 48)</span>
            </div>
            <h3 className="text-base font-semibold text-slate-100 mt-1">
              Experience the Complete Synthetic Pressure Vessel Procurement Workflow
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Step through the exact scenario: Unresolved Design Pressure conflict (16 vs 18 bar) → Missing process fields → Engineer sign-off → Multi-vendor compliance breakdown → Deviation register → Technical bid scoring.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => executeDemoStep(1)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors"
            >
              Start Step 1: Conflict
            </button>
            <button
              onClick={() => executeDemoStep(2)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium transition-colors"
            >
              Step 2: Resolve
            </button>
            <button
              onClick={() => executeDemoStep(4)}
              className="px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs font-medium transition-colors"
            >
              Step 4: Approve MDS
            </button>
            <button
              onClick={() => executeDemoStep(5)}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium transition-colors"
            >
              Step 5: Compliance Matrix
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
