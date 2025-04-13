import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>MRONJ風險評估</Text>
        
        <Text style={styles.introduction}>
          本應用程式用於評估患者發生藥物相關性顎骨壞死(MRONJ)的風險。{'\n\n'}
          透過收集患者的用藥史和相關病史，我們可以為牙科治療提供風險評估和建議。{'\n\n'}
          在繼續之前，請確認您同意提供相關個人資訊用於風險評估。
        </Text>

        <Link href="/consent" asChild>
          <TouchableOpacity style={styles.agreeButton}>
            <Text style={styles.buttonText}>開始評估</Text>
          </TouchableOpacity>
        </Link>
      </View>
      
      <Text style={styles.version}>版本 1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
    ...(Platform.OS === 'web' ? {
      maxWidth: 800,
      marginHorizontal: 'auto',
      paddingTop: 40,
      paddingBottom: 40,
    } : {})
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
    ...(Platform.OS === 'web' ? {
      maxWidth: 600,
      marginHorizontal: 'auto',
    } : {})
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  introduction: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  agreeButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? {
      cursor: 'pointer',
      ':hover': {
        backgroundColor: '#0062cc',
      }
    } : {})
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  version: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
});
