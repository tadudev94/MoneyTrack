import FilePickerManager from 'react-native-file-picker';
import RNFS from 'react-native-fs';

const pickJsonFile = async () => {
  try {
    FilePickerManager.showFilePicker(
      { title: 'Chọn file JSON', chooseFileButtonTitle: 'Chọn' },
      response => {
        if (response.didCancel) {
          console.log('Người dùng hủy chọn file');
        } else if (response.error) {
          console.error('Lỗi chọn file:', response.error.message, response);
        } else {
          try {
            if (!response.uri.endsWith('.json')) {
              console.error('Vui lòng chọn file JSON');
              return;
            }
            console.log('File URI:', response.uri);
            // const fileContent = await RNFS.readFile(response.uri, 'utf8');
            // const jsonData = JSON.parse(fileContent);
            // console.log('Dữ liệu JSON:', jsonData);
          } catch (err) {
            console.error('Lỗi đọc file:', err);
          }
        }
      },
    );
  } catch (err) {
    console.error('Lỗi:', err);
  }
};

export default pickJsonFile;
