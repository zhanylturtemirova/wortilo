import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { TranslatorScreen } from './src/screens/TranslatorScreen';
import { useEffect } from 'react';
import { Alert, Button, Platform } from 'react-native';

export default function App() {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    async function checkModels() {
      try {
        const { default: translator } =
          await import('./modules/wortilo-translator/src/WortiloTranslatorModule');

        const languages = await translator.getDownloadedLanguages();
        console.log('Downloaded languages:', languages);
        console.log('translate method:', typeof translator.translate);
        const result = await translator.translate('Mir ist kalt', 'de', 'en');
        console.log('Translation result:', result);
      } catch (error) {
        console.error('Failed to check translation models:', error);
      }
    }

    void checkModels();
  }, []);

  function confirmDownload() {
    console.log('Download button pressed');

    Alert.alert(
      'Download languages?',
      'German and Russian models require approximately 60 MB. Wi-Fi is required.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Download',
          onPress: async () => {
            try {
              const { default: translator } =
                await import('./modules/wortilo-translator/src/WortiloTranslatorModule');

              console.log('Starting German download');
              await translator.downloadLanguage('de');
              console.log('German downloaded');

              await translator.downloadLanguage('ru');
              console.log('Russian downloaded');

              const languages = await translator.getDownloadedLanguages();
              console.log('Downloaded languages:', languages);
              Alert.alert('Ready', 'Language models downloaded.');
            } catch (error) {
              console.error('Model download failed:', error);
              Alert.alert(
                'Download failed',
                'Check your connection and try again.',
              );
            }
          },
        },
      ],
    );
  }
  return (
    <SafeAreaProvider>
      {Platform.OS === 'android' && (
        <SafeAreaView edges={['top']}>
          <Button title="Download languages" onPress={confirmDownload} />
        </SafeAreaView>
      )}
      <TranslatorScreen />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
