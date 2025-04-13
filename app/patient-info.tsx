import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import RNPickerSelect from 'react-native-picker-select';
import { usePatientStore } from './store/patientData';

interface PatientInfo {
  name: string;
  birthYear: string;
  birthMonth: string;
  birthDay: string;
  idNumber: string;
  age: number | null;
}

// Generate height options (140cm to 200cm)
const heightOptions = Array.from(
  { length: 61 },
  (_, i) => ({ label: `${140 + i} 公分`, value: (140 + i).toString() })
);

// Generate weight options (30kg to 150kg)
const weightOptions = Array.from(
  { length: 121 },
  (_, i) => ({ label: `${30 + i} 公斤`, value: (30 + i).toString() })
);

// Add this function at the top level
const calculateAge = (year: string, month: string, day: string): number => {
  const birthYear = parseInt(year);
  const birthMonth = parseInt(month);
  const birthDay = parseInt(day);
  const today = new Date();
  let age = today.getFullYear() - birthYear;
  const m = today.getMonth() + 1 - birthMonth;
  if (m < 0 || (m === 0 && today.getDate() < birthDay)) {
    age--;
  }
  return age;
};

export default function PatientInfo() {
  const { updatePatientInfo } = usePatientStore();
  const currentYear = new Date().getFullYear();
  
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '',
    birthYear: currentYear.toString(),
    birthMonth: '1',
    birthDay: '1',
    idNumber: '',
    age: null,
  });

  // Generate year options from 1912 to current year
  const yearOptions = Array.from(
    { length: currentYear - 1911 },
    (_, i) => ({ label: `${1912 + i}年`, value: (1912 + i).toString() })
  ).reverse();

  const monthOptions = Array.from(
    { length: 12 },
    (_, i) => ({ label: `${i + 1}月`, value: (i + 1).toString() })
  );

  const getDaysInMonth = (year: string, month: string) => {
    return new Date(parseInt(year), parseInt(month), 0).getDate();
  };

  const dayOptions = Array.from(
    { length: getDaysInMonth(patientInfo.birthYear, patientInfo.birthMonth) },
    (_, i) => ({ label: `${i + 1}日`, value: (i + 1).toString() })
  );

  // Validate Taiwan ID number format
  const validateTaiwanID = (id: string) => {
    const idRegex = /^[A-Z][12]\d{8}$/;
    return idRegex.test(id);
  };

  const validateFields = () => {
    const errors = [];
    
    if (!patientInfo.name.trim()) errors.push('姓名');
    if (!patientInfo.idNumber.trim()) {
      errors.push('身分證字號');
    } else if (!validateTaiwanID(patientInfo.idNumber.toUpperCase())) {
      Alert.alert('錯誤', '請輸入有效的身分證字號');
      return false;
    }
    
    // Validate birth date
    if (!patientInfo.birthYear || !patientInfo.birthMonth || !patientInfo.birthDay) {
      errors.push('出生日期');
    }
    
    if (errors.length > 0) {
      Alert.alert(
        '請填寫必填項目',
        `以下欄位尚未填寫完整：\n${errors.join('、')}`,
        [{ text: '確定' }]
      );
      return false;
    }
    
    return true;
  };

  const handleSubmit = () => {
    if (!validateFields()) return;
    
    const age = calculateAge(
      patientInfo.birthYear,
      patientInfo.birthMonth,
      patientInfo.birthDay
    );

    updatePatientInfo({
      name: patientInfo.name,
      birthYear: patientInfo.birthYear,
      birthMonth: patientInfo.birthMonth,
      birthDay: patientInfo.birthDay,
      idNumber: patientInfo.idNumber.toUpperCase(),
      age: age,
    });

    router.push('/medical-history');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>身分驗證</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>姓名</Text>
            <TextInput
              style={styles.input}
              value={patientInfo.name}
              onChangeText={(text) => setPatientInfo({ ...patientInfo, name: text })}
              placeholder="請輸入姓名"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>身分證字號</Text>
            <TextInput
              style={styles.input}
              value={patientInfo.idNumber}
              onChangeText={(text) => setPatientInfo({ ...patientInfo, idNumber: text.toUpperCase() })}
              placeholder="請輸入身分證字號"
              autoCapitalize="characters"
              maxLength={10}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>出生日期</Text>
            
            {/* Year picker on first row */}
            <View style={styles.yearPickerContainer}>
              <RNPickerSelect
                value={patientInfo.birthYear}
                onValueChange={(value) => setPatientInfo({ ...patientInfo, birthYear: value })}
                items={yearOptions}
                placeholder={{ label: '年', value: null }}
              />
            </View>

            {/* Month and Day pickers on second row */}
            <View style={styles.monthDayContainer}>
              <View style={[styles.datePickerItem, { flex: 1 }]}>
                <RNPickerSelect
                  value={patientInfo.birthMonth}
                  onValueChange={(value) => setPatientInfo({ ...patientInfo, birthMonth: value })}
                  items={monthOptions}
                  placeholder={{ label: '月', value: null }}
                />
              </View>

              <View style={[styles.datePickerItem, { flex: 1 }]}>
                <RNPickerSelect
                  value={patientInfo.birthDay}
                  onValueChange={(value) => setPatientInfo({ ...patientInfo, birthDay: value })}
                  items={dayOptions}
                  placeholder={{ label: '日', value: null }}
                />
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
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
  input: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
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
  yearPickerContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,  // Add space between year and month/day pickers
  },
  monthDayContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  datePickerItem: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  unitText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 4,
  },
  bmiContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  bmiText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
}); 