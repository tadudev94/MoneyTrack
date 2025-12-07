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
import { styles } from './DeptDetailScreen.style';
import HelpModal from '../../components/shared/HelpModal';
import MoneyModal from '../../components/shared/MoneyModal';
import DropdownComponent, { DropdownItem } from '../../components/shared/DropdownComponent';
import { TransactionItem } from './DeptDetailItem';
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

const DeptDetailScreen = ({ route, navigation }: TransactionScreenProps) => {
  const { dept_id, page_title } = route.params || {};
  console.log(dept_id)
  const [fundId, setFundId] = useState<string | null>(null);
  const { group } = useCurrentGroup();
  const loadFundsByGroup = useFundStore(x => x.loadByGroup);
  const refreshDept = useDeptStore(x => x.refresh);
  const funds = useFundStore(x => x.funds);
  const fundDropdowns = funds.map(x => {
    return { label: x.name, value: x.fund_id }
  })

  const { createWithTransaction, updateDetail, removeDetail, refresh } = useDeptDetailStore(s => s);
  const refreshTran = useTransactionStore(s => s.refresh);
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
  const [type, setType] = useState('expense');

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
      return getDeptDetailsPaging(
        page,
        pageSize,
        dept_id,
        params.keyword || '', // lấy từ params (keyword) chứ không lấy trực tiếp searchText
      ).then(rows => {
        return rows.details.map(r => ({ ...r }))
      });
    },
    [lastTran], // chỉ phụ thuộc group_id
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
    const fullDesc = `${page_title}: ${desc}`
    if (editTransaction) {
      await updateTransaction({
        ...editTransaction,
        tag_id: tagSelected,
        description: fullDesc,
        transaction_date: date.getTime(),
        amount: parseInt(amount, 10),
      });

      Toast.show({ type: 'success', text1: 'Đã cập nhật ' });
    } else {
      if (fundId) {
        const creRes = await createWithTransaction({
          group_id: group.group_id,
          type: type,
          tag_id: type == 'income' ? TAG_ID_DUOC_TRA_NO : TAG_ID_CHO_VAY,
          fund_id: fundId,
          amount: parseInt(amount, 10),
          description: fullDesc || type,
          transaction_date: date.getTime(),
        }, { description: fullDesc || type, dept_id });

        if (creRes.transaction_id != '') {
          refreshTran();
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

    refreshDept();
    setShowModal(false);
    setDate(new Date());
    setAmount('');
    setDesc('');
    setEditTransaction(null);
    setFundId(null);
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
    setShowModal(true);
  }

  const renderItem = useCallback(
    ({ item }: { item: Transaction }) => (
      <TransactionItem
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
      />
    ),
    [handleDelete, enabledMap, activeId],
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{page_title}</Text>
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
                placeholder="Chọn ví"
                searchPlaceholder="Tìm ví..."
                value={fundId}
                onChange={setFundId} />
            </View>
            <View style={{ zIndex: 1000, left: -18 }}>
              <DropdownComponent data={[{ label: 'Được Trả', value: "income" }, {
                label: 'Cho Vay', value: 'expense'
              }]}
                placeholder="Loại"
                searchPlaceholder="Tìm ..."
                value={type}
                onChange={setType} />
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

export default DeptDetailScreen;
