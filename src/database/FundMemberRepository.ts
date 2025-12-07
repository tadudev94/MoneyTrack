import { getDatabase } from './database';
import { Member } from './MemberRepository';

export interface FundMember {
  fund_id: string;
  member_id: string;
  joined_at: number;
}

export const countMembersOfFund = async (fundId: string): Promise<number> => {
  const db = getDatabase();

  const [results] = await db.executeSql(
    `
    SELECT COUNT(*) as total
    FROM app_fund_members fm
    WHERE fm.fund_id = ?
    `,
    [fundId],
  );

  if (results.rows.length > 0) {
    return results.rows.item(0).total as number;
  }

  return 0;
};

export const getMembersOfFundPaging = async (
  fundId: string,
  page: number,
  pageSize: number,
): Promise<Member[]> => {
  const db = getDatabase();

  const offset = (page - 1) * pageSize;

  const [results] = await db.executeSql(
    `
    SELECT m.*, fm.fund_id
    FROM app_members m
    JOIN app_fund_members fm ON m.member_id = fm.member_id
    WHERE fm.fund_id = ?
    LIMIT ? OFFSET ?
    `,
    [fundId, pageSize, offset],
  );

  const rows: Member[] = [];
  for (let i = 0; i < results.rows.length; i++) {
    rows.push(results.rows.item(i) as Member);
  }

  return rows;
};

export const getMembersOfFunds = async (
  fundIds: string[],
): Promise<Record<string, Member[]>> => {
  if (fundIds.length === 0) return {};

  const db = getDatabase();
  const placeholders = fundIds.map(() => '?').join(',');

  const [results] = await db.executeSql(
    `
    SELECT m.*, fm.fund_id
    FROM app_members m
    JOIN app_fund_members fm ON m.member_id = fm.member_id
    WHERE fm.fund_id IN (${placeholders})
    `,
    fundIds,
  );

  const dict: Record<string, Member[]> = {};

  for (let i = 0; i < results.rows.length; i++) {
    const row = results.rows.item(i);
    const member: Member = {
      member_id: row.member_id,
      group_id: row.group_id,
      name: row.name,
      role: row.role,
      created_at: row.created_at,
    };

    if (!dict[row.fund_id]) {
      dict[row.fund_id] = [];
    }
    dict[row.fund_id].push(member);
  }

  return dict;
};

export const addMemberToFund = async (
  fundId: string,
  memberId: string,
): Promise<boolean> => {
  const db = getDatabase();
  const joinedAt = Date.now();

  const [result] = await db.executeSql(
    `INSERT OR IGNORE INTO app_fund_members (fund_id, member_id, joined_at)
     VALUES (?, ?, ?)`,
    [fundId, memberId, joinedAt],
  );

  // Nếu rowsAffected > 0 thì insert thành công
  return result.rowsAffected > 0;
};

export const addAllMembersToFund = async (
  groupId: string,
  fundId: string,
): Promise<number> => {
  const db = getDatabase();
  const joinedAt = Date.now();

  // Lấy tất cả member trong group
  const [membersResult] = await db.executeSql(
    `SELECT member_id FROM app_members WHERE group_id = ?`,
    [groupId],
  );

  const members = [];
  for (let i = 0; i < membersResult.rows.length; i++) {
    members.push(membersResult.rows.item(i).member_id);
  }

  if (members.length === 0) return 0;

  // Thêm tất cả vào fund
  let totalInserted = 0;
  for (const memberId of members) {
    const [insertResult] = await db.executeSql(
      `INSERT OR IGNORE INTO app_fund_members (fund_id, member_id, joined_at)
       VALUES (?, ?, ?)`,
      [fundId, memberId, joinedAt],
    );
    totalInserted += insertResult.rowsAffected;
  }

  return totalInserted; // số lượng thêm thành công
};

export const getFundsOfMember = async (memberId: string): Promise<string[]> => {
  const db = getDatabase();
  const [result] = await db.executeSql(
    `SELECT fund_id FROM app_fund_members WHERE member_id = ?`,
    [memberId],
  );
  const fundIds: string[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    fundIds.push(result.rows.item(i).fund_id);
  }
  return fundIds;
};

export const removeMemberFromFund = async (
  fundId: string,
  memberId: string,
): Promise<void> => {
  const db = getDatabase();
  await db.executeSql(
    `DELETE FROM app_fund_members WHERE fund_id = ? AND member_id = ?`,
    [fundId, memberId],
  );
};
export const getMembersByFund = async (
  fundId: string,
): Promise<FundMember[]> => {
  const db = getDatabase();
  const [result] = await db.executeSql(
    `SELECT * FROM app_fund_members WHERE fund_id = ?`,
    [fundId],
  );
  return Array.from(
    { length: result.rows.length },
    (_, i) => result.rows.item(i) as FundMember,
  );
};

export const getFundsByMember = async (
  memberId: string,
): Promise<FundMember[]> => {
  const db = getDatabase();
  const [result] = await db.executeSql(
    `SELECT * FROM app_fund_members WHERE member_id = ?`,
    [memberId],
  );
  return Array.from(
    { length: result.rows.length },
    (_, i) => result.rows.item(i) as FundMember,
  );
};

export const addMembersToFund = async (
  fundId: string,
  memberIds: string[],
): Promise<void> => {
  const db = getDatabase();
  const joinedAt = Date.now();

  await Promise.all(
    memberIds.map(memberId =>
      db.executeSql(
        `INSERT OR IGNORE INTO app_fund_members (fund_id, member_id, joined_at)
         VALUES (?, ?, ?)`,
        [fundId, memberId, joinedAt],
      ),
    ),
  );
};
