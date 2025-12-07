import { getDatabase } from './database';
import { v4 as uuidv4 } from 'uuid';

export interface Fund {
  fund_id: string;
  group_id: string;
  name: string;
  created_at: number;
}

export const createFund = async (
  fund: Omit<Fund, 'fund_id' | 'created_at'>,
): Promise<string> => {
  const db = getDatabase();
  const fundId = uuidv4();
  const createdAt = Date.now();
  await db.executeSql(
    `INSERT INTO app_funds (fund_id, group_id, name, created_at) VALUES (?, ?, ?, ?)`,
    [
      fundId,
      fund.group_id,
      fund.name,
      createdAt,
    ],
  );
  return fundId;
};

export const updateFund = async (
  fundId: string,
  data: { name: string; },
) => {
  const db = getDatabase();
  await db.executeSql(
    `UPDATE app_funds SET name = ?  WHERE fund_id = ?`,
    [data.name, fundId],
  );
};

export const getFundsByGroupId = async (group_id: string): Promise<Fund[]> => {
  const db = getDatabase();
  const [result] = await db.executeSql(
    `SELECT f.* FROM app_funds f
     WHERE f.group_id = ?`,
    [group_id],
  );
  return Array.from(
    { length: result.rows.length },
    (_, i) => result.rows.item(i) as Fund,
  );
};

export const getFundsByGroupPaging = async (
  groupId: string,
  page: number,
  pageSize: number,
): Promise<{ funds: Fund[]; total: number }> => {
  const db = getDatabase();
  const offset = (page - 1) * pageSize;

  // Lấy danh sách Ví theo paging
  const [fundResult] = await db.executeSql(
    `SELECT * FROM app_funds WHERE group_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [groupId, pageSize, offset],
  );
  const funds: Fund[] = Array.from(
    { length: fundResult.rows.length },
    (_, i) => fundResult.rows.item(i) as Fund,
  );

  // Lấy tổng số Ví của group
  const [countResult] = await db.executeSql(
    `SELECT COUNT(*) as count FROM app_funds WHERE group_id = ?`,
    [groupId],
  );
  const total = countResult.rows.item(0).count;

  return { funds, total };
};

export const getTotalExpectedByGroup = async (
  groupId: string,
): Promise<number> => {
  const db = getDatabase();

  const [result] = await db.executeSql(
    `
    SELECT 
      SUM(0 * IFNULL(fm_count.num_members, 0)) AS total_expected
    FROM app_funds f
    LEFT JOIN (
      SELECT fund_id, COUNT(member_id) AS num_members
      FROM app_fund_members
      GROUP BY fund_id
    ) AS fm_count
    ON f.fund_id = fm_count.fund_id
    WHERE f.group_id = ?
    `,
    [groupId],
  );

  const totalExpected = result.rows.item(0).total_expected ?? 0;
  return totalExpected;
};

export const getTotalExpectedByGroupAndFund = async (
  groupId: string,
  fundId: string,
): Promise<number> => {
  const db = getDatabase();

  const [result] = await db.executeSql(
    `
    SELECT 
      SUM(0 * IFNULL(fm_count.num_members, 0)) AS total_expected
    FROM app_funds f
    LEFT JOIN (
      SELECT fund_id, COUNT(member_id) AS num_members
      FROM app_fund_members
      GROUP BY fund_id
    ) AS fm_count
    ON f.fund_id = fm_count.fund_id
    WHERE f.group_id = ? and f.fund_id = ?
    `,
    [groupId, fundId],
  );

  const totalExpected = result.rows.item(0).total_expected ?? 0;
  return totalExpected;
};
