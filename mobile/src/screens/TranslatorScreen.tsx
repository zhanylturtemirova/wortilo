import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LanguagePanel } from '../components/LanguagePanel';
import { themes } from '../theme';

const languages = [
  { code: 'de', name: 'German' },
  { code: 'en', name: 'English' },
  { code: 'ru', name: 'Russian' },
] as const;
type LanguageCode = (typeof languages)[number]['code'];

export function TranslatorScreen() {
  const colors = themes[useColorScheme() === 'dark' ? 'dark' : 'light'];
  const [selected, setSelected] = useState<LanguageCode[]>(['de', 'en', 'ru']);
  const [source, setSource] = useState<LanguageCode>('de');
  const [texts, setTexts] = useState<Record<LanguageCode, string>>({
    de: '',
    en: '',
    ru: '',
  });
  const [isChoosingLanguages, setIsChoosingLanguages] = useState(false);
  const [translationStatus, setTranslationStatus] = useState('');
  const requestVersion = useRef(0);
  const sourceText = texts[source];
  function changeText(code: LanguageCode, value: string) {
    requestVersion.current += 1;
    setSource(code);
    setTexts((previous) => ({ ...previous, [code]: value }));
  }

  function toggleLanguage(code: LanguageCode) {
    requestVersion.current += 1;
    if (!selected.includes(code)) {
      setSelected([...selected, code]);
      return;
    }
    if (selected.length <= 2) return;
    const remaining = selected.filter((language) => language !== code);
    setSelected(remaining);
    if (source === code) setSource(remaining[0]);
    // Keep draft text when hiding a block, so adding it back doesn't lose work.
  }
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const version = ++requestVersion.current;
    const targets = selected.filter((code) => code !== source);
    let cancelled = false;

    const isCurrent = () => !cancelled && version === requestVersion.current;

    const timer = setTimeout(async () => {
      if (!isCurrent()) return;
      setTranslationStatus('');

      if (!sourceText.trim()) {
        setTexts((previous) => {
          const next = { ...previous };
          targets.forEach((code) => {
            next[code] = '';
          });
          return next;
        });
        return;
      }

      setTranslationStatus('Translating…');

      try {
        const { default: translator } =
          await import('../../modules/wortilo-translator/src/WortiloTranslatorModule');

        const results = await Promise.allSettled(
          targets.map((code) => translator.translate(sourceText, source, code)),
        );

        if (!isCurrent()) return;

        setTexts((previous) => {
          const next = { ...previous };

          results.forEach((result, index) => {
            next[targets[index]] =
              result.status === 'fulfilled' ? result.value : '';
          });

          return next;
        });

        const failed = results.some((result) => result.status === 'rejected');
        setTranslationStatus(
          failed ? 'Some translations failed. Check downloaded models.' : '',
        );
      } catch (error) {
        if (!isCurrent()) return;
        console.error('Translation failed:', error);
        setTranslationStatus('Translation unavailable.');
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [sourceText, source, selected]);
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.brand, { color: colors.text }]}>Wortilo</Text>
          <View style={styles.heading}>
            <Text
              accessibilityRole="header"
              style={[styles.title, { color: colors.text }]}
            >
              Translate
            </Text>
            <Text style={[styles.body, { color: colors.muted }]}>
              Type in any language block.
            </Text>
          </View>
          <View style={[styles.notice, { backgroundColor: colors.tint }]}>
            <Text style={[styles.body, { color: colors.text }]}>
              {Platform.OS === 'android'
                ? translationStatus ||
                  'Translation uses downloaded models. Saving is not available yet.'
                : 'Manual entry. Automatic translation is currently available on Android.'}
            </Text>
          </View>

          {selected.map((code) => (
            <LanguagePanel
              key={code}
              language={
                languages.find((language) => language.code === code)!.name
              }
              value={texts[code]}
              isSource={source === code}
              colors={colors}
              onChangeText={(value) => changeText(code, value)}
            />
          ))}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: isChoosingLanguages }}
            onPress={() => setIsChoosingLanguages((previous) => !previous)}
            style={({ pressed }) => [
              styles.button,
              {
                borderColor: colors.border,
                backgroundColor: colors.surface,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={[styles.buttonText, { color: colors.accent }]}>
              {isChoosingLanguages ? 'Done' : '+ Add / remove languages'}
            </Text>
          </Pressable>

          {isChoosingLanguages && (
            <View style={[styles.chooser, { borderColor: colors.border }]}>
              <Text
                accessibilityRole="header"
                style={[styles.body, { color: colors.text }]}
              >
                Choose languages
              </Text>
              {languages.map((language) => {
                const active = selected.includes(language.code);
                const disabled = active && selected.length <= 2;
                return (
                  <Pressable
                    key={language.code}
                    accessibilityRole="button"
                    accessibilityLabel={`${active ? 'Remove' : 'Add'} ${language.name}`}
                    accessibilityState={{ disabled }}
                    disabled={disabled}
                    onPress={() => toggleLanguage(language.code)}
                    style={[styles.languageRow, { borderColor: colors.border }]}
                  >
                    <Text style={[styles.body, { color: colors.text }]}>
                      {language.name}
                    </Text>
                    <Text
                      style={[
                        styles.body,
                        { color: disabled ? colors.muted : colors.accent },
                      ]}
                    >
                      {disabled ? 'Selected' : active ? 'Remove' : '+ Add'}
                    </Text>
                  </Pressable>
                );
              })}
              <Text style={[styles.caption, { color: colors.muted }]}>
                Keep at least two languages. Hidden text is kept until you close
                the app.
              </Text>
            </View>
          )}

          <Pressable
            disabled
            accessibilityRole="button"
            accessibilityState={{ disabled: true }}
            style={[
              styles.button,
              { backgroundColor: colors.tint, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.buttonText, { color: colors.muted }]}>
              Save to flashcards
            </Text>
          </Pressable>
          <Text style={[styles.caption, { color: colors.muted }]}>
            Drafts stay on this screen only. Nothing is saved yet.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    padding: 24,
    gap: 12,
    paddingBottom: 40,
  },
  brand: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  heading: { gap: 8, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '700' },
  body: { fontSize: 14, lineHeight: 21 },
  caption: { fontSize: 12, lineHeight: 18 },
  notice: { padding: 12, borderRadius: 12 },
  button: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  chooser: { padding: 16, borderWidth: 1, borderRadius: 16, gap: 8 },
  languageRow: {
    minHeight: 52,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
});
