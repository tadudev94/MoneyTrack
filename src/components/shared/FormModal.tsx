import React from 'react';
import {
  Modal,
  Pressable,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export type FieldConfig = {
  key: string; // key trong object
  label: string;
  placeholder?: string;
  value?: string; // optional nếu bạn dùng object
};

type FormModalProps<T extends Record<string, any>> = {
  visible: boolean;
  title: string;
  fields: FieldConfig[];
  form: T; // state object
  setForm: React.Dispatch<React.SetStateAction<T>>; // setForm
  onClose: () => void;
  onSave: () => void;
  isEditing?: boolean;
};

function FormModal<T extends Record<string, any>>({
  visible,
  title,
  fields,
  form,
  setForm,
  onClose,
  onSave,
  isEditing,
}: FormModalProps<T>) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalBox} onPress={e => e.stopPropagation()}>
          <Text style={styles.modalTitle}>
            {isEditing ? `Sửa ${title}` : `Thêm ${title}`}
          </Text>

          {fields.map(field => (
            <TextInput
              key={field.key}
              style={styles.input}
              placeholder={field.placeholder || field.label}
              value={form[field.key] ?? ''}
              onChangeText={text =>
                setForm(prev => ({ ...prev, [field.key]: text }))
              }
            />
          ))}

          <TouchableOpacity style={styles.createBtn} onPress={onSave}>
            <Text style={styles.createBtnText}>
              {isEditing ? 'Cập nhật' : 'Thêm'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Huỷ</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

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
  modalTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  createBtn: {
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    borderRadius: 8,
  },
  createBtnText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  cancelText: { textAlign: 'center', marginTop: 10, color: '#999' },
});

export default FormModal;
