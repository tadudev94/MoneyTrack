// AdManager.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TestIds } from 'react-native-google-mobile-ads';
import { BANNER_ID_REAL, INTERSTITIAL_ID_REAL } from '@env';

const LAST_AD_TIME_KEY = 'last_ad_time';

export async function canShowAd(): Promise<boolean> {
  const lastTime = await AsyncStorage.getItem(LAST_AD_TIME_KEY);
  const now = Date.now();

  if (!lastTime) return true; // Chưa show bao giờ → OK

  const diff = now - parseInt(lastTime, 10);
  return diff >= 60 * 1000 * 5; // Ít nhất 3p giây mới show lại
}

export async function markAdShown() {
  await AsyncStorage.setItem(LAST_AD_TIME_KEY, Date.now().toString());
}


export type AdIds = {
  banner: string;
  initial: string;
};

export const getAdIds = (): AdIds => {
  const isTest = false;
  const isDev = __DEV__;

  if (isDev || isTest) {
    return {
      banner: TestIds.BANNER,
      initial: TestIds.INTERSTITIAL,
    };
  } else {
    return {
      banner: BANNER_ID_REAL,
      initial: INTERSTITIAL_ID_REAL,
    };
  }
};