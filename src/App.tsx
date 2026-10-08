import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { Toast } from './components/common/Toast';
import { DashboardView } from './components/dashboard/DashboardView';
import { DocumentListView } from './components/documents/DocumentListView';
import { SplitDocumentViewer } from './components/documents/SplitDocumentViewer';
import { ConflictCenterView } from './components/extraction/ConflictCenterView';
import { MDSSheetView } from './components/mds/MDSSheetView';
import { MDSRevisionsView } from './components/mds/MDSRevisionsView';
import { VendorOffersView } from './components/vendor/VendorOffersView';
import { ComplianceMatrixView } from './components/vendor/ComplianceMatrixView';
import { ClarificationsView } from './components/vendor/ClarificationsView';
import { DeviationRegisterView } from './components/vendor/DeviationRegisterView';
import { TBEView } from './components/tbe/TBEView';
import { RulesAndTemplatesView } from './components/rules/RulesAndTemplatesView';
import { ReportsView } from './components/reports/ReportsView';
import { AuditTrailView } from './components/audit/AuditTrailView';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();

  switch (activeTab) {
    case 'dashboard':
      return <DashboardView />;
    case 'documents':
      return <DocumentListView />;
    case 'document_viewer':
      return <SplitDocumentViewer />;
    case 'conflicts':
      return <ConflictCenterView />;
    case 'mds_draft':
      return <MDSSheetView />;
    case 'mds_revisions':
      return <MDSRevisionsView />;
    case 'vendor_offers':
      return <VendorOffersView />;
    case 'compliance_matrix':
      return <ComplianceMatrixView />;
    case 'clarifications':
      return <ClarificationsView />;
    case 'deviations':
      return <DeviationRegisterView />;
    case 'tbe':
      return <TBEView />;
    case 'rules_templates':
      return <RulesAndTemplatesView />;
    case 'reports':
      return <ReportsView />;
    case 'audit_trail':
      return <AuditTrailView />;
    default:
      return <DashboardView />;
  }
};

export default function App() {
  return (
    <AppProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-900 text-slate-100 font-sans antialiased">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
            <MainContent />
          </main>
        </div>
        <Toast />
      </div>
    </AppProvider>
  );
}
