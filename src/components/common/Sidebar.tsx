import React from 'react';
import { useApp, NavigationTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  Files,
  FileSearch,
  AlertOctagon,
  FileSpreadsheet,
  History,
  Building2,
  TableProperties,
  HelpCircle,
  ShieldAlert,
  Award,
  Sliders,
  Printer,
  ScrollText,
} from 'lucide-react';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeType?: 'warning' | 'info' | 'error';
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, conflicts, deviations, clarifications, activeRevision } = useApp();

  const unresolvedConflicts = conflicts.filter((c) => !c.isResolved).length;
  const openDeviations = deviations.filter((d) => d.status === 'Identified').length;
  const openClarifications = clarifications.filter((c) => c.status === 'Open').length;

  const sections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'DOCUMENT INGESTION',
      items: [
        { id: 'documents', label: 'Documents & PDS', icon: Files },
        { id: 'document_viewer', label: 'Split-Screen Viewer', icon: FileSearch },
      ],
    },
    {
      title: 'ENGINEERING VALIDATION',
      items: [
        {
          id: 'conflicts',
          label: 'Conflict Center',
          icon: AlertOctagon,
          badge: unresolvedConflicts > 0 ? unresolvedConflicts : undefined,
          badgeType: 'error',
        },
      ],
    },
    {
      title: 'MECHANICAL DATA SHEET',
      items: [
        {
          id: 'mds_draft',
          label: activeRevision.status === 'APPROVED' ? 'Approved MDS Sheet' : 'Draft MDS & Review',
          icon: FileSpreadsheet,
          badge: activeRevision.status === 'APPROVED' ? 'Rev 1' : 'Draft',
          badgeType: activeRevision.status === 'APPROVED' ? 'info' : 'warning',
        },
        { id: 'mds_revisions', label: 'Revision Control', icon: History },
      ],
    },
    {
      title: 'VENDOR TECHNICAL BID',
      items: [
        { id: 'vendor_offers', label: 'Vendor Offers', icon: Building2 },
        { id: 'compliance_matrix', label: 'Compliance Matrix', icon: TableProperties },
        {
          id: 'clarifications',
          label: 'Clarification TQs',
          icon: HelpCircle,
          badge: openClarifications > 0 ? openClarifications : undefined,
          badgeType: 'info',
        },
        {
          id: 'deviations',
          label: 'Deviation Register',
          icon: ShieldAlert,
          badge: openDeviations > 0 ? openDeviations : undefined,
          badgeType: 'warning',
        },
        { id: 'tbe', label: 'Technical Bid Eval (TBE)', icon: Award },
      ],
    },
    {
      title: 'GOVERNANCE & AUDIT',
      items: [
        { id: 'rules_templates', label: 'Rules & Dictionary', icon: Sliders },
        { id: 'reports', label: 'Reports & Export', icon: Printer },
        { id: 'audit_trail', label: 'Audit Trail', icon: ScrollText },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none overflow-y-auto">
      <div className="py-4 px-3 flex flex-col gap-6">
        {sections.map((section, idx) => (
          <div key={idx} className="flex flex-col gap-1">
            <div className="px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
              {section.title}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs transition-colors text-left ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-300 font-medium border-l-2 border-blue-500 pl-2.5'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded ${
                        item.badgeType === 'error'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : item.badgeType === 'warning'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-auto p-4 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col gap-1">
        <div className="text-slate-300 font-medium">AeroMDS Decision Support</div>
        <div>Non-autonomous engineering system</div>
        <div className="text-[10px] text-slate-400 font-mono mt-1">v2.4.0 · ASME VIII / API 650</div>
      </div>
    </aside>
  );
};
