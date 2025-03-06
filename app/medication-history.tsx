import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, FlatList } from 'react-native';
import { router } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';
import { usePatientStore, DrugName, Medication } from './store/patientData';

// Add interface for medication
interface MedicationGroup {
  title: string;
  medications: {
    name: DrugName;
    route: '口服' | '注射';
  }[];
}

export default function MedicationHistory() {
  const { patientData, updatePatientInfo, addMedication, updateMedication, removeMedication } = usePatientStore();
  const [dateError, setDateError] = useState<string>('');
  const [currentMedication, setCurrentMedication] = useState<Partial<Medication>>({
    drugName: '',
    administrationRoute: '',
    indication: '',
    startYear: '',
    startMonth: '',
    frequency: '',
    isStopped: false,
    stopYear: '',
    stopMonth: ''
  });
  const [editingMedicationIndex, setEditingMedicationIndex] = useState<number | null>(null);

  // Set default value for hasAntiresorptiveMed to true when component mounts if no medications exist
  useEffect(() => {
    if (patientData.hasAntiresorptiveMed === false && patientData.medications.length === 0) {
      updatePatientInfo({ hasAntiresorptiveMed: true });
    }
  }, []);

  // Get current year and generate year options (from 1990 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - 1990 + 1 },
    (_, i) => ({ 
      label: `${currentYear - i}年`, 
      value: (currentYear - i).toString() 
    })
  );

  // Generate month options
  const monthOptions = Array.from(
    { length: 12 },
    (_, i) => ({ label: `${i + 1}月`, value: (i + 1).toString() })
  );

  const frequencyOptions = [
    { label: '每天', value: '每天' },
    { label: '每個月', value: '每個月' },
    { label: '每半年', value: '每半年' },
  ];

  // Update medicationGroups with proper typing
  const medicationGroups: MedicationGroup[] = [
    {
      title: '雙磷酸鹽類藥物',
      medications: [
        { name: 'Alendronate (Fosamax)', route: '口服' },
        { name: 'Risedronate (Actonel)', route: '口服' },
        { name: 'Ibandronate (Boniva)', route: '注射' },
      ]
    },
    {
      title: '單株抗體藥物',
      medications: [
        { name: 'Denosumab (Prolia/Xgeva)', route: '注射' },
      ]
    },
    {
      title: '其他抗骨吸收藥物',
      medications: [
        { name: 'Bevacizumab (Avastin)', route: '注射' },
        { name: 'Sunitinib (Sutent)', route: '口服' },
        { name: 'Cabozantinib (Cabometyx)', route: '口服' },
      ]
    }
  ];

  const handleDrugSelection = (drugName: DrugName, route: '口服' | '注射') => {
    setCurrentMedication({
      ...currentMedication,
      drugName,
      administrationRoute: route
    });
  };

  const handleReasonSelection = (reason: '骨質疏鬆' | '惡性腫瘤/骨轉移' | '多發性骨髓瘤' | '其他') => {
    // Convert the UI value to the value expected by the type system
    let indicationValue: '骨質疏鬆' | '惡性腫瘤/骨轉移'| '多發性骨髓瘤'  | '其他' = reason as any;
    
    // Map "惡性腫瘤/骨轉移" to "骨轉移" for type compatibility
    if (reason === '惡性腫瘤/骨轉移') {
      indicationValue = '惡性腫瘤/骨轉移';
    }
    
    setCurrentMedication({
      ...currentMedication,
      indication: indicationValue
    });
  };

  const handleFrequencySelection = (freq: '每天' | '每個月' | '每半年') => {
    setCurrentMedication({
      ...currentMedication,
      frequency: freq
    });
  };

  // Add validation function
  const validateStopDate = (year: string, month: string) => {
    if (!currentMedication.startYear || !currentMedication.startMonth) {
      setDateError('請先選擇開始用藥時間');
      return false;
    }

    const startDate = new Date(
      parseInt(currentMedication.startYear),
      parseInt(currentMedication.startMonth) - 1
    );
    const stopDate = new Date(
      parseInt(year),
      parseInt(month) - 1
    );
    
    // Check if stop date is before start date
    if (stopDate < startDate) {
      setDateError('停藥時間不能早於開始用藥時間');
      return false;
    }
    
    // Check if stop date is in the future
    const today = new Date();
    if (stopDate > today) {
      setDateError('停藥時間不能晚於現在');
      return false;
    }

    setDateError('');
    return true;
  };

  // Update the stop date handlers
  const handleStopYearChange = (value: string) => {
    if (value && currentMedication.stopMonth) {
      if (validateStopDate(value, currentMedication.stopMonth)) {
        setCurrentMedication({
          ...currentMedication,
          stopYear: value
        });
      }
    } else {
      setCurrentMedication({
        ...currentMedication,
        stopYear: value
      });
    }
  };

  const handleStopMonthChange = (value: string) => {
    if (value && currentMedication.stopYear) {
      if (validateStopDate(currentMedication.stopYear, value)) {
        setCurrentMedication({
          ...currentMedication,
          stopMonth: value
        });
      }
    } else {
      setCurrentMedication({
        ...currentMedication,
        stopMonth: value
      });
    }
  };

  const validateMedicationFields = () => {
    if (patientData.hasAntiresorptiveMed) {
      const errors = [];
      
      // Check if there's at least one medication added
      if (patientData.medications.length === 0 && !isValidMedication(currentMedication)) {
        errors.push('請至少添加一種藥物');
      }

      if (errors.length > 0) {
        Alert.alert(
          '請完整填寫用藥資訊',
          errors.join('\n'),
          [{ text: '確定' }]
        );
        return false;
      }
    }
    return true;
  };

  // Helper function to validate medication data
  const isValidMedication = (med: Partial<Medication>): boolean => {
    if (!med.drugName) return false;
    if (!med.indication) return false;
    if (!med.startYear || !med.startMonth) return false;
    if (!med.frequency) return false;
    if (med.isStopped && (!med.stopYear || !med.stopMonth)) return false;
    
    return true;
  };

  // Function to save current medication
  const saveMedication = () => {
    if (!isValidMedication(currentMedication)) {
      Alert.alert(
        '請完整填寫用藥資訊',
        '藥物名稱、使用原因、開始時間和頻率為必填項目',
        [{ text: '確定' }]
      );
      return;
    }

    // Calculate duration in months for risk assessment
    const startDate = new Date(
      parseInt(currentMedication.startYear!),
      parseInt(currentMedication.startMonth!) - 1
    );
    
    const endDate = currentMedication.isStopped && currentMedication.stopYear && currentMedication.stopMonth
      ? new Date(
          parseInt(currentMedication.stopYear),
          parseInt(currentMedication.stopMonth) - 1
        )
      : new Date();
    
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const durationMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));

    const medicationToAdd = {
      ...currentMedication,
      durationMonths
    } as Medication;

    if (editingMedicationIndex !== null) {
      // Update existing medication
      updateMedication(editingMedicationIndex, medicationToAdd);
    } else {
      // Add new medication
      addMedication(medicationToAdd);
    }

    // Clear form
    setCurrentMedication({
      drugName: '',
      administrationRoute: '',
      indication: '',
      startYear: '',
      startMonth: '',
      frequency: '',
      isStopped: false,
      stopYear: '',
      stopMonth: ''
    });
    setEditingMedicationIndex(null);
  };

  // Function to edit an existing medication
  const editMedication = (index: number) => {
    const medToEdit = patientData.medications[index];
    setCurrentMedication(medToEdit);
    setEditingMedicationIndex(index);
  };

  // Function to delete a medication
  const deleteMedication = (index: number) => {
    Alert.alert(
      '刪除藥物',
      '確定要刪除這個藥物記錄嗎？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '確定', 
          onPress: () => {
            removeMedication(index);
            if (editingMedicationIndex === index) {
              setCurrentMedication({
                drugName: '',
                administrationRoute: '',
                indication: '',
                startYear: '',
                startMonth: '',
                frequency: '',
                isStopped: false,
                stopYear: '',
                stopMonth: ''
              });
              setEditingMedicationIndex(null);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Update the submit handler
  const handleSubmit = () => {
    // If there's a current medication being edited, try to save it first
    if (currentMedication.drugName && !editingMedicationIndex && isValidMedication(currentMedication)) {
      // Calculate duration in months for risk assessment
      const startDate = new Date(
        parseInt(currentMedication.startYear!),
        parseInt(currentMedication.startMonth!) - 1
      );
      
      const endDate = currentMedication.isStopped && currentMedication.stopYear && currentMedication.stopMonth
        ? new Date(
            parseInt(currentMedication.stopYear),
            parseInt(currentMedication.stopMonth) - 1
          )
        : new Date();
      
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const durationMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));

      const medicationToAdd = {
        ...currentMedication,
        durationMonths
      } as Medication;

      // Add this medication to the list
      addMedication(medicationToAdd);
    }

    // Check if we have at least one medication
    if (patientData.medications.length === 0 && !isValidMedication(currentMedication)) {
      Alert.alert('錯誤', '請至少添加一種藥物');
      return;
    }

    // Validate all medications dates
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
    
    const hasInvalidDates = patientData.medications.some((med, index) => {
      // Convert to numbers for comparison
      const startYear = parseInt(med.startYear);
      const startMonth = parseInt(med.startMonth);
      
      // Check if start date is in the future
      if (startYear > currentYear || (startYear === currentYear && startMonth > currentMonth)) {
        Alert.alert('日期錯誤', `藥物 #${index + 1}: 開始時間不能晚於現在`);
        return true;
      }
      
      // Check stop date if medication is stopped
      if (med.isStopped) {
        const stopYear = parseInt(med.stopYear);
        const stopMonth = parseInt(med.stopMonth);
        
        // Check if stop date is before start date
        if (stopYear < startYear || (stopYear === startYear && stopMonth < startMonth)) {
          Alert.alert('日期錯誤', `藥物 #${index + 1}: 停藥時間不能早於開始時間`);
          return true;
        }
        
        // Check if stop date is in the future
        if (stopYear > currentYear || (stopYear === currentYear && stopMonth > currentMonth)) {
          Alert.alert('日期錯誤', `藥物 #${index + 1}: 停藥時間不能晚於現在`);
          return true;
        }
      }
      
      return false;
    });
    
    if (hasInvalidDates) {
      return;
    }
    
    // If all validations pass, update patient data to have antiresorptive medication
    updatePatientInfo({
      hasAntiresorptiveMed: true
    });
    
    // Navigate to the medication summary page
    router.push('/medication-summary');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>用藥紀錄</Text>

        <View style={styles.form}>
          {/* Initial question */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>是否正在使用或曾經使用骨質疏鬆相關藥物？</Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  patientData.hasAntiresorptiveMed && styles.radioButtonSelected
                ]}
                onPress={() => updatePatientInfo({ hasAntiresorptiveMed: true })}
              >
                <Text style={styles.radioText}>是</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  !patientData.hasAntiresorptiveMed && styles.radioButtonSelected
                ]}
                onPress={() => {
                  // Remove all medications when selecting "no"
                  updatePatientInfo({ 
                    hasAntiresorptiveMed: false,
                    medications: []
                  });
                }}
              >
                <Text style={styles.radioText}>否</Text>
              </TouchableOpacity>
            </View>
          </View>

          {patientData.hasAntiresorptiveMed && (
            <>
              {/* List of added medications */}
              {patientData.medications.length > 0 && (
                <View style={styles.medicationListContainer}>
                  <Text style={styles.subheading}>已添加的藥物</Text>
                  {patientData.medications.map((med, index) => (
                    <View key={index} style={styles.medicationItem}>
                      <View style={styles.medicationDetails}>
                        <Text style={styles.medicationName}>{med.drugName}</Text>
                        <Text style={styles.medicationInfo}>
                          {med.indication} | {med.administrationRoute} | {med.frequency}
                        </Text>
                        <Text style={styles.medicationDates}>
                          開始: {med.startYear}年{med.startMonth}月
                          {med.isStopped ? ` 停止: ${med.stopYear}年${med.stopMonth}月` : ' 持續使用中'}
                        </Text>
                      </View>
                      <View style={styles.medicationActions}>
                        <TouchableOpacity
                          style={styles.editButton}
                          onPress={() => editMedication(index)}
                        >
                          <Text style={styles.editButtonText}>編輯</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => deleteMedication(index)}
                        >
                          <Text style={styles.deleteButtonText}>刪除</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Form for adding/editing medication */}
              <View style={styles.medicationForm}>
                <Text style={styles.subheading}>
                  {editingMedicationIndex !== null ? '編輯藥物' : '添加新藥物'}
                </Text>

                {/* Medication Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>請選擇使用的藥物</Text>
                  {medicationGroups.map((group, groupIndex) => (
                    <View key={groupIndex} style={styles.medicationGroup}>
                      <Text style={styles.groupTitle}>{group.title}</Text>
                      <View style={styles.medicationsGrid}>
                        {group.medications.map((med, medIndex) => (
                          <TouchableOpacity
                            key={medIndex}
                            style={[
                              styles.medicationButton,
                              currentMedication.drugName === med.name && styles.medicationButtonSelected
                            ]}
                            onPress={() => handleDrugSelection(med.name, med.route)}
                          >
                            <Text style={[
                              styles.medicationText,
                              currentMedication.drugName === med.name && styles.medicationTextSelected
                            ]}>{med.name}</Text>
                            <Text style={[
                              styles.routeText,
                              currentMedication.drugName === med.name && styles.medicationTextSelected
                            ]}>({med.route})</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </View>

                {/* Usage Details */}
                {currentMedication.drugName && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>使用原因</Text>
                      <View style={styles.radioGroup}>
                        {['骨質疏鬆', '多發性骨髓瘤', '惡性腫瘤/骨轉移', '其他'].map((reason) => (
                          <TouchableOpacity
                            key={reason}
                            style={[
                              styles.reasonButton,
                              currentMedication.indication === reason && styles.reasonButtonSelected
                            ]}
                            onPress={() => handleReasonSelection(reason as '骨質疏鬆' | '惡性腫瘤/骨轉移' | '多發性骨髓瘤' | '其他')}
                          >
                            <Text style={[
                              styles.reasonText,
                              currentMedication.indication === reason && styles.reasonTextSelected
                            ]}>{reason}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Start Date */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>開始{currentMedication.administrationRoute === '口服' ? '服用' : '注射'}的時間</Text>
                      <View style={styles.datePickerGroup}>
                        <View style={[styles.pickerContainer, { flex: 1 }]}>
                          <RNPickerSelect
                            value={currentMedication.startYear}
                            onValueChange={(value) => 
                              setCurrentMedication({
                                ...currentMedication,
                                startYear: value
                              })}
                            items={yearOptions}
                            style={pickerSelectStyles}
                            placeholder={{ label: '年份', value: null }}
                          />
                        </View>
                        <View style={[styles.pickerContainer, { flex: 1 }]}>
                          <RNPickerSelect
                            value={currentMedication.startMonth}
                            onValueChange={(value) => 
                              setCurrentMedication({
                                ...currentMedication,
                                startMonth: value
                              })}
                            items={monthOptions}
                            style={pickerSelectStyles}
                            placeholder={{ label: '月份', value: null }}
                          />
                        </View>
                      </View>
                    </View>

                    {/* Frequency */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>
                        多久{currentMedication.administrationRoute === '口服' ? '吃' : '注射'}一次
                      </Text>
                      <View style={styles.radioGroup}>
                        {frequencyOptions.map((option) => (
                          <TouchableOpacity
                            key={option.value}
                            style={[
                              styles.radioButton,
                              currentMedication.frequency === option.value && styles.radioButtonSelected
                            ]}
                            onPress={() => handleFrequencySelection(option.value as '每天' | '每個月' | '每半年')}
                          >
                            <Text style={[
                              styles.radioText,
                              currentMedication.frequency === option.value && styles.radioTextSelected
                            ]}>{option.label}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Stop Date Section */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>目前用藥狀態</Text>
                      <View style={styles.radioGroup}>
                        <TouchableOpacity 
                          style={[
                            styles.radioButton,
                            !currentMedication.isStopped && styles.radioButtonSelected
                          ]}
                          onPress={() => setCurrentMedication({ 
                            ...currentMedication,
                            isStopped: false,
                            stopYear: '',
                            stopMonth: '',
                          })}
                        >
                          <Text style={[
                            styles.radioText,
                            !currentMedication.isStopped && styles.radioTextSelected
                          ]}>持續服用</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[
                            styles.radioButton,
                            currentMedication.isStopped && styles.radioButtonSelected
                          ]}
                          onPress={() => setCurrentMedication({ 
                            ...currentMedication,
                            isStopped: true 
                          })}
                        >
                          <Text style={[
                            styles.radioText,
                            currentMedication.isStopped && styles.radioTextSelected
                          ]}>已停藥</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Show stop date pickers only if stopped */}
                    {currentMedication.isStopped && (
                      <View style={styles.inputGroup}>
                        <Text style={styles.sublabel}>停藥時間</Text>
                        <View style={styles.datePickerGroup}>
                          <View style={[styles.pickerContainer, { flex: 1 }]}>
                            <RNPickerSelect
                              value={currentMedication.stopYear}
                              onValueChange={handleStopYearChange}
                              items={yearOptions}
                              style={pickerSelectStyles}
                              placeholder={{ label: '年份', value: null }}
                            />
                          </View>
                          <View style={[styles.pickerContainer, { flex: 1 }]}>
                            <RNPickerSelect
                              value={currentMedication.stopMonth}
                              onValueChange={handleStopMonthChange}
                              items={monthOptions}
                              style={pickerSelectStyles}
                              placeholder={{ label: '月份', value: null }}
                            />
                          </View>
                        </View>
                        {dateError ? (
                          <Text style={styles.errorText}>{dateError}</Text>
                        ) : null}
                      </View>
                    )}

                    {/* Button to add/update medication */}
                    <TouchableOpacity 
                      style={styles.addMedicationButton} 
                      onPress={saveMedication}
                    >
                      <Text style={styles.addMedicationButtonText}>
                        {editingMedicationIndex !== null ? '更新藥物' : '再添加一種藥物'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </>
          )}
        </View>

        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={handleSubmit}
        >
          <Text style={styles.buttonText}>添加完成</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  form: {
    // Add appropriate styles for the form
  },
  inputGroup: {
    marginBottom: 20,
  },
  subheading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  radioButton: {
    padding: 10,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 5,
    marginRight: 10,
    marginTop: 5,
  },
  radioButtonSelected: {
    backgroundColor: '#000',
  },
  radioText: {
    fontSize: 16,
  },
  radioTextSelected: {
    color: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 5,
  },
  input: {
    padding: 10,
  },
  nextButton: {
    padding: 15,
    backgroundColor: '#000',
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  medicationGroup: {
    marginTop: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  medicationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  medicationButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    width: '48%',
  },
  medicationButtonSelected: {
    backgroundColor: '#007AFF',
  },
  medicationText: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
  },
  medicationTextSelected: {
    color: 'white',
  },
  routeText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  reasonButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginRight: 10,
    marginTop: 5,
  },
  reasonButtonSelected: {
    backgroundColor: '#007AFF',
  },
  reasonText: {
    color: '#007AFF',
    fontSize: 14,
  },
  reasonTextSelected: {
    color: 'white',
  },
  datePickerGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  sublabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    marginTop: 5,
  },
  medicationListContainer: {
    marginBottom: 25,
  },
  medicationItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medicationDetails: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  medicationInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  medicationDates: {
    fontSize: 14,
    color: '#666',
  },
  medicationActions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  editButtonText: {
    color: 'white',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 8,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
  },
  medicationForm: {
    backgroundColor: '#f8f8f855',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  addMedicationButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  addMedicationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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