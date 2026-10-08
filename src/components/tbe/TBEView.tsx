import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TBEScore, TBEScoringCategory } from '../../types';
import {
  Award,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Download,
  ShieldCheck,
  Building2,
  Info,
} from 'lucide-react';
import { exportToCSV } from '../../services/exportService';

export const TBEView: React.FC = () => {
  const {
    tbeScores,
    tbeCategories,
    updateTBECategoryWeight,
    updateTBEScore,
    approveTBEScore,
    showToast,
    project,
    currentUser,
  } = useApp();

  const [showWeightConfig, setShowWeightConfig] = useState<boolean>(false);
  const [selectedVendorForApproval, setSelectedVendorForApproval] = useState<TBEScore | null>(null);
  const [recommendationText, setRecommendationText] = useState<string>(
    'Technically recommended for procurement award subject to final commercial equalization.'
  );

  const totalWeight = tbeCategories.reduce((sum, c) => sum + c.weight, 0);
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01;

  const handleExportCSV = () => {
    const headers = [
      'Ranking',
      'Vendor Name',
      'AI Score (Pre-Review)',
      'Engineer Score (Approved)',
      'Technical Status',
      'Recommendation Note',
      ...tbeCategories.map((c) => `${c.name} (${c.weight}%)`),
    ];
    const rows = tbeScores.map((s) => [
      s.ranking,
      s.vendorName,
      s.totalAiScore,
      s.totalEngineerScore,
      s.engineerApproved ? 'Approved by Engineer' : 'AI Calculation Pending Sign-Off',
      s.recommendationNote,
      ...tbeCategories.map((c) => s.categoryScores[c.id]?.engineerScore ?? 0),
    ]);
    exportToCSV(`TBE_Evaluation_${project.equipmentTag}`, headers, rows);
    showToast('Exported TBE Evaluation to CSV', 'success');
  };

  const handleApproveVendor = () => {
    if (!selectedVendorForApproval) return;
    approveTBEScore(selectedVendorForApproval.vendorId, recommendationText);
    setSelectedVendorForApproval(null);
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col gap-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Technical Bid Evaluation (TBE) Module
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurable multi-factor engineering scoring. AI-generated scoring is strictly distinguished from Engineer-approved rating.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWeightConfig(!showWeightConfig)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showWeightConfig ? 'Hide Weighting Matrix' : 'Configure Weights (100%)'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export TBE CSV</span>
          </button>
        </div>
      </div>

      {/* Mandatory Safety & Non-Autonomous Decision Support Warning */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-950 dark:text-amber-100">ENGINEERING DECISION-SUPPORT GOVERNANCE:</strong>
          <span className="ml-1 leading-relaxed">
            The platform does NOT automatically select or award the winning vendor. Technical ranking serves as decision support only. Accountable discipline engineers and procurement committees must endorse the final technical evaluation summary.
          </span>
        </div>
      </div>

      {/* Configurable Category Weights Panel */}
      {showWeightConfig && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-5 shadow-sm text-xs flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                TBE Scoring Weight Distribution Matrix
              </div>
              <div className="text-[11px] text-slate-500">
                Weights must total exactly 100%. Adjust percentage sliders according to project requisition criteria.
              </div>
            </div>
            <div className={`font-mono text-xs font-bold px-3 py-1 rounded border ${
              isWeightValid
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-rose-50 text-rose-700 border-rose-300'
            }`}>
              Total: {totalWeight}% {isWeightValid ? '✓ VALID' : '⚠ MUST EQUAL 100%'}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tbeCategories.map((cat) => (
              <div key={cat.id} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-2">
                <div>
                  <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200">
                    <span>{cat.name}</span>
                    <span className="font-mono text-blue-600 dark:text-blue-400 tabular-nums">
                      {cat.weight}%
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                    {cat.description}
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={cat.weight}
                  onChange={(e) => updateTBECategoryWeight(cat.id, Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Vendor Scoring Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tbeScores.map((score) => {
          const isTopRank = score.ranking === 1;
          return (
            <div
              key={score.vendorId}
              className={`bg-white dark:bg-slate-900 rounded border p-5 flex flex-col justify-between shadow-sm transition-all ${
                isTopRank
                  ? 'border-blue-500 ring-1 ring-blue-400/30'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                {/* Ranking Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-400">
                      RANK #{score.ranking}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {score.vendorName}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-mono text-slate-400">Engineer Score</div>
                    <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
                      {score.totalEngineerScore}
                      <span className="text-xs text-slate-400 font-normal">/100</span>
                    </div>
                  </div>
                </div>

                {/* AI Score vs Engineer Score Badge Comparison */}
                <div className="mt-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded border border-slate-100 dark:border-slate-800 text-[11px] font-mono flex items-center justify-between">
                  <div>
                    <span className="text-slate-500">AI Model Score: </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">{score.totalAiScore}</span>
                  </div>
                  <div className="h-3 w-px bg-slate-300 dark:bg-slate-700"></div>
                  <div>
                    <span className="text-slate-500">Engineer Score: </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 tabular-nums">{score.totalEngineerScore}</span>
                  </div>
                </div>

                {/* Category Score Breakdown */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider font-mono">
                    Evaluation Category Breakdown:
                  </div>
                  {tbeCategories.map((cat) => {
                    const cScore = score.categoryScores[cat.id] || { aiScore: 70, engineerScore: 70, remarks: '' };
                    return (
                      <div key={cat.id} className="flex flex-col gap-0.5 border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                        <div className="flex items-center justify-between font-mono text-[11px]">
                          <span className="text-slate-600 dark:text-slate-400 truncate max-w-[170px]" title={cat.name}>
                            {cat.name} ({cat.weight}%)
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-[10px]">AI: {cScore.aiScore}</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                              {cScore.engineerScore}
                            </span>
                          </div>
                        </div>
                        <div className="text-[10px] text-slate-500 italic truncate" title={cScore.remarks}>
                          {cScore.remarks}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recommendation Note */}
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded text-xs text-slate-600 dark:text-slate-300 leading-relaxed border border-slate-100 dark:border-slate-800">
                  <strong>Technical Memo:</strong> {score.recommendationNote}
                </div>
              </div>

              {/* Approval / Sign-off Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                {score.engineerApproved ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-1 font-mono text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Approved by {score.approvedBy}
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedVendorForApproval(score);
                      setRecommendationText(score.recommendationNote);
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Authorize Engineer Endorsement</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Endorsement Modal */}
      {selectedVendorForApproval && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg max-w-md w-full p-5 text-xs flex flex-col gap-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                Authorize TBE Recommendation: {selectedVendorForApproval.vendorName}
              </h3>
              <button onClick={() => setSelectedVendorForApproval(null)}>✕</button>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Discipline Recommendation Note
              </label>
              <textarea
                rows={3}
                value={recommendationText}
                onChange={(e) => setRecommendationText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded p-2 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="text-[11px] text-slate-500 font-mono">
              Signed by: {currentUser.name} ({currentUser.title})
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedVendorForApproval(null)}
                className="px-3 py-1.5 text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveVendor}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
              >
                Endorse Evaluation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
