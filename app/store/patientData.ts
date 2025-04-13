import { create } from 'zustand';

// Add these types for medication categorization
export type MedicationType = 
  | 'Antiresorptive'  // 抗骨質再吸收劑
  | 'Antiangiogenic'  // 抗血管新生劑
  | 'Both'            // 兩者皆是
  | '';

export type SubType = 
  | 'Bisphosphonates-IV'     // 靜脈注射型雙磷酸鹽類
  | 'Bisphosphonates-Oral'   // 口服型雙磷酸鹽類
  | 'RANK-L Inhibitors'      // RANK-L抑制劑
  | 'Antiangiogenic Agents'  // 抗血管新生藥物
  | '';

export type DrugName = 
  // Bisphosphonates - IV
  | 'Zoledronate (Zometa)'
  | 'Zoledronate (Reclast)'
  | 'Pamidronate (Aredia)'
  | 'Ibandronate (Boniva IV)'
  
  // Bisphosphonates - Oral
  | 'Alendronate (Fosamax)'
  | 'Risedronate (Actonel)'
  | 'Ibandronate (Boniva)'
  
  // RANK-L Inhibitors
  | 'Denosumab (Prolia/Xgeva)'
  | 'Denosumab (Prolia)'
  | 'Denosumab (Xgeva)'
  
  // Monoclonal Antibodies
  | 'Romosozumab (Evenity)'
  
  // Antiangiogenic
  | 'Bevacizumab (Avastin)'
  | 'Sunitinib (Sutent)'
  | 'Cabozantinib (Cabometyx)'
  | '';

// Add interface for medication tracking
export interface Medication {
  drugName: DrugName;
  administrationRoute: '口服' | '注射' | '';
  indication: '骨質疏鬆' | '惡性腫瘤/骨轉移' | '多發性骨髓瘤' | '其他' | '';
  startYear: string;
  startMonth: string;
  frequency: '每天' | '每個月' | '每半年' | '';
  isStopped: boolean;
  stopYear: string;
  stopMonth: string;
  durationMonths?: number; // Calculated field for risk assessment
}

export interface PatientData {
  // Personal Info
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  idNumber: string;
  age: number | null;
  
  // Medical History
  gender: '男' | '女' | '跨性別' | '';
  transgenderType: '男跨女' | '女跨男' | '其他' | '';
  hasHormoneTherapy: boolean;
  hormoneTherapyDuration: '5年以內' | '5-10年' | '10年以上' | '';
  systemicDiseases: string[];
  hasRadiotherapy: boolean;
  radiotherapyDetails: string;
  hasCancer: boolean;
  cancerHistory: string;
  otherConditions: string;

  // Updated Medication History
  hasAntiresorptiveMed: boolean;
  medicationType: MedicationType;
  medicationSubType: SubType;
  drugName: DrugName;
  administrationRoute: '口服' | '注射' | '';
  indication: '骨質疏鬆' | '惡性腫瘤/骨轉移' | '多發性骨髓瘤' | '其他' | '';
  startYear: string;
  startMonth: string;
  frequency: '每天' | '每個月' | '每半年' | '';
  isStopped: boolean;
  stopYear: string;
  stopMonth: string;
  medicationStatus: '使用中/過去曾使用' | '過去未曾使用，即將開始使用' | '';
  
  // Future medication plan
  futureMedicationReason: string;
  futureMedicationName: string;
  futureMedicationStartYear: string;
  futureMedicationStartMonth: string;
  futureMedicationRoute: '口服' | '注射' | '';

  // MRONJ Specific Risk Factors
  steroidUse: boolean;               // 類固醇使用
  diabetes: boolean;                 // 糖尿病 (HbA1c > 6.5%)
  anemia: boolean;                   // 貧血 (Hb <10 g/dL)
  heavySmoker: boolean;              // 重度吸煙 (>10支煙/天)
  periodontalIssues: boolean;        // 牙周病或自發性牙痛

  // For tracking multiple medications
  medications: Medication[];

  // Physical measurements
  height: string;  // in cm
  weight: string;  // in kg
  bmi: number | null;
  isObese: boolean;
}

interface PatientStore {
  patientData: PatientData;
  updatePatientInfo: (data: Partial<PatientData>) => void;
  resetPatientData: () => void;
  addMedication: (medication: Medication) => void;
  updateMedication: (index: number, medication: Partial<Medication>) => void;
  removeMedication: (index: number) => void;
}

const initialPatientData: PatientData = {
  name: '',
  birthYear: '',
  birthMonth: '',
  birthDay: '',
  idNumber: '',
  age: null,
  gender: '',
  transgenderType: '',
  hasHormoneTherapy: false,
  hormoneTherapyDuration: '',
  systemicDiseases: [],
  hasRadiotherapy: false,
  radiotherapyDetails: '',
  hasCancer: false,
  cancerHistory: '',
  otherConditions: '',
  hasAntiresorptiveMed: false,
  medicationType: '',
  medicationSubType: '',
  drugName: '',
  administrationRoute: '',
  indication: '',
  startYear: '',
  startMonth: '',
  frequency: '',
  isStopped: false,
  stopYear: '',
  stopMonth: '',
  medicationStatus: '',
  futureMedicationReason: '',
  futureMedicationName: '',
  futureMedicationStartYear: '',
  futureMedicationStartMonth: '',
  futureMedicationRoute: '',
  steroidUse: false,
  diabetes: false,
  anemia: false,
  heavySmoker: false,
  periodontalIssues: false,
  medications: [],
  height: '',
  weight: '',
  bmi: null,
  isObese: false,
};

export const usePatientStore = create<PatientStore>((set: any) => ({
  patientData: initialPatientData,
  updatePatientInfo: (data: Partial<PatientData>) => 
    set((state: PatientStore) => ({ 
      patientData: { ...state.patientData, ...data } 
    })),
  resetPatientData: () => set({ patientData: initialPatientData }),
  // Add methods for managing medications
  addMedication: (medication: Medication) =>
    set((state: PatientStore) => ({
      patientData: {
        ...state.patientData,
        medications: [...state.patientData.medications, medication]
      }
    })),
  updateMedication: (index: number, medication: Partial<Medication>) =>
    set((state: PatientStore) => ({
      patientData: {
        ...state.patientData,
        medications: state.patientData.medications.map((med, i) =>
          i === index ? { ...med, ...medication } : med
        )
      }
    })),
  removeMedication: (index: number) =>
    set((state: PatientStore) => ({
      patientData: {
        ...state.patientData,
        medications: state.patientData.medications.filter((_, i) => i !== index)
      }
    })),
})); 