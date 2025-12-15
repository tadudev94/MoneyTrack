import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  walletTag: {
    backgroundColor: '#e0e0e0',
    color: '#424242',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 25,
  },
  actionBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    width: 40,
    marginLeft: 8,
    padding: 4,
  },
  summaryCard: {
    backgroundColor: '#f9f9f9',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  summaryTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  summaryDetail: { fontSize: 14, color: '#555' },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemTitle: { fontSize: 14, fontWeight: '600', color: '#000' },
  itemDate: { fontSize: 12, color: '#777', marginTop: 2 },
  itemAmount: { fontSize: 14, fontWeight: 'bold', color: '#c62828' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#777',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
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
  modalTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  payBtn: {
    backgroundColor: '#777',
    paddingVertical: 12,
    borderRadius: 8,
  },
  payBtnText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  summaryBox: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f5f7fa',
    marginHorizontal: 4,
  },

  summaryLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },

  planAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1976d2', // xanh kế hoạch
  },

  spentAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#d32f2f', // đỏ chi tiêu
  },
  remainingBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#eef4ff',
    alignItems: 'center',
  },

  remainingAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2e7d32', // còn tiền
  },

  overSpent: {
    color: '#c62828', // vượt kế hoạch
  },
});