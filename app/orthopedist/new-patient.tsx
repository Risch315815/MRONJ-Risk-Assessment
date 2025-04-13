import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';

export default function NewPatient() {
  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    gender: '',
    medicalHistory: '',
  });

  const handleSubmit = () => {
    // TODO: Implement patient data submission
    console.log('Patient Data:', patientData);
    router.push('/orthopedist/patient-list');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>New Patient Registration</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Patient Name</Text>
          <TextInput
            style={styles.input}
            value={patientData.name}
            onChangeText={(text) => setPatientData({ ...patientData, name: text })}
            placeholder="Enter patient name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            value={patientData.age}
            onChangeText={(text) => setPatientData({ ...patientData, age: text })}
            placeholder="Enter age"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <TextInput
            style={styles.input}
            value={patientData.gender}
            onChangeText={(text) => setPatientData({ ...patientData, gender: text })}
            placeholder="Enter gender"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Medical History</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={patientData.medicalHistory}
            onChangeText={(text) => setPatientData({ ...patientData, medicalHistory: text })}
            placeholder="Enter relevant medical history"
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Register Patient</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});