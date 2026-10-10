import { NativeModule, requireNativeModule } from 'expo';

declare class WortiloTranslatorModule extends NativeModule<{}> {
  getDownloadedLanguages(): Promise<string[]>;
  downloadLanguage(language: 'en' | 'de' | 'ru'): Promise<void>;
  translate(
    text: string,
    sourceLanguage: 'en' | 'de' | 'ru',
    targetLanguage: 'en' | 'de' | 'ru',
  ): Promise<string>;
}
export default requireNativeModule<WortiloTranslatorModule>(
  'WortiloTranslator',
);
