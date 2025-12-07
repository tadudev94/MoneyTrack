import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from './MemberScreen.style';
import { getMemberById, Member } from '../../database/MemberRepository';
import { getFundsByGroupId, Fund } from '../../database/FundRepository';
import { getFundsOfMember } from '../../database/FundMemberRepository';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Checkbox } from 'react-native-paper';
import { useCurrentGroup } from '../../hooks/useCurrentGroup';
import { useMemberFundStore } from '../../store/memberFundStore';
import { getFundIdsWithTransactionsByMember } from '../../database/TransactionRepository';
import HelpModal from '../../components/shared/HelpModal';

const MemberSettingsScreen = () => {
  const navigation = useNavigation();
  const updateMemberFunds = useMemberFundStore(x => x.updateMemberFunds);
  const route = useRoute<any>();
  const { group } = useCurrentGroup();
  const { memberId } = route.params;

  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState<Member | null>(null);
  const [funds, setFunds] = useState<Fund[]>([]);
  const [selectedFunds, setSelectedFunds] = useState<string[]>([]);
  const [fundsLocked, setFundsLocked] = useState<string[]>([]); // fund đã có giao dịch

  useEffect(() => {
    const fetchData = async () => {
      if (group) {
        setLoading(true);
        const m = await getMemberById(memberId);
        const f = await getFundsByGroupId(group.group_id);
        const memberFunds = await getFundsOfMember(memberId);
        const fundHasTrans = await getFundIdsWithTransactionsByMember(memberId);

        setMember(m);
        setFunds(f);
        setSelectedFunds(memberFunds);
        setFundsLocked(fundHasTrans); // lưu các fund bị khoá
        setLoading(false);
      }
    };
    fetchData();
  }, [group, memberId]);

  const toggleFund = (fundId: string, checked: boolean) => {
    // Nếu fund đã có giao dịch thì không cho uncheck
    if (fundsLocked.includes(fundId)) return;

    if (checked) {
      setSelectedFunds(prev => [...prev, fundId]);
    } else {
      setSelectedFunds(prev => prev.filter(id => id !== fundId));
    }
  };

  const addAllFunds = () => {
    setSelectedFunds(funds.map(f => f.fund_id));
  };

  const removeAllFunds = () => {
    // Giữ lại các fund locked, chỉ xoá fund chưa locked
    setSelectedFunds(prev => prev.filter(id => fundsLocked.includes(id)));
  };

  const handleUpdate = async () => {
    if (!member) return;
    await updateMemberFunds(memberId, selectedFunds);
    Alert.alert('Thành công', 'Cập nhật Ví cho thành viên thành công!');
    navigation.goBack();
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center' },
        ]}
      >
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  if (!member) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 20 }}>
          Không tìm thấy thành viên
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cài đặt thành viên</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Info */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Tên thành viên</Text>
        <Text style={styles.summaryDetail}>{member.name}</Text>
      </View>

      {/* Fund List */}
      <View style={{ flex: 1, marginTop: 20, marginHorizontal: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <Text style={styles.summaryTitle}>Tham gia Ví</Text>

          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={addAllFunds}>
              <Text style={styles.actionText}>Thêm tất cả</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={removeAllFunds}>
              <Text style={[styles.actionText, { marginLeft: 16 }]}>
                Huỷ tất cả
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={funds}
          keyExtractor={item => item.fund_id}
          renderItem={({ item }) => {
            const checked = selectedFunds.includes(item.fund_id);
            const locked = fundsLocked.includes(item.fund_id);

            return (
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 12,
                  opacity: locked ? 0.5 : 1,
                }}
                onPress={() => toggleFund(item.fund_id, !checked)}
                disabled={locked}
              >
                <Checkbox
                  status={checked ? 'checked' : 'unchecked'}
                  onPress={() => toggleFund(item.fund_id, !checked)}
                  color="#1976d2"
                  disabled={locked}
                />
                <Text style={{ marginLeft: 8 }}>
                  {item.name}
                  {locked ? ' (Đã có giao dịch)' : ''}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
      
      {/* Update button */}
      <View style={{ padding: 16 }}>
        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: '#1976d2' }]}
          onPress={handleUpdate}
        >
          <Text style={styles.createBtnText}>Cập nhật</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MemberSettingsScreen;
