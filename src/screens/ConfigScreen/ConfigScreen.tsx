import React, { useEffect, useState } from 'react';
import Share from 'react-native-share';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getAllGroups } from '../../database/GroupRepository';
import { useGroupStore } from '../../store/groupStore';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { styles } from './ConfigScreen.style';
import DeviceInfo from 'react-native-device-info';
import Rate, { AndroidMarket } from 'react-native-rate';

export default function ConfigScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [aboutVisible, setAboutVisible] = useState(false); // <-- thêm state
  const [newGroupName, setNewGroupName] = useState('');
  const versionName = DeviceInfo.getVersion();
  const versionCode = DeviceInfo.getBuildNumber();
  const { addGroup, setCurrentGroup, currentGroupId } = useGroupStore();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    const data = await getAllGroups();
    setGroups(data);
    setLoading(false);
  };

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    await addGroup({ name: newGroupName.trim() });
    setNewGroupName('');
    setShowModal(false);
    loadGroups();
  };

  return (
    <View style={styles.container}>
      {/* Header cố định */}
      <View>
        {/* user info */}
        <View style={styles.userBox}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>DU</Text>
          </View>
          <View>
            <Text style={styles.userName}>Du Ta</Text>
            <Text style={styles.userEmail}>duta08642@gmail.com</Text>
          </View>
          {/* nút edit chưa có thì để mờ */}
          <View style={{ marginLeft: 'auto', opacity: 0.3 }}>
            <Icon name="edit" size={20} color="#666" />
          </View>
        </View>

        {/* archived */}
        <View style={[styles.archiveBox, { opacity: 0.5 }]}>
          <Icon name="archive" size={20} color="#999" />
          <Text style={[styles.archiveText, { color: '#999' }]}>
            Đã lưu trữ (sắp có)
          </Text>
          <Icon
            name="chevron-right"
            size={20}
            color="#999"
            style={{ marginLeft: 'auto' }}
          />
        </View>

        {/* section header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Danh sách nhóm</Text>
          <TouchableOpacity onPress={() => setShowModal(true)}>
            <Icon name="add-circle" size={24} color="#1976d2" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chỉ scroll danh sách nhóm */}
      <FlatList
        style={{ flex: 1 }}
        data={groups}
        keyExtractor={item => item.group_id}
        renderItem={({ item }) => {
          const isActive = item.group_id === currentGroupId;
          return (
            <TouchableOpacity
              style={[styles.groupItem, isActive && styles.groupItemActive]}
              onPress={() => {
                setCurrentGroup(item.group_id);
                navigation.goBack();
              }}
            >
              <Text
                style={[styles.groupName, isActive && styles.groupNameActive]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          !loading && (
            <Text style={{ textAlign: 'center', marginVertical: 20 }}>
              Chưa có nhóm nào
            </Text>
          )
        }
      />

      {/* Footer cố định */}
      <View style={styles.footer}>
        <SettingItem icon="settings" label="Cài đặt" comingSoon />
        <Divider />
        <SettingItem icon="support-agent" label="Hỗ trợ online" comingSoon />
        <Divider />
        <SettingItem
          icon="share"
          label="Mời bạn bè"
          onPress={async () => {
            try {
              await Share.open({
                message:
                  'Tải ứng dụng Ví Lớp tại đây: https://play.google.com/store/apps/details?id=money_v1.vn',
              });
            } catch (err) {
              console.log('❌ Share error:', err);
            }
          }}
        />
        <Divider />
        <SettingItem
          icon="star-rate"
          label="Đánh giá ứng dụng"
          onPress={() => {
            const options = {
              AppleAppID: '1234567890',
              GooglePackageName: 'money_v1.vn',
              preferredAndroidMarket: AndroidMarket.Google,
              preferInApp: false,
              openAppStoreIfInAppFails: true,
            };

            Rate.rate(options, success => {
              if (success) {
                console.log('✅ User went to store to review');
              }
            });
          }}
        />
        <Divider />
        <SettingItem
          icon="info"
          label="Về chúng tôi"
          onPress={() => setAboutVisible(true)} // <-- mở modal
        />

        <Text style={[styles.versionText, { marginTop: 12 }]}>
          Phiên bản: {versionName} (Build {versionCode})
        </Text>
      </View>

      {/* Modal thêm group */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Tạo nhóm mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên nhóm..."
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <TouchableOpacity style={styles.createBtn} onPress={handleAddGroup}>
              <Text style={styles.createBtnText}>Tạo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text
                style={{ textAlign: 'center', marginTop: 10, color: '#999' }}
              >
                Huỷ
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Về chúng tôi */}
      <AboutModal visible={aboutVisible} onClose={() => setAboutVisible(false)} />
    </View>
  );
}

function SettingItem({
  icon,
  label,
  comingSoon = false,
  onPress,
}: {
  icon: string;
  label: string;
  comingSoon?: boolean;
  onPress?: () => void;
}) {
  const Wrapper: any = comingSoon ? View : TouchableOpacity;
  return (
    <Wrapper
      style={[styles.settingItem, comingSoon && { opacity: 0.5 }]}
      onPress={!comingSoon && onPress ? onPress : undefined}
      activeOpacity={0.7}
    >
      <Icon name={icon} size={20} color={comingSoon ? '#aaa' : '#555'} />
      <Text style={[styles.settingText, comingSoon && { color: '#aaa' }]}>
        {label}
        {comingSoon ? ' (sắp có)' : ''}
      </Text>
    </Wrapper>
  );
}

function AboutModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const versionName = DeviceInfo.getVersion();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>Về chúng tôi</Text>
          <Text style={{ marginVertical: 8, textAlign: 'center' }}>
            Ứng dụng Quản lý Ví lớp v{versionName}
            {'\n'}
            Tác giả: TaduDev
            {'\n'}
            Liên hệ: ducntdev94@gmail.com
          </Text>
          <TouchableOpacity style={styles.createBtn} onPress={onClose}>
            <Text style={styles.createBtnText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function Divider() {
  return (
    <View style={{ height: 1, backgroundColor: '#eee', marginVertical: 6 }} />
  );
}
  