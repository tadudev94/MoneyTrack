import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';

type ModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: () => void; 
  title: string;
  children?: React.ReactNode;
};

const AppModal = ({
  visible,
  onClose,
  onSave,
  title,
  children = <></>,
}: ModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalBox} onPress={e => e.stopPropagation()}>
          {children}
          <TouchableOpacity style={styles.payBtn} onPress={onSave}>
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

export default AppModal;
