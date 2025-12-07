import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, StatusBar, Platform } from 'react-native';
import {
  Appbar,
  Text,
  IconButton,
  Provider as PaperProvider,
  DefaultTheme,
} from 'react-native-paper';
import { updateTestTitle } from '../../database/testManager';

interface HeaderProps {
  testUid: string;
  title: string;
}

// Custom theme để override màu primary
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6893f0ff',
    onPrimary: '#ffffff',
  },
};

const EditableTestDetailHeader: React.FC<HeaderProps> = ({
  testUid,
  title,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>(title);

  useEffect(() => {
    setNewTitle(title ?? '');
  }, [title]);

  const handleSave = async () => {
    if (newTitle.trim().length === 0) return;
    await updateTestTitle(testUid, newTitle);
    setIsEditing(false);
  };

  return (
    <Appbar.Header style={styles.header}>
      {/* Khoảng trống trái để cân đối icon */}
      <View style={{ width: 48 }} />

      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            value={newTitle}
            onChangeText={setNewTitle}
            style={styles.input}
            autoFocus
            placeholder="Nhập tiêu đề"
            placeholderTextColor="#ffffff99"
          />
          <IconButton icon="check" size={20} onPress={handleSave} />
          <IconButton
            icon="close"
            size={20}
            onPress={() => setIsEditing(false)}
          />
        </View>
      ) : (
        <Text style={styles.title}>{newTitle}</Text>
      )}

      {!isEditing && (
        <Appbar.Action icon="pencil" onPress={() => setIsEditing(true)} />
      )}
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#6893f0ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    color: '#fff',
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: '#fff',
    fontSize: 18,
    color: '#fff',
    paddingVertical: 0,
  },
});

export default EditableTestDetailHeader;
