import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, Shield, ChevronDown, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, setCurrentUser, availableUsers, project, executeDemoStep, demoStep, showToast } = useApp();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between px-6 shrink-0 relative z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <span className="font-semibold tracking-wider text-base text-slate-100 flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></span>
          AeroMDS
        </span>
        <span className="text-slate-600 hidden sm:inline" aria-hidden="true">|</span>
        <span className="text-xs text-slate-400 hidden sm:inline truncate max-w-xs">
          {project.name} · {project.equipmentTag}
        </span>
      </div>

      {/* Zone 2: Navigation Breadcrumbs / State */}
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-mono">
        <span className="text-slate-300 font-medium">{project.equipmentTag}</span>
        <span aria-hidden="true">/</span>
        <span>{project.equipmentName}</span>
        <span aria-hidden="true">/</span>
        <span className="text-emerald-400 font-sans font-medium">{project.currentMdsRevision}</span>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-3">
        {/* Interactive Master Demo Walkthrough Button */}
        <div className="relative">
          <button
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            <span>Master Demo Flow</span>
            <ChevronDown className="w-3 h-3 text-blue-200" />
          </button>

          {showDemoMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded shadow-2xl py-2 z-50 text-xs text-slate-200">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Master Prompt Demo Scenario (Sec 48)
              </div>
              <button
                onClick={() => { executeDemoStep(1); setShowDemoMenu(false); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-start gap-2"
              >
                <span className="text-blue-400 font-mono font-bold">01.</span>
                <div>
                  <div className="font-medium text-slate-100">Inspect Source Conflict</div>
                  <div className="text-[11px] text-slate-400">PDS 16 bar(g) vs Spec 18 bar(g)</div>
                </div>
              </button>
              <button
                onClick={() => { executeDemoStep(2); setShowDemoMenu(false); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-start gap-2"
              >
                <span className="text-blue-400 font-mono font-bold">02.</span>
                <div>
                  <div className="font-medium text-slate-100">Engineer Resolves Conflict</div>
                  <div className="text-[11px] text-slate-400">Accept 18 bar(g) per SPEC-014 Clause 4.2</div>
                </div>
              </button>
              <button
                onClick={() => { executeDemoStep(3); setShowDemoMenu(false); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-start gap-2"
              >
                <span className="text-blue-400 font-mono font-bold">03.</span>
                <div>
                  <div className="font-medium text-slate-100">Resolve 2 Missing Fields</div>
                  <div className="text-[11px] text-slate-400">Design Temp (200°C) & CA (3.0 mm)</div>
                </div>
              </button>
              <button
                onClick={() => { executeDemoStep(4); setShowDemoMenu(false); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-start gap-2"
              >
                <span className="text-blue-400 font-mono font-bold">04.</span>
                <div>
                  <div className="font-medium text-slate-100">Approve MDS (Rev 1)</div>
                  <div className="text-[11px] text-slate-400">Digital sign-off with audit record</div>
                </div>
              </button>
              <button
                onClick={() => { executeDemoStep(5); setShowDemoMenu(false); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-start gap-2"
              >
                <span className="text-blue-400 font-mono font-bold">05.</span>
                <div>
                  <div className="font-medium text-slate-100">Evaluate 3 Vendor Offers</div>
                  <div className="text-[11px] text-slate-400">Alpha (Compliant), Beta (Deviations), Gamma (Missing/Unclear)</div>
                </div>
              </button>
              <button
                onClick={() => { executeDemoStep(6); setShowDemoMenu(false); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-start gap-2"
              >
                <span className="text-blue-400 font-mono font-bold">06.</span>
                <div>
                  <div className="font-medium text-slate-100">Clarifications & Deviations</div>
                  <div className="text-[11px] text-slate-400">Inspect auto-generated registers</div>
                </div>
              </button>
              <button
                onClick={() => { executeDemoStep(7); setShowDemoMenu(false); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-start gap-2 border-t border-slate-800"
              >
                <span className="text-blue-400 font-mono font-bold">07.</span>
                <div>
                  <div className="font-medium text-slate-100">Final Technical Bid Evaluation</div>
                  <div className="text-[11px] text-slate-400">TBE scores & weight validation</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* User Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded text-xs text-slate-200 border border-slate-700 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">{currentUser.name}</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">[{currentUser.role}]</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded shadow-xl py-1.5 z-50 text-xs">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                Switch Role / User (RBAC)
              </div>
              {availableUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setCurrentUser(u);
                    setShowUserDropdown(false);
                    showToast(`Active User switched to ${u.name} (${u.role})`, 'info');
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center justify-between ${
                    currentUser.id === u.id ? 'bg-slate-800/80 text-blue-300 font-medium' : 'text-slate-300'
                  }`}
                >
                  <div>
                    <div>{u.name}</div>
                    <div className="text-[10px] text-slate-400">{u.title}</div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">{u.role}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
