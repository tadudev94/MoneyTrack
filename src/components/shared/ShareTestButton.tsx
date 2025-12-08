import React from 'react';
import { Platform, Alert, Linking } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import Share from 'react-native-share';
import RNFetchBlob from 'react-native-blob-util';

interface ShareTestButtonProps {
  testData: unknown;
  fileName?: string;
}

const ShareTestButton: React.FC<ShareTestButtonProps> = ({
  testData,
  fileName = 'test-data.json',
}) => {
  const handleShare = async () => {
    try {
      // Chuẩn hóa tên file
      const timestamp = Date.now();
      const safeFileName = `test-data-${timestamp}.json`
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      // 1. Kiểm tra dữ liệu
      if (!testData || typeof testData !== 'object') {
        throw new Error('Dữ liệu không hợp lệ');
      }

      // Sử dụng CacheDir cho Android, DocumentDir cho iOS
      const dirs = RNFetchBlob.fs.dirs;
      const filePath = Platform.OS === 'android'
        ? `${dirs.CacheDir}/${safeFileName}`
        : `${dirs.DocumentDir}/${safeFileName}`;

      // Debug 1: Kiểm tra thư mục
      const dirExists = await RNFetchBlob.fs.exists(Platform.OS === 'android' ? dirs.CacheDir : dirs.DocumentDir);
      console.log('Thư mục tồn tại:', dirExists);
      if (!dirExists) {
        throw new Error('Thư mục không tồn tại');
      }

      // 2. Ghi file
      console.log('Bắt đầu ghi file tại:', filePath);
      const jsonString = JSON.stringify(testData, null, 2);
      console.log('Nội dung JSON:', jsonString.substring(0, 100) + '...');

      await RNFetchBlob.fs.writeFile(filePath, jsonString, 'utf8');

      // 3. Kiểm tra file
      const fileExists = await RNFetchBlob.fs.exists(filePath);
      console.log('File tồn tại sau khi ghi:', fileExists);
      if (!fileExists) {
        throw new Error('Tạo file thất bại');
      }

      // 4. Chuẩn bị URI cho chia sẻ
      const fileUri = Platform.OS === 'android' ? `file://${filePath}` : filePath;
      console.log('Chuẩn bị chia sẻ với URI:', fileUri);

      // Debug 2: Kiểm tra URI
      const uriExists = await RNFetchBlob.fs.exists(fileUri.replace('file://', ''));
      console.log('URI tồn tại:', uriExists);

      // Tùy chọn chia sẻ
      const shareOptions = {
        title: 'Chia sẻ Dữ liệu Kiểm tra',
        message: 'File dữ liệu kiểm tra đính kèm',
        url: fileUri,
        type: 'application/json',
        failOnCancel: false,
        // Thêm để ưu tiên chia sẻ đến ứng dụng cùng loại
        packageName: Platform.OS === 'android' ? 'money_v2.vn' : undefined,
        activityType: Platform.OS === 'ios' ? 'money_v2.vn.share' : undefined,
      };

      console.log('Chia sẻ với tùy chọn:', shareOptions);

      // 5. Thực hiện chia sẻ
      const shareResult = await Share.open(shareOptions);
      console.log('Kết quả chia sẻ:', shareResult);

      // 6. Dọn dẹp file tạm
      setTimeout(() => {
        RNFetchBlob.fs
          .unlink(filePath)
          .then(() => console.log('Xóa file tạm thành công'))
          .catch(cleanupError => console.warn('Lỗi xóa file:', cleanupError));
      }, 10000); // Giảm xuống 10 giây để dọn dẹp nhanh hơn
    } catch (error) {
      console.error('❌ Lỗi:', JSON.stringify(error, null, 2));

      let errorMessage = 'Đã xảy ra lỗi không xác định';
      let showSettingsButton = false;

      if (error instanceof Error) {
        errorMessage = error.message;

        if (error.message.includes('Uri.getScheme()')) {
          errorMessage = 'Lỗi hệ thống khi chuẩn bị file chia sẻ';
          showSettingsButton = true;

          // Debug chi tiết
          try {
            const dirs = RNFetchBlob.fs.dirs;
            const dirContents = await RNFetchBlob.fs.ls(Platform.OS === 'android' ? dirs.CacheDir : dirs.DocumentDir);
            console.log('Danh sách file trong thư mục:', dirContents);

            const fileStats = await Promise.all(
              dirContents.map(async file => ({
                name: file,
                size: (
                  await RNFetchBlob.fs.stat(`${Platform.OS === 'android' ? dirs.CacheDir : dirs.DocumentDir}/${file}`)
                ).size,
              })),
            );
            console.log('Chi tiết các file:', fileStats);
          } catch (debugError) {
            console.warn('Lỗi debug:', debugError);
          }
        }
      }

      Alert.alert(
        'Chia sẻ Thất bại',
        errorMessage,
        // [
        //   { text: 'OK' },
        //   showSettingsButton && Platform.OS === 'android'
        //     ? { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() }
        //     : null,
        // ].filter(Boolean),
      );
    }
  };

  return (
    <PaperButton
      mode="contained"
      onPress={handleShare}
      style={{ margin: 16 }}
      labelStyle={{ paddingVertical: 8 }}
      testID="share-button"
    >
      Chia sẻ Kiểm tra
    </PaperButton>
  );
};

export default ShareTestButton;