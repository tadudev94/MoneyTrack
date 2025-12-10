import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Pressable,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useCurrentGroup } from '../../hooks/useCurrentGroup';
import { useTransactionStore } from '../../store/transactionStore';
import {
  getTotalExpenseByGroup,
  getTotalIncomeByGroup,
} from '../../database/TransactionRepository';
import { styles } from './HomeScreen.style';
import {
  Provider,
  TextInput,
  IconButton,
} from 'react-native-paper';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
} from 'react-native-popup-menu';
import { useGroupStore } from '../../store/groupStore';

type TabParamList = {
  Home: undefined;
  Fund: undefined;
  Member: undefined;
  Income: undefined;
  Expense: undefined;
  Config: undefined;
  Report: undefined;
  Tag: undefined;
  ExpensePlan: undefined;
  Dept: undefined;
};

type HomeScreenNavProp = BottomTabNavigationProp<TabParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavProp>();
  const { group } = useCurrentGroup();
  const { updateGroup, deleteGroup } = useGroupStore();
  const lastTran = useTransactionStore(s => s.lastUpdated);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  // menu
  const [menuVisible, setMenuVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [newName, setNewName] = useState(group?.name || '');
  const [showModal, setShowModal] = useState(false);

  const init = async () => {
    if (group?.group_id) {
      getTotalIncomeByGroup(group.group_id).then(setIncome);
      getTotalExpenseByGroup(group.group_id).then(setExpense);
    }
  };

  useEffect(() => {
    if (group?.group_id) {
      init();
      setNewName(group.name); // cập nhật khi đổi nhóm
    }
  }, [group, lastTran]);

  const handleEdit = () => {
    setShowModal(true);
    setMenuVisible(false);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert('Xóa nhóm', 'Bạn có chắc muốn xóa nhóm này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          if (group) {
            deleteGroup(group?.group_id);
          }
        },
      },
    ]);
  };

  const saveEdit = () => {
    if (group) {
      updateGroup(group.group_id, newName);
    }
    setEditVisible(false);
    setShowModal(false);
  };

  return (
    <Provider>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {/* nút menu trái */}
          <TouchableOpacity onPress={() => navigation.navigate('Config')}>
            <Icon name="menu" size={24} color="#000" />
          </TouchableOpacity>

          {/* tên nhóm */}
          <Text style={styles.headerTitle}>{group?.name}</Text>

          {/* nút 3 chấm + menu */}

          <Menu>
            <MenuTrigger>
              <IconButton
                icon="dots-vertical"
                size={22}
                iconColor="#000"
                style={{
                  margin: 0,
                  padding: 0,
                  minWidth: 0, // bỏ khung vuông mặc định
                  height: 24, // thu nhỏ đúng bằng icon
                  width: 24,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              />
            </MenuTrigger>

            <MenuOptions
              customStyles={{
                optionsContainer: {
                  paddingVertical: 4,
                  borderRadius: 8,
                  width: 120, //
                  backgroundColor: '#fff',
                  elevation: 4,
                  shadowColor: '#000',
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                },
              }}
            >
              <MenuOption
                onSelect={handleEdit}
                customStyles={{
                  optionWrapper: styles.menuItem,
                  optionText: styles.menuText,
                }}
                text="Sửa tên nhóm"
              />
              <MenuOption
                onSelect={handleDelete}
                customStyles={{
                  optionWrapper: styles.menuItem,
                  optionText: [
                    styles.menuText,
                    { color: 'red', fontWeight: '600' },
                  ],
                }}
                text="Xóa nhóm"
              />
            </MenuOptions>
          </Menu>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          {/* Card Tổng quan */}
          <View style={styles.card}>
            <View style={styles.overviewRow}>
              <OverviewItem
                label="Số Dư"
                value={(income - expense).toLocaleString() + ' đ'}
                icon="wallet"
              />
              <OverviewItem
                label="Tổng Thu"
                value={income.toLocaleString() + ' đ'}
                icon="cash-plus"
              />
              <OverviewItem
                label="Tổng Chi"
                value={expense.toLocaleString() + ' đ'}
                icon="cash-minus"
              />
            </View>
          </View>

          {/* Shortcut */}
          <View style={styles.card}>
            <View style={styles.row}>
              <Shortcut
                icon="wallet"
                label="Ví"
                color="#4CAF50"
                onPress={() => navigation.navigate('Fund')}
              />
              <Shortcut
                icon="cash-plus"
                label="Thu"
                color="#2196F3"
                onPress={() => navigation.navigate('Income')}
              />
              <Shortcut
                icon="cash-minus"
                label="Chi"
                color="#F44336"
                onPress={() => navigation.navigate('Expense')}
              />
            </View>

            <View style={styles.row}>
              <Shortcut
                icon="camera-plus"
                label="Snapshot"
                color="#9C27B0"
                onPress={() => navigation.navigate('Member')}
              />
              <Shortcut
                icon="file-chart"
                label="Báo cáo"
                color="#FF9800"
                onPress={() => navigation.navigate('Report')}
              />
              <Shortcut
                icon="tag"
                label="Tag"
                color="#718b73ff"
                onPress={() => navigation.navigate('Tag')}
              />
            </View>
            <View style={styles.row}>
              <Shortcut
                icon="calendar-range"
                label="Kế hoạch chi"
                color="#081e64ff"
                onPress={() => navigation.navigate('ExpensePlan')}
              />
              <Shortcut
                icon="account-cash-outline"
                label="Nợ"
                color="#9C27B0"
                onPress={() => navigation.navigate('Dept')}
              />
              <Shortcut />
            </View>
          </View>
        </ScrollView>

        <Modal visible={showModal} transparent animationType="slide">
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowModal(false)}
          >
            <Pressable
              style={styles.modalBox}
              onPress={e => e.stopPropagation()}
            >
              <Text style={styles.modalTitle}>Nhập Tên Nhóm</Text>
              <TextInput
                style={styles.input}
                placeholder="Tên Nhóm"
                keyboardType="default"
                value={newName}
                onChangeText={setNewName}
              />
              <TouchableOpacity style={styles.payBtn} onPress={saveEdit}>
                <Text style={styles.payBtnText}>Xác nhận</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowModal(false)}>
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
    </Provider>
  );
};

const OverviewItem = ({ label, value, icon }: any) => (
  <View style={styles.overviewItem}>
    <Icon name={icon} size={22} color="#E89C0C" />
    <Text style={styles.overviewLabel}>{label}</Text>
    <Text style={styles.overviewValue}>{value}</Text>
  </View>
);

const Shortcut = ({ icon, label, onPress, color = '#444' }: any) => (
  <TouchableOpacity style={styles.shortcut} onPress={onPress}>
    <View style={styles.shortcutIcon}>
      <Icon name={icon} size={40} color={color} />
    </View>
    <Text style={styles.shortcutLabel}>{label}</Text>
  </TouchableOpacity>
);

export default HomeScreen;
