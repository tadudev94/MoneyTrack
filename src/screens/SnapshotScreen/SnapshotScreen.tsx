import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { usePaging } from '../../hooks/usePaging';
import { useCurrentGroup } from '../../hooks/useCurrentGroup';

import {
  getSnapshotsPaging,
  createSnapshot,
  Snapshot,
  deleteSnapshot,
  snapshotAndCleanTrans,
} from '../../database/SnapshotRepository';

import { styles } from './SnapshotScreen.style';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useTransactionStore } from '../../store/transactionStore';

type NavProp = NativeStackNavigationProp<
  {
    SnapshotDetail: { snapshotId: string };
  },
  'SnapshotDetail'
>;

const SnapshotScreen = () => {
  const navigation = useNavigation<NavProp>();
  const { group } = useCurrentGroup();

  const fetchSnapshots = async (page: number, pageSize: number) => {
    const { snapshots } = await getSnapshotsPaging(page, pageSize);
    return snapshots;
  };
  const refresh = useTransactionStore(s => s.refresh);
  const {
    data: snapshots,
    loading,
    hasMore,
    loadPage,
    reset,
  } = usePaging<Snapshot>(fetchSnapshots, 10);

  useEffect(() => {
    reset();
  }, []);

  // =====================
  // CREATE SNAPSHOT
  // =====================
  const handleCreateSnapshot = async () => {
    if (!group) return;

    try {
      await createSnapshot(group.group_id);
      reset(); // reload list
    } catch (err) {
      console.log('Snapshot error:', err);
    }
  };

  // =====================
  // CREATE SNAPSHOT
  // =====================
  const handleCreateSnapshotAndClean = async () => {
    if (!group) return;
    const confirm = () => {
      Alert.alert(
        'Xác nhận',
        'Bạn có chắc muốn Chụp và xóa toàn bộ dữ liệu dao dịch, chỉ còn snapshot dc giữ lại. ?',
        [
          { text: 'Huỷ', style: 'cancel' },
          {
            text: 'Xác Nhận',
            style: 'destructive',
            onPress: async () => {
              try {
                await snapshotAndCleanTrans(group.group_id);
                refresh();
                reset(); // reload list sau khi xóa
              } catch (err) {
                console.log('Snapshot and clean error:', err);
              }
            },
          },
        ],
        { cancelable: true }
      );
    };
    confirm();
  };

  // =====================
  // RENDER SNAPSHOT ITEM
  // =====================
  const renderSnapshot = ({ item }: { item: Snapshot }) => {
    const date = new Date(item.created_at).toLocaleString();
    const handleDelete = () => {
      Alert.alert(
        'Xác nhận',
        'Bạn có chắc muốn xóa snapshot này?',
        [
          { text: 'Huỷ', style: 'cancel' },
          {
            text: 'Xóa',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteSnapshot(item.snapshot_id);
                reset(); // reload list sau khi xóa
              } catch (err) {
                console.log('Delete snapshot error:', err);
              }
            },
          },
        ],
        { cancelable: true }
      );
    };
    return (
      <TouchableOpacity
        style={styles.snapshotCard}
        onPress={() =>
          navigation.navigate('SnapshotDetail', {
            snapshotId: item.snapshot_id,
          })
        }
      >
        <View style={styles.snapshotInfo}>
          <Text style={styles.snapshotTitle}>
            Snapshot lúc {date}
          </Text>
          <Text style={styles.snapshotBalance}>
            Tổng số dư: {item.balance.toLocaleString()}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={handleDelete} style={{ marginRight: 8 }}>
            <Icon name="trash-can-outline" size={22} color="#e53935" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const total = snapshots.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Snapshot</Text>

        <TouchableOpacity onPress={handleCreateSnapshotAndClean}>
          <Icon name="database-minus" size={28} color="#fa320fff" />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Tổng quan</Text>
        <Text style={styles.summaryDetail}>{total} snapshot</Text>
      </View>

      {/* List */}
      <FlatList
        data={snapshots}
        keyExtractor={item => item.snapshot_id}
        renderItem={renderSnapshot}
        contentContainerStyle={{ paddingBottom: 100 }}
        onEndReached={() => hasMore && loadPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator style={{ margin: 10 }} />
          ) : null
        }
      />

      {/* FAB button snapshot */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateSnapshot}
      >
        <Icon name="camera" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default SnapshotScreen;
