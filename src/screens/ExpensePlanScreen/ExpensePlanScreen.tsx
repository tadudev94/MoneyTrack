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
  ExpensePlan,
  getExpensePlansPaging,
  getExpensePlansPagingWithSpent
} from '../../database/ExpensePlanRepository';
import { useExpensePlanStore } from '../../store/expensePlanStore';
import Toast from 'react-native-toast-message';
import { styles } from './ExpensePlanScreen.style';
import { ExpensePlanItem } from './ExpensePlanItem';
import AppModal from '../../components/shared/AppModal';
import { useTagStore } from '../../store/tagStore';
import { Tag, getAllTags } from '../../database/TagRepository';
import DropdownComponent, { DropdownItem } from '../../components/shared/DropdownComponent';
import DatePicker from '../../components/shared/DatePicker';
import MoneyInput from '../../components/shared/MoneyInput';

const ExpensePlanScreen = () => {
  const addExpensePlan = useExpensePlanStore(s => s.addExpensePlan);
  const updateExpensePlan = useExpensePlanStore(s => s.updateExpensePlan);
  const deleteExpensePlan = useExpensePlanStore(s => s.deleteExpensePlan);
  const lastUpdated = useExpensePlanStore(s => s.lastUpdated);

  const [showModal, setShowModal] = useState(false);
  const [planValue, setPlanValue] = useState('');
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());
  const [editPlan, setEditPlan] = useState<ExpensePlan | null>(null);
  const [tags, setTags] = useState<DropdownItem[]>([]);

  const swipeableRefs = useRef<Record<string, any>>({});
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const lastTran = useTagStore(s => s.lastUpdated);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [tagSelected, setTagSelected] = useState('');
  const resetFilter = () => {
    setSearchText('');
    setShowSearch(false);
    setParams({ keyword: '', tagId: undefined });
  };

  const handleSearch = () => {
    reset({ keyword: searchText, tagId: tagSelected });
  };

  const handleDateChange = (selectedDate?: Date) => {
    if (selectedDate) {
      // ép ngày = 1
      const firstOfMonth = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
      );
      setFromDate(firstOfMonth);
    }
  };

  const fetchPlans = useCallback(
    (page: number, pageSize: number, params: Record<string, any>) => {
      return getExpensePlansPagingWithSpent(
        page,
        pageSize,
        params.tagId,
        params.keyword
      ).then(res => res.plans.map(p => ({ ...p })));
    },
    []
  );

  const { data: plans, loading, hasMore, setParams, loadPage, reset } = usePaging(fetchPlans, 10);

  useEffect(() => {
    reset({ keyword: '', tagId: undefined });
    getAllTags().then(x => setTags(x.map(y => ({
      label: y.name,
      value: y.tag_id,
    }))));
  }, [lastUpdated]);

  const handleSave = async () => {
    if (!tagSelected) {
      Toast.show({ type: 'error', text1: 'Vui lòng chọn Tag' });
      return;
    }

    const planData = {
      tag_id: tagSelected,
      from_date: fromDate.getTime(),
      to_date: toDate.getTime(),
      value: parseInt(planValue),
    };

    if (editPlan) {
      await updateExpensePlan({ ...editPlan, ...planData });
      Toast.show({ type: 'success', text1: 'Đã cập nhật' });
    } else {
      await addExpensePlan(planData);
      Toast.show({ type: 'success', text1: 'Thành công' });
    }

    setShowModal(false);
    setPlanValue('');
    setEditPlan(null);
    reset();
  };

  const handleDelete = async (item: ExpensePlan) => {
    await deleteExpensePlan(item.expense_plan_id);
    Toast.show({ type: 'success', text1: 'Đã xoá' });
    reset();
  };

  const renderItem = useCallback(
    ({ item }: { item: ExpensePlan }) => (
      <ExpensePlanItem
        item={item}
        onEdit={i => {
          setEditPlan({ ...i });
          setPlanValue(i.value.toString());
          setFromDate(new Date(i.from_date));
          setToDate(new Date(i.to_date));
          setTagSelected(i.tag_id);
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
    [handleDelete],
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kế hoạch chi</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => {
              if (showSearch) {
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
        </View>
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
            placeholder="Tìm theo tag hoặc giá trị..."
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity onPress={handleSearch}>
            <Icon name="magnify" size={24} color="#1976d2" />
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={plans}
        keyExtractor={item => item.expense_plan_id}
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <Text style={{ fontSize: 16, color: '#666' }}>Không có dữ liệu</Text>
            </View>
          ) : null
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setEditPlan(null);
          setPlanValue('');
          setShowModal(true);
        }}
      >
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      <AppModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        title={editPlan ? 'Sửa Expense Plan' : 'Thêm Expense Plan'}
        children={
          <View>
            {/* Tag Input */}
            <View style={{ zIndex: 1000, left: -18 }}>
              <DropdownComponent data={tags}
                placeholder="Chọn tag"
                style={{ width: 285, marginBottom: 5 }}
                searchPlaceholder="Tìm Tag..."
                value={tagSelected}
                onChange={setTagSelected} />
            </View>
            {/* From Date */}
            <View style={{ width: 285, margin: 5, marginLeft: 18, zIndex: 1000, left: -19 }}>
              <DatePicker
                value={fromDate}
                onChange={(d) => handleDateChange(d)}
              // maximumDate={new Date()}
              />
            </View>

            {/* Value */}
            <MoneyInput
              value={planValue}
              onChange={setPlanValue}
              placeholder={"Hạn Mức"}
            />
          </View>
        }
      />
    </View>
  );
};

export default ExpensePlanScreen;
