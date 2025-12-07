// components/QuestionDisplay.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { RadioButton, Checkbox, Text, TextInput } from 'react-native-paper';
import { Question } from '../../types';


interface Props {
  question: Question;
  selectedValue: string | string[]; // single: string, multiple: string[]
  onSelect: (value: string | string[]) => void;
}

const QuestionDisplay: React.FC<Props> = ({ question, selectedValue, onSelect }) => {
  if (question.type === 'manual') {
    return (
      <TextInput
        mode="outlined"
        value={typeof selectedValue === 'string' ? selectedValue : ''}
        onChangeText={(text) => onSelect(text)}
        placeholder="Nhập câu trả lời"
        numberOfLines={3}
      />
    );
  }

  return (
    <View>
      {question.options?.map((opt, idx) => {
        const isSelected =
          question.type === 'single'
            ? selectedValue === opt.question_option_uid
            : Array.isArray(selectedValue) && selectedValue.includes(opt.question_option_uid);

        return (
          <View key={opt.question_option_uid} style={styles.optionRow}>
            {question.type === 'single' ? (
              <RadioButton
                value={opt.question_option_uid}
                status={isSelected ? 'checked' : 'unchecked'}
                onPress={() => onSelect(opt.question_option_uid)}
              />
            ) : (
              <Checkbox
                status={isSelected ? 'checked' : 'unchecked'}
                onPress={() => {
                  if (!Array.isArray(selectedValue)) return;
                  const updated = isSelected
                    ? selectedValue.filter((v) => v !== opt.question_option_uid)
                    : [...selectedValue, opt.question_option_uid];
                  onSelect(updated);
                }}
              />
            )}
            <Text style={styles.optionText}>{opt.text}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  optionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  optionText: { flex: 1, fontSize: 16 },
});

export default QuestionDisplay;
