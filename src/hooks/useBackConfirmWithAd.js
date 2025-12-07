import { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { showInterstitial } from '../utils/InterstitialHelper';

export default function useBackConfirmWithAd(navigation) {
  const { t } = useTranslation();

  useEffect(() => {
    const backAction = () => {
      Alert.alert(
        t('exitQuizTitle'), // Tiêu đề
        t('exitQuizMessage'), // Nội dung
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('exit'),
            onPress: () => {
              showInterstitial(() => {
                navigation.goBack();
              });
            },
          },
        ]
      );
      return true; // chặn hành vi mặc định
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [navigation, t]);
}
