import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Divider, Portal, Dialog, Button } from 'react-native-paper';
import CustomBottomSheet, {
  BottomSheetRef,
} from '../../components/shared/CustomBottomSheet';
import { DatePickerModal } from 'react-native-paper-dates';
import DropDownPicker from 'react-native-dropdown-picker';

type Props = {
  members?: string[];
  onApply: (filter: {
    fromDate: Date | null;
    toDate: Date | null;
    members: string[];
  }) => void;
};

export type IncomeFilterSheetRef = {
  open: () => void;
  close: () => void;
  isOpen: () => boolean;
};

const IncomeFilterSheet = forwardRef<IncomeFilterSheetRef, Props>(
  ({ members = [], onApply }, ref) => {
    const [fromDate, setFromDate] = useState<Date | null>(null);
    const [toDate, setToDate] = useState<Date | null>(null);
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
    const [openDatePicker, setOpenDatePicker] = useState(false);

    const [openDropdown, setOpenDropdown] = useState(false);
    const [dropdownItems, setDropdownItems] = useState(
      members.map(m => ({ label: m, value: m })),
    );

    const innerRef = React.useRef<BottomSheetRef>(null);

    useEffect(() => {
      setDropdownItems(members.map(m => ({ label: m, value: m })));
    }, [members]);

    useImperativeHandle(ref, () => ({
      open: () => innerRef.current?.open(),
      close: () => innerRef.current?.close(),
      isOpen: () => innerRef.current?.isOpen() ?? false,
    }));

    const renderRow = (label: string, value: string, onPress?: () => void) => (
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        activeOpacity={0.6}
      >
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>
          {value} {onPress ? '>' : ''}
        </Text>
      </TouchableOpacity>
    );

    return (
      <>
        <CustomBottomSheet ref={innerRef}>
          <ScrollView
            style={styles.container}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Bộ lọc Thu</Text>
            <Divider style={styles.divider} />

            {/* Date range */}
            {renderRow(
              'Chọn khoảng ngày',
              fromDate && toDate
                ? `${fromDate.toDateString()} → ${toDate.toDateString()}`
                : 'Chọn khoảng ngày',
              () => setOpenDatePicker(true),
            )}

            {/* Member multi-select dropdown */}
            <View style={{ zIndex: 1000, marginHorizontal: 16, marginTop: 12 }}>
              <DropDownPicker
                multiple={true}
                open={openDropdown}
                value={selectedMembers}
                items={dropdownItems}
                setOpen={setOpenDropdown}
                setValue={setSelectedMembers}
                setItems={setDropdownItems}
                placeholder="Chọn thành viên"
                searchable={true}
                mode="BADGE"
                zIndex={1000} // ✅ Thêm
                zIndexInverse={3000} // ✅ Thêm
              />
            </View>

            <Divider style={[styles.divider, { marginTop: 12 }]} />

            {/* Action buttons */}
            <View style={styles.actions}>
              <Button onPress={() => innerRef.current?.close()}>Đóng</Button>
              <Button
                mode="contained"
                onPress={() => {
                  onApply({
                    fromDate,
                    toDate,
                    members:
                      selectedMembers.length > 0 ? selectedMembers : ['Tất cả'],
                  });
                  innerRef.current?.close();
                }}
                style={styles.applyBtn}
              >
                Áp dụng
              </Button>
            </View>
          </ScrollView>
        </CustomBottomSheet>

        {/* DatePicker */}
        <Portal>
          <Dialog
            visible={openDatePicker}
            onDismiss={() => setOpenDatePicker(false)}
            style={styles.dialog}
          >
            <Dialog.Content style={styles.dialogContent}>
              <DatePickerModal
                locale="vi"
                mode="range"
                visible
                onDismiss={() => setOpenDatePicker(false)}
                startDate={fromDate || undefined}
                endDate={toDate || undefined}
                onConfirm={({ startDate, endDate }) => {
                  setFromDate(startDate ?? null);
                  setToDate(endDate ?? null);
                  setOpenDatePicker(false);
                }}
              />
            </Dialog.Content>
          </Dialog>
        </Portal>
      </>
    );
  },
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingVertical: 8 },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 0 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  rowLabel: { fontSize: 16, color: '#000' },
  rowValue: { fontSize: 16, color: '#999', flexShrink: 1 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', padding: 16 },
  applyBtn: { marginLeft: 12, borderRadius: 8 },
  dialog: { borderRadius: 16, overflow: 'hidden' },
  dialogContent: { padding: 0 },
});

export default IncomeFilterSheet;
