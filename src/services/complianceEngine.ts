import { ExtractedParameter, VendorOffer, ComplianceResult, ComplianceStatus } from '../types';
import { normalizeUnit } from './unitConversion';
import { DEFAULT_ENGINEERING_RULES, evaluateEngineeringRule } from './ruleEngine';

export function evaluateVendorCompliance(
  mdsParameters: ExtractedParameter[],
  vendor: VendorOffer
): ComplianceResult[] {
  const results: ComplianceResult[] = [];

  for (const mdsParam of mdsParameters) {
    // If MDS parameter itself is not applicable or not set, skip
    if (mdsParam.status === 'Not Applicable' || mdsParam.originalValue === null) {
      continue;
    }

    const vendorParamData = vendor.parameters[mdsParam.parameterName];
    const rule = DEFAULT_ENGINEERING_RULES.find(
      (r) => r.isActive && r.parameterName.toLowerCase() === mdsParam.parameterName.toLowerCase()
    );

    // 1. MISSING: vendor has no entry or explicitly blank
    if (!vendorParamData || vendorParamData.value === null || vendorParamData.value === undefined || vendorParamData.value === '') {
      results.push({
        id: `CMP-${vendor.id}-${mdsParam.id}`,
        vendorId: vendor.id,
        vendorName: vendor.vendorName,
        parameterName: mdsParam.parameterName,
        category: mdsParam.category,
        mdsRequirement: {
          value: mdsParam.originalValue,
          unit: mdsParam.originalUnit || '',
          normalizedValue: mdsParam.normalizedValue ?? undefined,
          normalizedUnit: mdsParam.normalizedUnit ?? undefined,
        },
        vendorOffer: {
          value: null,
          unit: null,
          sourcePage: undefined,
          sourceText: undefined,
        },
        status: 'MISSING',
        ruleApplied: rule?.ruleCode,
        explanation: `Vendor offer document does not state or provide data for "${mdsParam.parameterName}". Required by approved MDS.`,
        uncertaintyReason: 'Field omitted from vendor quotation schedule.',
        engineerVerified: false,
      });
      continue;
    }

    // 2. UNCLEAR: stated vaguely or lacking proof / conditional claims
    if (!vendorParamData.isExplicitlyStated || String(vendorParamData.value).toLowerCase().includes('tbd') || String(vendorParamData.value).toLowerCase().includes('subject to')) {
      results.push({
        id: `CMP-${vendor.id}-${mdsParam.id}`,
        vendorId: vendor.id,
        vendorName: vendor.vendorName,
        parameterName: mdsParam.parameterName,
        category: mdsParam.category,
        mdsRequirement: {
          value: mdsParam.originalValue,
          unit: mdsParam.originalUnit || '',
        },
        vendorOffer: {
          value: vendorParamData.value,
          unit: vendorParamData.unit,
          sourcePage: vendorParamData.sourcePage,
          sourceText: vendorParamData.sourceText,
        },
        status: 'UNCLEAR',
        ruleApplied: rule?.ruleCode,
        explanation: `Vendor provides an ambiguous or conditional statement ("${vendorParamData.value}"). Insufficient technical evidence to verify design compliance.`,
        uncertaintyReason: 'Vendor wording is conditional or uncertified. Technical clarification required.',
        engineerVerified: false,
      });
      continue;
    }

    // Check pressure gauge vs absolute discrepancy
    if (mdsParam.parameterName.toLowerCase().includes('pressure')) {
      const mdsUnit = (mdsParam.originalUnit || '').toLowerCase();
      const vUnit = (vendorParamData.unit || '').toLowerCase();
      const mdsIsGauge = mdsUnit.includes('g');
      const vIsGauge = vUnit.includes('g');
      const mdsIsAbs = mdsUnit.includes('a');
      const vIsAbs = vUnit.includes('a');

      if ((mdsIsGauge && vIsAbs) || (mdsIsAbs && vIsGauge)) {
        results.push({
          id: `CMP-${vendor.id}-${mdsParam.id}`,
          vendorId: vendor.id,
          vendorName: vendor.vendorName,
          parameterName: mdsParam.parameterName,
          category: mdsParam.category,
          mdsRequirement: {
            value: mdsParam.originalValue,
            unit: mdsParam.originalUnit || '',
          },
          vendorOffer: {
            value: vendorParamData.value,
            unit: vendorParamData.unit,
            sourcePage: vendorParamData.sourcePage,
            sourceText: vendorParamData.sourceText,
          },
          status: 'UNCLEAR',
          ruleApplied: 'PRESSURE-BASIS-CHECK',
          explanation: `Incompatible pressure basis: Approved MDS specifies ${mdsParam.originalUnit} whereas vendor quotation lists ${vendorParamData.unit}. Gauge vs Absolute discrepancy requires explicit confirmation.`,
          uncertaintyReason: 'Pressure reference mismatch (barg vs bara).',
          engineerVerified: false,
        });
        continue;
      }
    }

    // 3. Unit normalization & comparison
    const normMds = normalizeUnit(mdsParam.originalValue, mdsParam.originalUnit, mdsParam.parameterName);
    const normVendor = normalizeUnit(vendorParamData.value, vendorParamData.unit, mdsParam.parameterName);

    // If a rule exists, evaluate via rule engine
    if (rule) {
      const compValMds = normMds ? normMds.normalizedValue : mdsParam.originalValue;
      const compValVendor = normVendor ? normVendor.normalizedValue : vendorParamData.value;
      const evalRes = evaluateEngineeringRule(rule, compValMds, compValVendor);

      const status: ComplianceStatus = evalRes.isCompliant ? 'COMPLIANT' : 'DEVIATING';

      results.push({
        id: `CMP-${vendor.id}-${mdsParam.id}`,
        vendorId: vendor.id,
        vendorName: vendor.vendorName,
        parameterName: mdsParam.parameterName,
        category: mdsParam.category,
        mdsRequirement: {
          value: mdsParam.originalValue,
          unit: mdsParam.originalUnit || '',
          normalizedValue: normMds?.normalizedValue,
          normalizedUnit: normMds?.normalizedUnit,
        },
        vendorOffer: {
          value: vendorParamData.value,
          unit: vendorParamData.unit,
          normalizedValue: normVendor?.normalizedValue,
          normalizedUnit: normVendor?.normalizedUnit,
          sourcePage: vendorParamData.sourcePage,
          sourceText: vendorParamData.sourceText,
        },
        status,
        ruleApplied: rule.ruleCode,
        explanation: evalRes.reason,
        engineerVerified: false,
      });
      continue;
    }

    // 4. Default comparison logic (for parameters without a specific rule)
    if (normMds && normVendor && normMds.normalizedUnit === normVendor.normalizedUnit) {
      const match = normMds.normalizedValue === normVendor.normalizedValue;
      results.push({
        id: `CMP-${vendor.id}-${mdsParam.id}`,
        vendorId: vendor.id,
        vendorName: vendor.vendorName,
        parameterName: mdsParam.parameterName,
        category: mdsParam.category,
        mdsRequirement: {
          value: mdsParam.originalValue,
          unit: mdsParam.originalUnit || '',
          normalizedValue: normMds.normalizedValue,
          normalizedUnit: normMds.normalizedUnit,
        },
        vendorOffer: {
          value: vendorParamData.value,
          unit: vendorParamData.unit,
          normalizedValue: normVendor.normalizedValue,
          normalizedUnit: normVendor.normalizedUnit,
          sourcePage: vendorParamData.sourcePage,
          sourceText: vendorParamData.sourceText,
        },
        status: match ? 'COMPLIANT' : 'DEVIATING',
        explanation: match
          ? `Normalized values match: ${normVendor.normalizedValue} ${normVendor.normalizedUnit}.`
          : `Normalized value mismatch: MDS requires ${normMds.normalizedValue} ${normMds.normalizedUnit}, vendor proposed ${normVendor.normalizedValue} ${normVendor.normalizedUnit}.`,
        engineerVerified: false,
      });
    } else {
      // String comparison
      const match = String(mdsParam.originalValue).trim().toLowerCase() === String(vendorParamData.value).trim().toLowerCase();
      results.push({
        id: `CMP-${vendor.id}-${mdsParam.id}`,
        vendorId: vendor.id,
        vendorName: vendor.vendorName,
        parameterName: mdsParam.parameterName,
        category: mdsParam.category,
        mdsRequirement: {
          value: mdsParam.originalValue,
          unit: mdsParam.originalUnit || '',
        },
        vendorOffer: {
          value: vendorParamData.value,
          unit: vendorParamData.unit,
          sourcePage: vendorParamData.sourcePage,
          sourceText: vendorParamData.sourceText,
        },
        status: match ? 'COMPLIANT' : 'DEVIATING',
        explanation: match
          ? `Vendor matches MDS requirement ("${mdsParam.originalValue}").`
          : `Vendor specification ("${vendorParamData.value}") diverges from approved MDS ("${mdsParam.originalValue}").`,
        engineerVerified: false,
      });
    }
  }

  return results;
}
