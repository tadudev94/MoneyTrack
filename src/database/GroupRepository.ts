import { getDatabase } from './database';
import uuidv4 from '../utils/uuid';

export interface Group {
  group_id: string;
  name: string;
  description?: string;
  created_at: number;
}

// Tạo nhóm
export const createGroup = async (
  group: Omit<Group, 'group_id' | 'created_at'>,
): Promise<string> => {
  const db = getDatabase();
  const groupId = uuidv4();
  const createdAt = Date.now();
  await db.executeSql(
    `INSERT INTO app_groups (group_id, name, description, created_at) VALUES (?, ?, ?, ?)`,
    [groupId, group.name, group.description ?? null, createdAt],
  );
  return groupId;
};

// Lấy tất cả nhóm
export const getAllGroups = async (): Promise<Group[]> => {
  const db = getDatabase();
  const [result] = await db.executeSql(`SELECT * FROM app_groups`);
  return Array.from(
    { length: result.rows.length },
    (_, i) => result.rows.item(i) as Group,
  );
};

// Lấy 1 nhóm theo id
export const getGroupById = async (groupId: string): Promise<Group | null> => {
  const db = getDatabase();
  const [result] = await db.executeSql(
    `SELECT * FROM app_groups WHERE group_id = ?`,
    [groupId],
  );
  if (result.rows.length === 0) return null;
  return result.rows.item(0) as Group;
};

// Cập nhật nhóm
export const updateGroup = async (group: Group): Promise<void> => {
  const db = getDatabase();
  await db.executeSql(
    `UPDATE app_groups SET name = ?, description = ? WHERE group_id = ?`,
    [group.name, group.description ?? null, group.group_id],
  );
};

export const updateNameGroup = async (
  groupId: string,
  name: string,
): Promise<void> => {
  try {
    const db = getDatabase();
    await db.executeSql(`UPDATE app_groups SET name = ? WHERE group_id = ?`, [
      name,
      groupId,
    ]);
    console.log(`✅ Cập nhật tên nhóm ${groupId} thành "${name}" thành công`);
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật tên nhóm:', error);
    throw error; // ném ra để chỗ gọi hàm biết có lỗi
  }
};

// Xóa nhóm
export const deleteGroup = async (groupId: string): Promise<number> => {
  const db = getDatabase();
  const [result] = await db.executeSql(
    `DELETE FROM app_groups WHERE group_id = ?`,
    [groupId],
  );
  return result.rowsAffected ?? 0;
};
