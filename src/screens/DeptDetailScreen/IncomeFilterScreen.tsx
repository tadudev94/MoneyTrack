import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal } from 'react-native';
import SectionedMultiSelect from 'react-native-sectioned-multi-select';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker';
import { styles } from './DeptDetailScreen.style';

type MemberItem = { id: string; name: string };
type FundItem = { id: string; name: string };

const IncomeFilterScreen = ({ route }) => {
  const navigation = useNavigation();
  const onApply = route.params?.onApply;
  const currentFilter = route.params?.currentFilter || {
    members: [],
    funds: [],
    startDate: null,
    endDate: null,
  };

  const members: MemberItem[] = [
    { id: '1', name: 'Nam' },
    { id: '2', name: 'Lan' },
    { id: '3', name: 'Minh' },
    { id: '4', name: 'Duc' },
  ];

  const funds: FundItem[] = [
    { id: '101', name: 'Ví A' },
    { id: '102', name: 'Ví B' },
    { id: '103', name: 'Ví C' },
  ];

  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    currentFilter.members,
  );
  const [selectedFunds, setSelectedFunds] = useState<string[]>(
    currentFilter.funds,
  );
  const [startDate, setStartDate] = useState<Date | null>(
    currentFilter.startDate,
  );
  const [endDate, setEndDate] = useState<Date | null>(currentFilter.endDate);

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [currentPicker, setCurrentPicker] = useState<'start' | 'end'>('start');
  const [tempDate, setTempDate] = useState(new Date());

  const openPicker = (type: 'start' | 'end') => {
    setCurrentPicker(type);
    setTempDate(
      type === 'start' ? startDate || new Date() : endDate || new Date(),
    );
    setDatePickerVisible(true);
  };

  const confirmDate = () => {
    if (currentPicker === 'start') setStartDate(tempDate);
    else setEndDate(tempDate);
    setDatePickerVisible(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      {/* Header */}
      <View
        style={[styles.header, { flexDirection: 'row', alignItems: 'center' }]}
      >
        <Icon
          name="filter-list"
          size={22}
          color="#6200ee"
          style={{ marginRight: 6 }}
        />
        <Text style={styles.headerTitle}>Bộ lọc thu nhập</Text>
      </View>

      {/* Dropdown Ví */}
      <View style={styles.summaryCard}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Icon
            name="account-balance-wallet"
            size={20}
            color="#ff9800"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.summaryTitle}>Chọn Ví</Text>
        </View>
        <SectionedMultiSelect
          items={funds}
          uniqueKey="id"
          selectText="Chọn Ví..."
          showDropDowns={false}
          onSelectedItemsChange={(ids: string[]) => setSelectedFunds(ids)}
          selectedItems={selectedFunds}
          single={false}
          IconRenderer={Icon}
          searchPlaceholderText="Tìm Ví..."
          showChips={true}
        />
      </View>

      {/* Dropdown Thành viên */}
      <View style={styles.summaryCard}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Icon
            name="people"
            size={20}
            color="#4caf50"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.summaryTitle}>Chọn thành viên</Text>
        </View>
        <SectionedMultiSelect
          items={members}
          uniqueKey="id"
          selectText="Chọn thành viên..."
          showDropDowns={false}
          onSelectedItemsChange={(ids: string[]) => setSelectedMembers(ids)}
          selectedItems={selectedMembers}
          single={false}
          IconRenderer={Icon}
          searchPlaceholderText="Tìm thành viên..."
          showChips={true}
        />
      </View>

      {/* Khoảng ngày */}
      <View style={styles.summaryCard}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <Icon
            name="date-range"
            size={20}
            color="#2196f3"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.summaryTitle}>Khoảng ngày</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.itemCard,
            { flexDirection: 'row', alignItems: 'center' },
          ]}
          onPress={() => openPicker('start')}
        >
          <Icon
            name="event"
            size={18}
            color="#2196f3"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.itemTitle}>
            Ngày bắt đầu: {startDate ? startDate.toLocaleDateString() : 'Chọn'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.itemCard,
            { flexDirection: 'row', alignItems: 'center' },
          ]}
          onPress={() => openPicker('end')}
        >
          <Icon
            name="event"
            size={18}
            color="#2196f3"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.itemTitle}>
            Ngày kết thúc: {endDate ? endDate.toLocaleDateString() : 'Chọn'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Nút */}
      <View
        style={{ flexDirection: 'row', marginTop: 20, paddingHorizontal: 16 }}
      >
        <TouchableOpacity
          style={[
            styles.payBtn,
            {
              flex: 1,
              backgroundColor: '#aaa',
              marginRight: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
          onPress={() => {
            setSelectedFunds([]);
            setSelectedMembers([]);
            setStartDate(null);
            setEndDate(null);
          }}
        >
          <Icon
            name="restore"
            size={18}
            color="#f44336"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.payBtnText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.payBtn,
            {
              flex: 1,
              marginLeft: 8,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            },
          ]}
          onPress={() => {
            onApply?.({
              memberIds: selectedMembers,
              fundIds: selectedFunds,
              startDate,
              endDate,
            });
            navigation.goBack();
          }}
        >
          <Icon
            name="check-circle"
            size={18}
            color="#4caf50"
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              ...styles.payBtnText,
              color: '#4caf50',
            }}
          >
            Apply
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal chọn ngày */}
      <Modal transparent animationType="fade" visible={datePickerVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <DatePicker
              date={tempDate}
              onDateChange={setTempDate}
              mode="date"
            />
            <View style={{ flexDirection: 'row', marginTop: 16 }}>
              <TouchableOpacity
                style={[
                  styles.payBtn,
                  { flex: 1, backgroundColor: '#aaa', marginRight: 8 },
                ]}
                onPress={() => setDatePickerVisible(false)}
              >
                <Text style={styles.payBtnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.payBtn, { flex: 1, marginLeft: 8 }]}
                onPress={confirmDate}
              >
                <Text style={styles.payBtnText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default IncomeFilterScreen;
