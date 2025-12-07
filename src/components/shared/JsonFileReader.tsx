import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import DocumentPicker, { types } from 'react-native-document-picker';
import RNFS from 'react-native-fs';

const JsonFileReader: React.FC = () => {
  const [jsonContent, setJsonContent] = useState<string | null>(null);

  const pickFile = async () => {
    try {
      // Mở Document Picker để chọn file JSON
      const res = await DocumentPicker.pick({
        type: [types.allFiles], // có thể filter lại bằng MIME type application/json
      });

      // Đường dẫn tới file
      const fileUri = res[0].uri;

      // Đọc nội dung file bằng react-native-fs
      const fileContent = await RNFS.readFile(fileUri, 'utf8');

      // Parse JSON
      const parsed = JSON.parse(fileContent);

      setJsonContent(JSON.stringify(parsed, null, 2));
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        console.error('Error reading file:', err);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Chọn file JSON" onPress={pickFile} />
      {jsonContent && (
        <View style={styles.resultBox}>
          <Text selectable style={styles.text}>
            {jsonContent}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  resultBox: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    width: '100%',
  },
  text: {
    fontSize: 14,
  },
});

export default JsonFileReader;
