import { create } from 'zustand';
import {
  addMemberToFund,
  getFundsOfMember,
  removeMemberFromFund,
} from '../database/FundMemberRepository';

type MemberFundStore = {
  lastUpdated: number;
  updateMemberFunds: (memberId: string, newFunds: string[]) => Promise<void>;
  addMemberToFund: (fundId: string, memberId: string) => Promise<void>;
  removeMemberFromFund: (fundId: string, memberId: string) => Promise<void>;
};

export const useMemberFundStore = create<MemberFundStore>(set => ({
  lastUpdated: 0,

  addMemberToFund: async (fundId, memberId) => {
    await addMemberToFund(fundId, memberId);
    set({ lastUpdated: Date.now() });
  },

  removeMemberFromFund: async (fundId, memberId) => {
    await removeMemberFromFund(fundId, memberId);
    set({ lastUpdated: Date.now() });
  },

  updateMemberFunds: async (memberId: string, newFunds: string[]) => {
    const currentFunds = await getFundsOfMember(memberId);
    for (const f of newFunds) {
      if (!currentFunds.includes(f)) await addMemberToFund(f, memberId);
    }
    for (const f of currentFunds) {
      if (!newFunds.includes(f)) await removeMemberFromFund(f, memberId);
    }

    set({ lastUpdated: Date.now() });
  },
}));
