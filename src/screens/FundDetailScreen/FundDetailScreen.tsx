import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePaging } from '../../hooks/usePaging';
import {
  getBalanceByFunds,
  getCountTransByGroup,
  getTotalTransByGroup,
  getTransactionsByGroupPaging,
  getTransactionsWithPlanPaging,
  Transaction,
} from '../../database/TransactionRepository';
import { useCurrentGroup } from '../../hooks/useCurrentGroup';
import { useTransactionStore } from '../../store/transactionStore';
import Toast from 'react-native-toast-message';
import { styles } from './FundDetailScreen.style';
import HelpModal from '../../components/shared/HelpModal';
import MoneyModal from '../../components/shared/MoneyModal';
import DropdownComponent, { DropdownItem } from '../../components/shared/DropdownComponent';
import { FundDetailItem } from './FundDetailItem';
import { useFundStore } from '../../store/fundStore';
import DatePicker from '../../components/shared/DatePicker';
import { getAllTags, TAG_ID_CHO_VAY, TAG_ID_DUOC_TRA_NO } from '../../database/TagRepository';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useTagStore } from '../../store/tagStore';
import { getDeptDetailsPaging } from '../../database/DeptDetailRepository';
import { useDeptDetailStore } from '../../store/deptDetailStore';
import { useDeptStore } from '../../store/deptStore';

type TransactionScreenProps = {
  // type: any;
  // tag_id?: string;
  route: any;
  navigation: any;
};

const FundDetailScreen = ({ route, navigation }: TransactionScreenProps) => {
  const { fund_id, page_title,
    fund_name,
    total_income } = route.params || {};
  console.log(fund_name, total_income,)
  const [fundId, setFundId] = useState<string | null>(fund_id);
  const [toFundId, setToFundId] = useState<string | null>(null);
  const { group } = useCurrentGroup();
  const loadFundsByGroup = useFundStore(x => x.loadByGroup);
  const funds = useFundStore(x => x.funds);
  const fundDropdowns = funds.map(x => {
    return { label: x.name, value: x.fund_id }
  })

  const refreshTran = useTransactionStore(s => s.refresh);
  const addTransaction = useTransactionStore(s => s.addTransaction);
  const updateTransaction = useTransactionStore(s => s.updateTransaction);
  const deleteTransaction = useTransactionStore(s => s.deleteTransaction);

  const [totalTransaction, setTotalTransaction] = useState(0);
  const [countTransaction, setCountTransaction] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [editTransaction, setEditTransaction] = useState<any>(null);
  const [date, setDate] = useState<Date>(new Date());

  // Quản lý swipe refs + state
  const swipeableRefs = useRef<Record<string, any>>({});
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const lastTran = useTransactionStore(s => s.lastUpdated);
  const [showHelp, setShowHelp] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [tags, setTags] = useState<DropdownItem[]>([]);
  const [tagSelected, setTagSelected] = useState(undefined);
  const [type, setType] = useState('move');
  const [balance, setBalance] = useState(total_income);

  const resetFilter = () => {
    setSearchText('');
    setShowSearch(false);
    setParams({ keyword: '' });
  };

  const handleSearch = () => {
    reset({ keyword: searchText }); // reset paging với keyword mới
  };

  const fetchTransactions = useCallback(
    (page: number, pageSize: number, params: Record<string, any>) => {
      getBalanceByFunds(group.group_id, [fund_id]).then(x => setBalance(x[fund_id]));
      return getTransactionsWithPlanPaging(
        group?.group_id,
        page,
        pageSize,
        '',
        fund_id,
        params.keyword || '', // lấy từ params (keyword) chứ không lấy trực tiếp searchText
      ).then(rows => {
        return rows.map(r => ({ ...r }))
      });
    },
    [lastTran, group], // chỉ phụ thuộc group_id
  );

  const {
    data: transData,
    loading,
    hasMore,
    setParams,
    params,
    loadPage,
    reset,
  } = usePaging(fetchTransactions, 10);

  console.log(transData)

  useEffect(() => {
    setSearchText('');
    setShowSearch(false);
    reset({ keyword: '' });
    getAllTags().then(x => setTags(x.map(y => ({
      label: y.name,
      value: y.tag_id,
    }))));
    loadFundsByGroup(group?.group_id)
  }, [lastTran]);

  const handleSave = async () => {
    if (!amount.trim() || isNaN(Number(amount))) {
      Toast.show({ type: 'error', text1: 'Số tiền không hợp lệ' });
      return;
    }
    if (!group) return;

    if (editTransaction) {
      await updateTransaction({
        ...editTransaction,
        tag_id: tagSelected,
        description: desc || type,
        transaction_date: date.getTime(),
        amount: parseInt(amount, 10),
      });
      Toast.show({ type: 'success', text1: 'Đã cập nhật ' + type });
    } else {
      if (fundId) {
        const creRes = await addTransaction({
          group_id: group.group_id,
          type: 'move',
          tag_id: tagSelected,
          fund_id: fundId,
          to_fund_id: toFundId,
          amount: parseInt(amount, 10),
          description: desc || type,
          transaction_date: date.getTime(),
        });
        if (creRes.transaction_id != '') {
          Toast.show({ type: 'success', text1: 'Thành công' });
          refreshTran()
        }
        else {
          Toast.show({ type: 'error', text1: 'Số Tiền ko đủ hoặc giao dịch thất bại' });
        }
      }
      else {
        Toast.show({ type: 'error', text1: 'Vui lòng chọn ví' });
        return;
      }
    }

    setShowModal(false);
    handleResetModal();
    reset();
  };

  const handleDelete = async (item: any) => {
    await deleteTransaction(item.transaction_id);
    Toast.show({ type: 'success', text1: 'Đã xoá ' });
    reset();
  };

  const handleResetModal = () => {
    setFundId('')
    setType('expense')
    setAmount('');
    setDesc('');
    setFundId('')
  }

  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => (
      <FundDetailItem
        item={item}
        type={item.type}
        onEdit={i => {
          setEditTransaction({ ...i });
          setAmount(i.amount.toString());
          setDesc(i.description);
          setFundId(i.fund_id)
          setShowModal(true);
          setType(i.type)
        }}
        onDelete={handleDelete}
        swipeableRefs={swipeableRefs}
        enabledMap={enabledMap}
        setEnabledMap={setEnabledMap}
        activeId={activeId}
        setActiveId={setActiveId}
        fund_id={fund_id}
      />
    ),
    [handleDelete, enabledMap, activeId],
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{fund_name}</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => {
              if (showSearch == true) {
                setShowSearch(prev => !prev);
                resetFilter();
              } else {
                setShowSearch(prev => !prev);
              }
            }}
          >
            <Icon
              name="filter-variant"
              size={24}
              color={showSearch ? '#1976d2' : '#000'}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowHelp(true)}>
            <Icon name="lightbulb-on-outline" size={24} color="#2368fcff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Số Dư</Text>
        <Text style={styles.summaryDetail}>
          {balance.toLocaleString('vi-VN')} đ
        </Text>
      </View>

      {showSearch && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: 16,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
            paddingHorizontal: 10,
            backgroundColor: '#fff',
          }}
        >
          <TextInput
            style={{ flex: 1, height: 40 }}
            placeholder="Nhập từ khoá tìm kiếm..."
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity onPress={handleSearch}>
            <Icon name="magnify" size={24} color="#1976d2" />
          </TouchableOpacity>
        </View>
      )}
      {/* List */}
      <FlatList
        data={transData}
        keyExtractor={item => item.transaction_id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
        onEndReached={() => {
          if (!loading && hasMore) loadPage();
        }}
        onEndReachedThreshold={0.2}
        ListFooterComponent={
          loading ? <ActivityIndicator size="small" color="#000" /> : null
        }
        ListEmptyComponent={
          !loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
              }}
            >
              <Text style={{ fontSize: 16, color: '#666' }}>
                Không có dữ liệu
              </Text>
            </View>
          ) : null
        }
      />
      {/* Add button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditTransaction(null);
          setAmount('');
          setDesc('');
          setShowModal(true);
        }}
      >
        <Icon name="plus" size={28} color="#ffffffff" />
      </TouchableOpacity>
      <MoneyModal
        title={editTransaction ? 'Sửa ' : 'Thêm '}
        visible={showModal}
        onClose={() => {
          handleResetModal();
          setShowModal(false);
        }}
        onSave={handleSave}
        desc={desc}
        setDesc={setDesc}
        amount={amount}
        setAmount={setAmount}
        placeholder="Mô tả"
        moneyPlaceholder="Số Tiền"
        children={
          <>
            <View style={{ zIndex: 1000, left: -18 }}>
              <DropdownComponent data={fundDropdowns}
                placeholder="Chọn ví Nguồn"
                searchPlaceholder="Tìm ví..."
                value={fundId}
                onChange={setFundId} />
            </View>
            <View style={{ zIndex: 1000, left: -18 }}>
              <DropdownComponent data={fundDropdowns}
                placeholder="Chọn ví Đích"
                searchPlaceholder="Tìm ví..."
                value={toFundId}
                onChange={setToFundId} />
            </View>
            <View style={{ width: 290, margin: 5, marginLeft: 18, zIndex: 1000, left: -18 }}>
              <DatePicker
                value={date}
                onChange={setDate}
                mode="date"
                maximumDate={new Date()}
              />
            </View>
          </>
        }
      />
    </View>
  );
};

export default FundDetailScreen;
