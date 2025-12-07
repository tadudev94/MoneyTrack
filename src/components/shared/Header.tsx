// Header.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../styles/common';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightIcon?: string;
  onRightPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onBack, rightIcon, onRightPress }) => {
  return (
    <View style={styles.container}>
      {onBack ? (
        <TouchableOpacity style={styles.left} onPress={onBack}>
        </TouchableOpacity>
      ) : (
        <View style={styles.left} />
      )}

      <Text style={styles.title}>{title}</Text>

      {rightIcon ? (
        <TouchableOpacity style={styles.right} onPress={onRightPress}>
        </TouchableOpacity>
      ) : (
        <View style={styles.right} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 36,
    backgroundColor: colors.headerBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 10,
    elevation: 4,
    borderRadius: 5
  },
  left: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  right: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    color: colors.textButton,
    fontWeight: 'bold',
  },
});

export default Header;
