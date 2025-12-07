// store/deptDetailStore.ts
import { create } from 'zustand';
import {
  DeptDetail,
  createDeptDetail,
  updateDeptDetail,
  deleteDeptDetail,
  getDeptDetailsByDept,
  getDeptDetailsByTransaction,
} from '../database/DeptDetailRepository';
import { createTransaction, Transaction } from '../database/TransactionRepository';

interface DeptDetailState {
  details: DeptDetail[];
  loading: boolean;
  lastUpdated: number;

  refresh: () => void;

  loadByDept: (dept_id: string) => Promise<void>;
  loadByTransaction: (transaction_id: string) => Promise<void>;

  addDetail: (
    data: Omit<DeptDetail, 'dept_detail_id'>
  ) => Promise<DeptDetail | null>;
  createWithTransaction: (
    transactionData: Omit<Transaction, 'transaction_id'>,
    detailData: Omit<DeptDetail, 'dept_detail_id' | 'transaction_id'>
  ) => Promise<DeptDetail | null>;

  updateDetail: (
    dept_detail_id: string,
    data: { transaction_id: string; dept_id: string }
  ) => Promise<void>;

  removeDetail: (dept_detail_id: string) => Promise<void>;

  clear: () => void;
}

export const useDeptDetailStore = create<DeptDetailState>((set, get) => ({
  details: [],
  loading: false,
  lastUpdated: Date.now(),

  refresh: () => set({ lastUpdated: Date.now() }),

  // -----------------------------------------------------
  // LOAD BY DEPT
  // -----------------------------------------------------
  loadByDept: async (dept_id: string) => {
    set({ loading: true });
    try {
      const rows = await getDeptDetailsByDept(dept_id);
      set({
        details: rows,
        lastUpdated: Date.now(),
      });
    } finally {
      set({ loading: false });
    }
  },

  // -----------------------------------------------------
  // LOAD BY TRANSACTION
  // -----------------------------------------------------
  loadByTransaction: async (transaction_id: string) => {
    set({ loading: true });
    try {
      const rows = await getDeptDetailsByTransaction(transaction_id);
      set({
        details: rows,
        lastUpdated: Date.now(),
      });
    } finally {
      set({ loading: false });
    }
  },
  
  createWithTransaction: async (transactionData, detailData) => {
    try {
      // 1. Tạo transaction trước
      const transaction = await createTransaction(transactionData);
      console.log(transaction, detailData)
      // 2. Tạo DeptDetail, gắn transaction_id
      const dept_detail_id = await createDeptDetail({
        ...detailData,
        transaction_id: transaction.transaction_id,
      });

      const newDetail: DeptDetail = {
        dept_detail_id,
        transaction_id: transaction.transaction_id,
        ...detailData,
      };

      // 3. Update local store
      set(state => ({
        details: [...state.details, newDetail],
        lastUpdated: Date.now(),
      }));

      return newDetail;
    } catch (e) {
      console.log('createWithTransaction error:', e);
      return null;
    }
  },

  // -----------------------------------------------------
  // ADD
  // -----------------------------------------------------
  addDetail: async data => {
    try {
      const id = await createDeptDetail(data);

      const newDetail: DeptDetail = {
        dept_detail_id: id,
        ...data,
      };

      set(state => ({
        details: [...state.details, newDetail],
        lastUpdated: Date.now(),
      }));

      return newDetail;
    } catch (ex) {
      console.log('addDetail error:', ex);
      return null;
    }
  },

  // -----------------------------------------------------
  // UPDATE
  // -----------------------------------------------------
  updateDetail: async (dept_detail_id, data) => {
    await updateDeptDetail(dept_detail_id, data);

    // update local store
    set(state => ({
      details: state.details.map(d =>
        d.dept_detail_id === dept_detail_id
          ? { ...d, ...data }
          : d
      ),
      lastUpdated: Date.now(),
    }));
  },

  // -----------------------------------------------------
  // REMOVE
  // -----------------------------------------------------
  removeDetail: async dept_detail_id => {
    await deleteDeptDetail(dept_detail_id);

    set(state => ({
      details: state.details.filter(x => x.dept_detail_id !== dept_detail_id),
      lastUpdated: Date.now(),
    }));
  },

  // -----------------------------------------------------
  // CLEAR
  // -----------------------------------------------------
  clear: () =>
    set({
      details: [],
      lastUpdated: Date.now(),
    }),
}));
