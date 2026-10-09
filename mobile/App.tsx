import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TranslatorScreen } from './src/screens/TranslatorScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <TranslatorScreen />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
