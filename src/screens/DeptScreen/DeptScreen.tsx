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
  Dept,
  getDeptsPaging
} from '../../database/DeptRepository';
import { useCurrentGroup } from '../../hooks/useCurrentGroup';
import { useDeptStore } from '../../store/deptStore';
import Toast from 'react-native-toast-message';
import { styles } from './DeptScreen.style';
import { DeptItem } from './DeptItem';
import { useFundStore } from '../../store/fundStore';
import DatePicker from '../../components/shared/DatePicker';
import { getAllTags } from '../../database/TagRepository';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useTagStore } from '../../store/tagStore';
import AppModal from '../../components/shared/AppModal';
import { getDeptSummaryPaging } from '../../database/DeptDetailRepository';
import { formatMoney } from '../../utils/moneyFormat';

type DeptScreenProps = {
  route: any;
  navigation: any;
};

const DeptScreen = ({ route, navigation }: DeptScreenProps) => {
  const { group } = useCurrentGroup();
  const addDept = useDeptStore(s => s.addDept);
  const updateDept = useDeptStore(s => s.updateDept);
  const deleteDept = useDeptStore(s => s.removeDept);
  const [showModal, setShowModal] = useState(false);
  const [desc, setDesc] = useState('');
  const [editDept, setEditDept] = useState<Dept | null>(null);

  // Quản lý swipe refs + state
  const swipeableRefs = useRef<Record<string, any>>({});
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const lastTran = useDeptStore(s => s.lastUpdated);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [sum, setSum] = useState(0);

  const resetFilter = () => {
    setSearchText('');
    setShowSearch(false);
    setParams({ keyword: '' });
  };

  const handleSearch = () => {
    reset({ keyword: searchText }); // reset paging với keyword mới
  };

  const fetchDepts = useCallback(
    (page: number, pageSize: number, params: Record<string, any>) => {
      if (!group?.group_id) return Promise.resolve([]);
      return getDeptSummaryPaging(
        page,
        pageSize,
        params.keyword || ''
      ).then(rows => {
        setSum(rows.sum);
        return rows.list.map(r => ({ ...r }))
      });
    },
    [group?.group_id, lastTran], // chỉ phụ thuộc group_id
  );

  const {
    data: deptData,
    loading,
    hasMore,
    setParams,
    loadPage,
    reset,
  } = usePaging(fetchDepts, 10);
  console.log(deptData)
    ;
  useEffect(() => {
    if (group?.group_id) {
      setSearchText('');
      setShowSearch(false);
      reset({ keyword: '' });
    }
  }, [group?.group_id, lastTran]);

  const handleSave = async () => {
    if (editDept) {
      await updateDept(
        editDept.dept_id,
        desc,
      );
      Toast.show({ type: 'success', text1: 'Đã cập nhật ' });
    } else {
      const creRes = await addDept({
        description: desc,
      });

      if (creRes?.dept_id != '') {
        Toast.show({ type: 'success', text1: 'Thành công' });
      }
      else {
        Toast.show({ type: 'error', text1: 'Số Tiền ko đủ hoặc giao dịch thất bại' });
      }
    }

    setShowModal(false);
    setDesc('');
    setEditDept(null);
    reset();
  };

  const handleDelete = async (item: any) => {
    await deleteDept(item.dept_id);
    Toast.show({ type: 'success', text1: 'Đã xoá ' });
    reset();
  };

  const renderItem = useCallback(
    ({ item }: { item: Dept }) => (
      <DeptItem
        item={item}
        type={"income"}
        onEdit={i => {
          setEditDept({ ...i });
          setDesc(i.description);
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
        <Text style={styles.headerTitle}>Vay - Nợ</Text>
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
          {/* <TouchableOpacity onPress={() => setShowHelp(true)}>
            <Icon name="lightbulb-on-outline" size={24} color="#2368fcff" />
          </TouchableOpacity> */}
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Tổng cộng</Text>
        <Text style={styles.summaryDetail}>
          {formatMoney(sum)} đ
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
        data={deptData}
        keyExtractor={item => item.dept_id}
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
          setEditDept(null);
          setDesc('');
          setShowModal(true);
        }}
      >
        <Icon name="plus" size={28} color="#ffffffff" />
      </TouchableOpacity>
      <AppModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        title={editDept ? 'Sửa ' : 'Thêm '}
        children={
          <>
            <TextInput
              style={styles.input}
              placeholder={"Mô tả"}
              value={desc}
              onChangeText={setDesc}
            />
          </>
        }
      />
    </View>
  );
};

export default DeptScreen;
