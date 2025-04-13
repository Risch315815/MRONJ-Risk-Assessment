import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';

export default function StartEval() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>知情同意書</Text>

        <View style={styles.section}>
          <Text style={styles.sectionText}>
            本人同意以下事項：{'\n\n'}
            1. 我了解此應用程式的目的是評估MRONJ（藥物相關性顎骨壞死）的風險。{'\n\n'}
            2. 我同意提供我的個人資料，包括但不限於：{'\n'}
            • 姓名{'\n'}
            • 出生日期{'\n'}
            • 身份證字號{'\n'}
            • 病史資料{'\n'}
            • 用藥紀錄{'\n\n'}
            3. 我了解這些資料將用於：{'\n'}
            • 身份驗證{'\n'}
            • 風險評估{'\n'}
            • 產生評估報告{'\n\n'}
            4. 我了解我可以隨時要求刪除我的個人資料。{'\n\n'}
            5. 我確認以上提供的所有資料均為真實且正確。
          </Text>
        </View>

        <Link href="/patient-info" asChild>
          <TouchableOpacity style={styles.agreeButton}>
            <Text style={styles.buttonText}>我已閱讀並同意以上內容</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

// ... styles remain the same 