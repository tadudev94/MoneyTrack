import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  Swipeable,
  LongPressGestureHandler,
  State,
} from 'react-native-gesture-handler';
import { styles } from './ExpensePlanScreen.style';
import { formatMoney } from '../../utils/moneyFormat';
import { useNavigation } from '@react-navigation/native';
import { useTagStore } from '../../store/tagStore';

type ExpensePlanItemProps = {
  item: any; // ExpensePlan
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  swipeableRefs: React.MutableRefObject<Record<string, any>>;
  enabledMap: Record<string, boolean>;
  setEnabledMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  activeId: string | null;
  setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
};

export const ExpensePlanItem = React.memo(
  ({
    item,
    onEdit,
    onDelete,
    swipeableRefs,
    enabledMap,
    setEnabledMap,
    activeId,
    setActiveId,
  }: ExpensePlanItemProps) => {

    const navigation = useNavigation();
    console.log(item)
    const handleClick = () => {
      navigation.navigate('ExpensePlanDetail', {
        typeInput: 'expense_plan',
        expense_plan_id: item.expense_plan_id
      });
    };


    const spent = item.total_spent || 0;
    const budget = item.value || 0;
    const percent =
      Number((budget > 0 ? (spent / budget) * 100 : 0).toFixed(2));

    let color = 'green';     // <= 50%
    if (percent > 90) {
      color = 'red';         // > 90%
    } else if (percent > 50) {
      color = 'orange';      // 50–90%
    }
    const handleLongPress = (event: any, id: string) => {
      if (event.nativeEvent.state === State.ACTIVE) {
        if (activeId && swipeableRefs.current[activeId]) {
          swipeableRefs.current[activeId].close();
        }
        setEnabledMap(prev => ({ ...prev, [id]: true }));
        setActiveId(id);

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
        onHandlerStateChange={e => handleLongPress(e, item.expense_plan_id)}
        minDurationMs={200}
      >
        <View>
          <Swipeable
            ref={ref => (swipeableRefs.current[item.expense_plan_id] = ref)}
            enabled={enabledMap[item.expense_plan_id] || false}
            renderRightActions={renderRightActions}
            onSwipeableClose={() =>
              setEnabledMap(prev => ({ ...prev, [item.expense_plan_id]: false }))
            }
          >
            <View style={styles.itemCard}>
              <Pressable onPress={() => handleClick()}>
                <Icon name="calendar-range" size={24} color="#246ee6ff" />
              </Pressable>
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.itemTitle}>
                  {item.tag_name || 'No Tag'} - {formatMoney(item.value)}đ
                </Text>
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 4
                }}>

                  {/* Cột trái */}
                  <Text style={styles.itemSubTitle}>
                    {(new Date(item.from_date).getMonth() + 1).toString().padStart(2, '0')}/{new Date(item.from_date).getFullYear()}
                  </Text>

                  {/* Cột phải - 3 dòng */}
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.itemSubTitle, { color }]}>
                      Đã chi: {item.total_spent.toLocaleString('vi-VN')} đ
                    </Text>

                    <Text style={[styles.itemSubTitle, { color }]}>
                      {percent.toFixed(2)} %
                    </Text>

                    <Text style={[styles.itemSubTitle, { color }]}>
                      Chênh lệch: {formatMoney(item.value - item.total_spent)} đ
                    </Text>
                  </View>

                </View>

              </View>
            </View>
          </Swipeable>
        </View>
      </LongPressGestureHandler>
    );
  },
);
