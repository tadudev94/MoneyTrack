// --- Styles ---
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
  summaryTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  summaryValue: { fontSize: 14, fontWeight: '500', color: '#000' },

  fundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  fundName: { fontSize: 15, fontWeight: '600', marginBottom: 4, color: '#000' },
  fundDetail: { fontSize: 13, color: '#555' },
  progress: { marginTop: 6, height: 6, borderRadius: 3 },
  balanceBox: { marginLeft: 12, alignItems: 'flex-end' },
  balanceLabel: { fontSize: 12, color: '#888' },
  balanceValue: { fontSize: 14, fontWeight: 'bold', color: '#008000' },
  balanceTotal: { fontSize: 13, color: '#141313ff', fontWeight: 'bold' },

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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
  },
});
