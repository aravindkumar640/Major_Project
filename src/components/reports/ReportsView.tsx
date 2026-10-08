import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Printer,
  FileSpreadsheet,
  TableProperties,
  ShieldAlert,
  Award,
  Download,
  CheckCircle2,
} from 'lucide-react';
import {
  generateMDSPrintHtml,
  printEngineeringReport,
  exportToCSV,
} from '../../services/exportService';

export const ReportsView: React.FC = () => {
  const {
    project,
    activeRevision,
    parameters,
    complianceResults,
    deviations,
    tbeScores,
    tbeCategories,
    showToast,
  } = useApp();

  const handlePrintMDS = () => {
    const html = generateMDSPrintHtml(project, activeRevision);
    printEngineeringReport(`MDS Report - ${project.equipmentTag}`, html);
  };

  const handlePrintCompliance = () => {
    const rows = complianceResults
      .map(
        (r) => `
      <tr>
        <td>${r.vendorName}</td>
        <td><strong>${r.parameterName}</strong></td>
        <td>${r.mdsRequirement.value} ${r.mdsRequirement.unit}</td>
        <td>${r.vendorOffer.value ?? 'MISSING'} ${r.vendorOffer.unit ?? ''}</td>
        <td><span class="badge badge-${r.status.toLowerCase()}">${r.status}</span></td>
        <td>${r.ruleApplied ?? 'Standard'}</td>
        <td>${r.explanation}</td>
      </tr>
    `
      )
      .join('');

    const html = `
      <h2>VENDOR TECHNICAL COMPLIANCE REPORT</h2>
      <div><strong>Project:</strong> ${project.name} | <strong>Tag:</strong> ${project.equipmentTag}</div>
      <table>
        <thead>
          <tr>
            <th>Vendor</th>
            <th>Parameter</th>
            <th>MDS Requirement</th>
            <th>Vendor Quoted</th>
            <th>Status</th>
            <th>Rule</th>
            <th>Explanation</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
    printEngineeringReport(`Compliance Report - ${project.equipmentTag}`, html);
  };

  const handlePrintTBE = () => {
    const rows = tbeScores
      .map(
        (s) => `
      <tr>
        <td>#${s.ranking}</td>
        <td><strong>${s.vendorName}</strong></td>
        <td>${s.totalAiScore}</td>
        <td><strong>${s.totalEngineerScore}</strong></td>
        <td>${s.engineerApproved ? 'Approved by Engineer' : 'Pending'}</td>
        <td>${s.recommendationNote}</td>
      </tr>
    `
      )
      .join('');

    const html = `
      <h2>TECHNICAL BID EVALUATION (TBE) SUMMARY REPORT</h2>
      <div><strong>Project:</strong> ${project.name} | <strong>Tag:</strong> ${project.equipmentTag}</div>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Vendor</th>
            <th>AI Model Score</th>
            <th>Engineer Approved Score</th>
            <th>Status</th>
            <th>Discipline Recommendation</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
    printEngineeringReport(`TBE Report - ${project.equipmentTag}`, html);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Printer className="w-5 h-5 text-blue-600" />
          Formal Engineering Dossiers & Procurement Reports
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Generate formal printable dossiers conforming to EPC project standards with audit timestamps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* MDS Report */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded w-fit mb-3">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Mechanical Data Sheet Dossier
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Complete equipment data sheet with verified parameter values, ISO/SI unit normalizations, source citations, and approval signatures.
            </p>
            <div className="mt-3 font-mono text-[11px] text-slate-500">
              Revision: {activeRevision.revision} · Status: {activeRevision.status}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              onClick={handlePrintMDS}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print MDS</span>
            </button>
          </div>
        </div>

        {/* Vendor Compliance Report */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 rounded w-fit mb-3">
              <TableProperties className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Vendor Compliance Matrix Report
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Detailed item-by-item comparison across all bidding fabricators, tracking compliant, deviating, unclear, and missing specifications.
            </p>
            <div className="mt-3 font-mono text-[11px] text-slate-500">
              Evaluated: {complianceResults.length} parameters across 3 vendors
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              onClick={handlePrintCompliance}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Matrix</span>
            </button>
          </div>
        </div>

        {/* TBE Summary Report */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="p-2.5 bg-purple-50 dark:bg-purple-950 text-purple-600 rounded w-fit mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              Technical Bid Evaluation (TBE)
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Formal engineering evaluation summary with category weight breakdown, AI vs engineer score distinction, and procurement recommendation.
            </p>
            <div className="mt-3 font-mono text-[11px] text-slate-500">
              Evaluated: 7 Weighted Categories (100% Normalized)
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              onClick={handlePrintTBE}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print TBE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
