import { ComplianceResult, ClarificationItem, DeviationItem, DeviationSeverity, ClarificationPriority } from '../types';

export function generateClarificationsFromCompliance(
  complianceResults: ComplianceResult[]
): ClarificationItem[] {
  const clarifications: ClarificationItem[] = [];
  let counter = 1;

  for (const item of complianceResults) {
    if (item.status === 'MISSING') {
      clarifications.push({
        id: `CLR-${item.vendorId}-${String(counter).padStart(3, '0')}`,
        clarificationNumber: `TQ-${item.vendorName.substring(0, 3).toUpperCase()}-${String(counter).padStart(3, '0')}`,
        vendorId: item.vendorId,
        vendorName: item.vendorName,
        parameterName: item.parameterName,
        category: item.category,
        priority: 'High',
        question: `Vendor quotation schedule does not state "${item.parameterName}". Please provide full technical confirmation and supporting calculations conforming to approved MDS requirement (${item.mdsRequirement.value} ${item.mdsRequirement.unit}).`,
        background: `Requirement was omitted in submitted quotation data sheets.`,
        status: 'Open',
        owner: 'Lead Mechanical Engineer',
        dueDate: '2026-10-18',
      });
      counter++;
    } else if (item.status === 'UNCLEAR') {
      clarifications.push({
        id: `CLR-${item.vendorId}-${String(counter).padStart(3, '0')}`,
        clarificationNumber: `TQ-${item.vendorName.substring(0, 3).toUpperCase()}-${String(counter).padStart(3, '0')}`,
        vendorId: item.vendorId,
        vendorName: item.vendorName,
        parameterName: item.parameterName,
        category: item.category,
        priority: 'High',
        question: `Vendor states "${item.vendorOffer.value}" for ${item.parameterName}. Please confirm whether this meets the specified MDS requirement (${item.mdsRequirement.value} ${item.mdsRequirement.unit}) and submit relevant design drawings / certificates.`,
        background: item.explanation,
        status: 'Open',
        owner: 'Package Engineer',
        dueDate: '2026-10-18',
      });
      counter++;
    } else if (item.status === 'DEVIATING') {
      // If critical or major deviation, also generate a clarification asking if vendor can conform
      const isCritical = item.ruleApplied?.includes('PRESSURE') || item.ruleApplied?.includes('TEMP') || item.ruleApplied?.includes('MAT') || item.ruleApplied?.includes('CODE');
      if (isCritical) {
        clarifications.push({
          id: `CLR-${item.vendorId}-${String(counter).padStart(3, '0')}`,
          clarificationNumber: `TQ-${item.vendorName.substring(0, 3).toUpperCase()}-${String(counter).padStart(3, '0')}`,
          vendorId: item.vendorId,
          vendorName: item.vendorName,
          parameterName: item.parameterName,
          category: item.category,
          priority: 'High',
          question: `Vendor has proposed ${item.vendorOffer.value} ${item.vendorOffer.unit || ''} whereas approved MDS strictly mandates ${item.mdsRequirement.value} ${item.mdsRequirement.unit || ''}. Please clarify whether vendor can comply with the MDS baseline without commercial/delivery impact.`,
          background: item.explanation,
          status: 'Open',
          owner: 'Procurement Technical Lead',
          dueDate: '2026-10-16',
        });
        counter++;
      }
    }
  }

  return clarifications;
}

export function generateDeviationsFromCompliance(
  complianceResults: ComplianceResult[]
): DeviationItem[] {
  const deviations: DeviationItem[] = [];
  let counter = 1;

  for (const item of complianceResults) {
    if (item.status === 'DEVIATING') {
      let severity: DeviationSeverity = 'Minor';
      let impact = 'Minor impact on accessory dimensions or documentation.';

      if (item.parameterName.toLowerCase().includes('pressure')) {
        severity = 'Critical';
        impact = 'Pressure containment boundary compromised; violates ASME Section VIII safety margin and MAWP limits.';
      } else if (item.parameterName.toLowerCase().includes('temperature')) {
        severity = 'Critical';
        impact = 'Material allowable stress limit exceeded under high process temperature upset scenario.';
      } else if (item.parameterName.toLowerCase().includes('material')) {
        severity = 'Major';
        impact = 'Corrosion resistance diminished in sour/chloride environment; pitting/cracking risk over 25-year design life.';
      } else if (item.parameterName.toLowerCase().includes('corrosion')) {
        severity = 'Major';
        impact = 'Insufficient vessel wall sacrificial thickness under plant operating design life.';
      } else if (item.parameterName.toLowerCase().includes('code')) {
        severity = 'Critical';
        impact = 'Statutory and client pressure vessel regulatory compliance violation.';
      }

      deviations.push({
        id: `DEV-${item.vendorId}-${String(counter).padStart(3, '0')}`,
        deviationNumber: `DEV-${item.vendorName.substring(0, 3).toUpperCase()}-${String(counter).padStart(3, '0')}`,
        vendorId: item.vendorId,
        vendorName: item.vendorName,
        parameterName: item.parameterName,
        mdsRequirement: `${item.mdsRequirement.value} ${item.mdsRequirement.unit || ''}`.trim(),
        vendorProposal: `${item.vendorOffer.value} ${item.vendorOffer.unit || ''}`.trim(),
        deviationDescription: item.explanation,
        technicalImpact: impact,
        severity,
        status: 'Identified',
      });
      counter++;
    }
  }

  return deviations;
}
