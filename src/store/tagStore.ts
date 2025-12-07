import { create } from 'zustand';
import {
  Tag,
  createTag,
  updateTag as dbUpdateTag,
  deleteTag as dbDeleteTag,
} from '../database/TagRepository';

type TagStore = {
  lastUpdated: number;
  refresh: () => void;
  addTag: (
    t: Omit<Tag, 'tag_id' | 'created_at'>,
  ) => Promise<string>;
  updateTag: (t: Tag) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;

  filterTagId: string;
  setFilterTagId: (id: string) => void;
  resetFilterTagId: () => void;
};

export const useTagStore = create<TagStore>(set => ({
  lastUpdated: 0,
  filterTagId: "",
  setFilterTagId: (id) => set({ filterTagId: id }),
  resetFilterTagId: () => set({ filterTagId: "" }),
  // ✅ Thêm Tag mới
  addTag: async t => {
    var tag_id = await createTag(t);
    if (tag_id != '') {
      set({ lastUpdated: Date.now() });
    }
    return tag_id;
  },

  // ✅ Cập nhật Tag
  updateTag: async t => {
    await dbUpdateTag(t.tag_id, { ...t });
    set({ lastUpdated: Date.now() });
  },

  // ✅ Xoá Tag
  deleteTag: async id => {
    await dbDeleteTag(id);
    set({ lastUpdated: Date.now() });
  },
  refresh: () => set({ lastUpdated: Date.now() }),
}));
