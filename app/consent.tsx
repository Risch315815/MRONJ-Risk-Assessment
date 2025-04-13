import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import Checkbox from 'expo-checkbox';

export default function Consent() {
  const [isChecked, setIsChecked] = useState(false);

  const handleNext = () => {
    if (isChecked) {
      router.push('/patient-info');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>知情同意書</Text>
        
        <Text style={styles.greeting}>親愛的使用者，您好：</Text>
        <Text style={styles.introText}>
          感謝您使用本應用程式。為提供顎骨失活風險評估功能，本應用程式需要您填寫包含個人敏感資訊（如姓名、出生年月日、病史、用藥紀錄）在內的資料。為保障您的權益，請您在使用前仔細閱讀並同意以下內容：
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. 蒐集目的與使用方式</Text>
          <Text style={styles.sectionText}>
            本應用程式僅在您的裝置本地端暫存並使用您所填寫之個人資料，並未上傳至任何伺服器或第三方服務。{'\n'}
            所蒐集之資料僅用於進行藥物相關性顎骨失活（MRONJ）風險估算與報告生成，並不作他用。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. 資料儲存與安全</Text>
          <Text style={styles.sectionText}>
            您的個人資料（含可能的PDF檔案）僅儲存於您使用之手機裝置本地端。除非第三方直接取得手機控制權，否則無法存取或外流。{'\n'}
            一旦您刪除本App或手動刪除所生成之PDF，本應用程式所蒐集之個人資料與快取檔案亦會同步被移除，無需額外程序。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. 使用者權利</Text>
          <Text style={styles.sectionText}>
            您可隨時停止填寫並退出本應用程式；若已提交資料而欲撤回，您可直接刪除應用程式與PDF檔案，即可達成資料清除。{'\n'}
            本應用程式不會自行備份任何使用者資料，故一旦刪除後將無法復原。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. 法律依據</Text>
          <Text style={styles.sectionText}>
            本應用程式依照《個人資料保護法》及相關法令，落實資料最小化原則與安全措施。{'\n'}
            若您有任何疑慮或想瞭解更多，請參考本應用程式「隱私權聲明」或聯絡開發者。
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. 同意聲明</Text>
          <Text style={styles.sectionText}>
            我已閱讀並充分了解本App蒐集與使用個人資料的目的、範圍及方式；並明白我可隨時自行刪除應用程式與PDF檔案，以終止對我個人資料的使用。{'\n'}
            我同意並自願提供上述個人資料給本應用程式進行風險評估。
          </Text>
        </View>

        <View style={styles.checkboxContainer}>
          <Checkbox
            value={isChecked}
            onValueChange={setIsChecked}
            color={isChecked ? '#007AFF' : undefined}
          />
          <Text style={styles.checkboxLabel}>我已閱讀並同意以上內容</Text>
        </View>

        <TouchableOpacity 
          style={[styles.button, !isChecked && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!isChecked}
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
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  greeting: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
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