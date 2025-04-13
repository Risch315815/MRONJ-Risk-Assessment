import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Checkbox from 'expo-checkbox';
import { usePatientStore } from './store/patientData';

export default function PreAssessment() {
  const [isChecked, setIsChecked] = useState(false);
  const { patientData } = usePatientStore();

  const handleShowResult = () => {
    if (isChecked) {
      router.push('/risk-assessment');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>重要聲明</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. 非診斷或治療</Text>
          <Text style={styles.sectionText}>
            本應用程式提供的「藥物相關性顎骨失活(MRONJ)風險評估」結果，僅作為風險參考與醫病溝通之輔助工具，並非醫療診斷、治療或處方。{'\n'}
            本應用程式並非經主管機關認定之醫療器材，亦不具備取代臨床醫師或牙醫師專業判斷的功能。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. 專業醫師諮詢</Text>
          <Text style={styles.sectionText}>
            若您有任何顎骨疼痛、口腔不適、或其他疑似症狀，請務必諮詢合格醫師或牙醫師進行實體檢查與正式診斷。{'\n'}
            評估結果僅供您與醫事人員進行進一步討論，最終治療或處置方案應由具專業資格之人員評估後確定。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. 資料蒐集與保護</Text>
          <Text style={styles.sectionText}>
            本應用程式不上傳任何個人或醫療資料至外部伺服器，所有輸入資料僅儲存於本機裝置，並於刪除應用程式時同步移除。{'\n'}
            若您選擇將PDF報告分享給第三方，如醫師、診所，請自行留意通訊方式之安全性。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. 使用風險與自我負責</Text>
          <Text style={styles.sectionText}>
            您瞭解並同意，本應用程式所提供之評估結果可能受到使用者輸入資料正確性、行動裝置環境等因素影響，其結果僅供參考，開發者不承擔使用者自行依賴本應用程式結果而造成之任何損失或責任。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. 軟體更新與版本資訊</Text>
          <Text style={styles.sectionText}>
            開發者保留更新、修改或停止本應用程式之權利，您應持續關注版本更新內容，以獲取更完整或精準的風險評估邏輯。
          </Text>
        </View>

        <View style={styles.checkboxContainer}>
          <Checkbox
            value={isChecked}
            onValueChange={setIsChecked}
            color={isChecked ? '#007AFF' : undefined}
          />
          <Text style={styles.checkboxLabel}>
            我已閱讀並瞭解本聲明，繼續查看評估結果
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, !isChecked && styles.buttonDisabled]}
          onPress={handleShowResult}
          disabled={!isChecked}
        >
          <Text style={styles.buttonText}>查看評估結果</Text>
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
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  sectionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 