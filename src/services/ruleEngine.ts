import { EngineeringRule, DeviationSeverity } from '../types';

export const DEFAULT_ENGINEERING_RULES: EngineeringRule[] = [
  {
    id: 'RULE-P01',
    ruleCode: 'PRESSURE-001',
    parameterName: 'Design Pressure',
    standard: 'ASME Section VIII Div 1',
    condition: 'vendor_value >= mds_value',
    severity: 'Critical',
    description: 'Vendor design pressure must meet or exceed approved MDS requirement. Under-rating violates pressure vessel safety margin.',
    isActive: true,
  },
  {
    id: 'RULE-T01',
    ruleCode: 'TEMP-001',
    parameterName: 'Design Temperature',
    standard: 'Process Safety',
    condition: 'vendor_value >= mds_value',
    severity: 'Critical',
    description: 'Vendor maximum design temperature must meet or exceed process upset envelope. Lower rating risks shell creep/rupture.',
    isActive: true,
  },
  {
    id: 'RULE-M01',
    ruleCode: 'MAT-001',
    parameterName: 'Shell & Head Material',
    standard: 'Company Standard',
    condition: 'vendor_material_grade_compatible',
    severity: 'Major',
    description: 'Material must comply with corrosion/sour service requirements. Substituting lower alloy (e.g. SS304 for SS316L) is a major deviation.',
    isActive: true,
  },
  {
    id: 'RULE-C01',
    ruleCode: 'CORR-001',
    parameterName: 'Corrosion Allowance',
    standard: 'API 650',
    condition: 'vendor_value >= mds_value',
    severity: 'Major',
    description: 'Vendor corrosion allowance must meet or exceed specified thickness (typically 3.0 mm for hydrocarbon/sour service).',
    isActive: true,
  },
  {
    id: 'RULE-CODE01',
    ruleCode: 'CODE-001',
    parameterName: 'Design Code & Standard',
    standard: 'ASME Section VIII Div 1',
    condition: 'vendor_value == mds_value',
    severity: 'Critical',
    description: 'Vessel design and fabrication must be strictly certified to specified Code (ASME Section VIII Div. 1 with U-Stamp).',
    isActive: true,
  },
  {
    id: 'RULE-W01',
    ruleCode: 'WEIGHT-001',
    parameterName: 'Empty Equipment Weight',
    standard: 'Company Standard',
    condition: 'tolerance <= 10%',
    severity: 'Minor',
    description: 'Empty operating weight deviation within ±10% acceptable for foundation civil design check.',
    tolerancePercentage: 10,
    isActive: true,
  },
  {
    id: 'RULE-NOZ01',
    ruleCode: 'NOZZLE-001',
    parameterName: 'Flange Rating',
    standard: 'ASME Section VIII Div 1',
    condition: 'vendor_value >= mds_value',
    severity: 'Major',
    description: 'Nozzle flanges must meet or exceed ASME B16.5 rating (e.g., Class 300 RF minimum).',
    isActive: true,
  },
  {
    id: 'RULE-PWHT01',
    ruleCode: 'PWHT-001',
    parameterName: 'Post Weld Heat Treatment',
    standard: 'ASME Section VIII Div 1',
    condition: 'vendor_value == mds_value',
    severity: 'Major',
    description: 'PWHT requirements mandated by sour service (NACE MR0175) must be explicitly committed by vendor.',
    isActive: true,
  },
];

export interface RuleEvaluationResult {
  ruleCode: string;
  isCompliant: boolean;
  severity?: DeviationSeverity;
  reason: string;
}

export function evaluateEngineeringRule(
  rule: EngineeringRule,
  mdsValue: any,
  vendorValue: any
): RuleEvaluationResult {
  if (vendorValue === null || vendorValue === undefined || vendorValue === '') {
    return {
      ruleCode: rule.ruleCode,
      isCompliant: false,
      severity: rule.severity,
      reason: `Mandatory parameter missing from vendor offer (${rule.description})`,
    };
  }

  // Material grade check
  if (rule.ruleCode === 'MAT-001') {
    const mdsStr = String(mdsValue).trim().toUpperCase();
    const vStr = String(vendorValue).trim().toUpperCase();
    if (mdsStr.includes('SS316') && vStr.includes('SS304')) {
      return {
        ruleCode: rule.ruleCode,
        isCompliant: false,
        severity: 'Major',
        reason: `Material downgrade detected: Vendor proposes ${vendorValue} instead of approved ${mdsValue}. Lower molybdenum content impairs pitting resistance in sour service.`,
      };
    }
    if (mdsStr !== vStr) {
      return {
        ruleCode: rule.ruleCode,
        isCompliant: false,
        severity: 'Major',
        reason: `Material grade mismatch: Specified ${mdsValue}, Vendor proposed ${vendorValue}.`,
      };
    }
    return {
      ruleCode: rule.ruleCode,
      isCompliant: true,
      reason: `Material grade strictly matches specification: ${mdsValue}.`,
    };
  }

  // Code check
  if (rule.ruleCode === 'CODE-001') {
    const mdsStr = String(mdsValue).toLowerCase();
    const vStr = String(vendorValue).toLowerCase();
    if (vStr.includes('asme viii') || vStr.includes('asme section viii') || vStr.includes('div 1')) {
      return {
        ruleCode: rule.ruleCode,
        isCompliant: true,
        reason: 'Vendor offer confirms compliance with ASME Section VIII Div 1.',
      };
    }
    return {
      ruleCode: rule.ruleCode,
      isCompliant: false,
      severity: 'Critical',
      reason: `Design code discrepancy. Required: ${mdsValue}; Provided: ${vendorValue}.`,
    };
  }

  // Numeric checks
  const numMds = typeof mdsValue === 'number' ? mdsValue : parseFloat(String(mdsValue));
  const numVendor = typeof vendorValue === 'number' ? vendorValue : parseFloat(String(vendorValue));

  if (!isNaN(numMds) && !isNaN(numVendor)) {
    if (rule.condition === 'vendor_value >= mds_value') {
      if (numVendor >= numMds) {
        return {
          ruleCode: rule.ruleCode,
          isCompliant: true,
          reason: `Vendor rating ${numVendor} meets or exceeds MDS requirement ${numMds}.`,
        };
      } else {
        return {
          ruleCode: rule.ruleCode,
          isCompliant: false,
          severity: rule.severity,
          reason: `Vendor rating ${numVendor} is lower than approved MDS requirement ${numMds} (Deficit: ${(numMds - numVendor).toFixed(2)}).`,
        };
      }
    }

    if (rule.condition === 'tolerance <= 10%' && rule.tolerancePercentage) {
      const diffPct = Math.abs((numVendor - numMds) / numMds) * 100;
      if (diffPct <= rule.tolerancePercentage) {
        return {
          ruleCode: rule.ruleCode,
          isCompliant: true,
          reason: `Vendor value ${numVendor} within allowed ±${rule.tolerancePercentage}% tolerance of MDS ${numMds} (delta: ${diffPct.toFixed(1)}%).`,
        };
      } else {
        return {
          ruleCode: rule.ruleCode,
          isCompliant: false,
          severity: rule.severity,
          reason: `Vendor value ${numVendor} exceeds ±${rule.tolerancePercentage}% tolerance limit (actual delta: ${diffPct.toFixed(1)}%).`,
        };
      }
    }
  }

  // String equality check
  const strMds = String(mdsValue).trim().toLowerCase();
  const strVendor = String(vendorValue).trim().toLowerCase();
  if (strMds === strVendor) {
    return {
      ruleCode: rule.ruleCode,
      isCompliant: true,
      reason: `Direct specification match: ${mdsValue}.`,
    };
  }

  return {
    ruleCode: rule.ruleCode,
    isCompliant: false,
    severity: rule.severity,
    reason: `Value mismatch: MDS specified "${mdsValue}", Vendor quoted "${vendorValue}".`,
  };
}
