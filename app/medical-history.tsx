import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Switch, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';
import { usePatientStore } from './store/patientData';

export default function MedicalHistory() {
  const { patientData, updatePatientInfo } = usePatientStore();

  // Updated systemic diseases options
  const systemicDiseaseOptions = [
    { label: '無', value: '無' },
    { label: '高血壓', value: '高血壓' },
    { label: '心臟血管疾病', value: '心臟血管疾病' },
    { label: '洗腎', value: '洗腎' },
    { label: 'A型肝炎', value: 'A型肝炎' },
    { label: 'B型肝炎', value: 'B型肝炎' },
    { label: 'C型肝炎', value: 'C型肝炎' },
    { label: '腦中風病史', value: '腦中風病史' },
  ];

  const genderOptions = [
    { label: '男', value: '男' },
    { label: '女', value: '女' },
    { label: '跨性別', value: '跨性別' },
  ];

  const transgenderOptions = [
    { label: '男跨女', value: '男跨女' },
    { label: '女跨男', value: '女跨男' },
    { label: '其他', value: '其他' },
  ];

  const hormoneTherapyDurationOptions = [
    { label: '5年以內', value: '5年以內' },
    { label: '5-10年', value: '5-10年' },
    { label: '10年以上', value: '10年以上' },
  ];

  // Calculate and display age from stored birth date
  const age = patientData.age ? `${patientData.age}歲` : '未填寫出生日期';

  // Height and weight options
  const heightOptions = Array.from(
    { length: 61 },
    (_, i) => ({ label: `${140 + i}公分`, value: (140 + i).toString() })
  );

  const weightOptions = Array.from(
    { length: 121 },
    (_, i) => ({ label: `${30 + i}公斤`, value: (30 + i).toString() })
  );

  const validateFields = () => {
    const errors = [];
    const details = [];
    
    // Basic required fields
    if (!patientData.height) errors.push('身高');
    if (!patientData.weight) errors.push('體重');
    if (!patientData.gender) errors.push('性別');
    if (!patientData.systemicDiseases || patientData.systemicDiseases.length === 0) {
      errors.push('系統性疾病');
    }

    // Transgender specific validations
    if (patientData.gender === '跨性別') {
      if (!patientData.transgenderType) {
        errors.push('跨性別類型');
      }
      if (patientData.hasHormoneTherapy === undefined) {
        errors.push('是否進行荷爾蒙療法');
      }
      if (patientData.hasHormoneTherapy && !patientData.hormoneTherapyDuration) {
        errors.push('荷爾蒙療法時間長度');
      }
    }

    // Radiation therapy details validation
    if (patientData.hasRadiotherapy) {
      if (!patientData.radiotherapyDetails?.trim()) {
        details.push('頭頸部放射線治療詳情');
      }
    }

    // Cancer history details validation
    if (patientData.hasCancer) {
      if (!patientData.cancerHistory?.trim()) {
        details.push('惡性腫瘤病史詳情');
      }
    }

    // Show error for required fields
    if (errors.length > 0) {
      Alert.alert(
        '請填寫必填項目',
        `以下欄位尚未填寫完整：\n${errors.join('、')}`,
        [{ text: '確定' }]
      );
      return false;
    }

    // Show error for missing details
    if (details.length > 0) {
      Alert.alert(
        '請填寫詳細資料',
        `以下項目需要填寫詳情：\n${details.join('、')}`,
        [{ text: '確定' }]
      );
      return false;
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (!validateFields()) return;
    
    const height = parseFloat(patientData.height);
    const weight = parseFloat(patientData.weight);
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    const isObese = bmi >= 30;
    
    updatePatientInfo({
      bmi: bmi,
      isObese: isObese,
    });

    router.push('/medication-history');
  };

  // In the MedicalHistory component, add a function to calculate age
  const calculateAge = (birthYear: string, birthMonth: string, birthDay: string) => {
    const today = new Date();
    const birthDate = new Date(
      parseInt(birthYear),
      parseInt(birthMonth) - 1,
      parseInt(birthDay)
    );
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  // Add logic to handle "無" selection
  const handleDiseaseSelection = (disease: string) => {
    const currentDiseases = patientData.systemicDiseases;
    let newDiseases: string[];

    if (disease === '無') {
      // If selecting "無", clear all other selections
      newDiseases = ['無'];
    } else {
      if (currentDiseases.includes('無')) {
        // If "無" was previously selected, remove it
        newDiseases = [disease];
      } else {
        // Toggle the selected disease
        newDiseases = currentDiseases.includes(disease)
          ? currentDiseases.filter(d => d !== disease)
          : [...currentDiseases, disease];
      }
    }

    updatePatientInfo({ systemicDiseases: newDiseases });
    
    // Update diabetes flag if selecting diabetes
    if (disease === '糖尿病') {
      updatePatientInfo({ diabetes: !currentDiseases.includes('糖尿病') });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>病史資料</Text>

        <View style={styles.form}>
          {/* Age Display */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>年齡</Text>
            <View style={styles.ageDisplay}>
              <Text style={styles.ageText}>{age}</Text>
            </View>
          </View>

          {/* Height Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>身高</Text>
            <View style={styles.heightPickerContainer}>
              <RNPickerSelect
                value={patientData.height}
                onValueChange={(value) => updatePatientInfo({ height: value })}
                items={heightOptions}
                placeholder={{ label: '請選擇身高', value: null }}
              />
            </View>
          </View>

          {/* Weight Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>體重</Text>
            <View style={styles.weightPickerContainer}>
              <RNPickerSelect
                value={patientData.weight}
                onValueChange={(value) => updatePatientInfo({ weight: value })}
                items={weightOptions}
                placeholder={{ label: '請選擇體重', value: null }}
              />
            </View>
          </View>

          {/* Gender Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>生理性別</Text>
            <View style={styles.radioGroup}>
              {genderOptions.map((option) => (
                <TouchableOpacity 
                  key={option.value}
                  style={[
                    styles.radioButton,
                    patientData.gender === option.value && styles.radioButtonSelected
                  ]}
                  onPress={() => {
                    updatePatientInfo({ 
                      gender: option.value,
                      // Reset related fields when changing gender
                      transgenderType: '',
                      hasHormoneTherapy: false,
                      hormoneTherapyDuration: '',
                    });
                  }}
                >
                  <Text style={[
                    styles.radioText,
                    patientData.gender === option.value && styles.radioTextSelected
                  ]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Transgender Type Selection */}
          {patientData.gender === '跨性別' && (
            <View style={styles.inputGroup}>
              <Text style={styles.sublabel}>跨性別類型</Text>
              <View style={styles.radioGroup}>
                {transgenderOptions.map((option) => (
                  <TouchableOpacity 
                    key={option.value}
                    style={[
                      styles.radioButton,
                      patientData.transgenderType === option.value && styles.radioButtonSelected
                    ]}
                    onPress={() => updatePatientInfo({ transgenderType: option.value })}
                  >
                    <Text style={[
                      styles.radioText,
                      patientData.transgenderType === option.value && styles.radioTextSelected
                    ]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Hormone Therapy Question */}
          {patientData.gender === '跨性別' && (
            <View style={styles.inputGroup}>
              <Text style={styles.sublabel}>是否接受賀爾蒙療法？</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity 
                  style={[
                    styles.radioButton,
                    patientData.hasHormoneTherapy && styles.radioButtonSelected
                  ]}
                  onPress={() => updatePatientInfo({ 
                    hasHormoneTherapy: true,
                  })}
                >
                  <Text style={[
                    styles.radioText,
                    patientData.hasHormoneTherapy && styles.radioTextSelected
                  ]}>是</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.radioButton,
                    patientData.hasHormoneTherapy === false && styles.radioButtonSelected
                  ]}
                  onPress={() => updatePatientInfo({ 
                    hasHormoneTherapy: false,
                    hormoneTherapyDuration: '', // Reset duration when selecting No
                  })}
                >
                  <Text style={[
                    styles.radioText,
                    patientData.hasHormoneTherapy === false && styles.radioTextSelected
                  ]}>否</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Hormone Therapy Duration */}
          {patientData.gender === '跨性別' && patientData.hasHormoneTherapy && (
            <View style={styles.inputGroup}>
              <Text style={styles.sublabel}>接受賀爾蒙療法時間長度</Text>
              <View style={styles.pickerContainer}>
                <RNPickerSelect
                  value={patientData.hormoneTherapyDuration}
                  onValueChange={(value) => 
                    updatePatientInfo({ hormoneTherapyDuration: value })}
                  items={hormoneTherapyDurationOptions}
                  style={pickerSelectStyles}
                  placeholder={{ label: '請選擇時間長度', value: null }}
                />
              </View>
            </View>
          )}

          {/* Systemic Diseases */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>系統性疾病（可複選）</Text>
            <View style={styles.checkboxGroup}>
              {systemicDiseaseOptions.map((disease) => (
                <TouchableOpacity
                  key={disease.value}
                  style={styles.checkbox}
                  onPress={() => handleDiseaseSelection(disease.value)}
                >
                  <View style={[
                    styles.checkboxBox,
                    patientData.systemicDiseases.includes(disease.value) && styles.checkboxChecked
                  ]} />
                  <Text style={styles.checkboxLabel}>{disease.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* MRONJ-Specific Risk Factors Section */}
          <View style={styles.riskFactorsSection}>
            <Text style={styles.sectionTitle}>MRONJ風險因素</Text>
            
            {/* Poorly Controlled Diabetes - new dedicated question */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>是否有控制不佳之糖尿病 (HbA1c ≥ 7.0%)</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity 
                  style={[
                    styles.radioButton,
                    patientData.diabetes && styles.radioButtonSelected
                  ]}
                  onPress={() => updatePatientInfo({ diabetes: true })}
                >
                  <Text style={[
                    styles.radioText,
                    patientData.diabetes && styles.radioTextSelected
                  ]}>是</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.radioButton,
                    patientData.diabetes === false && styles.radioButtonSelected
                  ]}
                  onPress={() => updatePatientInfo({ diabetes: false })}
                >
                  <Text style={[
                    styles.radioText,
                    patientData.diabetes === false && styles.radioTextSelected
                  ]}>否</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Steroid Use */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>是否長期使用類固醇？</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity 
                  style={[
                    styles.radioButton,
                    patientData.steroidUse && styles.radioButtonSelected
                  ]}
                  onPress={() => updatePatientInfo({ steroidUse: true })}
                >
                  <Text style={[
                    styles.radioText,
                    patientData.steroidUse && styles.radioTextSelected
                  ]}>是</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.radioButton,
                    patientData.steroidUse === false && styles.radioButtonSelected
                  ]}
                  onPress={() => updatePatientInfo({ steroidUse: false })}
                >
                  <Text style={[
                    styles.radioText,
                    patientData.steroidUse === false && styles.radioTextSelected
                  ]}>否</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Anemia */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>是否有貧血 (Hb &lt;10 g/dL)？</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity 
                  style={[
                    styles.radioButton,
                    patientData.anemia && styles.radioButtonSelected
                  ]}
                  onPress={() => updatePatientInfo({ anemia: true })}
                >
                  <Text style={[
                    styles.radioText,
                    patientData.anemia && styles.radioTextSelected
                  ]}>是</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.radioButton,
                    patientData.anemia === false && styles.radioButtonSelected
                  ]}
                  onPress={() => updatePatientInfo({ anemia: false })}
                >
                  <Text style={[
                    styles.radioText,
                    patientData.anemia === false && styles.radioTextSelected
                  ]}>否</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Heavy Smoker */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>是否為重度吸煙者 (&gt;10支煙/天)？</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity 
                  style={[
                    styles.radioButton,
                    patientData.heavySmoker && styles.radioButtonSelected
                  ]}
                  onPress={() => updatePatientInfo({ heavySmoker: true })}
                >
                  <Text style={[
                    styles.radioText,
                    patientData.heavySmoker && styles.radioTextSelected
                  ]}>是</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.radioButton,
                    patientData.heavySmoker === false && styles.radioButtonSelected
                  ]}
                  onPress={() => updatePatientInfo({ heavySmoker: false })}
                >
                  <Text style={[
                    styles.radioText,
                    patientData.heavySmoker === false && styles.radioTextSelected
                  ]}>否</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Periodontal Issues */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>是否有牙周病或自發性牙痛？</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity 
                  style={[
                    styles.radioButton,
                    patientData.periodontalIssues && styles.radioButtonSelected
                  ]}
                  onPress={() => updatePatientInfo({ periodontalIssues: true })}
                >
                  <Text style={[
                    styles.radioText,
                    patientData.periodontalIssues && styles.radioTextSelected
                  ]}>是</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.radioButton,
                    patientData.periodontalIssues === false && styles.radioButtonSelected
                  ]}
                  onPress={() => updatePatientInfo({ periodontalIssues: false })}
                >
                  <Text style={[
                    styles.radioText,
                    patientData.periodontalIssues === false && styles.radioTextSelected
                  ]}>否</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Radiotherapy History */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>是否曾接受頭頸部放射治療？</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={[
                  styles.radioButton,
                  patientData.hasRadiotherapy && styles.radioButtonSelected
                ]}
                onPress={() => updatePatientInfo({ hasRadiotherapy: true })}
              >
                <Text style={[
                  styles.radioText,
                  patientData.hasRadiotherapy && styles.radioTextSelected
                ]}>是</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.radioButton,
                  !patientData.hasRadiotherapy && styles.radioButtonSelected
                ]}
                onPress={() => updatePatientInfo({ hasRadiotherapy: false })}
              >
                <Text style={[
                  styles.radioText,
                  !patientData.hasRadiotherapy && styles.radioTextSelected
                ]}>否</Text>
              </TouchableOpacity>
            </View>
          </View>

          {patientData.hasRadiotherapy && (
            <View style={styles.inputGroup}>
              <Text style={styles.sublabel}>放射治療詳情</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={patientData.radiotherapyDetails}
                onChangeText={(text) => 
                  updatePatientInfo({ radiotherapyDetails: text })}
                placeholder="請說明治療時間、部位等"
                multiline
                numberOfLines={3}
              />
            </View>
          )}

          {/* Cancer History */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>是否有惡性腫瘤病史？</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity 
                style={[
                  styles.radioButton,
                  patientData.hasCancer && styles.radioButtonSelected
                ]}
                onPress={() => updatePatientInfo({ hasCancer: true })}
              >
                <Text style={[
                  styles.radioText,
                  patientData.hasCancer && styles.radioTextSelected
                ]}>是</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.radioButton,
                  !patientData.hasCancer && styles.radioButtonSelected
                ]}
                onPress={() => updatePatientInfo({ hasCancer: false })}
              >
                <Text style={[
                  styles.radioText,
                  !patientData.hasCancer && styles.radioTextSelected
                ]}>否</Text>
              </TouchableOpacity>
            </View>
          </View>

          {patientData.hasCancer && (
            <View style={styles.inputGroup}>
              <Text style={styles.sublabel}>腫瘤病史詳情</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={patientData.cancerHistory}
                onChangeText={(text) => 
                  updatePatientInfo({ cancerHistory: text })}
                placeholder="請說明診斷時間、類型、治療方式等"
                multiline
                numberOfLines={3}
              />
            </View>
          )}

          {/* Other Conditions */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>其他病史</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={patientData.otherConditions}
              onChangeText={(text) => 
                updatePatientInfo({ otherConditions: text })}
              placeholder="請填寫其他需要注意的病史"
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={() => {
            if (validateFields()) {
              // Calculate BMI when proceeding
              if (patientData.height && patientData.weight) {
                const height = parseFloat(patientData.height) / 100;
                const weight = parseFloat(patientData.weight);
                const bmi = weight / (height * height);
                updatePatientInfo({
                  bmi: Math.round(bmi * 10) / 10,
                  isObese: bmi >= 30
                });
              }
              router.push('/medication-history');
            }
          }}
        >
          <Text style={styles.buttonText}>下一步</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  form: {
    gap: 20,
    marginBottom: 30,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  sublabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  calculatedAge: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  checkboxGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 4,
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 10,
  },
  radioButton: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    backgroundColor: 'white',
  },
  radioButtonSelected: {
    backgroundColor: '#007AFF',
  },
  radioText: {
    fontSize: 16,
    color: '#007AFF',
  },
  radioTextSelected: {
    color: 'white',
  },
  ageDisplay: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  ageText: {
    fontSize: 16,
    color: '#333',
  },
  heightPickerContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  weightPickerContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  riskFactorsSection: {
    backgroundColor: '#f0f7ff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 15,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    color: '#333',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#333',
  },
}); 