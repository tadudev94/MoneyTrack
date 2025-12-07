import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';

type MoneyInputProps = {
  value: string; // luôn giữ số thô (50000)
  onChange: (text: string) => void;
  placeholder?: string;
};

export const formatMoney = (val: string) => {
  if (!val) return '';
  return val.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const MoneyInput: React.FC<MoneyInputProps> = ({ value, onChange, placeholder }) => {
  const [displayValue, setDisplayValue] = useState<string>(formatMoney(value));

  useEffect(() => {
    setDisplayValue(formatMoney(value));
  }, [value]);

  const handleChange = (text: string) => {
    // bỏ hết ký tự không phải số
    const numeric = text.replace(/[^0-9]/g, '');
    onChange(numeric); // số gốc trả ra ngoài
    setDisplayValue(formatMoney(numeric)); // hiển thị đẹp
  };

  const handleAddZeros = () => {
    const newValue = value ? value + '000' : '1000';
    onChange(newValue);
    setDisplayValue(formatMoney(newValue));
  };

  return (
    <View style={styles.inputRow}>
      <TextInput
        style={styles.inputFlex}
        placeholder={placeholder ?? 'Số tiền mỗi thành viên'}
        keyboardType="numeric"
        value={displayValue}
        onChangeText={handleChange}
      />
      <TouchableOpacity style={styles.suffixBtn} onPress={handleAddZeros}>
        <Text style={styles.suffixBtnText}>000</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  inputFlex: {
    flex: 1,
    padding: 10,
  },
  suffixBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 5,
    backgroundColor: '#eee',
  },
  suffixBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default MoneyInput;
