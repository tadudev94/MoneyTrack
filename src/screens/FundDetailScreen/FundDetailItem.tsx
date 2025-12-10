import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Swipeable,
  LongPressGestureHandler,
  State,
} from 'react-native-gesture-handler';
import { styles } from './FundDetailScreen.style';
import { formatMoney } from '../../utils/moneyFormat';

type FundDetailItemProps = {
  item: any;
  type: string;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  swipeableRefs: React.MutableRefObject<Record<string, any>>;
  enabledMap: Record<string, boolean>;
  setEnabledMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  activeId: string | null;
  setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
  fund_id: string,
  to_fund_name: string,
};

export const FundDetailItem = React.memo(
  ({
    item,
    type,
    onEdit,
    onDelete,
    swipeableRefs,
    enabledMap,
    setEnabledMap,
    activeId,
    setActiveId,
    fund_id,
    to_fund_name
  }: FundDetailItemProps) => {
    const handleLongPress = (event: any, id: string) => {
      if (event.nativeEvent.state === State.ACTIVE) {
        // đóng item đang mở
        if (activeId && swipeableRefs.current[activeId]) {
          swipeableRefs.current[activeId].close();
        }

        setEnabledMap(prev => ({ ...prev, [id]: true }));
        setActiveId(id);

        // tự mở action
        setTimeout(() => {
          swipeableRefs.current[id]?.openRight();
        }, 10);
      }
    };

    const renderRightActions = () => (
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#1976d2' }]}
          onPress={() => onEdit(item)}
        >
          <Icon name="pencil" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#c62828' }]}
          onPress={() => onDelete(item)}
        >
          <Icon name="delete" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );

    return (
      <LongPressGestureHandler
        onHandlerStateChange={e => handleLongPress(e, item.transaction_id)}
        minDurationMs={200}
      >
        <View>
          <Swipeable
            ref={ref => (swipeableRefs.current[item.transaction_id] = ref)}
            enabled={enabledMap[item.transaction_id] || false}
            renderRightActions={renderRightActions}
            onSwipeableClose={() =>
              setEnabledMap(prev => ({ ...prev, [item.transaction_id]: false }))
            }
          >
            <View style={styles.itemCard}>
              <Icon
                name={
                  type === "income"
                    ? "cash-plus"
                    : type === "expense"
                      ? "cash-minus"
                      : "cash"
                }

                size={24}
                color={type == 'income' ? '#4CAF50' : type === "expense" ? '#c62828' : "#a09393ff"}
              />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.itemTitle}>
                  {(item.member_name || '') + ' '}
                  {(item.description || type) + ' '}
                </Text>
                <Text style={styles.itemDate}>
                  {new Date(item.transaction_date).toLocaleDateString('vi-VN')}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {/* Ví tiền */}
                <Text style={[styles.walletTag, styles.fundTag]}>
                  {
                    type == 'move'
                      ? (item.fund_id == fund_id
                        ? "Tới: " + item.to_fund_name
                        : "Từ: " + item.fund_name)
                      : item.fund_name
                  }
                </Text>

                {/* Tag */}
                {item.tag_name ? (
                  <Text style={[styles.walletTag, styles.expenseTag]}>
                    {item.tag_name}
                  </Text>
                ) : null}
              </View>
              <Text style={[styles.itemAmount, { color: type == 'income' ? '#4CAF50' : type === "expense" ? '#c62828' : "#a09393ff" }]}>
                {type == 'income' ? '+' : type == 'expense' ? '-' :fund_id == item.fund_id ? "-" : "+" } {formatMoney(item.amount)} đ
              </Text>
            </View>
          </Swipeable>
        </View>
      </LongPressGestureHandler>
    );
  },
);