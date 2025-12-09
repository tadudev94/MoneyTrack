
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },

  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  summaryText: { fontSize: 15, fontWeight: '500', color: '#333' },

  memberCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 1,
  },
  memberSelected: { backgroundColor: '#e0f7fa' },

  memberName: { fontSize: 15, color: '#000' },

  statusPaid: { flexDirection: 'row', alignItems: 'center' },
  statusOverpaid: { flexDirection: 'row', alignItems: 'center' },
  statusOverpaidText: { marginLeft: 6, fontSize: 14, fontWeight: '700' },
  statusPartial: { flexDirection: 'row', alignItems: 'center' },
  statusUnpaid: { flexDirection: 'row', alignItems: 'center' },
  statusText: { marginLeft: 6, fontSize: 13, fontWeight: '500' },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#1976d2',
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