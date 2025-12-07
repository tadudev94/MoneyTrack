import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import MoneyInput from './MoneyInput';

type MoneyModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (amount: number, desc: string) => void; // sửa: trả về number + desc
  desc: string;
  setDesc: (text: string) => void;
  amount: string; // vẫn giữ string thô
  setAmount: (text: string) => void;
  title: string;
  placeholder: string;
  moneyPlaceholder?: string;
  children?: React.ReactNode;
};

const MoneyModal = ({
  visible,
  onClose,
  onSave,
  desc,
  setDesc,
  amount,
  setAmount,
  title,
  placeholder,
  moneyPlaceholder,
  children = <></>,
}: MoneyModalProps) => {
  const handleSave = () => {
    const num = parseInt(amount || '0', 10);
    onSave(num, desc);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalBox} onPress={e => e.stopPropagation()}>
          <Text style={styles.modalTitle}>{title}</Text>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            value={desc}
            onChangeText={setDesc}
          />
          <MoneyInput
            value={amount}
            onChange={setAmount}
            placeholder={moneyPlaceholder}
          />
          {children}
          <TouchableOpacity style={styles.payBtn} onPress={handleSave}>
            <Text style={styles.payBtnText}>Xác nhận</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ textAlign: 'center', marginTop: 10, color: '#999' }}>
              Huỷ
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
  },
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  payBtn: {
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    borderRadius: 8,
  },
  payBtnText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
});

export default MoneyModal;
