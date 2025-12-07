import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePaging } from '../../hooks/usePaging';
import {
  getMembersByGroupPaging,
  createMember,
  Member,
  updateMember,
} from '../../database/MemberRepository';
import { useCurrentGroup } from '../../hooks/useCurrentGroup';
import { styles } from './MemberScreen.style';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import HelpModal from '../../components/shared/HelpModal';

type ScreenNavigationProp = NativeStackNavigationProp<
  {
    MemberSettings: {
      memberId: string;
      memberName: string;
    };
  },
  'MemberSettings'
>;

const MemberScreen = () => {
  const navigation = useNavigation();
  const { group } = useCurrentGroup();
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('');
  // single selection id
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const fetchMembers = async (page: number, pageSize: number) => {
    if (!group) return [];
    const { members } = await getMembersByGroupPaging(
      group.group_id,
      page,
      pageSize,
    );
    return members;
  };

  const {
    data: members,
    loading,
    hasMore,
    loadPage,
    reset,
  } = usePaging<Member>(fetchMembers, 10);

  useEffect(() => {
    reset(); // load khi mount hoặc group thay đổi
  }, [group?.group_id]);

  // select one only: toggle single id
  const toggleSelect = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  const handleAddOrEditMember = async () => {
    if (!memberName.trim() || !group) return;

    if (editingMember) {
      await updateMember({
        member_id: editingMember.member_id,
        name: memberName.trim(),
        role: memberRole.trim() || undefined,
      });
      setEditingMember(null);
    } else {
      await createMember({
        name: memberName.trim(),
        role: memberRole.trim() || undefined,
        group_id: group.group_id,
      });
    }

    setMemberName('');
    setMemberRole('');
    setShowModal(false);
    reset();
    setSelectedId(null);
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setMemberName(member.name);
    setMemberRole(member.role || '');
    setShowModal(true);
    setSelectedId(member.member_id); // select this one (single select)
  };

  const total = members.length;

  const renderMember = ({ item }: { item: Member }) => {
    const isSelected = selectedId === item.member_id;

    return (
      <TouchableOpacity
        style={[styles.memberCard, isSelected && styles.memberSelected]}
        onPress={() => toggleSelect(item.member_id)} // chỉ select, không mở modal
      >
        {/* left: avatar + text */}
        <View style={styles.memberInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name && item.name.length > 0
                ? item.name.charAt(0).toUpperCase()
                : '?'}
            </Text>
          </View>
          <View style={styles.textWrap}>
            <Text style={styles.memberName}>{item.name}</Text>
            {item.role ? (
              <Text style={styles.memberRole}>{item.role}</Text>
            ) : null}
          </View>
        </View>

        {/* right: action icons */}
        {isSelected && (
          <View style={styles.actionIcons}>
            {/* nút sửa */}
            <TouchableOpacity
              style={{ padding: 8 }}
              onPress={() => openEditModal(item)}
            >
              <Icon name="pencil" size={22} color="#555" />
            </TouchableOpacity>

            {/* nút setting */}
            <TouchableOpacity
              style={{ padding: 8 }}
              onPress={() =>
                navigation.navigate('MemberSettings', {
                  memberId: item.member_id,
                  memberName: item.name,
                })
              }
            >
              <Icon name="cog" size={22} color="#555" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Danh sách thành viên</Text>
        <TouchableOpacity onPress={() => setShowHelp(true)}>
          <Icon name="lightbulb-on-outline" size={24} color="#2368fcff" />
        </TouchableOpacity>
      </View>

      {/* Thống kê */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Tổng quan</Text>
        <Text style={styles.summaryDetail}>{total} thành viên</Text>
      </View>

      {/* Danh sách */}
      <FlatList
        data={members}
        keyExtractor={item => item.member_id}
        renderItem={renderMember}
        contentContainerStyle={{ paddingBottom: 100 }}
        onEndReached={() => hasMore && loadPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator style={{ margin: 10 }} /> : null
        }
      />

      {/* Nút thêm member */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setShowModal(true);
          setEditingMember(null);
          setSelectedId(null);
        }}
      >
        <Icon name="plus" size={28} color="#fff" />
      </TouchableOpacity>

      <HelpModal
        visible={showHelp}
        onClose={() => setShowHelp(false)}
        title="Hướng dẫn màn hình Thành Viên"
        tips={[
          'Chọn thành viên cần thao tác. Bấm vào icon bánh răng cưa để cài đặt Ví mà thành viên đó tham gia vào, sau khi cài đặt tên của thành viên sẽ xuất hiện trong Ví',
          'Chọn biểu tượng bút chì để sửa thông tin của thành viên đó',
        ]}
      />

      <Modal visible={showModal} transparent animationType="slide">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setShowModal(false);
            setMemberName(''); // reset input
            setMemberRole('');
            setEditingMember(null); // nếu có
            setSelectedId(null);
          }}
        >
          {/* Bên trong modalBox, chặn sự kiện nhấn lan ra overlay */}
          <Pressable style={styles.modalBox} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>
              {editingMember ? 'Sửa thành viên' : 'Thêm thành viên'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Tên thành viên"
              value={memberName}
              onChangeText={setMemberName}
            />
            <TextInput
              style={styles.input}
              placeholder="Vai trò (tùy chọn)"
              value={memberRole}
              onChangeText={setMemberRole}
            />
            <TouchableOpacity
              style={styles.createBtn}
              onPress={handleAddOrEditMember}
            >
              <Text style={styles.createBtnText}>
                {editingMember ? 'Cập nhật' : 'Thêm'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setShowModal(false);
                setMemberName('');
                setMemberRole('');
                setEditingMember(null);
                setSelectedId(null);
              }}
            >
              <Text
                style={{ textAlign: 'center', marginTop: 10, color: '#999' }}
              >
                Huỷ
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};
export default MemberScreen;
