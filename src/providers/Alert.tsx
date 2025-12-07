import React, { useState } from 'react';
import { Portal, Dialog, Button, Paragraph } from 'react-native-paper';

type AlertType = 'success' | 'error' | 'info' | 'confirm';

interface AlertOptions {
  message: string;
  type?: AlertType;
  onConfirm?: () => void;
  autoHide?: boolean; // tự ẩn sau duration
  duration?: number;  // thời gian tự ẩn (ms)
}

let showAlertFn: ((options: AlertOptions) => void) | null = null;

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<AlertType>('info');
  const [onConfirm, setOnConfirm] = useState<() => void | undefined>(() => undefined);

  showAlertFn = ({ message, type = 'info', onConfirm, autoHide = false, duration = 3000 }: AlertOptions) => {
    setMessage(message);
    setType(type);
    setOnConfirm(() => onConfirm);
    setVisible(true);

    if (autoHide && (type === 'success' || type === 'info')) {
      setTimeout(() => {
        setVisible(false);
        onConfirm?.();
      }, duration);
    }
  };

  const hide = () => setVisible(false);

  // Title/icon theo type
  const getTitle = () => {
    switch (type) {
      case 'success': return '✅ Thành công';
      case 'error': return '❌ Lỗi';
      case 'info': return 'ℹ️ Thông tin';
      case 'confirm': return '⚠️ Xác nhận';
    }
  };

  return (
    <>
      {children}
      <Portal>
        <Dialog visible={visible} onDismiss={hide}>
          <Dialog.Title>{getTitle()}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{message}</Paragraph>
          </Dialog.Content>
          {(type === 'error' || type === 'confirm') && (
            <Dialog.Actions>
              <Button
                onPress={() => {
                  hide();
                  onConfirm?.();
                }}
              >
                OK
              </Button>
            </Dialog.Actions>
          )}
        </Dialog>
      </Portal>
    </>
  );
};

// Helper để gọi alert từ bất cứ đâu
export const AlertHelper = {
  show: (options: AlertOptions) => {
    if (showAlertFn) showAlertFn(options);
  },
  success: (msg: string, duration = 2000) =>
    AlertHelper.show({ message: msg, type: 'success', autoHide: true, duration }),
  info: (msg: string, duration = 2000) =>
    AlertHelper.show({ message: msg, type: 'info', autoHide: true, duration }),
  error: (msg: string, onConfirm?: () => void) =>
    AlertHelper.show({ message: msg, type: 'error', onConfirm }),
  confirm: (msg: string, onConfirm?: () => void) =>
    AlertHelper.show({ message: msg, type: 'confirm', onConfirm }),
};
