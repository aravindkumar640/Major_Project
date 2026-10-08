import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Project,
  EngineeringDocument,
  ExtractedParameter,
  SourceConflict,
  VendorOffer,
  MDSRevision,
  User,
  UserRole,
  ComplianceResult,
  ClarificationItem,
  DeviationItem,
  TBEScoringCategory,
  TBEScore,
  AuditLogEntry,
  ParameterDefinition,
} from '../types';
import {
  SYNTHETIC_USERS,
  SYNTHETIC_PROJECT,
  SYNTHETIC_DOCUMENTS,
  INITIAL_CONFLICTS,
  getInitialExtractedParameters,
  SYNTHETIC_VENDORS,
  INITIAL_PARAMETER_DEFINITIONS,
} from '../services/syntheticData';
import { evaluateVendorCompliance } from '../services/complianceEngine';
import {
  generateClarificationsFromCompliance,
  generateDeviationsFromCompliance,
} from '../services/clarificationAndDeviation';
import { DEFAULT_TBE_CATEGORIES, calculateAITBEScores, validateTBEWeights } from '../services/tbeEngine';
import { normalizeUnit } from '../services/unitConversion';

export type NavigationTab =
  | 'dashboard'
  | 'documents'
  | 'document_viewer'
  | 'conflicts'
  | 'mds_draft'
  | 'mds_revisions'
  | 'vendor_offers'
  | 'compliance_matrix'
  | 'clarifications'
  | 'deviations'
  | 'tbe'
  | 'rules_templates'
  | 'reports'
  | 'audit_trail';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  availableUsers: User[];
  project: Project;
  setProject: React.Dispatch<React.SetStateAction<Project>>;
  documents: EngineeringDocument[];
  addDocument: (doc: EngineeringDocument) => void;
  parameters: ExtractedParameter[];
  conflicts: SourceConflict[];
  resolveConflict: (conflictId: string, chosenValue: string | number, reason: string) => void;
  updateParameter: (paramId: string, updates: Partial<ExtractedParameter>, reason: string) => void;
  mdsRevisions: MDSRevision[];
  activeRevision: MDSRevision;
  approveMDS: (comment: string) => { success: boolean; error?: string };
  vendors: VendorOffer[];
  complianceResults: ComplianceResult[];
  clarifications: ClarificationItem[];
  updateClarification: (id: string, updates: Partial<ClarificationItem>) => void;
  addClarification: (item: ClarificationItem) => void;
  deviations: DeviationItem[];
  updateDeviation: (id: string, updates: Partial<DeviationItem>) => void;
  tbeCategories: TBEScoringCategory[];
  updateTBECategoryWeight: (categoryId: string, newWeight: number) => { success: boolean; error?: string };
  tbeScores: TBEScore[];
  updateTBEScore: (vendorId: string, categoryId: string, engineerScore: number, remarks: string) => void;
  approveTBEScore: (vendorId: string, recommendationNote: string) => void;
  auditLogs: AuditLogEntry[];
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedDocId: string;
  setSelectedDocId: (id: string) => void;
  selectedParamForViewer: ExtractedParameter | null;
  setSelectedParamForViewer: (param: ExtractedParameter | null) => void;
  parameterDefinitions: ParameterDefinition[];
  toastMessage: string | null;
  toastType: 'info' | 'success' | 'warning' | 'error';
  showToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  executeDemoStep: (stepNumber: number) => void;
  demoStep: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(SYNTHETIC_USERS[0]); // David Chen, PE (Engineer)
  const [project, setProject] = useState<Project>(SYNTHETIC_PROJECT);
  const [documents, setDocuments] = useState<EngineeringDocument[]>(SYNTHETIC_DOCUMENTS);
  const [parameters, setParameters] = useState<ExtractedParameter[]>(getInitialExtractedParameters());
  const [conflicts, setConflicts] = useState<SourceConflict[]>(INITIAL_CONFLICTS);
  const [parameterDefinitions] = useState<ParameterDefinition[]>(INITIAL_PARAMETER_DEFINITIONS);

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [selectedDocId, setSelectedDocId] = useState<string>('doc-pds-001');
  const [selectedParamForViewer, setSelectedParamForViewer] = useState<ExtractedParameter | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'info' | 'success' | 'warning' | 'error'>('info');

  const [demoStep, setDemoStep] = useState<number>(1);

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'aud-001',
      timestamp: '2026-10-02T10:15:00Z',
      userId: 'usr-eng-01',
      userName: 'David Chen, PE',
      userRole: 'engineer',
      action: 'Document Uploaded & Hashed',
      entityType: 'DOCUMENT',
      entityId: 'doc-pds-001',
      details: {
        newValue: 'PDS-001-V101.pdf',
        reason: 'Initial engineering process data sheet issuance',
        source: 'PDS-001-V101.pdf',
      },
    },
    {
      id: 'aud-002',
      timestamp: '2026-10-02T10:16:30Z',
      userId: 'system',
      userName: 'AeroMDS Ingestion Engine',
      userRole: 'admin',
      action: 'AI Parameter Extraction Completed',
      entityType: 'PARAMETER',
      entityId: 'V-101',
      details: {
        newValue: '14 Parameters Extracted, 2 Missing, 1 Conflict Flagged',
        source: 'PDS-001-V101.pdf',
      },
    },
    {
      id: 'aud-003',
      timestamp: '2026-10-02T11:00:00Z',
      userId: 'usr-rev-01',
      userName: 'Sarah Lindqvist',
      userRole: 'reviewer',
      action: 'Document Uploaded & Hashed',
      entityType: 'DOCUMENT',
      entityId: 'doc-spec-014',
      details: {
        newValue: 'SPEC-014-PV.pdf',
        reason: 'Project vessel specification upload',
        source: 'SPEC-014-PV.pdf',
      },
    },
    {
      id: 'aud-004',
      timestamp: '2026-10-02T11:02:00Z',
      userId: 'system',
      userName: 'AeroMDS Conflict Engine',
      userRole: 'admin',
      action: 'Cross-Document Conflict Detected',
      entityType: 'CONFLICT',
      entityId: 'CONF-001',
      details: {
        previousValue: '16 bar(g) (PDS-001)',
        newValue: '18 bar(g) (SPEC-014)',
        reason: 'Design Pressure disparity detected across sources. Engineer review triggered.',
        source: 'PDS-001 p.3 vs SPEC-014 p.12',
      },
    },
  ]);

  const [mdsRevisions, setMdsRevisions] = useState<MDSRevision[]>([
    {
      revision: 'Rev 0 (Draft)',
      revisionNumber: 0,
      createdAt: '2026-10-02T11:05:00Z',
      createdBy: 'David Chen, PE',
      status: 'DRAFT',
      comment: 'Initial draft auto-populated from PDS-001 and SPEC-014. Pending conflict resolution and missing parameters.',
      fields: parameters,
    },
  ]);

  const activeRevision = mdsRevisions[mdsRevisions.length - 1];

  const [vendors] = useState<VendorOffer[]>(SYNTHETIC_VENDORS);
  const [tbeCategories, setTbeCategories] = useState<TBEScoringCategory[]>(DEFAULT_TBE_CATEGORIES);

  // Computed state for compliance, clarifications, deviations, and TBE
  const [complianceResults, setComplianceResults] = useState<ComplianceResult[]>([]);
  const [clarifications, setClarifications] = useState<ClarificationItem[]>([]);
  const [deviations, setDeviations] = useState<DeviationItem[]>([]);
  const [tbeScores, setTbeScores] = useState<TBEScore[]>([]);

  const showToast = (msg: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Log an immutable audit entry
  const logAudit = (
    action: string,
    entityType: AuditLogEntry['entityType'],
    entityId: string,
    details: AuditLogEntry['details']
  ) => {
    const entry: AuditLogEntry = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  // Re-evaluate compliance whenever approved MDS or vendors change
  useEffect(() => {
    const currentMds = activeRevision.fields;
    let allCompResults: ComplianceResult[] = [];
    for (const vendor of vendors) {
      const vResults = evaluateVendorCompliance(currentMds, vendor);
      allCompResults = [...allCompResults, ...vResults];
    }
    setComplianceResults(allCompResults);

    const generatedClarifications = generateClarificationsFromCompliance(allCompResults);
    setClarifications(generatedClarifications);

    const generatedDeviations = generateDeviationsFromCompliance(allCompResults);
    setDeviations(generatedDeviations);

    const calculatedScores = calculateAITBEScores(
      vendors,
      allCompResults,
      generatedDeviations,
      tbeCategories
    );
    setTbeScores(calculatedScores);
  }, [parameters, activeRevision.status, tbeCategories]);

  // Conflict Resolution
  const resolveConflict = (conflictId: string, chosenValue: string | number, reason: string) => {
    const targetConflict = conflicts.find((c) => c.id === conflictId);
    if (!targetConflict) return;

    const numVal = typeof chosenValue === 'number' ? chosenValue : parseFloat(String(chosenValue));
    const norm = normalizeUnit(numVal, 'bar(g)', targetConflict.parameterName);

    setConflicts((prev) =>
      prev.map((c) =>
        c.id === conflictId
          ? {
              ...c,
              isResolved: true,
              resolvedValue: String(chosenValue),
              resolvedBy: currentUser.name,
              resolutionReason: reason,
              resolvedAt: new Date().toISOString(),
            }
          : c
      )
    );

    setParameters((prev) =>
      prev.map((p) => {
        if (p.parameterName === targetConflict.parameterName) {
          return {
            ...p,
            originalValue: chosenValue,
            originalUnit: 'bar(g)',
            normalizedValue: norm?.normalizedValue ?? chosenValue,
            normalizedUnit: norm?.normalizedUnit ?? 'MPa(g)',
            conversionFormula: norm?.formula,
            conversionSource: norm?.sourceStandard,
            status: 'Available',
            requiresReview: false,
            source: {
              documentId: 'doc-spec-014',
              documentName: 'SPEC-014-PV.pdf',
              page: 12,
              section: 'Clause 4.2',
              sourceText: 'Clause 4.2: Minimum Design Pressure: 18.0 bar(g) (Supersedes preliminary PDS)',
            },
            notes: `Resolved by ${currentUser.name}: ${reason}`,
          };
        }
        return p;
      })
    );

    logAudit(
      'Conflict Resolved by Engineer',
      'CONFLICT',
      conflictId,
      {
        previousValue: '16 bar(g) / 18 bar(g) (Disputed)',
        newValue: `${chosenValue} bar(g)`,
        reason,
        source: 'SPEC-014-PV.pdf p.12',
      }
    );

    showToast(`Conflict for ${targetConflict.parameterName} resolved: ${chosenValue} bar(g) approved.`, 'success');
  };

  // Update / Fill parameter (e.g. missing values)
  const updateParameter = (paramId: string, updates: Partial<ExtractedParameter>, reason: string) => {
    const existing = parameters.find((p) => p.id === paramId);
    if (!existing) return;

    setParameters((prev) =>
      prev.map((p) => {
        if (p.id === paramId) {
          const newVal = updates.originalValue !== undefined ? updates.originalValue : p.originalValue;
          const newUnit = updates.originalUnit !== undefined ? updates.originalUnit : p.originalUnit;
          const norm = normalizeUnit(newVal, newUnit, p.parameterName);

          return {
            ...p,
            ...updates,
            normalizedValue: norm?.normalizedValue ?? updates.normalizedValue ?? p.normalizedValue,
            normalizedUnit: norm?.normalizedUnit ?? updates.normalizedUnit ?? p.normalizedUnit,
            conversionFormula: norm?.formula ?? p.conversionFormula,
            conversionSource: norm?.sourceStandard ?? p.conversionSource,
            engineerOverride: {
              value: newVal ?? '',
              unit: newUnit ?? '',
              engineerName: currentUser.name,
              reason,
              timestamp: new Date().toISOString(),
            },
          };
        }
        return p;
      })
    );

    logAudit(
      `Parameter Updated: ${existing.parameterName}`,
      'PARAMETER',
      paramId,
      {
        previousValue: existing.originalValue !== null ? `${existing.originalValue} ${existing.originalUnit || ''}` : 'MISSING',
        newValue: updates.originalValue !== undefined ? `${updates.originalValue} ${updates.originalUnit || ''}` : '',
        reason,
        source: updates.source?.documentName || 'Manual Engineering Input',
      }
    );

    showToast(`Updated ${existing.parameterName}`, 'info');
  };

  // Approve MDS
  const approveMDS = (comment: string): { success: boolean; error?: string } => {
    // Error prevention checks per Master Prompt Section 36
    const unresolvedConflicts = conflicts.filter((c) => !c.isResolved);
    if (unresolvedConflicts.length > 0) {
      return {
        success: false,
        error: `Cannot approve MDS: ${unresolvedConflicts.length} unresolved source conflict(s) remaining (e.g., ${unresolvedConflicts[0].parameterName}). Must be resolved in Conflict Center.`,
      };
    }

    const missingMandatory = parameters.filter((p) => p.status === 'Missing');
    if (missingMandatory.length > 0) {
      return {
        success: false,
        error: `Cannot approve MDS: ${missingMandatory.length} mandatory parameter(s) missing (e.g. ${missingMandatory.map((m) => m.parameterName).join(', ')}). Engineer review required.`,
      };
    }

    // Role check: Only engineer or reviewer can approve
    if (currentUser.role !== 'engineer' && currentUser.role !== 'reviewer' && currentUser.role !== 'admin') {
      return {
        success: false,
        error: `Permission Denied: User role "${currentUser.role}" is not authorized to sign off Mechanical Data Sheets. Requires Engineer or Reviewer authority.`,
      };
    }

    const newRevNumber = activeRevision.revisionNumber + 1;
    const newRevisionName = `Rev ${newRevNumber} (Approved)`;

    const approvedRev: MDSRevision = {
      revision: newRevisionName,
      revisionNumber: newRevNumber,
      createdAt: new Date().toISOString(),
      createdBy: activeRevision.createdBy,
      approvedBy: `${currentUser.name} (${currentUser.title})`,
      approvedAt: new Date().toISOString(),
      status: 'APPROVED',
      comment,
      fields: parameters.map((p) => ({ ...p, status: 'Approved' })),
    };

    setMdsRevisions((prev) => [...prev, approvedRev]);
    setProject((prev) => ({
      ...prev,
      status: 'MDS_APPROVED',
      currentMdsRevision: newRevisionName,
      updatedAt: new Date().toISOString(),
    }));

    logAudit(
      `MDS Approved: ${newRevisionName}`,
      'MDS',
      newRevisionName,
      {
        previousValue: activeRevision.revision,
        newValue: newRevisionName,
        reason: comment,
        comment: `Digital approval stamped by ${currentUser.name} at ${new Date().toISOString()}`,
      }
    );

    showToast(`Mechanical Data Sheet ${newRevisionName} officially approved!`, 'success');
    return { success: true };
  };

  const addDocument = (doc: EngineeringDocument) => {
    setDocuments((prev) => [doc, ...prev]);
    logAudit('Document Uploaded & Hashed', 'DOCUMENT', doc.id, {
      newValue: doc.title,
      reason: 'User file ingestion',
      source: doc.fileFormat,
    });
    showToast(`Document "${doc.title}" processed & hashed (${doc.hash.substring(0, 10)}...)`, 'success');
  };

  const updateClarification = (id: string, updates: Partial<ClarificationItem>) => {
    setClarifications((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
    showToast(`Clarification ${id} updated`, 'info');
  };

  const addClarification = (item: ClarificationItem) => {
    setClarifications((prev) => [item, ...prev]);
    logAudit('Clarification Raised', 'CLARIFICATION', item.id, {
      newValue: item.question,
      reason: 'Manual engineering technical query',
    });
    showToast(`Clarification ${item.clarificationNumber} created`, 'success');
  };

  const updateDeviation = (id: string, updates: Partial<DeviationItem>) => {
    setDeviations((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
    logAudit('Deviation Disposition Updated', 'DEVIATION', id, {
      newValue: updates.status,
      reason: updates.engineerDisposition,
    });
    showToast(`Deviation ${id} disposition recorded`, 'info');
  };

  const updateTBECategoryWeight = (categoryId: string, newWeight: number) => {
    const updated = tbeCategories.map((c) =>
      c.id === categoryId ? { ...c, weight: newWeight } : c
    );
    const validation = validateTBEWeights(updated);
    setTbeCategories(updated);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }
    return { success: true };
  };

  const updateTBEScore = (vendorId: string, categoryId: string, engineerScore: number, remarks: string) => {
    setTbeScores((prev) =>
      prev.map((s) => {
        if (s.vendorId === vendorId) {
          const currentCat = s.categoryScores[categoryId] || { aiScore: 70, engineerScore: 70, remarks: '' };
          const updatedCatScores = {
            ...s.categoryScores,
            [categoryId]: {
              ...currentCat,
              engineerScore,
              remarks,
            },
          };
          let totalEng = 0;
          for (const cat of tbeCategories) {
            const sc = updatedCatScores[cat.id];
            if (sc) totalEng += (sc.engineerScore * cat.weight) / 100;
          }
          return {
            ...s,
            categoryScores: updatedCatScores,
            totalEngineerScore: Math.round(totalEng * 10) / 10,
          };
        }
        return s;
      })
    );
    showToast('TBE engineer score adjusted', 'info');
  };

  const approveTBEScore = (vendorId: string, recommendationNote: string) => {
    setTbeScores((prev) =>
      prev.map((s) =>
        s.vendorId === vendorId
          ? {
              ...s,
              engineerApproved: true,
              approvedBy: currentUser.name,
              approvedAt: new Date().toISOString(),
              recommendationNote,
            }
          : s
      )
    );
    logAudit('TBE Evaluation Sign-Off', 'TBE', vendorId, {
      newValue: 'Approved by Engineer',
      reason: recommendationNote,
    });
    showToast('TBE Technical Recommendation approved by Engineer', 'success');
  };

  // Interactive step-by-step master prompt demo runner
  const executeDemoStep = (stepNumber: number) => {
    setDemoStep(stepNumber);
    if (stepNumber === 1) {
      // Step 1: Show conflict center
      setActiveTab('conflicts');
      showToast('Step 1: Notice the Source Conflict on Design Pressure (16 bar vs 18 bar).', 'warning');
    } else if (stepNumber === 2) {
      // Step 2: Auto resolve conflict
      resolveConflict(
        'CONF-001',
        18,
        'Project Specification SPEC-014 Clause 4.2 mandates 18.0 bar(g) for compressor trip envelope, superseding preliminary PDS-001.'
      );
      showToast('Step 2: Conflict resolved by Engineer! Design Pressure set to 18 bar(g).', 'success');
      setActiveTab('mds_draft');
    } else if (stepNumber === 3) {
      // Step 3: Populate 2 missing parameters
      updateParameter(
        'p-tdes',
        {
          originalValue: 200,
          originalUnit: '°C',
          normalizedValue: 200,
          normalizedUnit: '°C',
          status: 'Available',
          requiresReview: false,
          source: {
            documentId: 'doc-spec-014',
            documentName: 'SPEC-014-PV.pdf',
            page: 12,
            section: 'Clause 4.2',
            sourceText: 'Clause 4.2: Maximum coincident Design Temperature = 200 °C',
          },
        },
        'Populated from approved SPEC-014-PV.pdf Clause 4.2'
      );
      updateParameter(
        'p-corr',
        {
          originalValue: 3.0,
          originalUnit: 'mm',
          normalizedValue: 3.0,
          normalizedUnit: 'mm',
          status: 'Available',
          requiresReview: false,
          source: {
            documentId: 'doc-spec-014',
            documentName: 'SPEC-014-PV.pdf',
            page: 12,
            section: 'Clause 4.2',
            sourceText: 'Clause 4.2: Corrosion Allowance: 3.0 mm sacrificial thickness for sour service.',
          },
        },
        'Populated from approved SPEC-014-PV.pdf Clause 4.2'
      );
      showToast('Step 3: Missing parameters (Design Temp = 200°C, CA = 3.0 mm) populated with traceable sources!', 'success');
      setActiveTab('mds_draft');
    } else if (stepNumber === 4) {
      // Step 4: Approve MDS
      const res = approveMDS('Approved for Vendor Technical Inquiry following resolution of process safety surge envelope.');
      if (res.success) {
        showToast('Step 4: MDS Rev 1 (Approved) digitally signed! Vendor offers now active.', 'success');
        setActiveTab('compliance_matrix');
      }
    } else if (stepNumber === 5) {
      // Step 5: View Compliance Matrix
      setActiveTab('compliance_matrix');
      showToast('Step 5: Inspect Vendor Offers comparison (Compliant, Deviating, Unclear, Missing).', 'info');
    } else if (stepNumber === 6) {
      // Step 6: View Clarifications & Deviations
      setActiveTab('deviations');
      showToast('Step 6: Review auto-generated Deviation Register and Technical Queries.', 'info');
    } else if (stepNumber === 7) {
      // Step 7: View TBE
      setActiveTab('tbe');
      showToast('Step 7: Technical Bid Evaluation scoring with live weight calculation.', 'info');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        availableUsers: SYNTHETIC_USERS,
        project,
        setProject,
        documents,
        addDocument,
        parameters,
        conflicts,
        resolveConflict,
        updateParameter,
        mdsRevisions,
        activeRevision,
        approveMDS,
        vendors,
        complianceResults,
        clarifications,
        updateClarification,
        addClarification,
        deviations,
        updateDeviation,
        tbeCategories,
        updateTBECategoryWeight,
        tbeScores,
        updateTBEScore,
        approveTBEScore,
        auditLogs,
        activeTab,
        setActiveTab,
        selectedDocId,
        setSelectedDocId,
        selectedParamForViewer,
        setSelectedParamForViewer,
        parameterDefinitions,
        toastMessage,
        toastType,
        showToast,
        executeDemoStep,
        demoStep,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
