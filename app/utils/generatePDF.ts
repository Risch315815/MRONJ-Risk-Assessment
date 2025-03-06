import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Platform, Alert } from 'react-native';
import { PatientData } from '../store/patientData';
import { assessRisk } from './riskAssessment';

interface MedicationRisk {
  drugName: string;
  riskPercentage: number;
}

// Function to get medication-specific educational content
const getMedicationEducationContent = (patientData: PatientData) => {
  let content = '';
  
  // Add drug-specific information for each medication
  if (patientData.medications.length > 0) {
    patientData.medications.forEach(med => {
      if (med.drugName.includes('Denosumab')) {
        content += `
          <div class="medication-info">
            <h4>${med.drugName}</h4>
            <p>單株抗體藥物，透過抑制RANK-L蛋白來減少骨質流失。與雙磷酸鹽類藥物不同，停藥後效果會較快消失。</p>
            ${med.indication === '骨質疏鬆' ? 
              '<p>用於骨質疏鬆時，MRONJ風險約為0.01-0.1%。</p>' : 
              '<p>用於惡性腫瘤時，MRONJ風險約為1-2%。</p>'
            }
          </div>
        `;
      } else if (med.drugName.includes('Zoledronate')) {
        content += `
          <div class="medication-info">
            <h4>${med.drugName}</h4>
            <p>效力最強的靜脈注射型雙磷酸鹽藥物，主要用於治療癌症骨轉移、高血鈣症和骨質疏鬆。</p>
            ${med.indication === '骨質疏鬆' ? 
              '<p>用於骨質疏鬆時，MRONJ風險約為0.017%。</p>' : 
              '<p>用於惡性腫瘤時，MRONJ風險約為1-10%。</p>'
            }
            <p>在體內可能存留超過10年。</p>
          </div>
        `;
      } else if (med.drugName.includes('Alendronate')) {
        content += `
          <div class="medication-info">
            <h4>${med.drugName}</h4>
            <p>最常見的口服雙磷酸鹽藥物，主要用於治療和預防骨質疏鬆。</p>
            <p>長期使用（大於4年）時MRONJ風險約為0.05-0.2%。</p>
            <p>服用時需搭配全杯水直立服用，並在服藥後至少30分鐘內保持直立姿勢。</p>
          </div>
        `;
      } else {
        content += `
          <div class="medication-info">
            <h4>${med.drugName}</h4>
            <p>屬於${med.administrationRoute === '口服' ? '口服' : '注射'}型藥物，用於${med.indication}。</p>
            <p>使用此類藥物可能增加發生顎骨壞死的風險，特別是進行牙科手術時。</p>
          </div>
        `;
      }
    });
  } else if (patientData.hasAntiresorptiveMed && patientData.drugName) {
    // Fallback to single medication for backward compatibility
    const drugName = patientData.drugName;
    if (drugName.includes('Denosumab')) {
      content += `
        <div class="medication-info">
          <h4>${drugName}</h4>
          <p>單株抗體藥物，透過抑制RANK-L蛋白來減少骨質流失。與雙磷酸鹽類藥物不同，停藥後效果會較快消失。</p>
          ${patientData.indication === '骨質疏鬆' ? 
            '<p>用於骨質疏鬆時，MRONJ風險約為0.01-0.1%。</p>' : 
            '<p>用於惡性腫瘤時，MRONJ風險約為1-2%。</p>'
          }
        </div>
      `;
    } else if (drugName.includes('Zoledronate')) {
      content += `
        <div class="medication-info">
          <h4>${drugName}</h4>
          <p>效力最強的靜脈注射型雙磷酸鹽藥物，主要用於治療癌症骨轉移、高血鈣症和骨質疏鬆。</p>
          ${patientData.indication === '骨質疏鬆' ? 
            '<p>用於骨質疏鬆時，MRONJ風險約為0.017%。</p>' : 
            '<p>用於惡性腫瘤時，MRONJ風險約為1-10%。</p>'
          }
          <p>在體內可能存留超過10年。</p>
        </div>
      `;
    }
  }
  
  return content;
};

// Function to get risk factor explanations
const getRiskFactorExplanations = (patientData: PatientData) => {
  const riskFactors = [];
  
  if (patientData.diabetes) {
    riskFactors.push('<li><strong>控制不佳之糖尿病</strong>: 糖化血色素(HbA1c)≥7.0%的糖尿病患者，其骨骼的血液供應和癒合能力可能受損，增加MRONJ風險約1.7倍。</li>');
  }
  
  if (patientData.steroidUse) {
    riskFactors.push('<li><strong>長期類固醇使用</strong>: 類固醇可能減緩骨骼癒合和抑制免疫系統，增加MRONJ風險約1.4倍。</li>');
  }
  
  if (patientData.anemia) {
    riskFactors.push('<li><strong>貧血</strong>: 血紅素低於10 g/dL的貧血可能降低組織氧合作用，增加MRONJ風險約1.3倍。</li>');
  }
  
  if (patientData.heavySmoker) {
    riskFactors.push('<li><strong>重度吸煙</strong>: 每天超過10支煙的吸煙習慣可能減少骨骼血液供應，增加MRONJ風險約1.3倍。</li>');
  }
  
  if (patientData.periodontalIssues) {
    riskFactors.push('<li><strong>牙周病或自發性牙痛</strong>: 牙周炎症是MRONJ的重要觸發因素，增加風險約1.5倍。</li>');
  }
  
  if (patientData.isObese) {
    riskFactors.push('<li><strong>肥胖</strong>: BMI大於30的肥胖可能增加全身性發炎反應，對骨骼癒合產生負面影響。</li>');
  }
  
  return riskFactors.length > 0 ? 
    `<div class="risk-factors"><h3>您的個人風險因素</h3><ul>${riskFactors.join('')}</ul></div>` : 
    '';
};

// Main function to generate HTML content for PDF
const generateHTML = (patientData: PatientData) => {
  const riskAssessments = assessRisk(patientData);
  
  // Format date as yyyy年mm月dd日
  const today = new Date();
  const formattedDate = `${today.getFullYear()}年${(today.getMonth() + 1).toString().padStart(2, '0')}月${today.getDate().toString().padStart(2, '0')}日`;
  
  // Format birth date
  const birthDate = `${patientData.birthYear}年${patientData.birthMonth}月${patientData.birthDay}日`;
  
  // Use stored values
  const bmi = patientData.bmi || 0;
  const isObese = patientData.isObese;
  const age = patientData.age || 0;
  
  // Get medication-specific education content
  const medicationEducationContent = getMedicationEducationContent(patientData);
  
  // Get risk factor explanations
  const riskFactorExplanations = getRiskFactorExplanations(patientData);

  return `
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: sans-serif; padding: 20px; }
          h1 { color: #007AFF; text-align: center; }
          h2 { color: #333; margin-top: 25px; }
          h3 { color: #555; margin-top: 20px; }
          h4 { color: #007AFF; margin-bottom: 5px; }
          .section { margin: 20px 0; }
          .assessment { 
            border: 1px solid #ccc; 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 5px;
          }
          .risk-high { color: #FF3B30; }
          .risk-medium { color: #FF9500; }
          .risk-low { color: #34C759; }
          .physical-info {
            background-color: #f8f8f8;
            padding: 10px;
            border-radius: 5px;
          }
          .page-break {
            page-break-before: always;
          }
          .medication-info {
            background-color: #f0f7ff;
            padding: 12px;
            border-radius: 5px;
            margin: 10px 0;
          }
          .risk-factors {
            background-color: #fff9f0;
            padding: 12px;
            border-radius: 5px;
            margin: 15px 0;
          }
          .education-section {
            background-color: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .citation {
            font-size: 12px;
            color: #666;
            margin-top: 8px;
            font-style: italic;
          }
          .citations-section {
            margin-top: 30px;
            padding-top: 10px;
            border-top: 1px solid #ddd;
          }
          .citations-section h3 {
            font-size: 14px;
            color: #555;
          }
          .citations-section ol {
            font-size: 12px;
            padding-left: 20px;
          }
          .warning {
            background-color: #ffeaea;
            color: #d00;
            padding: 10px;
            border-radius: 5px;
            margin: 10px 0;
            font-weight: bold;
          }
          .medication-list {
            margin: 10px 0;
          }
          .medication-item {
            background-color: #f8f8f8;
            padding: 10px;
            margin-bottom: 8px;
            border-radius: 5px;
          }
          .privacy-policy {
            margin: 20px 0;
            line-height: 1.6;
          }
          .privacy-policy h3 {
            color: #333;
            margin-top: 25px;
            margin-bottom: 15px;
            font-size: 18px;
          }
          .privacy-policy p {
            margin: 10px 0;
            text-align: justify;
          }
          .privacy-policy ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .privacy-policy li {
            margin: 5px 0;
          }
          .privacy-policy .section-title {
            font-weight: bold;
            margin-top: 15px;
          }
        </style>
      </head>
      <body>
        <h1>MRONJ風險評估報告</h1>
        
        <p>評估日期: ${formattedDate}</p>

        <div class="section">
          <h2>基本資料</h2>
          <p>姓名: ${patientData.name || '未填寫'}</p>
          <p>出生日期: ${birthDate}</p>
          <p>年齡: ${age}歲</p>
          <p>身分證字號: ${patientData.idNumber || '未填寫'}</p>
          <p>性別: ${patientData.gender || '未填寫'}</p>
          
          ${patientData.gender === '跨性別' ? `
            <p>跨性別類型: ${patientData.transgenderType}</p>
            <p>荷爾蒙治療: ${patientData.hasHormoneTherapy ? '有' : '無'}</p>
            ${patientData.hasHormoneTherapy ? `<p>治療時間: ${patientData.hormoneTherapyDuration}</p>` : ''}
          ` : ''}

          <div class="physical-info">
            <h3>身體資訊</h3>
            <p>身高: ${patientData.height} 公分</p>
            <p>體重: ${patientData.weight} 公斤</p>
            <p>BMI: ${bmi.toFixed(1)}${isObese ? ' (肥胖)' : ''}</p>
          </div>
        </div>

        <div class="section">
          <h2>病史資料</h2>
          <p>全身性疾病: ${patientData.systemicDiseases.length > 0 ? patientData.systemicDiseases.join('、') : '無'}</p>
          <p>放射治療病史: ${patientData.hasRadiotherapy ? '有' : '無'}</p>
          ${patientData.hasRadiotherapy ? `<p>詳情: ${patientData.radiotherapyDetails}</p>` : ''}
          <p>腫瘤病史: ${patientData.hasCancer ? '有' : '無'}</p>
          ${patientData.hasCancer ? `<p>詳情: ${patientData.cancerHistory}</p>` : ''}
          <p>其他病史: ${patientData.otherConditions || '無'}</p>
          
          <h3>MRONJ特定風險因素</h3>
          <p>長期類固醇使用: ${patientData.steroidUse ? '是' : '否'}</p>
          <p>糖尿病: ${patientData.diabetes ? '是' : '否'}</p>
          <p>貧血: ${patientData.anemia ? '是' : '否'}</p>
          <p>重度吸煙者: ${patientData.heavySmoker ? '是' : '否'}</p>
          <p>牙周病或自發性牙痛: ${patientData.periodontalIssues ? '是' : '否'}</p>
        </div>

        <div class="section">
          <h2>用藥紀錄</h2>
          ${patientData.hasAntiresorptiveMed ? 
            patientData.medications.length > 0 ? 
              `<div class="medication-list">
                ${patientData.medications.map((med, index) => `
                  <div class="medication-item">
                    <p><strong>藥物 ${index+1}:</strong> ${med.drugName}</p>
                    <p>使用方式: ${med.administrationRoute}</p>
                    <p>使用原因: ${med.indication}</p>
                    <p>開始時間: ${med.startYear}年${med.startMonth}月</p>
                    <p>使用頻率: ${med.frequency}</p>
                    ${med.isStopped ? 
                      `<p>停藥時間: ${med.stopYear}年${med.stopMonth}月</p>` : 
                      '<p>目前持續使用中</p>'
                    }
                    <p>使用期間: ${med.durationMonths ? `約${med.durationMonths}個月` : '計算中'}</p>
                  </div>
                `).join('')}
              </div>`
              : 
              `<p>藥物名稱: ${patientData.drugName}</p>
              <p>使用方式: ${patientData.administrationRoute}</p>
              <p>使用原因: ${patientData.indication}</p>
              <p>開始時間: ${patientData.startYear}年${patientData.startMonth}月</p>
              <p>使用頻率: ${patientData.frequency}</p>
              ${patientData.isStopped ? 
                `<p>停藥時間: ${patientData.stopYear}年${patientData.stopMonth}月</p>` : 
                '<p>目前持續使用中</p>'
              }`
            : '<p>無使用相關藥物</p>'
          }
        </div>

        <div class="page-break"></div>
        <div class="section">
          <h2>風險評估結果</h2>
          ${riskAssessments.map(assessment => `
            <div class="assessment">
              <h3>${assessment.procedure}</h3>
              <p class="risk-${assessment.riskLevel === '高風險' ? 'high' : 
                            assessment.riskLevel === '中度風險' ? 'medium' : 'low'}">
                風險程度: ${assessment.riskLevel}
              </p>
              ${assessment.medicationContributions ? 
                `<p>藥物風險貢獻:</p>
                <ul>
                  ${assessment.medicationContributions.map(med => 
                    `<li>${med.drugName}: ${med.riskPercentage.toFixed(2)}%</li>`
                  ).join('')}
                </ul>` : ''
              }
              <p>建議: ${assessment.recommendation}</p>
              ${assessment.procedure === '拔牙' && patientData.periodontalIssues ? 
                `<p class="warning">警告：您有牙周炎症問題，這會顯著增加MRONJ風險。建議先治療牙周疾病再考慮手術。</p>` : ''
              }
            </div>
          `).join('')}
          
          ${riskFactorExplanations}
          
          <div class="citations-section">
            <h3>學術文獻參考</h3>
            <ol>
              ${Array.from(new Set(riskAssessments.flatMap(a => a.citations || []))).map(citation => 
                `<li>${citation}</li>`
              ).join('')}
              <li>Ruggiero SL, et al. American Association of Oral and Maxillofacial Surgeons position paper on medication-related osteonecrosis of the jaw—2022 update. J Oral Maxillofac Surg. 2022;80(5):920-943.</li>
            </ol>
          </div>
        </div>

        <div class="page-break"></div>
        <div class="section">
          <h2>藥物相關性顎骨壞死症 (MRONJ) 衛教資訊</h2>
          
          <div class="education-section">
            <h3>什麼是MRONJ?</h3>
            <p>藥物相關性顎骨壞死症 (Medication-Related Osteonecrosis of the Jaw, MRONJ) 是一種罕見但嚴重的副作用，可能發生在服用特定類型藥物的患者。這些藥物主要用於治療骨質疏鬆症、多發性骨髓瘤、骨轉移等疾病。</p>
            
            <p>依照美國口腔顎面外科學會 (AAOMS) 2022年的定義，MRONJ需符合以下條件：</p>
            <ol>
              <li>正在或曾經使用抗骨質再吸收藥物或抗血管新生藥物</li>
              <li>暴露的顎骨或可經由口內或口外瘺管探測到的顎骨病灶持續超過8週</li>
              <li>無頭頸部放射治療病史或無明確的顎骨轉移</li>
            </ol>
          </div>
          
          ${medicationEducationContent}
          
          <div class="education-section">
            <h3>如何降低風險?</h3>
            <ul>
              <li><strong>維持良好口腔衛生</strong>：每日刷牙兩次、使用牙線、定期洗牙</li>
              <li><strong>定期牙科檢查</strong>：至少每六個月一次</li>
              <li><strong>告知您的牙醫</strong>：任何牙科治療前都要告知正在使用的藥物</li>
              <li><strong>避免不必要的侵入性牙科手術</strong>：尤其是在高風險患者</li>
              <li><strong>戒菸</strong>：吸煙會增加MRONJ風險</li>
              <li><strong>妥善控制慢性疾病</strong>：如糖尿病</li>
            </ul>
          </div>
          
          <div class="education-section">
            <h3>牙醫師的角色</h3>
            <p>在MRONJ的預防和管理中，牙醫師扮演著關鍵角色：</p>
            <ul>
              <li>識別高風險患者並提供個性化的預防策略</li>
              <li>在開始抗骨質再吸收藥物治療前進行全面的口腔評估和必要治療</li>
              <li>為高風險患者設計適當的牙科治療計畫</li>
              <li>與處方抗骨質再吸收藥物的醫師保持良好溝通</li>
            </ul>
            <p>若您需要牙科手術，牙醫師可能會與您的主治醫師討論是否需要暫停用藥（藥物假期）。</p>
          </div>
          
          <div class="education-section">
            <h3>需要注意的徵兆</h3>
            <p>若您出現以下症狀，請立即就醫：</p>
            <ul>
              <li>口腔疼痛或腫脹</li>
              <li>牙齦紅腫或出血</li>
              <li>口腔中有暴露的骨頭</li>
              <li>牙齒鬆動</li>
              <li>口臭</li>
              <li>下巴麻木或沉重感</li>
            </ul>
          </div>
        </div>

        <div class="page-break"></div>
        <div class="section privacy-policy">
          <h2>隱私權政策與聲明</h2>
          
          <p>本隱私權政策（以下稱「本政策」）適用於您使用本應用程式所提供的各項功能與服務。請您在使用前，務必詳細閱讀並瞭解本政策的內容。</p>

          <h3>一、蒐集個人資料之目的與範圍</h3>
          
          <p class="section-title">蒐集之目的</p>
          <p>本應用程式旨在協助使用者進行「藥物相關性顎骨失活 (MRONJ) 風險評估」，讓使用者及其醫護人員能更好地掌握口腔健康相關資訊。<br>
          您在本應用程式所提供的個人資訊（包括但不限於姓名、出生年月日、身分證字號、病史、用藥紀錄），均僅作為風險評估及生成報告之用。</p>

          <p class="section-title">蒐集之範圍</p>
          <p>為提供評估功能，本應用程式可能在您自願提供時收集下列個人或敏感性資訊：</p>
          <ul>
            <li>基本身分資訊：姓名、出生年月日、性別、身分證字號等。</li>
            <li>健康相關資訊：病史（如系統性疾病、放射治療紀錄等）、用藥紀錄、近期牙科治療或其他醫療資訊。</li>
          </ul>
          <p>若您不願意提供上述資訊，可能無法使用本應用程式的部分或全部功能。</p>

          <p class="section-title">資料蒐集方式</p>
          <p>您在本應用程式手動輸入；<br>
          本應用程式不會自動抓取裝置內其他應用程式或檔案的資料，除非您主動授權或選擇上傳。</p>
          
          <h3>二、個人資料之使用方式</h3>

          <p class="section-title">本地儲存，不上傳伺服器</p>
          <p>本應用程式所有輸入之個人資料皆儲存在您使用的手機（裝置）本地端，不會上傳至任何遠端伺服器或第三方服務。
          產生之 PDF 或報告檔案亦儲存在本機，如您選擇分享、上傳或寄送該檔案予第三方（例如醫護人員），則該行為為您個人自行決策，本應用程式不介入該傳輸過程。</p>

          <p class="section-title">用於顎骨失活風險評估與報告生成</p>
          <p>您填寫之個人資料，將由本應用程式離線運算並生成相關評估結果或報告。<br>
          本應用程式不會將您的個人資料用於廣告、行銷或其他超出評估目的之用途。</p>

          <p class="section-title">快取檔與暫存</p>
          <p>在您操作App過程中，系統可能會於本機裝置內產生暫存檔，但這些檔案亦僅儲存在本機且未連網，不會被自動上傳。
          當您刪除本應用程式時，相關快取檔案同時被移除。</p>

          <h3>三、個人資料之保存與安全</h3>

          <p class="section-title">資料保存期間</p>
          <p>您的個人資料僅於您安裝並使用本應用程式期間保存於本機；若您刪除本應用程式或手動刪除PDF報告檔案，則該資料不再保留於應用程式中。
          本應用程式不提供遠端備份功能，也不會主動將資料複製至任何外部伺服器。</p>

          <p class="section-title">資料安全措施</p>
          <p>本應用程式透過裝置本地端儲存方式來保護您的資料安全，除非他人直接取得您的裝置控制權或您自行分享檔案，否則第三方無法存取。
          使用者應自行做好手機或平板等裝置的安全防護，如設定解鎖密碼、啟用加密或遠端抹除功能。</p>

          <h3>四、使用者權利</h3>

          <p class="section-title">查詢、更正與刪除</p>
          <p>因所有資料僅儲存於您個人裝置中，本應用程式並無遠端伺服器可供查詢；如欲檢視或更改您先前輸入的資訊，可直接於應用程式介面中進行修改。
          若您不再需要此資訊，您可直接刪除本應用程式，或於檔案管理中刪除已生成的PDF報告，即可達到移除資料之效果。<br>
          若您欲刪除所有資料，請直接刪除本應用程式，或於檔案管理中刪除所有與本應用程式相關的本地端資料（含快取、使用者紀錄）。</p>

          <p class="section-title">撤回同意</p>
          <p>您可隨時停止使用本應用程式並移除相關檔案。當您刪除應用程式後，所有與本應用程式相關的本地端資料（含快取、使用者紀錄）皆會一併被移除。</p>

          <p class="section-title">跨境傳輸</p>
          <p>由於本應用程式不做任何雲端傳輸，不涉及跨境傳輸；若您自行透過電子郵件或其他網路服務傳送PDF檔案給海外對象，請自行留意該過程的資訊安全。</p>

          <h3>五、第三方分享與連結</h3>

          <p class="section-title">第三方服務</p>
          <p>本應用程式目前不整合任何廣告、第三方API或分析工具；如日後需新增，會在更新版本時明確告知並徵得您的同意。</p>

          <p class="section-title">外部連結</p>
          <p>本應用程式可能提供至專業醫學網站或其他資源連結；該連結並非本應用程式所經營，請您留意其隱私權政策與使用條款。</p>

          <h3>六、法律遵循</h3>

          <p class="section-title">個人資料保護法</p>
          <p>本應用程式依據《個人資料保護法》與其他相關法規，採取必要措施保障您的個人資料；若有違反法律之情事，本應用程式將依規定負起相應法律責任。</p>

          <p class="section-title">醫療相關法規</p>
          <p>本應用程式僅為提供「藥物相關性顎骨失活 (MRONJ) 風險評估」之輔助工具，不做診斷、治療或處方之用途，亦不涉及醫療行為；若您有任何身體不適或疑慮，應至醫療機構就診。</p>

          <h3>七、政策更新</h3>

          <p>本應用程式可能因服務內容或法規要求而適時修改本政策，並於應用程式內或更新版本發佈時公告。請您隨時留意，若對更新內容有疑問或不同意，可停止使用並移除應用程式。</p>

          <p>當本政策有重大變更時，我們會盡可能以彈窗或明顯訊息告知您。</p>

          <h3>八、聯絡方式</h3>

          <p>若您對本政策有任何問題、建議或欲行使查詢、更正、刪除等權利，請透過以下方式與我們聯繫：</p>
          <p>Email: JoeBingDDS0517@gmail.com</p>
          <p>聯絡人/負責人: 徐振傑</p>


          <h3>九、使用者同意</h3>
          <p>在您繼續使用本應用程式前，請確認已充分理解並同意本政策所述之所有條款。若您不同意，請立即停止使用並刪除本應用程式。</p>
        </div>
      </body>
    </html>
  `;
};

export const generateAndSavePDF = async (patientData: PatientData) => {
  try {
    // Generate HTML content
    const htmlContent = generateHTML(patientData);
    
    // Generate PDF file
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false
    });

    const pdfName = `MRONJ風險評估報告_${patientData.name}_${new Date().getTime()}.pdf`;

    if (Platform.OS === 'android') {
      // For Android: Use sharing
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: '儲存評估報告',
          UTI: 'com.adobe.pdf'
        });
      }
    } else {
      // For iOS: Save to app's documents directory
      const savePath = `${FileSystem.documentDirectory}${pdfName}`;
      await FileSystem.copyAsync({
        from: uri,
        to: savePath
      });
      Alert.alert(
        '儲存成功',
        `報告已儲存至您的裝置\n檔案名稱: ${pdfName}\n位置: 我的檔案/Documents`
      );
    }

    // Clean up the temporary file
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch (error) {
    console.error('Error generating PDF:', error);
    Alert.alert('錯誤', '儲存報告時發生錯誤');
    throw error;
  }
}; 