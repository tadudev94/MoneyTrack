import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Card,
  IconButton,
  List,
  useTheme,
  MD3Theme,
  Text,
} from 'react-native-paper';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { useTranslation } from 'react-i18next';
import { Question } from '../../types';

type QuestionItemProps = {
  data: Question;
  onEdit: (question: Question) => void;
  onDelete: (uid: string) => void;
  onPressItem: (question: Question) => void;
};

const QuestionItem: React.FC<QuestionItemProps> = ({
  data,
  onEdit,
  onDelete,
  onPressItem,
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Card
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() => onPressItem(data)}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.leftContent}>
          <List.Icon
            icon="comment-question-outline"
            color={theme.colors.primary}
            style={styles.icon}
          />
          <Text style={styles.questionText}>{data.question}</Text>
        </View>

        <Menu>
          <MenuTrigger customStyles={triggerStyles}>
            <IconButton icon="dots-vertical" size={20} />
          </MenuTrigger>
          <MenuOptions customStyles={menuOptionsStyles(theme)}>
            <MenuOption
              onSelect={() => onEdit(data)}
              text={t('btn_text_edit')}
              customStyles={menuOptionStyles(theme)}
            />
            <MenuOption
              onSelect={() => onDelete(data.question_uid)}
              text={t('btn_text_delete')}
              customStyles={{
                ...menuOptionStyles(theme),
                optionText: {
                  color: theme.colors.error,
                  fontWeight: '600',
                },
              }}
            />
          </MenuOptions>
        </Menu>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    borderRadius: 12,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  leftContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  questionText: {
    fontSize: 15,
    flexShrink: 1,
    fontWeight: '500',
  },
});

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
    color: theme.colors.onSurface,
  },
});

const triggerStyles = {
  triggerWrapper: {
    padding: 4,
    borderRadius: 20,
  },
};

export default React.memo(QuestionItem);
