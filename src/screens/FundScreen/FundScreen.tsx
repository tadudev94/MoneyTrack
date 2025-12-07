import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { usePaging } from '../../hooks/usePaging';
import { useCurrentGroup } from '../../hooks/useCurrentGroup';
import {
  getFundsByGroupPaging,
  getTotalExpectedByGroup,
} from '../../database/FundRepository';
import { useMemberStore } from '../../store/memberStore';
import { useTransactionStore } from '../../store/transactionStore';
import {
  getBalanceByFunds,
  getBalanceByGroup,
} from '../../database/TransactionRepository';
import { styles } from './FundScreen.style';
import { FundItem } from './FundItem';
import {
  addAllMembersToFund,
  getMembersOfFunds,
} from '../../database/FundMemberRepository';
import { useMemberFundStore } from '../../store/memberFundStore';
import MoneyModal from '../../components/shared/MoneyModal';
import { useFundStore } from '../../store/fundStore';
import HelpModal from '../../components/shared/HelpModal';
import AppModal from '../../components/shared/AppModal';
import MoneyInput from '../../components/shared/MoneyInput';

type FinalFund = {
  members_count: number;
  balance: number;
  fund_id: string;
  group_id: string;
  name: string;
  created_at: number;
};

// --- FundScreen ---
export default function FundScreen() {
  const navigation = useNavigation();
  const { group } = useCurrentGroup();
  const lastUpdateMemberFunds = useMemberFundStore(x => x.lastUpdated);
  const lastTran = useTransactionStore(s => s.lastUpdated);
  const lastFundUpdated = useFundStore(x => x.lastUpdated);
  const addFund = useFundStore(x => x.addFund);
  const refreshFundInfo = useFundStore(s => s.refresh);
  const totalGroupMembers = useMemberStore(state => state.totalGroupMembers);

  const [showModal, setShowModal] = useState(false);
  const [finalFunds, setFinalFunds] = useState<FinalFund[]>([]);
  const [newFundName, setNewFundName] = useState('');
  const [newFee, setNewFee] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const [balance, setBalance] = useState(0);
  const [addAllMem, setAddAllMem] = useState(true);

  const fetchFunds = async (page: number, pageSize: number) => {
    if (!group) return [];

    const { funds } = await getFundsByGroupPaging(
      group.group_id,
      page,
      pageSize,
    );

    if (funds.length === 0) return [];

    const fundIds = funds.map(f => f.fund_id);

    const incomes = await getBalanceByFunds(group.group_id, fundIds);
    console.log(incomes)
    const enrichedFunds = funds.map(f => ({
      ...f,
      balance: incomes[f.fund_id] ?? 0,
    }));

    return enrichedFunds;
  };

  const {
    data: funds,
    loading,
    hasMore,
    loadPage,
    reset,
  } = usePaging(fetchFunds, 10);

  const init = async () => {
    if (group?.group_id) {
      getBalanceByGroup(group.group_id).then(setBalance);
    }
  };

  useEffect(() => {
    if (group?.group_id) {
      reset();
      init();
    }
  }, [group, lastTran, lastUpdateMemberFunds, lastFundUpdated]);

  useEffect(() => {
    if (group?.group_id) {
      const fetchData = async () => {
        const fundIds = funds.map(f => f.fund_id);
        const members = await getMembersOfFunds(fundIds);

        const enrichedFunds = funds.map(f => ({
          ...f,
          members_count: members[f.fund_id]?.length ?? 0,
        }));

        setFinalFunds(enrichedFunds);
      };

      fetchData();
    }
  }, [group, funds, lastUpdateMemberFunds]);

  useEffect(() => {
    const fetch = async () => {
      if (group) {
        const expected = await getTotalExpectedByGroup(group.group_id);
        setTotalExpected(expected);
      }
      console.log('feech');
    };
    fetch();
  }, [group, lastUpdateMemberFunds, lastFundUpdated]);

  const handleAddFund = async () => {

    if (!newFundName.trim() || !group) return;

    const newFund = await addFund({
      group_id: group.group_id,
      name: newFundName.trim(),
    });

    console.log(newFund)

    if (addAllMem && newFund) {
      await addAllMembersToFund(group.group_id, newFund?.fund_id);
      refreshFundInfo();
    }

    setShowModal(false);
    setNewFundName('');
    setNewFee('');
    reset();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh sách Ví</Text>
        <TouchableOpacity onPress={() => setShowHelp(true)}>
          <Icon name="lightbulb-on-outline" size={24} color="#2368fcff" />
        </TouchableOpacity>
      </View>

      {/* Tổng quan */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Số Dư</Text>
        <Text style={styles.summaryValue}>
          {balance.toLocaleString()}đ
        </Text>
        {/* <ProgressBar
          progress={totalExpected > 0 ? totalIncome / totalExpected : 0}
          color="#2196F3"
          style={{ marginTop: 8, height: 8, borderRadius: 4 }}
        /> */}
      </View>

      {/* Danh sách Ví */}
      {loading && finalFunds.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={finalFunds}
          keyExtractor={item => item.fund_id}
          renderItem={({ item }) => (
            <FundItem
              item={item}
              groupId={group?.group_id ?? ''}
              totalGroupMembers={totalGroupMembers}
              navigation={navigation}
              lastTran={lastTran}
              totalBalance={balance}
            />
          )}
          contentContainerStyle={{ paddingBottom: 100 }}
          onEndReached={() => hasMore && loadPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? <ActivityIndicator style={{ margin: 10 }} /> : null
          }
        />
      )}

      {/* Nút thêm Ví */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>
      <AppModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleAddFund}
        title={'Thêm Ví mới'}
        children={
          <>
            <TextInput
              style={styles.input}
              placeholder={"Tên Ví"}
              value={newFundName}
              onChangeText={setNewFundName}
            />
          </>
        }
      />
      <HelpModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title="Hướng dẫn màn hình Ví"
        tips={[
          'Bạn nên tạo danh sách thành viên trước, khi đó Ví mới tạo sẽ thêm họ vào Ví nếu không sẽ phải thêm sau ở tab thành viên',
        ]}
      />
    </View>
  );
}
