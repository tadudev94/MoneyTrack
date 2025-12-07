import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDatabase } from '../contexts/DatabaseContext';
import { useTranslation } from 'react-i18next';
import { getAllGroups } from '../database/GroupRepository';
import { useGroupStore } from '../store/groupStore';
import { useFundStore } from '../store/fundStore';

type RootStackParamList = {
  Loading: undefined;
  SetupGroup: undefined;
  HomeStack: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Loading'>;
};

const LoadingScreen: React.FC<Props> = ({ navigation }) => {
  const { initialized } = useDatabase();
  const { t } = useTranslation();
  const [loadingText, setLoadingText] = useState<string>(
    t('loading.initializing'),
  );
  const loadGroups = useGroupStore(state => state.loadGroups);
  const loadFunds = useFundStore(x => x.loadByGroup);
  useEffect(() => {
    if (!initialized) {
      setLoadingText(t('loading.database'));
    }
  }, [initialized, t]);

  useEffect(() => {
    if (initialized) {
      const setup = async () => {
        try {
          setLoadingText(t('loading.fetchingData'));

          const groups = await getAllGroups();

          await loadGroups();
          if (groups.length > 0) {
            // đã có nhóm -> vào Home
            navigation.replace('HomeStack');
          } else {
            // chưa có nhóm -> vào SetupGroup
            navigation.replace('SetupGroup');
          }
        } catch (error) {
          console.error('❌ Error loading groups:', error);
          navigation.replace('SetupGroup');
        }
      };
      setup();
    }
  }, [initialized, navigation, t]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.text}>{loadingText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { marginTop: 20, fontSize: 16 },
});

export default LoadingScreen;
