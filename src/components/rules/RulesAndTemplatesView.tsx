import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DEFAULT_ENGINEERING_RULES } from '../../services/ruleEngine';
import { Sliders, BookOpen, CheckCircle2, Shield, Plus, ToggleLeft, ToggleRight } from 'lucide-react';

export const RulesAndTemplatesView: React.FC = () => {
  const { parameterDefinitions, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'rules' | 'dictionary'>('rules');
  const [rules, setRules] = useState(DEFAULT_ENGINEERING_RULES);

  const toggleRuleActive = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    );
    showToast('Engineering rule status updated', 'info');
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-slate-50 dark:bg-slate-950 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            Engineering Rules & Parameter Dictionary
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configurable design rules and standard parameter taxonomy stored separately from application code.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-3 py-1.5 rounded font-mono text-[11px] uppercase transition-colors ${
            activeTab === 'rules'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Engineering Rules ({rules.length})
        </button>
        <button
          onClick={() => setActiveTab('dictionary')}
          className={`px-3 py-1.5 rounded font-mono text-[11px] uppercase transition-colors ${
            activeTab === 'dictionary'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Parameter Dictionary ({parameterDefinitions.length})
        </button>
      </div>

      {activeTab === 'rules' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px] uppercase">
                <th className="py-2.5 px-4 font-semibold">Rule Code</th>
                <th className="py-2.5 px-4 font-semibold">Parameter</th>
                <th className="py-2.5 px-3 font-semibold">Standard Code</th>
                <th className="py-2.5 px-4 font-semibold">Logic / Condition</th>
                <th className="py-2.5 px-3 font-semibold">Severity</th>
                <th className="py-2.5 px-4 font-semibold">Description</th>
                <th className="py-2.5 px-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {rule.ruleCode}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {rule.parameterName}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                    {rule.standard}
                  </td>
                  <td className="py-3 px-4 font-mono text-blue-600 dark:text-blue-400 text-[11px]">
                    {rule.condition}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                      rule.severity === 'Critical'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        : rule.severity === 'Major'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                        : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300'
                    }`}>
                      {rule.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
                    {rule.description}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => toggleRuleActive(rule.id)}
                      className={`font-mono text-[11px] px-2 py-0.5 rounded font-semibold ${
                        rule.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}
                    >
                      {rule.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[11px] uppercase">
                <th className="py-2.5 px-4 font-semibold">Code / ID</th>
                <th className="py-2.5 px-4 font-semibold">Parameter Name</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Standard Unit</th>
                <th className="py-2.5 px-4 font-semibold">Allowed Units</th>
                <th className="py-2.5 px-3 font-semibold">Mandatory</th>
                <th className="py-2.5 px-4 font-semibold">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {parameterDefinitions.map((def) => (
                <tr key={def.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                    {def.code}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {def.name}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] uppercase text-slate-500">
                    {def.category}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {def.standardUnit}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-blue-600 dark:text-blue-400">
                    {def.allowedUnits.join(', ')}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px]">
                    {def.isMandatory ? (
                      <span className="text-rose-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-slate-400">Optional</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-500 leading-relaxed max-w-xs">
                    {def.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
