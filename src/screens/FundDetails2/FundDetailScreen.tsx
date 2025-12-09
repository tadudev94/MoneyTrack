import React, { useEffect, useState } from 'react';
import { styles } from './FundDetailScreen.styles';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ActivityIndicator } from 'react-native-paper';
import { useCurrentGroup } from '../../hooks/useCurrentGroup';
import { usePaging } from '../../hooks/usePaging';
import {
  Member,
} from '../../database/MemberRepository';
import Toast from 'react-native-toast-message';
import { useTransactionStore } from '../../store/transactionStore';
import { formatMoney, parseMoney } from '../../utils/moneyFormat';
import {
  countFullyPaidMembersOfFund,
  getPaidAmountByMembers,
} from '../../database/TransactionRepository';
import {
  countMembersOfFund,
  getMembersOfFundPaging,
} from '../../database/FundMemberRepository';
import MoneyModal from '../../components/shared/MoneyModal';
import { useFundStore } from '../../store/fundStore';

type FundDetailProps = {
  route: any;
  navigation: any;
};

const FundDetailScreen = ({ route, navigation }: FundDetailProps) => {
  const { fundId, fundName, feePerMember, totalIncome } = route.params;
  const { group } = useCurrentGroup();
  if (!group) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <Icon name="alert-circle-outline" size={40} color="#999" />
        <Text style={{ marginTop: 10, fontSize: 16, color: '#999' }}>
          Vui lòng chọn nhóm trước khi xem Ví
        </Text>
      </View>
    );
  }

  const { lastUpdated, addTransaction } = useTransactionStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [showPayModal, setShowPayModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [paidMap, setPaidMap] = useState<Record<string, number>>({});
  const [countMember, setCountMember] = useState(0);
  const [countFullyPaidMem, setCountFullyPaidMem] = useState(0);

  // modal edit fund
  const [showEditFund, setShowEditFund] = useState(false);
  const [editFundName, setEditFundName] = useState(fundName);
  const [editFee, setEditFee] = useState(feePerMember.toString());
  const updateFund = useFundStore(x => x.updateFund);

  const handleChange = (text: string) => {
    setAmount(formatMoney(text));
  };

  // Fetch members của group
  const fetchMembers = async (page: number, pageSize: number) => {
    if (!group) return [];
    const members = await getMembersOfFundPaging(fundId, page, pageSize);
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
    if (group) reset();
  }, [group]);

  // ✅ Load tổng đóng góp theo member
  const loadPaidMap = async () => {
    const map = await getPaidAmountByMembers(group.group_id, fundId);
    setPaidMap(map);
  };

  useEffect(() => {
    loadPaidMap();
    countMembersOfFund(fundId).then(setCountMember);
    countFullyPaidMembersOfFund(fundId).then(setCountFullyPaidMem);
  }, [fundId, lastUpdated]);

  // Toggle chọn nhiều người
  const toggleSelect = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id],
    );
  };

  // Mở modal đóng tiền (có thể cho 1 hoặc nhiều người)
  const openPayModal = (memberId?: string) => {
    if (memberId) {
      setSelected([memberId]); // chỉ 1 người
    }
    setAmount('');
    setShowPayModal(true);
  };

  // Lưu transaction (đóng góp)
  const handlePay = async () => {
    const rawValue = parseMoney(amount);
    if (rawValue == 0) return;
    const value = rawValue;
    const now = Date.now();

    for (let memberId of selected) {
      const paid = paidMap[memberId] ?? 0;
      const remain = feePerMember - paid;

      if (value > remain) {
        const member = members.find(m => m.member_id === memberId);
        Toast.show({
          type: 'error',
          text1: 'Số tiền không hợp lệ',
          text2: `${
            member?.name ?? 'Thành viên'
          } chỉ còn thiếu ${remain.toLocaleString()} đ`,
        });

        setShowPayModal(false);
        setAmount('');
        return;
      }
    }

    for (let memberId of selected) {
      await addTransaction({
        group_id: group.group_id,
        fund_id: fundId,
        member_id: memberId,
        type: 'income',
        amount: value,
        description: 'Đóng Ví',
        transaction_date: now,
      });
    }

    setShowPayModal(false);
    setSelected([]);
    setAmount('');
  };

  // mở modal sửa fund
  const openEditFund = () => {
    setEditFundName(fundName);
    setEditFee(feePerMember.toString());
    setShowEditFund(true);
  };

  // lưu sửa fund
  const handleSaveFund = async () => {
    try {
      await updateFund(fundId, editFundName, parseMoney(editFee));
      Toast.show({ type: 'success', text1: 'Cập nhật Ví thành công' });
      setShowEditFund(false);
      navigation.setParams({
        fundName: editFundName,
        feePerMember: parseMoney(editFee),
      });
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Lỗi khi cập nhật Ví' });
    }
  };

  const renderMember = ({ item }: { item: Member }) => {
    const paid = paidMap[item.member_id] ?? 0;
    const isSelected = selected.includes(item.member_id);

    return (
      <TouchableOpacity
        style={[styles.memberCard, isSelected && styles.memberSelected]}
        onPress={() => toggleSelect(item.member_id)}
      >
        <View>
          <Text style={styles.memberName}>{item.name}</Text>
          {paid > feePerMember ? (
            <View style={styles.statusOverpaid}>
              <Icon name="star-circle" size={20} color="#FFC107" />
              <Text style={styles.statusText}>
                Đã đóng <Text style={styles.statusOverpaidText}>vượt</Text>{' '}
                {paid.toLocaleString()} đ /{feePerMember.toLocaleString()} đ
              </Text>
            </View>
          ) : paid === feePerMember ? (
            <View style={styles.statusPaid}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.statusText}>
                Đã đóng đủ {paid.toLocaleString()} đ /{' '}
                {feePerMember.toLocaleString()} đ
              </Text>
            </View>
          ) : paid > 0 ? (
            <View style={styles.statusPartial}>
              <Icon name="alert-circle" size={20} color="#FF9800" />
              <Text style={styles.statusText}>
                Đã đóng {paid.toLocaleString()} đ /{' '}
                {feePerMember.toLocaleString()} đ
              </Text>
            </View>
          ) : (
            <View style={styles.statusUnpaid}>
              <Icon name="close-circle" size={20} color="#F44336" />
              <Text style={styles.statusText}>
                Cần nộp {feePerMember.toLocaleString()} đ
              </Text>
            </View>
          )}
        </View>

        {isSelected && (
          <View style={styles.actionIcons}>
            <TouchableOpacity
              style={{ padding: 8 }}
              onPress={() =>
                navigation.navigate('TransactionHistory', {
                  fundId,
                  memberId: item.member_id,
                  memberName: item.name,
                })
              }
            >
              <Icon name="history" size={24} color="#555" />
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{fundName}</Text>
        <TouchableOpacity onPress={openEditFund}>
          <Icon name="pencil" size={22} color="#1976d2" />
        </TouchableOpacity>
      </View>

      {/* Tổng quan */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>
          Dư Ví / Tổng Tiền : {}
        </Text>
      </View>

      {/* Danh sách thành viên */}
      <FlatList
        data={members}
        keyExtractor={item => item.member_id}
        renderItem={renderMember}
        contentContainerStyle={{ paddingBottom: 80 }}
        onEndReached={() => hasMore && loadPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? <ActivityIndicator style={{ margin: 10 }} /> : null
        }
      />

      {/* Nút đóng tiền cho nhiều người */}
      {selected.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={() => openPayModal()}>
          <Icon name="cash-plus" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Modal nhập số tiền */}
      <Modal visible={showPayModal} transparent animationType="slide">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPayModal(false)}
        >
          <Pressable style={styles.modalBox} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>
              Nhập số tiền ({selected.length} người)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Số tiền"
              keyboardType="numeric"
              value={amount}
              onChangeText={handleChange}
            />
            <TouchableOpacity style={styles.payBtn} onPress={handlePay}>
              <Text style={styles.payBtnText}>Xác nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowPayModal(false)}>
              <Text
                style={{ textAlign: 'center', marginTop: 10, color: '#999' }}
              >
                Huỷ
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Modal sửa fund */}
      <MoneyModal
        title="Sửa thông tin Ví"
        visible={showEditFund}
        onClose={() => setShowEditFund(false)}
        onSave={handleSaveFund}
        desc={editFundName}
        setDesc={setEditFundName}
        amount={editFee}
        setAmount={setEditFee}
        placeholder="Tên Ví"
      />
    </View>
  );
};

export default FundDetailScreen;
