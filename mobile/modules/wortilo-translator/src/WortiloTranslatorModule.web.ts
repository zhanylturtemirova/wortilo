import { registerWebModule, NativeModule } from 'expo';

class WortiloTranslatorModule extends NativeModule<{}> {}

export default registerWebModule(WortiloTranslatorModule, 'WortiloTranslatorModule');
