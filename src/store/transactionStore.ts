import { create } from 'zustand';
import {
  Transaction,
  createTransaction,
  updateTransaction as dbUpdateTransaction,
  deleteTransaction as dbDeleteTransaction,
} from '../database/TransactionRepository';

type TransactionStore = {
  lastUpdated: number;
  refresh: () => void;
  addTransaction: (
    t: Omit<Transaction, 'transaction_id' | 'created_at'>,
  ) => Promise<Transaction>;
  updateTransaction: (t: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
};

export const useTransactionStore = create<TransactionStore>(set => ({
  lastUpdated: 0,

  // ✅ Thêm transaction mới
  addTransaction: async t => {
    var rs = await createTransaction(t);
    if (rs.transaction_id != '') {
      set({ lastUpdated: Date.now() });
    }
    return rs;
  },

  // ✅ Cập nhật transaction
  updateTransaction: async t => {
    await dbUpdateTransaction(t);
    set({ lastUpdated: Date.now() });
  },

  // ✅ Xoá transaction
  deleteTransaction: async id => {
    await dbDeleteTransaction(id);
    set({ lastUpdated: Date.now() });
  },
  refresh: () => set({ lastUpdated: Date.now() }),
}));
