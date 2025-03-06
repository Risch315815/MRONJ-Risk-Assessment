import { PatientData, MedicationType, SubType, DrugName, Medication } from '../store/patientData';

type DentalProcedure = 
  | '非侵入性治療'  // Non-invasive (cleaning, filling)
  | '根管治療'    // Root canal treatment
  | '拔牙'         // Extraction
  | '牙周手術'     // Periodontal surgery
  | '植牙';         // Implant

type RiskLevel = '低風險' | '中度風險' | '高風險';

interface RiskAssessment {
  procedure: DentalProcedure;
  riskLevel: RiskLevel;
  recommendation: string;
  medicationContributions?: Array<{
    drugName: string;
    riskPercentage: number;
  }>;
  citations?: string[];
}

interface RiskFactors {
  // Systemic Risk Factors
  systemicFactors: {
    diabetes: boolean;
    steroidUse: boolean;
    anemia: boolean;
    smoking: boolean;
    obesity: boolean;
  };
  
  // Local Risk Factors
  localFactors: {
    dentoalveolarSurgery: boolean;
    periodontalDisease: boolean;
    anatomicFactors: boolean; // tori, exostoses, etc.
  };
  
  // Treatment Related Factors
  medications: Array<{
    type: MedicationType;
    drugName: DrugName;
    administrationRoute: '口服' | '注射' | '';
    duration: number; // in months
    indication: 'Cancer' | 'Osteoporosis' | 'Other';
    isStopped: boolean;
  }>;
}

function mapIndication(indication: string): 'Cancer' | 'Osteoporosis' | 'Other' {
  switch (indication) {
    case '骨質疏鬆':
      return 'Osteoporosis';
    case '多發性骨髓瘤':
    case '惡性腫瘤/骨轉移':
      return 'Cancer';
    default:
      return 'Other';
  }
}

function getMedicationType(drugName: DrugName): MedicationType {
  // Map drug names to their medication type
  const antiresorptive = [
    'Alendronate (Fosamax)',
    'Risedronate (Actonel)',
    'Ibandronate (Boniva)',
    'Zoledronate (Zometa)',
    'Pamidronate (Aredia)',
    'Ibandronate (Boniva IV)',
    'Denosumab (Prolia/Xgeva)'
  ];
  
  const antiangiogenic = [
    'Bevacizumab (Avastin)',
    'Sunitinib (Sutent)',
    'Cabozantinib (Cabometyx)'
  ];
  
  if (antiresorptive.includes(drugName)) {
    return 'Antiresorptive';
  } else if (antiangiogenic.includes(drugName)) {
    return 'Antiangiogenic';
  }
  
  return '';
}

function calculateDrugRiskPercentage(medication: Medication, patientData: PatientData): number {
  let baseRiskPercentage = 0;
  
  // Base risk by drug type and route
  if (medication.drugName.includes('Zoledronate') || medication.drugName.includes('Denosumab')) {
    baseRiskPercentage = medication.administrationRoute === '口服' ? 0.5 : 2.0;
  } else if (medication.drugName.includes('Alendronate') || medication.drugName.includes('Risedronate')) {
    baseRiskPercentage = 0.1;
  } else if (medication.drugName.includes('Ibandronate')) {
    baseRiskPercentage = medication.administrationRoute === '口服' ? 0.1 : 0.2;
  } else if (medication.drugName.includes('Bevacizumab')) {
    baseRiskPercentage = 0.2;
  } else {
    baseRiskPercentage = 0.1;
  }
  
  // Adjust for indication
  const indication = mapIndication(medication.indication);
  if (indication === 'Cancer') {
    baseRiskPercentage *= 3;
  }
  
  // Adjust for duration
  if (medication.durationMonths) {
    if (medication.durationMonths > 48) {
      baseRiskPercentage *= 2.5;
    } else if (medication.durationMonths > 24) {
      baseRiskPercentage *= 1.5;
    }
  }
  
  // Adjust for MRONJ-specific risk factors
  let riskMultiplier = 1.0;
  if (patientData.diabetes) riskMultiplier *= 1.8; // Increased multiplier for poorly controlled diabetes (HbA1c ≥ 7.0%)
  if (patientData.steroidUse) riskMultiplier *= 1.4;
  if (patientData.anemia) riskMultiplier *= 1.3;
  if (patientData.heavySmoker) riskMultiplier *= 1.3;
  if (patientData.periodontalIssues) riskMultiplier *= 1.5;
  
  return baseRiskPercentage * riskMultiplier;
}

function calculateRiskFactors(patientData: PatientData): RiskFactors {
  return {
    systemicFactors: {
      diabetes: patientData.diabetes || patientData.systemicDiseases.includes('糖尿病'),
      steroidUse: patientData.steroidUse,
      anemia: patientData.anemia,
      smoking: patientData.heavySmoker,
      obesity: patientData.isObese,
    },
    localFactors: {
      dentoalveolarSurgery: false, // To be determined based on procedure
      periodontalDisease: patientData.periodontalIssues,
      anatomicFactors: false, // To be added to medical history
    },
    medications: patientData.medications.map(med => ({
      type: getMedicationType(med.drugName),
      drugName: med.drugName,
      administrationRoute: med.administrationRoute,
      duration: med.durationMonths || 0,
      indication: mapIndication(med.indication),
      isStopped: med.isStopped,
    }))
  };
}

function hasSignificantRiskFactors(riskFactors: RiskFactors): boolean {
  const { systemicFactors } = riskFactors;
  return Object.values(systemicFactors).some(factor => factor === true);
}

function getDrugSpecificCitations(medication: Medication): string[] {
  const citations: string[] = [];
  
  // Add drug-specific citations
  if (medication.drugName.includes('Denosumab')) {
    citations.push('Saad F, et al. Incidence, risk factors, and outcomes of osteonecrosis of the jaw: integrated analysis from three blinded active-controlled phase III trials in cancer patients with bone metastases. Ann Oncol. 2012;23(5):1341-1347.');
  } else if (medication.drugName.includes('Zoledronate')) {
    citations.push('Ruggiero SL, et al. American Association of Oral and Maxillofacial Surgeons position paper on medication-related osteonecrosis of the jaw—2022 update. J Oral Maxillofac Surg. 2022;80(5):920-943.');
  } else if (medication.drugName.includes('Alendronate')) {
    citations.push('Khan AA, et al. Diagnosis and management of osteonecrosis of the jaw: a systematic review and international consensus. J Bone Miner Res. 2015;30(1):3-23.');
  }
  
  // Add general citation for all drugs
  citations.push('Palaska PK, et al. Bisphosphonates and time to osteonecrosis development. Oncologist. 2009;14(11):1154-1166.');
  
  return citations;
}

export function assessRisk(patientData: PatientData): RiskAssessment[] {
  const riskFactors = calculateRiskFactors(patientData);
  const assessments: RiskAssessment[] = [];
  
  // If no medications, return low risk for all procedures
  if (patientData.medications.length === 0 && !patientData.hasAntiresorptiveMed) {
    const procedures: DentalProcedure[] = [
      '非侵入性治療',
      '拔牙',
      '牙周手術',
      '植牙',
      '根管治療'
    ];
    
    procedures.forEach(procedure => {
      assessments.push({
        procedure,
        riskLevel: '低風險',
        recommendation: '可進行一般治療，無須特殊預防措施。',
      });
    });
    
    return assessments;
  }
  
  // Calculate risk for each medication
  const medicationRisks = patientData.medications.map(med => {
    return {
      medication: med,
      riskPercentage: calculateDrugRiskPercentage(med, patientData),
      citations: getDrugSpecificCitations(med)
    };
  });
  
  // Categorize procedures and assign risk
  const procedures: DentalProcedure[] = [
    '非侵入性治療',
    '拔牙',
    '牙周手術',
    '植牙',
    '根管治療'
  ];
  
  procedures.forEach(procedure => {
    let riskLevel: RiskLevel = '低風險';
    let recommendation = '';
    
    // Max risk percentage across all medications
    const maxRiskPercentage = Math.max(...medicationRisks.map(mr => mr.riskPercentage));
    
    // Determine risk level based on procedure and medication risks
    if (procedure === '非侵入性治療') {
      // Lower risk for non-invasive procedures
      if (maxRiskPercentage > 2.0) {
        riskLevel = '中度風險';
        recommendation = '可進行治療，但應注意口腔衛生並定期追蹤。';
      } else {
        riskLevel = '低風險';
        recommendation = '可進行常規治療，無須特殊預防措施。';
      }
    } else if (procedure === '根管治療') {
      // Moderate risk for root canal treatment
      if (maxRiskPercentage > 2.0) {
        riskLevel = '中度風險';
        recommendation = '可進行治療，但應避免過度器械擴大根尖孔，並謹慎使用根管沖洗液。';
      } else {
        riskLevel = '低風險';
        recommendation = '可進行常規治療，注意根管消毒清潔。';
      }
    } else {
      // Higher risk for invasive procedures
      if (maxRiskPercentage > 3.0 || hasSignificantRiskFactors(riskFactors)) {
        riskLevel = '高風險';
        recommendation = '建議：\n' +
                         '1. 考慮替代性治療方案\n' +
                         '2. 若必須進行手術，建議：\n' +
                         '   - 術前抗生素預防性投藥\n' +
                         '   - 減少手術創傷\n' +
                         '   - 避免開放性傷口\n' +
                         '3. 密切追蹤至少6個月';
      } else if (maxRiskPercentage > 1.0) {
        riskLevel = '中度風險';
        recommendation = '建議：\n' +
                         '1. 與開立處方醫師討論，考慮短期停藥\n' +
                         '2. 採取額外預防措施：\n' +
                         '   - 術前徹底清潔\n' +
                         '   - 減少手術創傷\n' +
                         '3. 定期追蹤';
      } else {
        riskLevel = '低風險';
        recommendation = '可進行常規治療，但需要：\n' +
                         '1. 告知風險並簽署同意書\n' +
                         '2. 維持良好口腔衛生\n' +
                         '3. 定期追蹤';
      }
    }
    
    // Add warning about periodontal disease if present
    if (patientData.periodontalIssues && (procedure === '拔牙' || procedure === '牙周手術' || procedure === '植牙')) {
      recommendation += '\n\n警告：病人有牙周疾病，顯著增加MRONJ風險。建議先控制牙周炎症後再進行手術。';
    }
    
    assessments.push({
      procedure,
      riskLevel,
      recommendation,
      medicationContributions: medicationRisks.map(mr => ({
        drugName: mr.medication.drugName,
        riskPercentage: mr.riskPercentage
      })),
      citations: Array.from(new Set(medicationRisks.flatMap(mr => mr.citations)))
    });
  });
  
  return assessments;
} 