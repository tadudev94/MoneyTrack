// File: CustomDialog.tsx
import React from 'react';
import { Dialog, Portal, Button, Paragraph } from 'react-native-paper';

interface CustomDialogProps {
  visible: boolean;
  message: string;
  onDismiss: () => void;
}

const CustomDialog: React.FC<CustomDialogProps> = ({ visible, message, onDismiss }) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Thông báo</Dialog.Title>
        <Dialog.Content>
          <Paragraph>{message}</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>OK</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default CustomDialog;
