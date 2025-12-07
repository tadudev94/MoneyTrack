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
  getCountTransByGroup,
  getTotalTransByGroup,
  getTransactionsByGroupPaging,
  getTransactionsWithPlanPaging,
  Transaction,
} from '../../database/TransactionRepository';
import { useCurrentGroup } from '../../hooks/useCurrentGroup';
import { useTransactionStore } from '../../store/transactionStore';
import Toast from 'react-native-toast-message';
import { styles } from './TransactionScreen.style';
import HelpModal from '../../components/shared/HelpModal';
import MoneyModal from '../../components/shared/MoneyModal';
import DropdownComponent, { DropdownItem } from '../../components/shared/DropdownComponent';
import { TransactionItem } from './TransactionItem';
import { useFundStore } from '../../store/fundStore';
import DatePicker from '../../components/shared/DatePicker';
import { getAllTags } from '../../database/TagRepository';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useTagStore } from '../../store/tagStore';

type TransactionScreenProps = {
  // type: any;
  // tag_id?: string;
  route: any;
  navigation: any;
};

const TransactionScreen = ({ route, navigation }: TransactionScreenProps) => {
  const { typeInput, expense_plan_id } = route.params || {};
  let type = '';
  if (typeInput == 'expense_plan') {
    type = 'expense'
    console.log(expense_plan_id)
  }
  else {
    type = typeInput ?? "income"
  }
  const [fundId, setFundId] = useState<string | null>(null);
  const { group } = useCurrentGroup();
  const loadFundsByGroup = useFundStore(x => x.loadByGroup);
  const funds = useFundStore(x => x.funds);
  const fundDropdowns = funds.map(x => {
    return { label: x.name, value: x.fund_id }
  })
  // const type = 'expense';
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
  console.log(lastTran, 'lasttra')
  const [showHelp, setShowHelp] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [tags, setTags] = useState<DropdownItem[]>([]);
  const [tagSelected, setTagSelected] = useState(undefined);

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
      if (!group?.group_id) return Promise.resolve([]);
      return getTransactionsWithPlanPaging(
        group.group_id,
        page,
        pageSize,
        type,
        expense_plan_id,
        params.keyword || '', // lấy từ params (keyword) chứ không lấy trực tiếp searchText
      ).then(rows => {
        return rows.map(r => ({ ...r }))
      });
    },
    [group?.group_id, lastTran], // chỉ phụ thuộc group_id
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

  const calSumary = async () => {
    if (group?.group_id) {
      getCountTransByGroup(group.group_id, type, params.keyword).then(
        setCountTransaction,
      );
      getTotalTransByGroup(group.group_id, type, params.keyword).then(
        setTotalTransaction,
      );
    }
  };
  useEffect(() => {
    calSumary();
    if (group) {
      loadFundsByGroup(group?.group_id)

    }
  }, [group?.group_id, params]);

  useEffect(() => {
    if (group?.group_id) {
      setSearchText('');
      setShowSearch(false);
      reset({ keyword: '' });
      calSumary();
      getAllTags().then(x => setTags(x.map(y => ({
        label: y.name,
        value: y.tag_id,
      }))));
    }
  }, [group?.group_id, lastTran]);

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
          type: type,
          tag_id: tagSelected,
          fund_id: fundId,
          amount: parseInt(amount, 10),
          description: desc || type,
          transaction_date: date.getTime(),
        });
        if (creRes.transaction_id != '') {
          Toast.show({ type: 'success', text1: 'Thành công' });
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

  const handleResetModal = () => {
    setDate(new Date());
    setAmount('');
    setDesc('');
    setEditTransaction(null);
    setTagSelected(undefined)
    setFundId(null);
  }
  const handleDelete = async (item: any) => {
    await deleteTransaction(item.transaction_id);
    Toast.show({ type: 'success', text1: 'Đã xoá ' + type });
    reset();
  };

  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => (
      <TransactionItem
        item={item}
        type={type}
        onEdit={i => {
          setEditTransaction({ ...i });
          setAmount(i.amount.toString());
          setDesc(i.description);
          setTagSelected(i.tag_id);
          setFundId(i.fund_id);
          setShowModal(true);
        }}
        onDelete={handleDelete}
        swipeableRefs={swipeableRefs}
        enabledMap={enabledMap}
        setEnabledMap={setEnabledMap}
        activeId={activeId}
        setActiveId={setActiveId}
      />
    ),
    [handleDelete, enabledMap, activeId],
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{type}</Text>
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
        <Text style={styles.summaryTitle}>Tổng cộng</Text>
        <Text style={styles.summaryDetail}>
          {countTransaction} khoản – {totalTransaction.toLocaleString('vi-VN')} đ
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
          handleResetModal()
          // setEditTransaction(null);
          // setAmount('');
          // setDesc('');
          setShowModal(true);
        }}
      >
        <Icon name="plus" size={28} color="#ffffffff" />
      </TouchableOpacity>
      <MoneyModal
        title={editTransaction ? 'Sửa ' + type : 'Thêm ' + type}
        visible={showModal}
        onClose={() => setShowModal(false)}
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
                placeholder="Chọn ví"
                searchPlaceholder="Tìm ví..."
                value={fundId}
                onChange={setFundId} />
            </View>
            <View style={{ zIndex: 1000, left: -18 }}>
              <DropdownComponent data={tags}
                placeholder="Chọn Tag"
                searchPlaceholder="Tìm Tag"
                value={tagSelected}
                onChange={setTagSelected} />
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
      <HelpModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title="Hướng dẫn màn hình Thu"
        tips={[
          'Nhấn giữ vào Thu để mở thao tác Sửa/Xoá.',
          'Nhấn nút dấu + để thêm Thu mới.',
          'Tổng số Thu và số tiền hiển thị ở phần đầu màn hình.',
          'Icon xanh lá đại diện cho đóng Ví, icon xanh dương đại diện cho các khoản ngoài Ví'
        ]}
      />
    </View>
  );
};

export default TransactionScreen;
