import uuidv4 from '../utils/uuid';
import { getDatabase } from './database';

export interface  Member {
  member_id: string;
  group_id: string;
  name: string;
  role?: string;
  created_at: number;
}

export const createMember = async (
  member: Omit<Member, 'member_id' | 'created_at'>
): Promise<string> => {
  const db = getDatabase();
  const memberId = uuidv4();
  const createdAt = Date.now();
  await db.executeSql(
    `INSERT INTO app_members (member_id, group_id, name, role, created_at) VALUES (?, ?, ?, ?, ?)`,
    [memberId, member.group_id, member.name, member.role ?? null, createdAt],
  );
  return memberId;
};

export const updateMember = async (
  member: Pick<Member, 'member_id' | 'name' | 'role'>
): Promise<void> => {
  const db = getDatabase();
  await db.executeSql(
    `UPDATE app_members 
     SET name = ?, role = ? 
     WHERE member_id = ?`,
    [member.name, member.role ?? null, member.member_id]
  );
};

export const getMembersByGroupPaging = async (
  groupId: string,
  page: number,
  pageSize: number,
  search: string = ''
): Promise<{ members: Member[]; total: number }> => {
  const db = getDatabase();

  let where = `WHERE group_id = ?`;
  let params: any[] = [groupId];

  if (search.trim()) {
    where += ` AND name LIKE ?`;
    params.push(`%${search}%`);
  }

  // Đếm total theo filter
  const [countResult] = await db.executeSql(
    `SELECT COUNT(*) as total FROM app_members ${where}`,
    params
  );
  const total = countResult.rows.item(0).total as number;

  // Lấy dữ liệu có phân trang
  const offset = (page - 1) * pageSize;
  const [result] = await db.executeSql(
    `SELECT * FROM app_members ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  const members: Member[] = Array.from({ length: result.rows.length }, (_, i) =>
    result.rows.item(i) as Member
  );

  return { members, total };
};

export const fetchMembersPage = async (
  page: number,
  pageSize: number,
  groupId: string
): Promise<Member[]> => {
  const { members } = await getMembersByGroupPaging(groupId, page, pageSize);
  return members;
};

export const getTotalMembersByGroup = async (groupId: string): Promise<number> => {
  const db = getDatabase();
  const [result] = await db.executeSql(
    `SELECT COUNT(*) as total FROM app_members WHERE group_id = ?`,
    [groupId]
  );
  return result.rows.item(0).total as number;
};

// Lấy thông tin member theo ID
export const getMemberById = async (memberId: string): Promise<Member | null> => {
  const db = getDatabase();
  const [result] = await db.executeSql(
    `SELECT * FROM app_members WHERE member_id = ? LIMIT 1`,
    [memberId],
  );

  if (result.rows.length > 0) {
    return result.rows.item(0) as Member;
  }
  return null;
};

// Xoá member theo ID
export const deleteMember = async (memberId: string): Promise<void> => {
  const db = getDatabase();
  await db.executeSql(`DELETE FROM app_members WHERE member_id = ?`, [memberId]);
};