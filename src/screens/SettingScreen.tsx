import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../locales'; // file cấu hình i18n
import { useTranslation } from 'react-i18next';
import Header from '../components/shared/Header';
import { colors, styles as commonStyles } from '../styles/common';
import BannerAds from '../components/shared/BannerAds';

type LanguageOption = {
  code: string;
  label: string;
};

const languages: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'ja', label: '日本語' },
];

export default function SettingsScreen() {
  const { t } = useTranslation();
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(
    languages[0],
  );
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const loadLang = async () => {
      const savedLang = await AsyncStorage.getItem('appLang');
      if (savedLang) {
        const langObj = languages.find(l => l.code === savedLang);
        if (langObj) {
          setSelectedLang(langObj);
          i18n.changeLanguage(savedLang);
        }
      } else {
        const currentLang = i18n.language;
        const langObj =
          languages.find(l => l.code === currentLang) || languages[0];
        setSelectedLang(langObj);
      }
    };
    loadLang();
  }, []);

  const handleSelectLanguage = async (lang: LanguageOption) => {
    i18n.changeLanguage(lang.code);
    await AsyncStorage.setItem('appLang', lang.code);
    setSelectedLang(lang);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <BannerAds />
      <Header
        title={t('settings.title')}
        rightIcon="add"
        onRightPress={() => console.log(t('settings.add_tag'))}
      />

      {/* Chọn ngôn ngữ */}
      <TouchableOpacity
        style={styles.option}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.optionLabel}>{t('settings.language')}</Text>
        <Text style={styles.optionValue}>{selectedLang.label}</Text>
      </TouchableOpacity>

      {/* Modal chọn ngôn ngữ */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {t('settings.select_language')}
            </Text>
            <FlatList
              data={languages}
              keyExtractor={item => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.languageItem}
                  onPress={() => handleSelectLanguage(item)}
                >
                  <Text style={styles.languageText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: commonStyles.container,
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionLabel: { fontSize: 16 },
  optionValue: { fontSize: 16, color: '#666' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  languageItem: { paddingVertical: 12 },
  languageText: { fontSize: 16 },
  closeButton: { marginTop: 15, alignItems: 'center' },
  closeText: { color: 'red', fontSize: 16 },
});
