import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { getAdIds } from '../../utils/adManager';

const BannerAds = () => {
  const bannerUnitId =  getAdIds().banner;
  // const bannerUnitId = 'ca-app-pub-6867236758151230/5050722443';
  return null;
  return (
    <View style={styles.banner}>
      <BannerAd
        unitId={bannerUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('✅ Banner loaded successfully');
        }}
        onAdFailedToLoad={error => {
          console.log('❌ Banner failed to load: ', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingBottom: 5
  },
});

export default BannerAds;
