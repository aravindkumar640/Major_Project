import { TBEScoringCategory, TBEScore, VendorOffer, ComplianceResult, DeviationItem } from '../types';

export const DEFAULT_TBE_CATEGORIES: TBEScoringCategory[] = [
  {
    id: 'tech_compliance',
    name: 'Technical Compliance',
    weight: 40,
    description: 'Overall conformity to process parameters, flow conditions, and mechanical operating limits.',
  },
  {
    id: 'design_compliance',
    name: 'Design Compliance',
    weight: 20,
    description: 'Adherence to vessel geometry, dimensions, nozzle schedules, and structural supports.',
  },
  {
    id: 'material_compliance',
    name: 'Material Compliance',
    weight: 10,
    description: 'Metallurgy selection, corrosion allowance, gasket, and trim compatibility with process fluids.',
  },
  {
    id: 'code_compliance',
    name: 'Code & Statutory Compliance',
    weight: 10,
    description: 'ASME Section VIII, API standards, U-stamp certification, and inspection standards.',
  },
  {
    id: 'documentation',
    name: 'Documentation & Quality Plan',
    weight: 10,
    description: 'Completeness of engineering submittals, welding procedures, and quality dossier commitment.',
  },
  {
    id: 'delivery_capability',
    name: 'Delivery & Fabrication Schedule',
    weight: 5,
    description: 'Manufacturing lead time, shop loading capacity, and site delivery milestones.',
  },
  {
    id: 'clarification_response',
    name: 'Clarification Responsiveness',
    weight: 5,
    description: 'Timeliness and technical clarity of responses to pre-award engineering queries.',
  },
];

export function validateTBEWeights(categories: TBEScoringCategory[]): { isValid: boolean; totalWeight: number; error?: string } {
  const totalWeight = categories.reduce((sum, c) => sum + c.weight, 0);
  if (Math.abs(totalWeight - 100) > 0.01) {
    return {
      isValid: false,
      totalWeight,
      error: `Scoring weights must total 100%. Current total: ${totalWeight}%. Please adjust category weights before evaluation.`,
    };
  }
  return { isValid: true, totalWeight };
}

export function calculateAITBEScores(
  vendors: VendorOffer[],
  complianceResults: ComplianceResult[],
  deviations: DeviationItem[],
  categories: TBEScoringCategory[]
): TBEScore[] {
  const scores: TBEScore[] = [];

  for (const vendor of vendors) {
    const vendorResults = complianceResults.filter((r) => r.vendorId === vendor.id);
    const vendorDeviations = deviations.filter((d) => d.vendorId === vendor.id);

    const totalCount = vendorResults.length || 1;
    const compliantCount = vendorResults.filter((r) => r.status === 'COMPLIANT').length;
    const deviatingCount = vendorResults.filter((r) => r.status === 'DEVIATING').length;
    const missingCount = vendorResults.filter((r) => r.status === 'MISSING').length;
    const unclearCount = vendorResults.filter((r) => r.status === 'UNCLEAR').length;

    // Technical compliance calculation
    const criticalDeviations = vendorDeviations.filter((d) => d.severity === 'Critical').length;
    const majorDeviations = vendorDeviations.filter((d) => d.severity === 'Major').length;

    // Base scores out of 100 per category
    let techScore = Math.max(0, Math.round(((compliantCount - missingCount * 1.5 - unclearCount * 0.8) / totalCount) * 100));
    if (criticalDeviations > 0) techScore = Math.max(20, techScore - criticalDeviations * 25);

    let designScore = 85;
    if (vendorDeviations.some((d) => d.parameterName.toLowerCase().includes('pressure') || d.parameterName.toLowerCase().includes('temperature'))) {
      designScore = 65;
    }

    let materialScore = 90;
    if (vendorDeviations.some((d) => d.parameterName.toLowerCase().includes('material'))) {
      materialScore = 55;
    }

    let codeScore = 95;
    if (vendorDeviations.some((d) => d.parameterName.toLowerCase().includes('code'))) {
      codeScore = 50;
    }

    // Default heuristics for auxiliary categories
    let docScore = 88;
    if (missingCount > 1) docScore = 70;
    let deliveryScore = 85;
    let clarScore = unclearCount > 0 ? 75 : 90;

    const catScores: Record<string, { aiScore: number; engineerScore: number; remarks: string }> = {
      tech_compliance: {
        aiScore: Math.min(100, Math.max(0, techScore)),
        engineerScore: Math.min(100, Math.max(0, techScore)),
        remarks: `${compliantCount}/${totalCount} compliant parameters. ${criticalDeviations} critical, ${majorDeviations} major deviations noted.`,
      },
      design_compliance: {
        aiScore: designScore,
        engineerScore: designScore,
        remarks: designScore < 80 ? 'Divergences in operational envelope identified.' : 'Fully adheres to vessel dimensions and process design conditions.',
      },
      material_compliance: {
        aiScore: materialScore,
        engineerScore: materialScore,
        remarks: materialScore < 80 ? 'Material grade downgrade proposed (requires metallurgist approval).' : 'Metallurgy and corrosion allowance comply with specifications.',
      },
      code_compliance: {
        aiScore: codeScore,
        engineerScore: codeScore,
        remarks: codeScore < 80 ? 'Incomplete ASME Code certification evidence.' : 'Confirmed ASME Section VIII Div 1 with U-stamp capability.',
      },
      documentation: {
        aiScore: docScore,
        engineerScore: docScore,
        remarks: docScore < 80 ? 'Missing preliminary data sheets in initial package.' : 'Standard EPC documentation package submitted.',
      },
      delivery_capability: {
        aiScore: deliveryScore,
        engineerScore: deliveryScore,
        remarks: '26 weeks ex-works fabrication schedule.',
      },
      clarification_response: {
        aiScore: clarScore,
        engineerScore: clarScore,
        remarks: clarScore < 80 ? 'Technical queries pending resolution.' : 'Responsive to pre-bid inquiries.',
      },
    };

    // Calculate weighted totals
    let totalAi = 0;
    let totalEng = 0;
    for (const cat of categories) {
      const cScore = catScores[cat.id];
      if (cScore) {
        totalAi += (cScore.aiScore * cat.weight) / 100;
        totalEng += (cScore.engineerScore * cat.weight) / 100;
      }
    }

    scores.push({
      vendorId: vendor.id,
      vendorName: vendor.vendorName,
      categoryScores: catScores,
      totalAiScore: Math.round(totalAi * 10) / 10,
      totalEngineerScore: Math.round(totalEng * 10) / 10,
      engineerApproved: false,
      ranking: 1, // Will be computed after sorting
      recommendationNote:
        criticalDeviations > 0
          ? 'Not recommended for award until critical deviations are eliminated.'
          : 'Technically acceptable subject to resolution of commercial terms and open technical queries.',
    });
  }

  // Sort by engineer score descending and assign rankings
  scores.sort((a, b) => b.totalEngineerScore - a.totalEngineerScore);
  scores.forEach((s, idx) => {
    s.ranking = idx + 1;
  });

  return scores;
}
