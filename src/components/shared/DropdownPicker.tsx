import React, { useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import { Text } from 'react-native-paper';

export type DropdownOption = {
  label: string;
  value: string | number;
};

type DropdownPickerProps = {
  value: string | number | null;
  onChange: (val: string | number | null) => void;
  options: DropdownOption[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
};

const DropdownPickerWrapper: React.FC<DropdownPickerProps> = ({
  value,
  onChange,
  options,
  label,
  placeholder = 'Select an item...',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(options);

  return (
    <>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={callback => {
          const val = callback(value);
          onChange(val);
        }}
        setItems={setItems}
        placeholder={placeholder}
        disabled={disabled}
        zIndex={1000} // prevent overlay issues
      />
    </>
  );
};

export default DropdownPickerWrapper;
