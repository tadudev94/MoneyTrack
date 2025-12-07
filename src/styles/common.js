import { StyleSheet } from 'react-native';

export const colors = {
  headerBackground: '#88aa6cff',
  background: '#f5f5f5', // màu nền màn hình
  cardBackground: '#fff', // nền card / chip
  primary: '#6287ecff', // màu chính: nút, key chip
  secondary: '#e3f2fd', // màu phụ: tag chip, input
  keyListBackground: '#c5cae9', // nền container list key
  textPrimary: '#333',
  textSecondary: '#666',
  textButton: '#fff',
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.background,
  },

  // Input chung
  input: {
    marginBottom: 8,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 0,
  },

  // Nút thêm key
  addButton: {
    marginBottom: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 5,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    alignSelf: 'stretch' 
  },
  addButtonText: {
    color: colors.textButton,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Container list key
  keyListContainer: {
    gap: 8,
    marginTop: 8,
    backgroundColor: colors.keyListBackground,
    borderRadius: 12,
    padding: 8,
  },

  // Key chip
  keyChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    margin: 4,
    borderRadius: 20,
    backgroundColor: colors.primary,
    elevation: 2,
  },
  keyChipText: {
    fontSize: 14,
    color: colors.textButton,
  },
  tagIcon: {
    marginRight: 4,
  },

  // Empty state
  noDataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 11,
  },
  noDataText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});
