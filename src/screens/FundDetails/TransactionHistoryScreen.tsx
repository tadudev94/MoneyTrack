// TransactionHistoryScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getTransactionsByFund } from '../../database/TransactionRepository';
import { Transaction } from '../../database/TransactionRepository';

const TransactionHistoryScreen = ({ route }: any) => {
  const { fundId, memberId, memberName } = route.params;
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await getTransactionsByFund(fundId);
        // chỉ lấy transaction của 1 member và là thu (income)
        setData(all.filter(tx => tx.member_id === memberId && tx.type === 'income'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fundId, memberId]);

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.row}>
      <Text style={styles.amount}>
        {item.amount.toLocaleString()} đ
      </Text>
      <Text style={styles.date}>
        {new Date(item.transaction_date).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  if (data.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>
          {memberName} chưa có lịch sử giao dịch nào
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lịch sử giao dịch - {memberName}</Text>
      <FlatList
        data={data}
        keyExtractor={item => item.transaction_id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  amount: { fontSize: 15, fontWeight: '600', color: '#1976d2' },
  date: { fontSize: 13, color: '#666' },
  emptyText: { fontSize: 14, color: '#999' },
});

export default TransactionHistoryScreen;
