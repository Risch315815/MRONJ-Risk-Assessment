import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

// Dummy data for demonstration
const dummyAssessments = [
  {
    id: '1',
    patientName: 'John Doe',
    date: '2024-02-19',
    riskLevel: 'High',
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    date: '2024-02-18',
    riskLevel: 'Low',
  },
];

export default function AssessmentHistory() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assessment History</Text>
      
      <FlatList
        data={dummyAssessments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.assessmentCard}>
            <Text style={styles.patientName}>{item.patientName}</Text>
            <Text style={styles.date}>{item.date}</Text>
            <Text style={[
              styles.riskLevel,
              { color: item.riskLevel === 'High' ? '#FF3B30' : '#34C759' }
            ]}>
              Risk Level: {item.riskLevel}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  assessmentCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  riskLevel: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 5,
  },
}); 