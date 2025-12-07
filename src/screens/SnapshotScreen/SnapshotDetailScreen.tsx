import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';

import {
  getFundSnapshots,
  getSnapshotsPaging,
  Snapshot,
  FundSnapshot,
} from '../../database/SnapshotRepository';

import { styles } from './SnapshotDetailScreen.style';

type RouteParams = {
  SnapshotDetail: {
    snapshotId: string;
  };
};

const SnapshotDetailScreen = () => {
  const route = useRoute<RouteProp<RouteParams, 'SnapshotDetail'>>();
  const navigation = useNavigation();
  const { snapshotId } = route.params;
  console.log(snapshotId, 'xx')
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [funds, setFunds] = useState<FundSnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      // Lấy snapshot chính (1 dòng)
      const { snapshots } = await getSnapshotsPaging(1, 1000);
      const snap = snapshots.find(s => s.snapshot_id === snapshotId) || null;

      setSnapshot(snap);

      // Lấy list fund snapshot
      const fundRes = await getFundSnapshots(snapshotId);
      console.log(fundRes)
      setFunds(fundRes);
    } catch (err) {
      console.log('Error loading snapshot detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [snapshotId]);

  const renderFund = ({ item }: { item: FundSnapshot }) => (
    <View style={styles.fundCard}>
      <View style={styles.fundInfo}>
        <Text style={styles.fundName}>{item.fund_name}</Text>
        <Text style={styles.fundBalance}>
          {item.balance.toLocaleString()} đ
        </Text>
      </View>
    </View>
  );

  if (loading || !snapshot) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const dateStr = new Date(snapshot.created_at).toLocaleString();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={28} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Chi tiết Snapshot</Text>

        <View style={{ width: 28 }} />
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Thời gian</Text>
        <Text style={styles.summaryDetail}>{dateStr}</Text>

        <Text style={[styles.summaryTitle, { marginTop: 8 }]}>
          Tổng số dư
        </Text>
        <Text style={styles.summaryDetail}>
          {snapshot.balance.toLocaleString()} đ
        </Text>
      </View>

      {/* Fund List */}
      <Text style={styles.sectionTitle}>Chi tiết từng quỹ</Text>

      <FlatList
        data={funds}
        keyExtractor={item => item.fund_snapshot_id}
        renderItem={renderFund}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
};

export default SnapshotDetailScreen;
