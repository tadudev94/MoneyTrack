import { create } from 'zustand';
import {
  ExpensePlan,
  createExpensePlan,
  updateExpensePlan as dbUpdateExpensePlan,
  deleteExpensePlan as dbDeleteExpensePlan,
} from '../database/ExpensePlanRepository';

type ExpensePlanStore = {
  lastUpdated: number;
  refresh: () => void;
  addExpensePlan: (
    t: Omit<ExpensePlan, 'expense_plan_id'>
  ) => Promise<string>;
  updateExpensePlan: (t: ExpensePlan) => Promise<void>;
  deleteExpensePlan: (id: string) => Promise<void>;
};

export const useExpensePlanStore = create<ExpensePlanStore>(set => ({
  lastUpdated: 0,

  // ✅ Thêm ExpensePlan mới
  addExpensePlan: async t => {
    const expense_plan_id = await createExpensePlan(t);
    if (expense_plan_id) {
      set({ lastUpdated: Date.now() });
    }
    return expense_plan_id;
  },

  // ✅ Cập nhật ExpensePlan
  updateExpensePlan: async t => {
    await dbUpdateExpensePlan(t.expense_plan_id, { ...t });
    set({ lastUpdated: Date.now() });
  },

  // ✅ Xoá ExpensePlan
  deleteExpensePlan: async id => {
    await dbDeleteExpensePlan(id);
    set({ lastUpdated: Date.now() });
  },

  // ✅ Refresh store
  refresh: () => set({ lastUpdated: Date.now() }),
}));
