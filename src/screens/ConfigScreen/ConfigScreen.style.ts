import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // user
  userBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#1976d2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  userName: { fontSize: 16, fontWeight: '600' },
  userEmail: { fontSize: 14, color: '#666' },

  // archive
  archiveBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 12,
    margin: 15,
    borderRadius: 8,
  },
  archiveText: { marginLeft: 10, fontSize: 15, color: '#2e7d32' },

  // section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 15,
    marginTop: 10,
    marginBottom: 5,
  },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#444' },

  // group list
  groupItem: {
    padding: 12,
    marginHorizontal: 15,
    marginVertical: 4,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  groupItemActive: {
    backgroundColor: '#eef7ff',
  },
  groupName: { fontSize: 15, color: '#333' },
  groupNameActive: { color: '#01030c', fontWeight: '600' },

  // footer (cố định dưới cùng)
  footer: {
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingText: { marginLeft: 12, fontSize: 15, color: '#444' },
  versionText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#999',
    fontSize: 13,
  },

  // modal
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
    marginBottom: 15,
  },
  createBtn: {
    backgroundColor: '#1976d2',
    paddingVertical: 12,
    borderRadius: 8,
  },
  createBtnText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
});
