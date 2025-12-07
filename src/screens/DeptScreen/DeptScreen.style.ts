import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
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

  walletTagContainer: {
    flexDirection: 'row',
    gap: 4, // khoảng cách giữa ví và tag
    alignItems: 'center',
  },
  walletTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },

  fundTag: {
    backgroundColor: '#ffe082', // màu vàng nhạt cho ví
    color: '#424242',
  },

  expenseTag: {
    backgroundColor: '#81d4fa', // màu xanh nhạt cho tag
    color: '#01579b',
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
});