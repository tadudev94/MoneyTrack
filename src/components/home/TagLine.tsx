import React from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { List } from 'react-native-paper';
import { NavigationProp } from '@react-navigation/native';
import { Tag } from '../../database/types';
import { useStore } from '../../store/useStore';

interface TagLineProps {
  allTags: Partial<Tag>[];
  navigation: NavigationProp<any>;
  maxTagLine?: number;
}

const TagLine: React.FC<TagLineProps> = ({
  allTags,
  navigation,
  maxTagLine = 5,
}) => {
  const { activeTag, setActiveTag } = useStore(); // 🔥 lấy từ store thay vì props

  const goToTagManager = () => {
    navigation.navigate('Tags');
  };

  return (
    <View style={styles.tagLineContainer}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={allTags.slice(0, maxTagLine)}
        keyExtractor={item => item.tag_id || ''}
        renderItem={({ item: tag }) => (
          <TouchableOpacity
            style={[
              styles.tagChip,
              activeTag?.tag_id === tag.tag_id ? styles.activeTag : null,
            ]}
            onPress={() => {
              if (activeTag?.tag_id === tag.tag_id) {
                setActiveTag(null);
              } else {
                setActiveTag(tag);
              }
            }}
          >
            <List.Icon icon="tag" color="#fff" style={styles.tagIcon} />
            <Text style={styles.tagChipText}>{tag.tag}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Nút đi tới trang quản lý */}
      <TouchableOpacity style={styles.manageBtn} onPress={goToTagManager}>
        <List.Icon icon="cog" color="#117231ff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  tagLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    marginVertical: 8,
    backgroundColor: '#4caf50',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#81c784',
    marginHorizontal: 4,
    elevation: 2,
  },
  activeTag: {
    backgroundColor: '#388e3c',
  },
  tagChipText: {
    fontSize: 14,
    color: '#fff',
  },
  tagIcon: {
    marginRight: 4,
  },
  manageBtn: {
    marginLeft: 8,
    backgroundColor: '#a3e7b4ff',
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },
});

export default TagLine;
