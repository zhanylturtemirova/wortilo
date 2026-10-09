import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { Colors } from '../theme';

type Props = {
  language: string;
  value: string;
  isSource: boolean;
  colors: Colors;
  onChangeText: (value: string) => void;
};

// The screen owns the text; this controlled component displays it.
export function LanguagePanel({ language, value, isSource, colors, onChangeText }: Props) {
  return (
    <View style={[styles.panel, {
      backgroundColor: isSource ? colors.tint : colors.surface,
      borderColor: isSource ? colors.accent : colors.border,
    }]}>
      <Text style={[styles.language, { color: colors.text }]}>{language}</Text>
      <TextInput
        accessibilityLabel={`${language} text`}
        accessibilityHint="Editing this field selects the source language."
        multiline
        textAlignVertical="top"
        value={value}
        onChangeText={onChangeText}
        placeholder="Enter a word or phrase"
        placeholderTextColor={colors.muted}
        selectionColor={colors.accent}
        style={[styles.input, { color: colors.text }]}
      />
      <Text style={[styles.caption, { color: colors.muted }]}>
        {isSource ? 'Source language' : 'Manual entry'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  language: { fontSize: 14, fontWeight: '600' },
  input: { fontSize: 24, minHeight: 48, padding: 0 },
  caption: { fontSize: 12 },
});
