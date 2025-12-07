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
import { styles } from './TagScreen.style';

type TagItemProps = {
  item: any;
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
  swipeableRefs: React.MutableRefObject<Record<string, any>>;
  enabledMap: Record<string, boolean>;
  setEnabledMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  activeId: string | null;
  setActiveId: React.Dispatch<React.SetStateAction<string | null>>;
};

export const TagItem = React.memo(
  ({
    item,
    onEdit,
    onDelete,
    swipeableRefs,
    enabledMap,
    setEnabledMap,
    activeId,
    setActiveId,
  }: TagItemProps) => {


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
        onHandlerStateChange={e => handleLongPress(e, item.tag_id)}
        minDurationMs={200}
      >
        <View>
          <Swipeable
            ref={ref => (swipeableRefs.current[item.tag_id] = ref)}
            enabled={enabledMap[item.tag_id] || false}
            renderRightActions={renderRightActions}
            onSwipeableClose={() =>
              setEnabledMap(prev => ({ ...prev, [item.tag_id]: false }))
            }
          >
            <View style={styles.itemCard}>
              <Icon
                name={"tag"}
                size={24}
                color={'#246ee6ff'}
              />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.itemTitle}>
                  {(item.name || '')}
                </Text>
              </View>
            </View>
          </Swipeable>
        </View>
      </LongPressGestureHandler>
    );
  },
);