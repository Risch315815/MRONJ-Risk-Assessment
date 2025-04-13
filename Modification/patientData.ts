import { create } from 'zustand';

// Add these types for medication categorization
type MedicationType = 
  | '抗骨質再吸收劑'
  | '促骨質合成藥物'
  | '抗骨質再吸收劑與促骨質合成藥物'
  | '';

type SubType = 
  | '雙磷酸鹽類'
  | '單株抗體'
  | '選擇性雌激素受體調節物'
  | '';

type DrugName = 
  | '福善美保骨錠Fosamax Plus'
  | '瑞谷卓膜衣錠Reosteo'
  | '骨維壯注射劑Boniva'
  | '保骼麗注射液Prolia'
  | '鈣穩膜衣錠Evista'
  | '骨穩Forteo'
  | '益穩挺Evenity'
  | '';

export interface PatientData {
  // Personal Info
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  idNumber: string;
  
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
  indication: '骨質疏鬆' | '多發性骨髓瘤' | '骨轉移' | '其他' | '';
  startYear: string;
  startMonth: string;
  frequency: '每天' | '每個月' | '每半年' | '';
  isStopped: boolean;
  stopYear: string;
  stopMonth: string;
}

interface PatientStore {
  patientData: PatientData;
  updatePatientInfo: (data: Partial<PatientData>) => void;
  resetPatientData: () => void;
}

const initialState: PatientData = {
  name: '',
  birthYear: new Date().getFullYear().toString(),
  birthMonth: '1',
  birthDay: '1',
  idNumber: '',
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
};

export const usePatientStore = create<PatientStore>((set: any) => ({
  patientData: initialState,
  updatePatientInfo: (data: Partial<PatientData>) => 
    set((state: PatientStore) => ({ 
      patientData: { ...state.patientData, ...data } 
    })),
  resetPatientData: () => set({ patientData: initialState }),
})); 