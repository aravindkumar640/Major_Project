/**
 * Deterministic Unit Normalization & Validation Engine
 * Adheres strictly to Section 7 & 8 of Specification:
 * - Deterministic, testable conversions
 * - Never mutates original values
 * - Tracks conversion formula and source standard
 * - Detects gauge vs absolute pressure ambiguities
 */

export interface ConversionResult {
  originalValue: number;
  originalUnit: string;
  normalizedValue: number;
  normalizedUnit: string;
  formula: string;
  sourceStandard: string;
  warning?: string;
}

export interface UnitValidationResult {
  isValid: boolean;
  issue?: string;
  isAmbiguousBasis?: boolean;
}

// Canonical base units
// Pressure -> MPa(g) or MPa(a)
// Temperature -> °C (or K for thermodynamic calculations)
// Dimension -> mm (standard mechanical engineering drawing unit) or m
// Flow Rate -> kg/h or m³/h
// Density -> kg/m³

export function validateUnit(unit: string | null | undefined, parameterName: string): UnitValidationResult {
  if (!unit || unit.trim() === '') {
    return {
      isValid: false,
      issue: 'Unit is missing for physical quantity.',
    };
  }

  const clean = unit.trim().toLowerCase();

  // Check pressure basis ambiguity
  if (parameterName.toLowerCase().includes('pressure')) {
    if (clean === 'bar' || clean === 'kpa' || clean === 'mpa' || clean === 'psi') {
      return {
        isValid: true,
        issue: 'Pressure basis requires verification (gauge vs absolute unspecified).',
        isAmbiguousBasis: true,
      };
    }
  }

  return { isValid: true };
}

export function normalizeUnit(
  val: number | string | null | undefined,
  unit: string | null | undefined,
  parameterName: string
): ConversionResult | null {
  if (val === null || val === undefined || val === '') return null;
  const numVal = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(numVal)) return null;

  if (!unit) return null;
  const cleanUnit = unit.trim();
  const lowerUnit = cleanUnit.toLowerCase();

  // PRESSURE NORMALIZATION (Standard: MPa)
  if (
    lowerUnit.includes('bar') ||
    lowerUnit.includes('kpa') ||
    lowerUnit.includes('mpa') ||
    lowerUnit.includes('psi')
  ) {
    const isGauge = lowerUnit.includes('g') || lowerUnit.includes('(g)');
    const isAbs = lowerUnit.includes('a') || lowerUnit.includes('(a)');
    const basis = isGauge ? '(g)' : isAbs ? '(a)' : '';
    const basisWarning = !isGauge && !isAbs ? 'Pressure basis requires verification (gauge vs absolute unspecified)' : undefined;

    if (lowerUnit.startsWith('bar')) {
      const norm = Math.round((numVal * 0.1) * 10000) / 10000;
      return {
        originalValue: numVal,
        originalUnit: cleanUnit,
        normalizedValue: norm,
        normalizedUnit: `MPa${basis}`,
        formula: 'P_MPa = P_bar * 0.1',
        sourceStandard: 'ISO 80000-4 / ASME PTC 19.2',
        warning: basisWarning,
      };
    }

    if (lowerUnit.startsWith('kpa')) {
      const norm = Math.round((numVal / 1000) * 10000) / 10000;
      return {
        originalValue: numVal,
        originalUnit: cleanUnit,
        normalizedValue: norm,
        normalizedUnit: `MPa${basis}`,
        formula: 'P_MPa = P_kPa / 1000',
        sourceStandard: 'ISO 80000-4 / ASME PTC 19.2',
        warning: basisWarning,
      };
    }

    if (lowerUnit.startsWith('mpa')) {
      return {
        originalValue: numVal,
        originalUnit: cleanUnit,
        normalizedValue: numVal,
        normalizedUnit: `MPa${basis}`,
        formula: 'Direct canonical unit',
        sourceStandard: 'ISO 80000-4',
        warning: basisWarning,
      };
    }

    if (lowerUnit.startsWith('psi')) {
      // 1 psi = 0.00689476 MPa
      const norm = Math.round((numVal * 0.00689476) * 10000) / 10000;
      return {
        originalValue: numVal,
        originalUnit: cleanUnit,
        normalizedValue: norm,
        normalizedUnit: `MPa${basis}`,
        formula: 'P_MPa = P_psi * 0.00689476',
        sourceStandard: 'NIST Special Publication 811',
        warning: basisWarning,
      };
    }
  }

  // TEMPERATURE NORMALIZATION (Standard: °C)
  if (lowerUnit === '°c' || lowerUnit === 'c' || lowerUnit === 'degc' || lowerUnit === 'deg c') {
    return {
      originalValue: numVal,
      originalUnit: '°C',
      normalizedValue: numVal,
      normalizedUnit: '°C',
      formula: 'Direct canonical unit',
      sourceStandard: 'ISO 80000-5',
    };
  }

  if (lowerUnit === 'k' || lowerUnit === 'kelvin') {
    const norm = Math.round((numVal - 273.15) * 100) / 100;
    return {
      originalValue: numVal,
      originalUnit: 'K',
      normalizedValue: norm,
      normalizedUnit: '°C',
      formula: 'T_°C = T_K - 273.15',
      sourceStandard: 'ISO 80000-5',
    };
  }

  if (lowerUnit === '°f' || lowerUnit === 'f' || lowerUnit === 'degf') {
    const norm = Math.round(((numVal - 32) * (5 / 9)) * 100) / 100;
    return {
      originalValue: numVal,
      originalUnit: '°F',
      normalizedValue: norm,
      normalizedUnit: '°C',
      formula: 'T_°C = (T_°F - 32) * 5/9',
      sourceStandard: 'ISO 80000-5',
    };
  }

  // DIMENSIONS (Standard: mm)
  if (lowerUnit === 'm' || lowerUnit === 'meter' || lowerUnit === 'meters') {
    const norm = Math.round(numVal * 1000);
    return {
      originalValue: numVal,
      originalUnit: 'm',
      normalizedValue: norm,
      normalizedUnit: 'mm',
      formula: 'L_mm = L_m * 1000',
      sourceStandard: 'ISO 80000-3',
    };
  }

  if (lowerUnit === 'mm') {
    return {
      originalValue: numVal,
      originalUnit: 'mm',
      normalizedValue: numVal,
      normalizedUnit: 'mm',
      formula: 'Direct mechanical standard',
      sourceStandard: 'ISO 80000-3',
    };
  }

  if (lowerUnit === 'in' || lowerUnit === 'inch' || lowerUnit === 'inches' || lowerUnit === '"') {
    const norm = Math.round((numVal * 25.4) * 10) / 10;
    return {
      originalValue: numVal,
      originalUnit: 'in',
      normalizedValue: norm,
      normalizedUnit: 'mm',
      formula: 'L_mm = L_in * 25.4',
      sourceStandard: 'ISO 80000-3',
    };
  }

  // MASS & FLOW (Standard: kg/h, kg/m³)
  if (lowerUnit === 'kg/h') {
    return {
      originalValue: numVal,
      originalUnit: 'kg/h',
      normalizedValue: numVal,
      normalizedUnit: 'kg/h',
      formula: 'Standard flow unit',
      sourceStandard: 'ISO 80000-4',
    };
  }

  if (lowerUnit === 'kg/s') {
    const norm = Math.round(numVal * 3600);
    return {
      originalValue: numVal,
      originalUnit: 'kg/s',
      normalizedValue: norm,
      normalizedUnit: 'kg/h',
      formula: 'Q_kg_h = Q_kg_s * 3600',
      sourceStandard: 'ISO 80000-4',
    };
  }

  if (lowerUnit === 'kg/m3' || lowerUnit === 'kg/m³') {
    return {
      originalValue: numVal,
      originalUnit: 'kg/m³',
      normalizedValue: numVal,
      normalizedUnit: 'kg/m³',
      formula: 'Standard density unit',
      sourceStandard: 'ISO 80000-4',
    };
  }

  // Fallback: direct identity
  return {
    originalValue: numVal,
    originalUnit: cleanUnit,
    normalizedValue: numVal,
    normalizedUnit: cleanUnit,
    formula: 'Identity (no conversion defined)',
    sourceStandard: 'As Provided',
  };
}
