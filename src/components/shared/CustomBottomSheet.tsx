import React, {
  useCallback,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import { StyleSheet } from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';

type Props = {
  children: React.ReactNode;
};

export type BottomSheetRef = {
  open: () => void;
  close: () => void;
  isOpen: () => boolean; // <- PHẢI có dòng này
};

const CustomBottomSheet = forwardRef<BottomSheetRef, Props>(
  ({ children }, ref) => {
    const bottomSheetRef = useRef<BottomSheet>(null);

    const snapPoints = useMemo(() => ['100%', '100%'], []);
    const [visible, setVisible] = useState(false);

    const handleSheetChanges = useCallback((index: number) => {
      setVisible(index >= 0);
    }, []);

    // 👇 Custom backdrop to close on outside press
    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior="close" // 👈 Chạm ra ngoài để đóng
        />
      ),
      [],
    );

    useImperativeHandle(ref, () => ({
      open: () => bottomSheetRef.current?.snapToIndex(1),
      close: () => bottomSheetRef.current?.close(),
      isOpen: () => visible,
    }));

    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose
        backdropComponent={renderBackdrop} // 👈 Thêm dòng này
      >
        <BottomSheetView style={styles.contentContainer}>
          {children}
        </BottomSheetView>
      </BottomSheet>
    );
  },
);

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
  },
});

export default CustomBottomSheet;
