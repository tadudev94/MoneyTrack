import { create } from 'zustand';
import { getTotalMembersByGroup } from '../database/MemberRepository';
import { useGroupStore } from './groupStore';

type MemberState = {
  totalGroupMembers: number;
  fundMemberCount: Record<string, number>;

  loadGroupMemberCount: () => Promise<void>;
  loadFundMemberCount: (fundId: string) => Promise<void>;
};

export const useMemberStore = create<MemberState>((set, get) => ({
  totalGroupMembers: 0,
  fundMemberCount: {},

  loadGroupMemberCount: async () => {
    const currentGroupId = useGroupStore.getState().currentGroupId; // lấy từ groupStore
    if (!currentGroupId) return;

    const total = await getTotalMembersByGroup(currentGroupId);
    set({ totalGroupMembers: total });
  },

  loadFundMemberCount: async fundId => {
    const currentGroupId = useGroupStore.getState().currentGroupId;
    if (!currentGroupId) return;

    const total = 5; // TODO: query fund_members theo groupId + fundId
    set(state => ({
      fundMemberCount: { ...state.fundMemberCount, [fundId]: total },
    }));
  },
}));
