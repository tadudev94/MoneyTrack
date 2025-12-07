// InterstitialHelper.ts
import {
  InterstitialAd,
  AdEventType,
  TestIds,
} from 'react-native-google-mobile-ads';
import { canShowAd, getAdIds, markAdShown } from './adManager';

const AD_UNIT_ID = getAdIds().initial;

/**
 * Hiển thị quảng cáo toàn màn hình Interstitial
 * @param onDone callback khi quảng cáo đóng hoặc lỗi
 */
export async function showInterstitial(onDone?: () => void) {
  if (!(await canShowAd())) {
    onDone?.();
    return;
  }

  // Tạo instance mới mỗi lần show
  const interstitial = InterstitialAd.createForAdRequest(AD_UNIT_ID);

  // Thêm listener
  const loadedListener = interstitial.addAdEventListener(
    AdEventType.LOADED,
    () => {
      interstitial.show();
    },
  );

  const closedListener = interstitial.addAdEventListener(
    AdEventType.CLOSED,
    async () => {
      await markAdShown();
      // Remove listener sau khi đóng
      loadedListener();
      closedListener();
      errorListener();
      onDone?.();
    },
  );

  const errorListener = interstitial.addAdEventListener(
    AdEventType.ERROR,
    () => {
      // Remove listener nếu load lỗi
      loadedListener();
      closedListener();
      errorListener();
      onDone?.();
    },
  );

  // Load quảng cáo
  interstitial.load();
}
