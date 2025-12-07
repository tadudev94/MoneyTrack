import React from 'react';
import { StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';

type HeaderProps = {
  title: string;
  onEdit: () => void;
};

const TestDetailHeader: React.FC<HeaderProps> = ({ title, onEdit }) => {
  return (
    <Appbar.Header style={styles.header}>
      <Appbar.Content
        title={title}
        titleStyle={styles.title}
        style={{ alignItems: 'center' }}
      />
      <Appbar.Action icon="pencil" onPress={onEdit} />
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#6893f0ff',
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TestDetailHeader;
