import React, { useState } from 'react';
import { FAB } from 'react-native-paper';
import { StyleSheet } from 'react-native';

type FabAction = {
  icon: string;
  label: string;
  onPress: () => void;
};

interface FabQuestionProps {
  actions: FabAction[];
  style?: object; // nhận thêm style từ props
}

const FabCustom: React.FC<FabQuestionProps> = ({ actions, style }) => {
  const [open, setOpen] = useState(false);

  return (
    <FAB.Group
      visible
      open={open}
      style={[styles.fab, style]}
      icon={open ? 'close' : 'plus'}
      actions={actions}
      onStateChange={({ open }) => setOpen(open)}
      onPress={() => {
        // Optional: logic when main FAB is pressed
      }}
    />
  );
};

export default FabCustom;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 0,
    right: 16,
    zIndex: 999,
  },
});
