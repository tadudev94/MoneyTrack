import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { Platform } from 'react-native';

/**
 * Ghi file và mở share dialog
 * @param fileName tên file (vd: report.xlsx, tags.json)
 * @param data dữ liệu đã chuẩn hoá (base64 hoặc utf8)
 * @param encoding kiểu encoding ('base64' cho Excel, 'utf8' cho JSON)
 * @param mimeType loại file
 */
export const exportAndShareFile = async (
  fileName: string,
  data: string,
  encoding: 'utf8' | 'base64',
  mimeType: string,
) => {
  const path =
    Platform.OS === 'android'
      ? `${RNFS.CachesDirectoryPath}/${fileName}`
      : `${RNFS.DocumentDirectoryPath}/${fileName}`;

  await RNFS.writeFile(path, data, encoding);

  await Share.open({
    url: Platform.OS === 'android' ? `file://${path}` : path,
    type: mimeType,
    filename: fileName,
    failOnCancel: false,
  });

  return path;
};
