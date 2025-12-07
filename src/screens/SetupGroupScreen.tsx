import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useGroupStore } from '../store/groupStore';

export default function SetupGroupScreen() {
  const navigation = useNavigation<any>();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const { addGroup } = useGroupStore();

  const handleCreate = async () => {
    try {
      await addGroup({ name: groupName, description });
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeStack' }],
      });
    } catch (error) {
      console.error('❌ Error creating group:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tạo nhóm đầu tiên</Text>
      <TextInput
        style={styles.input}
        placeholder="Tên nhóm"
        value={groupName}
        onChangeText={setGroupName}
      />
      <TextInput
        style={styles.input}
        placeholder="Mô tả (tuỳ chọn)"
        value={description}
        onChangeText={setDescription}
      />
      <Button title="Tạo nhóm" onPress={handleCreate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
  },
});
