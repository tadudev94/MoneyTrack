import React, { useCallback } from 'react';
import { Card, IconButton, List, MD3Theme, useTheme } from 'react-native-paper';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type TestItem = {
  test_uid: string;
  title: string;
};

type TestCardItemProps = {
  item: TestItem;
  handleEdit: (item: TestItem) => void;
  handleDelete: (test_uid: string) => void;
  handlePress: () => void;
};

const TestCardItem: React.FC<TestCardItemProps> = ({ 
  item, 
  handleEdit, 
  handleDelete,
  handlePress
}) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const onEditPress = useCallback(() => handleEdit(item), [item, handleEdit]);
  const onDeletePress = useCallback(() => handleDelete(item.test_uid), [item.test_uid, handleDelete]);
  return (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} onPress={handlePress}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.listItem}>
          <List.Icon 
            icon="file-document-outline" 
            color={theme.colors.primary}
            style={styles.listIcon}
          />
          <List.Item
            title={item.title}
            titleStyle={styles.title}
            style={styles.listItemContent}
          />
        </View>
        
        <Menu>
          <MenuTrigger customStyles={triggerStyles}>
            <IconButton 
              icon="dots-vertical" 
              size={20}
              style={styles.menuButton}
            />
          </MenuTrigger>
          <MenuOptions customStyles={menuOptionsStyles(theme)}>
            <MenuOption 
              onSelect={onEditPress} 
              text={t("btn_text_edit")}
              customStyles={menuOptionStyles(theme)}
            />
            <MenuOption 
              onSelect={onDeletePress} 
              text={t("btn_text_delete")}
              customStyles={{
                ...menuOptionStyles(theme),
                optionText: {
                  color: theme.colors.error,
                  fontWeight: '600'
                }
              }}
            />
          </MenuOptions>
        </Menu>
      </Card.Content>
    </Card>
  );
};

// Stylesheet
const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  listItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listIcon: {
    marginRight: 8,
  },
  listItemContent: {
    padding: 0,
    margin: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuButton: {
    margin: 0,
  },
});

// Dynamic styles
const menuOptionsStyles = (theme: MD3Theme) => ({
  optionsContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: 4,
    width: 120,
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  optionWrapper: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
});

const menuOptionStyles = (theme: MD3Theme) => ({
  optionText: {
    fontSize: 14,
    // color: theme.colors.text,
    color: 'blue',
  },
});

const triggerStyles = {
  triggerWrapper: {
    padding: 4,
    borderRadius: 20,
  },
};

export default React.memo(TestCardItem);