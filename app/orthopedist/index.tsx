import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Link } from 'expo-router';

export default function OrthopedistPortal() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Orthopedist Portal</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Patient Management</Text>
        <Link href="/orthopedist/new-patient" style={styles.link}>
          Add New Patient
        </Link>
        <Link href="/orthopedist/patient-list" style={styles.link}>
          View Patient List
        </Link>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Risk Assessment</Text>
        <Link href="/orthopedist/risk-assessment" style={styles.link}>
          New Risk Assessment
        </Link>
        <Link href="/orthopedist/assessment-history" style={styles.link}>
          View Assessment History
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  section: {
    padding: 20,
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  link: {
    fontSize: 16,
    color: '#007AFF',
    padding: 10,
    marginVertical: 5,
  },
}); 