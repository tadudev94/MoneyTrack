// store/fundStore.ts
import { create } from 'zustand';
import {
  Fund,
  getFundsByGroupId,
  createFund,
  updateFund,
} from '../database/FundRepository';

interface FundState {
  funds: Fund[]; // Ví trong group hiện tại
  loading: boolean;
  lastUpdated: number; // timestamp mỗi lần thay đổi
  refresh: () => void; // force trigger re-render khi cần

  loadByGroup: (groupId: string) => Promise<void>;
  addFund: (fund: Omit<Fund, 'fund_id' | 'created_at'>) => Promise<Fund | null>;
  updateFund: (fund_id: string, name: string, amount: number) => Promise<void>;
  clear: () => void;

  getTotalFundAmount: (totalGroupMembers: number) => number;
  getPaidFundAmount: (
    transactions: { type: string; amount: number; fund_id?: string }[],
  ) => number;
}

export const useFundStore = create<FundState>((set, get) => ({
  funds: [],
  loading: false,
  lastUpdated: 0,

  refresh: () => set({ lastUpdated: Date.now() }),

  loadByGroup: async (groupId: string) => {
    set({ loading: true });
    try {
      const rows = await getFundsByGroupId(groupId);
      set({ funds: rows, lastUpdated: Date.now() });
    } finally {
      set({ loading: false });
    }
  },
  updateFund: async (fund_id, name, amount) => {
    await updateFund(fund_id, { name });
    set({
      lastUpdated: Date.now(),
    });
  },

  addFund: async fund => {
    try{
      const id = await createFund(fund);
    const newFund: Fund = {
      ...fund,
      fund_id: id,
      created_at: Date.now(),
    };

    set(state => ({
      funds: [...state.funds, newFund],
      lastUpdated: Date.now(),
    }));

    return newFund;
    }
    catch(ex) {
      throw ex;
    }
  },

  clear: () => set({ funds: [], lastUpdated: Date.now() }),

  // ✅ tính tổng số tiền cần thu của tất cả Ví trong group
  getTotalFundAmount: totalGroupMembers => {
    return get().funds.reduce(
      (sum, f) => sum + (0) * totalGroupMembers,
      0,
    );
  },

  // ✅ tính tổng đã thu (income) từ transactions
  getPaidFundAmount: transactions => {
    return transactions
      .filter(tx => tx.type === 'income')
      .reduce((s, x) => s + x.amount, 0);
  },
}));
