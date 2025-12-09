import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { Button } from 'react-native-paper';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { CleanAllData, GetExportData } from '../../database/ExportImportManager';
import { createByTag } from '../database/TagManager';
import { pick, types } from '@react-native-documents/picker';
import { Data, KeyTag, Tag, Key } from '../../database/types';
import { createByKey } from '../database/KeyManager';
import { addTagToKey } from '../database/KeyTagManager';
import { importData } from '../database/DataManager';
import Header from '../../components/shared/Header';
import { AlertHelper as Alert } from '../../providers/Alert';
import BannerAds from '../../components/shared/BannerAds';
import { useTranslation } from 'react-i18next';

const ExportImportScreen: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const exportTags = async () => {
    try {
      setLoading(true);
      const obj = await GetExportData();
      const json = JSON.stringify(obj, null, 2);

      const path =
        Platform.OS === 'android'
          ? `${RNFS.CachesDirectoryPath}/tags_export.json`
          : `${RNFS.DocumentDirectoryPath}/tags_export.json`;

      await RNFS.writeFile(path, json, 'utf8');

      await Share.open({
        url: Platform.OS === 'android' ? `file://${path}` : path,
        type: 'application/json',
        filename: 'tags_export.json',
      });

      Alert.success(t('exportSuccess'));
    } catch (err: any) {
      if (err?.message === 'User did not share') {
        console.log('User canceled sharing, skip');
      } else {
        console.error('Export/Share error:', err);
        Alert.error(err.message || t('exportError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const importTags = async () => {
    try {
      setLoading(true);
      const res = await pick({
        type: [types.json],
        presentationStyle: 'formSheet',
      });
      const fileUri = res[0].uri;

      const response = await fetch(fileUri);
      const jsonString = await response.text();
      const rawData = JSON.parse(jsonString);

      const { tags, keyTags, keys, data } = rawData as {
        tags: Tag[];
        keyTags: KeyTag[];
        keys: Key[];
        data: Data[];
      };

      if (Array.isArray(tags)) for (const tag of tags) await createByTag(tag);
      if (Array.isArray(keys)) for (const key of keys) await createByKey(key);
      if (Array.isArray(keyTags))
        for (const kt of keyTags) await addTagToKey(kt.key_id, kt.tag_id);
      if (Array.isArray(data)) for (const d of data) await importData(d);

      Alert.success(t('importSuccess'));
    } catch (err: any) {
      console.error(err);
      if (err?.message === 'user canceled the document picker') {
        console.log('User canceled picker, skip');
      } else {
        Alert.error(t('importError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const cleanData = async () => {
    Alert.confirm(t('confirmClean'), async () => {
      try {
        await CleanAllData();
        Alert.success(t('cleanSuccess'));
      } catch (err) {
        console.error(err);
        Alert.error(t('cleanError'));
      }
    });
  };

  return (
    <View style={styles.container}>
      <BannerAds />
      <Header
        title={t('importExportTitle')}
        rightIcon="add"
        onRightPress={() => console.log('Thêm tag mới')}
      />

      <View style={styles.buttonColumn}>
        <Button
          mode="contained"
          icon="file-export"
          onPress={exportTags}
          loading={loading}
          style={[styles.button, styles.exportButton]}
        >
          {t('export')}
        </Button>

        <Button
          mode="contained"
          icon="file-import"
          onPress={importTags}
          loading={loading}
          style={[styles.button, styles.importButton]}
        >
          {t('import')}
        </Button>

        <Button
          mode="contained"
          icon="delete"
          onPress={cleanData}
          style={[styles.button, styles.cleanButton]}
        >
          {t('cleanAll')}
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f0f5f9' },
  buttonColumn: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    marginTop: 20,
    gap: 12,
    width: '100%',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    textAlign: 'center',
    width: '100%',
  },
  exportButton: { backgroundColor: '#499164ff' },
  importButton: { backgroundColor: '#52a7f1ff' },
  cleanButton: { backgroundColor: '#f44336' },
});

export default ExportImportScreen;
