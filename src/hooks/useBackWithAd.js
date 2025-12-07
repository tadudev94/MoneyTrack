import { useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { showInterstitial } from '../utils/InterstitialHelper';

export default function useBackWithAd(navigation) {
  const { t } = useTranslation();

  useEffect(() => {
    const backAction = () => {
      showInterstitial(() => {
        navigation.goBack();
      });
      return true; // chặn hành vi mặc định
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, [navigation, t]);
}
