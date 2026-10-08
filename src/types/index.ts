export type UserRole = 'admin' | 'engineer' | 'reviewer' | 'procurement' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  department: string;
}

export type ProjectStatus =
  | 'INITIATED'
  | 'DOCUMENTS_UPLOADED'
  | 'PDS_PROCESSED'
  | 'MDS_DRAFT'
  | 'ENGINEERING_REVIEW'
  | 'MDS_APPROVED'
  | 'VENDOR_EVALUATION'
  | 'TBE_IN_PROGRESS'
  | 'EVALUATION_COMPLETE'
  | 'CLOSED';

export type ParameterCategory = 'general' | 'process' | 'mechanical' | 'safety';

export type ExtractionStatus =
  | 'Available'
  | 'Missing'
  | 'Conflict'
  | 'Uncertain'
  | 'Requires Review'
  | 'Not Applicable'
  | 'Approved';

export type ComplianceStatus = 'COMPLIANT' | 'DEVIATING' | 'UNCLEAR' | 'MISSING';

export type DeviationSeverity = 'Critical' | 'Major' | 'Minor' | 'Informational';

export type ClarificationPriority = 'High' | 'Medium' | 'Low';

export interface SourceReference {
  documentId: string;
  documentName: string;
  page: number;
  section: string;
  table?: string;
  row?: number;
  column?: string;
  sourceText: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ParameterDefinition {
  id: string;
  code: string;
  name: string;
  category: ParameterCategory;
  standardUnit: string;
  allowedUnits: string[];
  isMandatory: boolean;
  description: string;
}

export interface ExtractedParameter {
  id: string;
  parameterId: string;
  parameterName: string;
  category: ParameterCategory;
  originalValue: string | number | null;
  originalUnit: string | null;
  normalizedValue: string | number | null;
  normalizedUnit: string | null;
  conversionFormula?: string;
  conversionSource?: string;
  unitValidationIssue?: string;
  source: SourceReference | null;
  confidence: number; // 0 - 1
  status: ExtractionStatus;
  engineerOverride?: {
    value: string | number;
    unit: string;
    engineerName: string;
    reason: string;
    timestamp: string;
  };
  conflicts?: SourceConflict[];
  notes?: string;
  requiresReview: boolean;
}

export interface SourceConflict {
  id: string;
  parameterName: string;
  source1: {
    documentName: string;
    page: number;
    value: string;
    text: string;
  };
  source2: {
    documentName: string;
    page: number;
    value: string;
    text: string;
  };
  recommendedAction: string;
  isResolved: boolean;
  resolvedValue?: string;
  resolvedBy?: string;
  resolutionReason?: string;
  resolvedAt?: string;
}

export interface EngineeringDocument {
  id: string;
  title: string;
  documentNumber: string;
  revision: string;
  type: 'PDS' | 'PROJECT_SPEC' | 'CLIENT_SPEC' | 'EQUIPMENT_SPEC' | 'ENGINEERING_CODE' | 'MDS_TEMPLATE' | 'VENDOR_OFFER';
  fileFormat: 'PDF' | 'XLSX' | 'DOCX' | 'CSV' | 'SCAN';
  fileSize: string;
  hash: string;
  issueDate: string;
  uploadedBy: string;
  uploadedAt: string;
  totalPages: number;
  equipmentTag: string;
  extractedParametersCount: number;
  contentSnippet: string;
  pages: DocumentPageData[];
}

export interface DocumentPageData {
  pageNumber: number;
  text: string;
  tables?: Array<{
    title: string;
    headers: string[];
    rows: string[][];
  }>;
  highlightBoxes?: Array<{
    parameterName: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
}

export interface MDSRevision {
  revision: string;
  revisionNumber: number;
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  status: 'DRAFT' | 'UNDER_REVIEW' | 'APPROVED';
  comment: string;
  fields: ExtractedParameter[];
  changes?: Array<{
    parameterName: string;
    oldValue: string;
    newValue: string;
    reason: string;
    user: string;
    timestamp: string;
  }>;
}

export interface EngineeringRule {
  id: string;
  ruleCode: string;
  parameterName: string;
  standard: 'ASME Section VIII Div 1' | 'API 650' | 'ISO 13709' | 'Company Standard' | 'Process Safety';
  condition: string;
  severity: DeviationSeverity;
  description: string;
  tolerancePercentage?: number;
  isActive: boolean;
}

export interface VendorOffer {
  id: string;
  vendorName: string;
  quotationNumber: string;
  revision: string;
  submissionDate: string;
  commercialStatus: 'Bidded' | 'Shortlisted' | 'Under Evaluation';
  documentId: string;
  contactPerson: string;
  parameters: Record<string, {
    value: string | number;
    unit: string;
    normalizedValue?: string | number;
    normalizedUnit?: string;
    sourcePage: number;
    sourceSection: string;
    sourceText: string;
    isExplicitlyStated: boolean;
  }>;
}

export interface ComplianceResult {
  id: string;
  vendorId: string;
  vendorName: string;
  parameterName: string;
  category: ParameterCategory;
  mdsRequirement: {
    value: string | number;
    unit: string;
    normalizedValue?: string | number;
    normalizedUnit?: string;
  };
  vendorOffer: {
    value: string | number | null;
    unit: string | null;
    normalizedValue?: string | number | null;
    normalizedUnit?: string | null;
    sourcePage?: number;
    sourceText?: string;
  };
  status: ComplianceStatus;
  ruleApplied?: string;
  explanation: string;
  uncertaintyReason?: string;
  engineerVerified: boolean;
  engineerNote?: string;
}

export interface ClarificationItem {
  id: string;
  clarificationNumber: string;
  vendorId: string;
  vendorName: string;
  parameterName: string;
  category: string;
  priority: ClarificationPriority;
  question: string;
  background: string;
  vendorResponse?: string;
  responseDate?: string;
  status: 'Open' | 'Awaiting Vendor' | 'Resolved' | 'Closed';
  owner: string;
  dueDate: string;
  resolution?: string;
}

export interface DeviationItem {
  id: string;
  deviationNumber: string;
  vendorId: string;
  vendorName: string;
  parameterName: string;
  mdsRequirement: string;
  vendorProposal: string;
  deviationDescription: string;
  technicalImpact: string;
  severity: DeviationSeverity;
  status: 'Identified' | 'Under Review' | 'Accepted with Conditions' | 'Rejected';
  engineerDisposition?: string;
  dispositionBy?: string;
  dispositionDate?: string;
}

export interface TBEScoringCategory {
  id: string;
  name: string;
  weight: number; // percentage (0 - 100)
  description: string;
}

export interface TBEScore {
  vendorId: string;
  vendorName: string;
  categoryScores: Record<string, {
    aiScore: number;
    engineerScore: number;
    remarks: string;
  }>;
  totalAiScore: number;
  totalEngineerScore: number;
  engineerApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  ranking: number;
  recommendationNote: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'MDS' | 'PARAMETER' | 'CONFLICT' | 'VENDOR' | 'TBE' | 'DEVIATION' | 'CLARIFICATION' | 'DOCUMENT';
  entityId: string;
  details: {
    previousValue?: string | number | null;
    newValue?: string | number | null;
    reason?: string;
    source?: string;
    comment?: string;
  };
}

export interface Project {
  id: string;
  projectNumber: string;
  name: string;
  client: string;
  facility: string;
  equipmentTag: string;
  equipmentName: string;
  service: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  currentMdsRevision: string;
}
