import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { usePatientStore } from './store/patientData';

export default function MedicationSummary() {
  const { patientData } = usePatientStore();
  
  const handleSubmit = () => {
    // Navigate to pre-assessment page
    router.push('/pre-assessment');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>目前/曾經服用的抗骨吸收藥物</Text>
        
        {patientData.medications.length > 0 ? (
          <View style={styles.medicationListContainer}>
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
                  {med.durationMonths && (
                    <Text style={styles.medicationDuration}>
                      使用期間: 約{med.durationMonths}個月
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noMedicationsContainer}>
            <Text style={styles.noMedicationsText}>沒有添加任何藥物資料</Text>
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => router.push('/medication-history')}
          >
            <Text style={styles.editButtonText}>修改藥物資料</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>送出資料</Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
  },
  medicationListContainer: {
    marginBottom: 30,
  },
  medicationItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  medicationDetails: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  medicationInfo: {
    fontSize: 16,
    color: '#666',
    marginBottom: 6,
  },
  medicationDates: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  medicationDuration: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: 'column',
    gap: 15,
  },
  editButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  noMedicationsContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 30,
  },
  noMedicationsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
}); 