import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9', // đồng màu nền
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },

  overviewRow: { flexDirection: 'row', justifyContent: 'space-between' },
  overviewItem: { flex: 1, alignItems: 'center' },
  overviewLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  overviewValue: { fontSize: 14, fontWeight: 'bold', marginTop: 2 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  shortcut: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  shortcutIcon: {
    shadowColor: '#f0f0f0',
    marginBottom: 8,
  },
  shortcutLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#000',
  },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 70,
    backgroundColor: '#000',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },

  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  navItem: { alignItems: 'center' },
  navLabel: { fontSize: 12, marginTop: 2, color: '#999' },

  // =================
  // Menu & Popup style
  // =================
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomColor: '#eee',
    alignSelf: 'flex-start', // không kéo dài ra
  },
  menuText: {
    fontSize: 14,
    color: '#333',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
  },
  modalTitle: { fontSize: 16, fontWeight: '600', marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#fffdfdff'
  },
  payBtn: {
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    borderRadius: 8,
  },
  payBtnText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
