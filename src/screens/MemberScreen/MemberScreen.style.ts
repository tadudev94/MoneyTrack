import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },

  summaryCard: {
    backgroundColor: '#f9f9f9',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  summaryTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  summaryDetail: { fontSize: 14, color: '#555' },

  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // push action icon to the right
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: '#445',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: 'bold' },
  textWrap: { marginLeft: 12, flexShrink: 1 },
  memberName: { fontSize: 14, color: '#000' },
  memberRole: { fontSize: 12, color: '#555', marginTop: 2 },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#000',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
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
    padding: 10,
    marginBottom: 12,
  },
  createBtn: {
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    borderRadius: 8,
  },
  createBtnText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // để icon cách nhau 1 chút
  },

  memberSelected: {
    borderWidth: 1,
    borderColor: '#1976d2',
    backgroundColor: '#eef7ff',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1976d2', // màu nhấn xanh
  },
});
