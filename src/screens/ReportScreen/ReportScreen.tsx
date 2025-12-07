import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import XLSX from 'xlsx';
import { exportAndShareFile } from '../../utils/fileExportHelper';
import { useCurrentGroup } from '../../hooks/useCurrentGroup';
import {
  getGroupOverview,
  getFundsReport,
  getMembersFundReport,
  MemberFundReport,
  FundReport,
  getTransactionsReport, // ✅ thêm
  TransactionSummary,
} from '../../database/ReportRepository';
import { useTransactionStore } from '../../store/transactionStore';
import { useNavigation } from '@react-navigation/native';
import { styles } from './ReportScreen.style';

const ReportScreen: React.FC = () => {
  const [funds, setFunds] = useState<FundReport[]>([]);
  const [members, setMembers] = useState<MemberFundReport[]>([]);
  const [overview, setOverview] = useState({ income: 0, expense: 0 });
  const [transactionSummary, setTransactionSummary] =
    useState<TransactionSummary>({
      transactions: [],
      total_income: 0,
      total_expense: 0,
      balance: 0,
    });

  const { group } = useCurrentGroup();
  const { lastUpdated } = useTransactionStore();
  const navigation = useNavigation();

  useEffect(() => {
    if (group?.group_id) {
      getGroupOverview(group.group_id).then(setOverview);
      getFundsReport(group.group_id).then(setFunds);
      getMembersFundReport(group.group_id).then(setMembers);
      getTransactionsReport(group.group_id).then(setTransactionSummary); // ✅ load giao dịch
    }
  }, [group, lastUpdated]);

  // helper chọn màu theo giá trị
  const getBalanceColor = (val: number) => {
    if (val > 0) return 'red'; // thiếu
    if (val < 0) return 'blue'; // dư
    return 'green'; // đủ
  };

  const exportToExcel = async () => {
    try {
      const sheetData: any[] = [];

      // Bảng 1: Tổng quan
      sheetData.push(['TỔNG QUAN']);
      sheetData.push(['Tổng thu', overview.income]);
      sheetData.push(['Tổng chi', overview.expense]);
      sheetData.push(['Tiền đang có', overview.income - overview.expense]);
      sheetData.push([]);

      // Bảng 2: Ví
      sheetData.push(['DANH SÁCH Ví']);
      sheetData.push(['Tên Ví', 'Tổng cần thu', 'Đã thu', 'Còn thiếu']);
      funds.forEach(f => {
        sheetData.push([f.name, f.total_required, f.paid, f.remaining]);
      });
      sheetData.push([]);

      // Bảng 3: Thành viên x Ví
      const header = ['Tên thành viên', ...funds.map(f => f.name)];
      sheetData.push(['THÀNH VIÊN - Ví : SỐ TIỀN CẦN THU']);
      sheetData.push(header);
      members.forEach(m => {
        sheetData.push([
          m.member_name,
          ...funds.map(f => m.fund_balances[f.fund_id] || 0),
        ]);
      });
      sheetData.push([]);

      // Bảng 4: Giao dịch
      sheetData.push(['GIAO DỊCH']);
      sheetData.push(['Ngày', 'Loại', 'Số tiền', 'Mô tả', 'Ví', 'Thành viên']);
      transactionSummary.transactions.forEach(t => {
        sheetData.push([
          new Date(t.transaction_date).toLocaleDateString(),
          t.type,
          t.amount,
          t.description ?? '',
          t.fund_name ?? '-',
          t.member_name ?? '-',
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');

      const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

      await exportAndShareFile(
        'report.xlsx',
        wbout,
        'base64',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );

      Alert.alert('✅ Thành công', 'Đã xuất file report.xlsx');
    } catch (error: any) {
      Alert.alert('❌ Lỗi', error.message || 'Không thể xuất Excel');
    }
  };

  const OverviewCard = ({ label, value, color, icon }: any) => (
    <View style={[styles.card, { borderColor: color }]}>
      <Icon name={icon} size={22} color={color} />
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={[styles.cardValue, { color }]}>
        {value.toLocaleString()} đ
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Báo cáo nhóm {group?.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tổng quan */}
      <View style={styles.overviewRow}>
        <OverviewCard
          label="Tổng Thu"
          value={overview.income}
          color="#4CAF50"
          icon="cash-plus"
        />
        <OverviewCard
          label="Tổng Chi"
          value={overview.expense}
          color="#F44336"
          icon="cash-minus"
        />
        <OverviewCard
          label="Số dư"
          value={overview.income - overview.expense}
          color="#2196F3"
          icon="wallet"
        />
      </View>

      {/* Scroll cho các bảng */}
      <ScrollView style={{ flex: 1 }}>
        {/* 2. Danh sách Ví */}
        <Text style={styles.sectionTitle}>DANH SÁCH Ví</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.th}>Tên Ví</Text>
            <Text style={styles.th}>Tổng cần thu</Text>
            <Text style={styles.th}>Đã thu</Text>
            <Text style={styles.th}>Còn thiếu</Text>
          </View>
          {funds.map((f, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.td}>{f.name}</Text>
              <Text style={styles.td}>{f.total_required.toLocaleString()}</Text>
              <Text style={styles.td}>{f.paid.toLocaleString()}</Text>
              <Text
                style={[styles.td, { color: getBalanceColor(f.remaining) }]}
              >
                {f.remaining.toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* 3. Danh sách thành viên */}
        <Text style={styles.sectionTitle}>
          THÀNH VIÊN - Ví : SỐ TIỀN CẦN THU
        </Text>
        <View style={{ flexDirection: 'row' }}>
          {/* Cột thành viên (cố định) */}
          <View style={{ minWidth: 150 }}>
            <View style={[styles.tableHeader, { backgroundColor: '#f0f0f0' }]}>
              <Text style={styles.th}>Thành viên</Text>
            </View>
            {members.map((m, i) => (
              <View key={i} style={{ ...styles.tableRow, minWidth: 120 }}>
                <Text style={styles.td}>{m.member_name}</Text>
              </View>
            ))}
          </View>

          {/* Cột Ví (scroll ngang) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* Header */}
              <View style={styles.tableHeader}>
                {funds.map((f, idx) => (
                  <Text key={idx} style={[styles.th, { minWidth: 124 }]}>
                    {f.name}
                  </Text>
                ))}
              </View>

              {/* Rows */}
              {members.map((m, i) => (
                <View key={i} style={styles.tableRow}>
                  {funds.map((f, idx) => {
                    const val = m.fund_balances[f.fund_id];
                    return (
                      <Text
                        key={idx}
                        style={[
                          styles.td,
                          {
                            minWidth: 100,
                            color:
                              val === undefined ? '#000' : getBalanceColor(val),
                          },
                        ]}
                      >
                        {val === undefined ? '-' : val.toLocaleString()}
                      </Text>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 4. Danh sách giao dịch */}
        <Text style={styles.sectionTitle}>GIAO DỊCH</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { minWidth: 100 }]}>Ngày</Text>
              <Text style={[styles.th, { minWidth: 150 }]}>Mô Tả</Text>
              <Text style={[styles.th, { minWidth: 120 }]}>Thành viên</Text>
              <Text style={[styles.th, { minWidth: 80 }]}>Loại</Text>
              <Text style={[styles.th, { minWidth: 100 }]}>Số tiền</Text>
              <Text style={[styles.th, { minWidth: 120 }]}>Ví</Text>
            </View>

            {/* Rows */}
            {transactionSummary.transactions.map((t, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.td, { minWidth: 100 }]}>
                  {new Date(t.transaction_date).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: '2-digit',
                  })}{' '}
                  {new Date(t.transaction_date).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text style={[styles.td, { minWidth: 150 }]}>
                  {t.description}
                </Text>
                <Text style={[styles.td, { minWidth: 120 }]}>
                  {t.member_name ?? '-'}
                </Text>
                <Text
                  style={[
                    styles.td,
                    {
                      minWidth: 80,
                      color: t.type === 'income' ? '#4CAF50' : '#F44336',
                    },
                  ]}
                >
                  {t.type === 'income' ? 'Thu' : 'Chi'}
                </Text>
                <Text style={[styles.td, { minWidth: 100 }]}>
                  {t.amount.toLocaleString()}
                </Text>
                <Text style={[styles.td, { minWidth: 120 }]}>
                  {t.fund_name ?? '-'}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </ScrollView>

      {/* Xuất Excel */}
      <TouchableOpacity style={styles.exportBtn} onPress={exportToExcel}>
        <Icon name="file-excel" size={20} color="#fff" />
        <Text style={styles.exportText}>Xuất Excel</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ReportScreen;
