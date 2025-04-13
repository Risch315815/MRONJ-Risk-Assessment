import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { router } from 'expo-router';
import { usePatientStore } from './store/patientData';
import { assessRisk } from './utils/riskAssessment';
import { generateAndSavePDF } from './utils/generatePDF';

export default function RiskAssessment() {
  const { patientData } = usePatientStore();
  const riskAssessments = assessRisk(patientData);
  const [selectedProcedure, setSelectedProcedure] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Check if user is about to start medication (not currently using but plans to)
  const isAboutToStartMedication = !patientData.hasAntiresorptiveMed && 
    patientData.medicationStatus === '過去未曾使用，即將開始使用';

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case '高風險': return '#FF3B30';
      case '中度風險': return '#FF9500';
      case '低風險': return '#34C759';
      default: return '#000000';
    }
  };

  const handleGeneratePDF = async () => {
    try {
      await generateAndSavePDF(patientData);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }
  };

  // Dental evaluation suggestions before starting medication
  const preStartSuggestions = [
    {
      title: '拔除不可修復的牙齒',
      description: '在開始抗骨質再吸收藥物治療前，應評估所有不可修復的牙齒並進行拔除。這樣可以避免日後在藥物治療期間進行侵入性牙科手術。',
      priority: '高優先'
    },
    {
      title: '治療牙周疾病',
      description: '牙周炎症是MRONJ的重要風險因素。在開始藥物治療前，應治療任何活動性牙周疾病，並建立良好的口腔衛生習慣。',
      priority: '高優先'
    },
    {
      title: '完成必要的根管治療',
      description: '檢查任何有症狀的牙齒或需要根管治療的牙齒，並在開始藥物治療前完成治療。',
      priority: '中優先'
    },
    {
      title: '修復有問題的假牙',
      description: '檢查並調整任何磨損過度的假牙或不適合的義齒，以防止口腔黏膜損傷，這可能成為骨暴露的起始點。',
      priority: '中優先'
    },
    {
      title: '全面口腔檢查',
      description: '進行全口牙科X光檢查，評估是否有隱藏的牙科問題，如囊腫、病灶或阻生牙等。',
      priority: '標準'
    },
    {
      title: '制定長期口腔保健計劃',
      description: '與牙醫討論並制定長期的口腔健康維護計劃，包括定期檢查、專業清潔的頻率以及優化居家口腔衛生的方法。',
      priority: '標準'
    }
  ];

  // Detailed treatment suggestions based on procedure and risk level
  const dentalTreatmentSuggestions = {
    '非侵入性治療': {
      '低風險': {
        title: '標準非侵入性治療建議',
        steps: [
          '可進行常規的非侵入性治療，如洗牙、填補齲齒、一般牙科檢查等',
          '維持良好的口腔衛生習慣',
          '每3-6個月定期口腔檢查',
          '使用含氟牙膏和抗菌漱口水'
        ]
      },
      '中度風險': {
        title: '中度風險非侵入性治療注意事項',
        steps: [
          '可進行常規的非侵入性治療，但需謹慎操作，避免刺激牙齦組織',
          '可能需要在治療前使用抗菌漱口水（如0.12%氯己定）',
          '更頻繁的定期檢查（每3個月一次）'
        ]
      },
      '高風險': {
        title: '高風險非侵入性治療特殊考量',
        steps: [
          '仍可進行非侵入性治療，但需更謹慎',
          '考慮在治療前後使用抗生素漱口水或口服抗生素',
          '採用更保守的治療方式',
          '高度重視口腔衛生教育，建議每2-3個月進行專業口腔清潔',
          '考慮與處方抗骨質再吸收藥物的醫師協商治療計畫'
        ]
      }
    },
    '根管治療': {
      '低風險': {
        title: '低風險根管治療建議',
        steps: [
          '可常規進行根管治療',
          '注意避免器械超出根尖',
          '良好的根管封填至根尖處',
          '正常的術後照顧和觀察'
        ]
      },
      '中度風險': {
        title: '中度風險根管治療注意事項',
        steps: [
          '可進行根管治療，但需謹慎操作',
          '謹慎控制工作長度，避免器械超出根尖',
          '考慮使用較溫和的根管沖洗液',
          '考慮在治療前使用抗菌漱口水或抗生素預防',
          '治療期間避免使用強烈的根管沖洗劑如高濃度次氯酸鈉',
          '術後密切觀察'
        ]
      },
      '高風險': {
        title: '高風險根管治療特殊考量',
        steps: [
          '需審慎評估根管治療的必要性',
          '考慮術前、術後抗生素預防',
          '極為謹慎的器械操作，嚴格控制工作長度',
          '考慮使用顯微鏡輔助進行精確治療',
          '避免強烈的沖洗劑和藥物',
          '較長時間的術後追蹤'
        ]
      }
    },
    '拔牙': {
      '低風險': {
        title: '低風險拔牙建議',
        steps: [
          '可進行常規拔牙手術',
          '確保最小創傷的手術技術',
          '良好的術後照顧和傷口管理',
          '維持術後口腔衛生',
          '常規術後複診'
        ]
      },
      '中度風險': {
        title: '中度風險拔牙注意事項',
        steps: [
          '建議與開立處方醫師討論短期停藥的可能性',
          '術前考慮抗生素預防（術前1天開始）',
          '使用最小創傷的拔牙技術',
          '拔牙後傷口應縫合，確保骨頭不外露',
          '術後持續使用抗生素（共7-10天）',
          '定期術後複診，確保傷口良好癒合',
          '延長術後追蹤時間'
        ]
      },
      '高風險': {
        title: '高風險拔牙特殊考量',
        steps: [
          '強烈建議與開立處方醫師討論短期停藥及替代治療方案',
          '考慮是否有非手術替代方案（如根管治療後牙冠切除）',
          '若必須拔牙，術前3天開始抗生素預防',
          '極小創傷手術，可能需要翻瓣確保完全縫合',
          '移除任何鋒利骨緣',
          '考慮使用PRF（富血小板纖維蛋白）或其他生物材料促進傷口癒合',
          '嚴密的術後追蹤，至少6個月',
          '術後延長抗生素使用（10-14天）',
          '提供詳細的口腔衛生和注意事項指導'
        ]
      }
    },
    '牙周手術': {
      '低風險': {
        title: '低風險牙周手術建議',
        steps: [
          '可進行常規牙周手術',
          '使用最小創傷技術',
          '良好的傷口管理和術後照顧',
          '定期術後複診'
        ]
      },
      '中度風險': {
        title: '中度風險牙周手術注意事項',
        steps: [
          '與開立處方醫師討論短期停藥的可能性',
          '考慮是否有非手術替代方案',
          '術前抗生素預防（術前1天開始）',
          '使用最小創傷技術和適當的翻瓣設計',
          '確保手術部位良好的血液供應',
          '縫合時避免張力',
          '延長術後抗生素使用（7-10天）',
          '密切術後追蹤'
        ]
      },
      '高風險': {
        title: '高風險牙周手術特殊考量',
        steps: [
          '強烈建議與處方醫師討論停藥和替代方案',
          '優先考慮非手術牙周治療',
          '若必須手術，術前3天開始抗生素',
          '考慮分階段進行治療，而非一次完成',
          '考慮使用促進傷口癒合的生物材料',
          '術後抗生素治療（10-14天）',
          '提供詳細的術後照顧指南',
          '長期術後追蹤，至少6個月'
        ]
      }
    },
    '植牙': {
      '低風險': {
        title: '低風險植牙建議',
        steps: [
          '可進行常規植牙手術',
          '關注精確的植體位置和最小創傷手術',
          '標準術後照顧和觀察',
          '提醒患者保持良好口腔衛生'
        ]
      },
      '中度風險': {
        title: '中度風險植牙注意事項',
        steps: [
          '建議與開立處方醫師討論短期停藥',
          '考慮替代方案，如固定式或活動式假牙',
          '術前抗生素預防（術前1天開始）',
          '使用最小創傷技術',
          '考慮骨質與植體間的良好初始穩定度',
          '確保手術區域完全縫合，無骨頭暴露',
          '術後抗生素治療（7-10天）',
          '延長植體骨整合時間',
          '密切術後追蹤'
        ]
      },
      '高風險': {
        title: '高風險植牙特殊考量',
        steps: [
          '強烈建議考慮替代方案而非植牙',
          '告知患者MRONJ的高風險，並取得知情同意',
          '若仍選擇植牙，必須與處方醫師充分討論',
          '術前3-5天開始抗生素預防',
          '考慮使用引導式植牙技術以增加精確度',
          '可能需要使用短式植體或減少植體數量',
          '術後延長抗生素使用（14天或更長）',
          '延長癒合期，考慮兩階段植牙流程',
          '提供詳細的術後指導和長期（至少一年）密切追蹤',
          '植體負載前確認良好的骨整合'
        ]
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '高優先': return '#FF3B30';
      case '中優先': return '#FF9500';
      case '標準': return '#34C759';
      default: return '#000000';
    }
  };

  const handleShowDetails = (procedure: string) => {
    setSelectedProcedure(procedure);
    setModalVisible(true);
  };

  const findAssessment = (procedure: string) => {
    return riskAssessments.find(assessment => assessment.procedure === procedure);
  };

  const getTreatmentSuggestion = (procedure: string) => {
    const assessment = findAssessment(procedure);
    if (!assessment) return null;
    
    return dentalTreatmentSuggestions[procedure as keyof typeof dentalTreatmentSuggestions]?.[assessment.riskLevel as keyof (typeof dentalTreatmentSuggestions)['非侵入性治療']];
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {isAboutToStartMedication ? (
          // Show pre-treatment dental evaluation suggestions
          <>
            <Text style={styles.title}>開始使用抗骨質再吸收藥物前的口腔評估建議</Text>
            <Text style={styles.subtitle}>
              根據2022年美國口腔顎面外科學會(AAOMS)指南，在開始抗骨質再吸收藥物治療前，建議您進行以下口腔評估和治療：
            </Text>
            
            {preStartSuggestions.map((suggestion, index) => (
              <View key={index} style={styles.assessmentCard}>
                <Text style={styles.procedureTitle}>{suggestion.title}</Text>
                <View style={[
                  styles.riskBadge,
                  { backgroundColor: getPriorityColor(suggestion.priority) }
                ]}>
                  <Text style={styles.riskText}>{suggestion.priority}</Text>
                </View>
                <Text style={styles.recommendation}>{suggestion.description}</Text>
              </View>
            ))}
            
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>重要提醒</Text>
              <Text style={styles.infoText}>
                研究顯示，在開始抗骨質再吸收藥物治療前進行全面的口腔評估和治療，可顯著降低日後發生MRONJ的風險。建議您在開始用藥前至少4週完成所有必要的侵入性牙科治療，讓骨組織有足夠的時間癒合。
              </Text>
            </View>
          </>
        ) : (
          // Show normal risk assessment
          <>
            <Text style={styles.title}>風險評估結果</Text>
            <Text style={styles.subtitle}>
              本評估結果依據您的藥物使用狀況和個人風險因素，提供不同牙科治療的MRONJ風險等級和建議。
              點擊"查看詳細建議"可獲得更具體的治療方式。
            </Text>

            {riskAssessments.map((assessment, index) => (
              <View key={index} style={styles.assessmentCard}>
                <Text style={styles.procedureTitle}>{assessment.procedure}</Text>
                <View style={[
                  styles.riskBadge,
                  { backgroundColor: getRiskColor(assessment.riskLevel) }
                ]}>
                  <Text style={styles.riskText}>{assessment.riskLevel}</Text>
                </View>
                <Text style={styles.recommendation}>{assessment.recommendation}</Text>
                <TouchableOpacity 
                  style={styles.detailsButton}
                  onPress={() => handleShowDetails(assessment.procedure)}
                >
                  <Text style={styles.detailsButtonText}>查看詳細建議</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Modal for detailed treatment suggestions */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    {selectedProcedure} - 詳細治療建議
                  </Text>
                  
                  {selectedProcedure && (
                    <>
                      <Text style={styles.modalSubtitle}>
                        {getTreatmentSuggestion(selectedProcedure)?.title}
                      </Text>
                      
                      <Text style={styles.modalSectionTitle}>治療方式：</Text>
                      {getTreatmentSuggestion(selectedProcedure)?.steps.map((step, index) => (
                        <View key={index} style={styles.stepContainer}>
                          <Text style={styles.stepNumber}>{index + 1}.</Text>
                          <Text style={styles.stepText}>{step}</Text>
                        </View>
                      ))}
                      
                      <Text style={styles.noteText}>
                        註：以上建議僅供參考，實際治療方案應根據醫師臨床判斷調整。
                      </Text>
                      
                      <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setModalVisible(false)}
                      >
                        <Text style={styles.closeButtonText}>關閉</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            </Modal>
          </>
        )}

        <TouchableOpacity 
          style={styles.printButton}
          onPress={handleGeneratePDF}
        >
          <Text style={styles.buttonText}>列印評估報告</Text>
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
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'left',
    marginBottom: 20,
    lineHeight: 22,
    color: '#333',
  },
  assessmentCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  procedureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 10,
  },
  riskText: {
    color: '#fff',
    fontWeight: '600',
  },
  recommendation: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 10,
  },
  infoBox: {
    backgroundColor: '#f0f7ff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 15,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#007AFF',
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  printButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  detailsButton: {
    backgroundColor: '#E0E0E0',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  detailsButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#007AFF',
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 5,
  },
  stepNumber: {
    width: 20,
    fontWeight: '600',
    color: '#007AFF',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  noteText: {
    fontStyle: 'italic',
    fontSize: 14,
    color: '#666',
    marginTop: 15,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 