import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAllGroups,
  createGroup,
  updateNameGroup,
  Group,
  deleteGroup,
} from '../database/GroupRepository';

type GroupState = {
  groups: Group[];
  currentGroupId: string | null;
  loadGroups: () => Promise<void>;
  addGroup: (data: { name: string; description?: string }) => Promise<void>;
  updateGroup: (id: string, name: string) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  setCurrentGroup: (id: string) => void;
};

export const useGroupStore = create<GroupState>()(
  persist(
    (set, get) => ({
      groups: [],
      currentGroupId: null,

      loadGroups: async () => {
        const list = await getAllGroups();
        set({ groups: list });
        console.log(list)
        if (list.length > 0 && get().currentGroupId === null) {
          set({ currentGroupId: list[0].group_id });
        }
      },

      addGroup: async data => {
        const id = await createGroup(data);
        const newGroup: Group = {
          group_id: id,
          name: data.name,
          description: data.description ?? undefined,
          created_at: Date.now(),
        };
        const groups = [...get().groups, newGroup];
        set({ groups });

        if (!get().currentGroupId) {
          set({ currentGroupId: id });
        }
      },

      updateGroup: async (id, name) => {
        try {
          await updateNameGroup(id, name);

          // cập nhật trong state
          const groups = get().groups.map(g =>
            g.group_id === id ? { ...g, name } : g,
          );
          set({ groups });
        } catch (error) {
          console.error('❌ Lỗi update group:', error);
        }
      },
      deleteGroup: async (id: string) => {
        try {
          await deleteGroup(id); // gọi trong GroupRepository

          // Cập nhật lại state, loại bỏ group bị xoá
          const groups = get().groups.filter(g => g.group_id !== id);
          set({ groups });

          // Nếu xoá group hiện tại thì reset currentGroupId
          if (get().currentGroupId === id) {
            set({
              currentGroupId: groups.length > 0 ? groups[0].group_id : null,
            });
          }
        } catch (error) {
          console.error('❌ Lỗi delete group:', error);
        }
      },

      setCurrentGroup: id => set({ currentGroupId: id }),
    }),
    {
      name: 'group-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ currentGroupId: state.currentGroupId }),
    },
  ),
);
