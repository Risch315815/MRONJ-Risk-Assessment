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
  
  // Update the initialization to properly handle both values
  const [medicationStatus, setMedicationStatus] = useState<'使用中/過去曾使用' | '過去未曾使用，即將開始使用' | ''>(
    patientData.medicationStatus === '過去未曾使用，即將開始使用' 
      ? '過去未曾使用，即將開始使用' 
      : '使用中/過去曾使用'
  );
  
  // Initialize medication states with existing values from patientData
  const [futureMedicationPlan, setFutureMedicationPlan] = useState({
    reason: patientData.futureMedicationReason || '',
    drugName: patientData.futureMedicationName || '',
    startYear: patientData.futureMedicationStartYear || '',
    startMonth: patientData.futureMedicationStartMonth || ''
  });

  // Initialize with existing values if editing a medication
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
      title: '雙磷酸鹽類藥物 (口服)',
      medications: [
        { name: 'Alendronate (Fosamax)', route: '口服' },
        { name: 'Risedronate (Actonel)', route: '口服' },
        { name: 'Ibandronate (Boniva)', route: '口服' },
      ]
    },
    {
      title: '雙磷酸鹽類藥物 (注射)',
      medications: [
        { name: 'Zoledronate (Zometa)', route: '注射' },
        { name: 'Zoledronate (Reclast)', route: '注射' },
        { name: 'Pamidronate (Aredia)', route: '注射' },
        { name: 'Ibandronate (Boniva IV)', route: '注射' },
      ]
    },
    {
      title: 'RANK-L 抑制劑',
      medications: [
        { name: 'Denosumab (Prolia)', route: '注射' },
        { name: 'Denosumab (Xgeva)', route: '注射' },
      ]
    },
    {
      title: '單株抗體藥物',
      medications: [
        { name: 'Romosozumab (Evenity)', route: '注射' },
      ]
    }
  ];

  // Add a note about other medications with weaker evidence
  const otherMedicationsNote = `如果有服用以下任一類藥物
  - raloxifene (Evista)
  - teriparatide (Forteo)
  - Bevacizumab
  - Sunitinib
  請諮詢您的醫師評估MRONJ風險。`;

  const handleDrugSelection = (drugName: DrugName, route: '口服' | '注射') => {
    setCurrentMedication({
      ...currentMedication,
      drugName,
      administrationRoute: route
    });
  };

  const handleReasonSelection = (reason: '骨質疏鬆' | '惡性腫瘤/骨轉移' | '多發性骨髓瘤' | '其他') => {
    setCurrentMedication({
      ...currentMedication,
      indication: reason
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

    // Ensure the appropriate flags are set
    updatePatientInfo({
      hasAntiresorptiveMed: true,
      medicationStatus: '使用中/過去曾使用'
    });

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

  // Update the submit handler to check both status values and add current medication
  const handleSubmit = () => {
    // For users with current/past medication use
    if (medicationStatus === '使用中/過去曾使用') {
      // Check if the user has entered medication information (even partially)
      if (currentMedication.drugName) {
        // Validate first
        if (!isValidMedication(currentMedication)) {
          Alert.alert(
            '請完整填寫用藥資訊',
            '藥物名稱、使用原因、開始時間和頻率為必填項目',
            [{ text: '確定' }]
          );
          return;
        }
        
        // Save the current medication before proceeding
        try {
          // Add the medication to the list
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

          // Update general medication flags
          updatePatientInfo({
            hasAntiresorptiveMed: true,
            medicationStatus: '使用中/過去曾使用'
          });
          
          // Navigate to the medication summary page after saving
          router.push('/medication-summary');
          return;
        } catch (error) {
          console.error('Error saving medication:', error);
          Alert.alert(
            '儲存藥物資訊時發生錯誤',
            '請稍後再試',
            [{ text: '確定' }]
          );
          return;
        }
      } else if (patientData.medications.length === 0) {
        // If no medication is being entered AND there are no saved medications
        Alert.alert(
          '未添加藥物',
          '請添加至少一種您正在使用或曾經使用的藥物',
          [{ text: '確定' }]
        );
        return;
      }
      // If there are already medications in the list but no new one being entered, proceed
    }
    
    // For future medication users, ensure their info is saved
    if (medicationStatus === '過去未曾使用，即將開始使用') {
      // Validate and save future medication plan
      if (!futureMedicationPlan.drugName || !futureMedicationPlan.reason || !futureMedicationPlan.startYear || !futureMedicationPlan.startMonth) {
        Alert.alert(
          '請完整填寫藥物計劃',
          '藥物名稱、使用原因和預計開始時間為必填項目',
          [{ text: '確定' }]
        );
        return;
      }
      
      // Save the future medication plan
      updateFutureMedicationPlan();
    }
    
    // Navigate to the medication summary page
    router.push('/medication-summary');
  };

  // Update patientData when medication status changes
  const handleMedicationStatusChange = (status: '使用中/過去曾使用' | '過去未曾使用，即將開始使用') => {
    setMedicationStatus(status);
    if (status === '使用中/過去曾使用') {
      updatePatientInfo({ 
        medicationStatus: status,
        hasAntiresorptiveMed: true 
      });
      
      // Initialize a default drug selection if none is selected
      if (!currentMedication.drugName) {
        const firstDrug = medicationGroups[0].medications[0];
        setCurrentMedication({
          ...currentMedication,
          drugName: firstDrug.name,
          administrationRoute: firstDrug.route
        });
      }
    } else {
      updatePatientInfo({ 
        medicationStatus: status,
        hasAntiresorptiveMed: false 
      });
    }
  };

  // Update future medication plan in patient data store
  const updateFutureMedicationPlan = () => {
    updatePatientInfo({
      futureMedicationReason: futureMedicationPlan.reason,
      futureMedicationName: futureMedicationPlan.drugName,
      futureMedicationStartYear: futureMedicationPlan.startYear,
      futureMedicationStartMonth: futureMedicationPlan.startMonth
    });
  };

  // Update the future medication plan section
  const handleFutureDrugSelection = (drugName: DrugName, route: '口服' | '注射') => {
    setFutureMedicationPlan({
      ...futureMedicationPlan,
      drugName
    });
    updatePatientInfo({ 
      futureMedicationName: drugName,
      futureMedicationRoute: route 
    });
  };

  const handleFutureReasonSelection = (reason: '骨質疏鬆' | '惡性腫瘤/骨轉移' | '多發性骨髓瘤' | '其他') => {
    setFutureMedicationPlan({
      ...futureMedicationPlan,
      reason
    });
    updatePatientInfo({ futureMedicationReason: reason });
  };

  const handleFutureYearChange = (year: string) => {
    setFutureMedicationPlan({
      ...futureMedicationPlan,
      startYear: year
    });
    updatePatientInfo({ futureMedicationStartYear: year });
  };

  const handleFutureMonthChange = (month: string) => {
    setFutureMedicationPlan({
      ...futureMedicationPlan,
      startMonth: month
    });
    updatePatientInfo({ futureMedicationStartMonth: month });
  };

  // Ensure proper initialization of the medicationStatus in useEffect
  useEffect(() => {
    // Initialize medicationStatus from patientData if available
    if (patientData.medicationStatus) {
      setMedicationStatus(patientData.medicationStatus as '使用中/過去曾使用' | '過去未曾使用，即將開始使用');
    } else if (patientData.hasAntiresorptiveMed || patientData.medications.length > 0) {
      // If there's medication data but no explicit status, assume '使用中/過去曾使用'
      setMedicationStatus('使用中/過去曾使用');
      updatePatientInfo({ medicationStatus: '使用中/過去曾使用' });
    }
  }, [patientData.medicationStatus, patientData.hasAntiresorptiveMed, patientData.medications.length]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>用藥紀錄</Text>

        <View style={styles.form}>
          {/* Medication Status Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>是否正在使用或曾經使用骨質疏鬆相關藥物？</Text>
            <View style={styles.radioGroup}>
              {['使用中/過去曾使用', '過去未曾使用，即將開始使用'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.reasonButton,
                    medicationStatus === status && styles.reasonButtonSelected
                  ]}
                  onPress={() => handleMedicationStatusChange(status as '使用中/過去曾使用' | '過去未曾使用，即將開始使用')}
                >
                  <Text style={[
                    styles.reasonText,
                    medicationStatus === status && styles.reasonTextSelected
                  ]}>{status}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Future Medication Plan for patients who will start medication */}
          {medicationStatus === '過去未曾使用，即將開始使用' && (
            <View style={styles.futureMedicationCard}>
              <Text style={styles.subheading}>即將開始使用的藥物計劃</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>使用原因</Text>
                <View style={styles.radioGroup}>
                  {['骨質疏鬆', '多發性骨髓瘤', '惡性腫瘤/骨轉移', '其他'].map((reason) => (
                    <TouchableOpacity
                      key={reason}
                      style={[
                        styles.reasonButton,
                        futureMedicationPlan.reason === reason && styles.reasonButtonSelected
                      ]}
                      onPress={() => handleFutureReasonSelection(reason as '骨質疏鬆' | '惡性腫瘤/骨轉移' | '多發性骨髓瘤' | '其他')}
                    >
                      <Text style={[
                        styles.reasonText,
                        futureMedicationPlan.reason === reason && styles.reasonTextSelected
                      ]}>{reason}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>預計使用的藥物</Text>
                {medicationGroups.map((group, groupIndex) => (
                  <View key={groupIndex} style={styles.medicationGroup}>
                    <Text style={styles.groupTitle}>{group.title}</Text>
                    <View style={styles.medicationsGrid}>
                      {group.medications.map((med, medIndex) => (
                        <TouchableOpacity
                          key={medIndex}
                          style={[
                            styles.medicationButton,
                            futureMedicationPlan.drugName === med.name && styles.medicationButtonSelected
                          ]}
                          onPress={() => handleFutureDrugSelection(med.name, med.route)}
                        >
                          <Text style={[
                            styles.medicationText,
                            futureMedicationPlan.drugName === med.name && styles.medicationTextSelected
                          ]}>{med.name}</Text>
                          <Text style={[
                            styles.routeText,
                            futureMedicationPlan.drugName === med.name && styles.medicationTextSelected
                          ]}>({med.route})</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>預計開始時間</Text>
                <View style={styles.datePickerGroup}>
                  <View style={[styles.pickerContainer, { flex: 1 }]}>
                    <RNPickerSelect
                      value={futureMedicationPlan.startYear}
                      onValueChange={(value) => handleFutureYearChange(value)}
                      items={yearOptions}
                      style={pickerSelectStyles}
                      placeholder={{ label: '年份', value: null }}
                    />
                  </View>
                  <View style={[styles.pickerContainer, { flex: 1 }]}>
                    <RNPickerSelect
                      value={futureMedicationPlan.startMonth}
                      onValueChange={(value) => handleFutureMonthChange(value)}
                      items={monthOptions}
                      style={pickerSelectStyles}
                      placeholder={{ label: '月份', value: null }}
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Existing Current Medication section - only show if status is "使用中/過去曾使用" */}
          {medicationStatus === '使用中/過去曾使用' && (
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

                {/* Note about other medications with weaker evidence */}
                <View style={styles.noteContainer}>
                  <Text style={styles.noteText}>{otherMedicationsNote}</Text>
                  <Text style={styles.disclaimerText}>本應用程式專注於2022年美國口腔顎面外科學會(AAOMS)認可的具有明確MRONJ風險證據的抗骨質再吸收藥物。對於其他藥物，請諮詢您的醫師。</Text>
                </View>

                {/* Usage Details - Always show these sections when "使用中/過去曾使用" is selected */}
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
  noteContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  noteText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#666',
  },
  futureMedicationCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  textInput: {
    padding: 10,
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