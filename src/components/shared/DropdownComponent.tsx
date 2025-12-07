import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

export type DropdownItem = {
  label: string;
  value: string;
};

type DropdownComponentProps = {
  data: DropdownItem[];             // danh sách item truyền vào
  placeholder?: string;             // placeholder
  searchPlaceholder?: string;       // placeholder khi search
  value?: string | null;
  style?: any;        // giá trị được chọn
  onChange: (value: string) => void; // callback khi chọn item
};

const DropdownComponent = ({
  data,
  placeholder = 'Select item',
  searchPlaceholder = 'Search...',
  value: initialValue = null,
  style = {},
  onChange,
}: DropdownComponentProps) => {
  const [value, setValue] = useState<string | null>(initialValue);

  const handleChange = (item: DropdownItem) => {
    setValue(item.value);
    onChange(item.value);
  };

  const renderItem = (item: DropdownItem) => (
    <View style={styles.item}>
      <Text style={styles.textItem}>{item.label}</Text>
    </View>
  );

  return (
    <Dropdown
      style={{ ...styles.dropdown, ...style }}
      placeholderStyle={styles.placeholderStyle}
      selectedTextStyle={styles.selectedTextStyle}
      inputSearchStyle={styles.inputSearchStyle}
      iconStyle={styles.iconStyle}
      data={data}
      search
      maxHeight={300}
      labelField="label"
      valueField="value"
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      value={value}
      onChange={handleChange}
      renderItem={renderItem}
    />
  );
};

export default DropdownComponent;

const styles = StyleSheet.create({
  dropdown: {
    margin: 16,
    marginTop: 7,
    width: 290,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    alignItems: 'center',
  },
  textItem: {
    flex: 1,
    fontSize: 16,
  },
  placeholderStyle: { fontSize: 16 },
  selectedTextStyle: { fontSize: 16 },
  iconStyle: { width: 20, height: 20 },
  inputSearchStyle: { height: 40, fontSize: 16 },
});
