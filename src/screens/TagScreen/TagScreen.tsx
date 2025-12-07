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
  Tag,
  getTagsPaging
} from '../../database/TagRepository';
import { useCurrentGroup } from '../../hooks/useCurrentGroup';
import { useTagStore } from '../../store/tagStore';
import Toast from 'react-native-toast-message';
import { styles } from './TagScreen.style';
import { TagItem } from './TagItem';
import AppModal from '../../components/shared/AppModal';


const TagScreen = () => {
  const { group } = useCurrentGroup();
  const addTag = useTagStore(s => s.addTag);
  const updateTag = useTagStore(s => s.updateTag);
  const deleteTag = useTagStore(s => s.deleteTag);

  const [countTag, setCountTag] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [tagName, setTagName] = useState('');
  const [editTag, setEditTag] = useState<any>(null);

  // Quản lý swipe refs + state
  const swipeableRefs = useRef<Record<string, any>>({});
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const lastTran = useTagStore(s => s.lastUpdated);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState('');
  const resetFilter = () => {
    setSearchText('');
    setShowSearch(false);
    setParams({ keyword: '' });
  };

  const handleSearch = () => {
    reset({ keyword: searchText }); // reset paging với keyword mới
  };

  const fetchTags = useCallback(
    (page: number, pageSize: number, params: Record<string, any>) => {
      return getTagsPaging(
        page,
        pageSize,
        params.keyword || '', // lấy từ params (keyword) chứ không lấy trực tiếp searchText
      ).then(rows => rows.tags.map(r => ({ ...r })));
    }, []
  );

  const {
    data: tags,
    loading,
    hasMore,
    setParams,
    loadPage,
    reset,
  } = usePaging(fetchTags, 10);

  useEffect(() => {
    if (group?.group_id) {
      setSearchText('');
      setShowSearch(false);
      reset({ keyword: '' });
    }
  }, [group?.group_id, lastTran]);

  const handleSave = async () => {
    if (editTag) {
      await updateTag({
        ...editTag,
        name: tagName,
      });
      Toast.show({ type: 'success', text1: 'Đã cập nhật' });
    } else {
      const creRes = await addTag({
        name: tagName,
      });
      if (creRes.tag_id != '') {
        Toast.show({ type: 'success', text1: 'Thành công' });
      }
    }

    setShowModal(false);
    setTagName('');
    setEditTag(null);
    reset();
  };

  const handleDelete = async (item: any) => {
    await deleteTag(item.tag_id);
    Toast.show({ type: 'success', text1: 'Đã xoá' });
    reset();
  };

  const renderItem = useCallback(
    ({ item }: { item: Tag }) => (
      <TagItem
        item={item}
        onEdit={i => {
          setEditTag({ ...i });
          setTagName(i.name);
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
        <Text style={styles.headerTitle}>Tags</Text>
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
        </View>
      </View>

      {/* Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Tổng Quan</Text>
        <Text style={styles.summaryDetail}>
          {countTag} Tags
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
        data={tags}
        keyExtractor={item => item.tag_id}
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
          setEditTag(null);
          setTagName('');
          setShowModal(true);
        }}
      >
        <Icon name="plus" size={28} color="#ffffffff" />
      </TouchableOpacity>
      <AppModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        title={editTag ? 'Sửa ' : 'Thêm '}
        children={
          <TextInput
            style={styles.input}
            placeholder={"Tên Tag"}
            value={tagName}
            onChangeText={setTagName}
          />
        }
      />
    </View>
  );
};

export default TagScreen;
