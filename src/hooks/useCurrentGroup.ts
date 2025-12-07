// hooks/useCurrentGroup.ts
import { useMemo } from 'react';
import { useGroupStore } from '../store/groupStore';
import { Group } from '../database/GroupRepository';

export const useCurrentGroup = (): { group: Group | null; loading: boolean } => {
  const { groups, currentGroupId } = useGroupStore();

  const group = useMemo(() => {
    if (!currentGroupId) return null;
    return groups.find(g => g.group_id === currentGroupId) ?? null;
  }, [groups, currentGroupId]);

  const loading = groups.length === 0;

  return { group, loading };
};