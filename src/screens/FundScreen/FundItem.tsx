import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ProgressBar } from 'react-native-paper';
import { Fund } from '../../database/FundRepository';
import { styles } from './FundScreen.style';

export interface FundWithIncome extends Fund {
  balance: number;
  members_count: number;
}

export const FundItem = ({
  item,
  navigation,
  totalBalance
}: {
  item: FundWithIncome;
  groupId: string;
  totalGroupMembers: number;
  navigation: any;
  lastTran: number;
  totalBalance: number;
}) => {
  const getPercentColor = (percent: number) => {
    if (percent < 25) return '#F44336'; // đỏ
    if (percent < 50) return '#FF9800'; // cam
    if (percent < 75) return '#FFC107'; // vàng
    return '#4CAF50'; // xanh lá
  };

  const feePerMember = 0;
  const totalAmount = totalBalance;
  const percent = totalAmount > 0 ? (item.balance / totalAmount) * 100 : 0;

  return (
    <TouchableOpacity
      style={styles.fundCard}
      onPress={() =>
        navigation.navigate('FundDetail', {
          fund_id: item.fund_id,
          fund_name: item.name,
          total_income: item.balance
        })
      }
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.fundName}>{item.name}</Text>

        <Text style={styles.fundDetail}>
          {/* {0}đ / người{' '} */}
          <Text style={{ color: getPercentColor(percent) }}>
            {percent.toFixed(2)}%
          </Text>
        </Text>

        {/* <ProgressBar
          progress={totalAmount > 0 ? item.total_income / totalAmount : 0}
          color="#4CAF50"
          style={styles.progress}
        /> */}
      </View>

      <View style={styles.balanceBox}>
        <Text style={styles.balanceLabel}>Số Dư Ví / Tổng Dư</Text>
        <Text style={styles.balanceValue}>
          {item.balance.toLocaleString()}đ/ <Text style={styles.balanceTotal}>{totalAmount.toLocaleString()}đ</Text>
        </Text>
        <Text style={styles.balanceTotal}>{percent.toFixed(2)}%</Text>
      </View>
    </TouchableOpacity>
  );
};
