import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fb',
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  loadingWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f1f1f',
  },

  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },

  summaryTitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },

  summaryDetail: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 2,
    color: '#333',
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },

  fundCard: {
    backgroundColor: '#ffffff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'column',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  fundInfo: {
    flexDirection: 'column',
  },

  fundName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E40AF', // màu nổi bật cho tên ví
  },

  fundBalance: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '600',
    color: '#16A34A', // màu xanh cho số tiền
  },
});
