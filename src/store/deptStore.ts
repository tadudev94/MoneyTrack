// store/deptStore.ts
import { create } from 'zustand';
import {
  Dept,
  getDeptsByType,
  createDept,
  updateDept,
  deleteDept,
} from '../database/DeptRepository';

interface DeptState {
  depts: Dept[];
  loading: boolean;
  lastUpdated: number;

  refresh: () => void;

  loadByType: (type: string) => Promise<void>;
  addDept: (
    dept: Omit<Dept, 'dept_id' | 'created_date'>
  ) => Promise<Dept | null>;
  updateDept: (
    dept_id: string,
    description: string
  ) => Promise<void>;
  removeDept: (dept_id: string) => Promise<void>;

  clear: () => void;
}

export const useDeptStore = create<DeptState>((set, get) => ({
  depts: [],
  loading: false,
  lastUpdated: 0,

  refresh: () => set({ lastUpdated: Date.now() }),

  loadByType: async (type: string) => {
    set({ loading: true });
    try {
      const rows = await getDeptsByType(type);
      set({ depts: rows, lastUpdated: Date.now() });
    } finally {
      set({ loading: false });
    }
  },

  addDept: async dept => {
    try {
      const id = await createDept(dept);

      const newDept: Dept = {
        ...dept,
        dept_id: id,
        created_date: Date.now(),
      };

      set(state => ({
        depts: [...state.depts, newDept],
        lastUpdated: Date.now(),
      }));

      return newDept;
    } catch (ex) {
      throw ex;
    }
  },

  updateDept: async (dept_id, description) => {
    await updateDept(dept_id, { description });
    set({
      lastUpdated: Date.now(),
    });
  },

  removeDept: async dept_id => {
    console.log(await deleteDept(dept_id))

    set(state => ({
      depts: state.depts.filter(x => x.dept_id !== dept_id),
      lastUpdated: Date.now(),
    }));
  },

  clear: () => set({ depts: [], lastUpdated: Date.now() }),
}));
