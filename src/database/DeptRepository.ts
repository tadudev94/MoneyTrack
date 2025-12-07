import { getDatabase } from './database';
import { v4 as uuidv4 } from 'uuid';

export interface Dept {
  dept_id: string;
  description: string;
  created_date: number;
  promise_date?: number;
}

export const createDept = async (
  dept: Omit<Dept, 'dept_id' | 'created_date'>,
): Promise<string> => {
  try {
    const db = getDatabase();
    const deptId = uuidv4();
    const createdDate = Date.now();

    await db.executeSql(
      `INSERT INTO app_depts (dept_id, description, created_date, promise_date)
     VALUES (?, ?, ?, ?)`,
      [deptId, dept.description, createdDate, dept.promise_date],
    );

    return deptId;
  } catch (ex) {
    console.log(ex)
    return "";
  }
};

export const updateDept = async (
  deptId: string,
  data: { description: string, promise_date?: number },
) => {
  const db = getDatabase();
  await db.executeSql(
    `UPDATE app_depts
     SET description = ? ,promise_date= ?    WHERE dept_id = ?`,
    [data.description, data.promise_date, deptId],
  );
};

export const getDeptById = async (deptId: string): Promise<Dept | null> => {
  const db = getDatabase();
  const [result] = await db.executeSql(
    `SELECT * FROM app_depts WHERE dept_id = ?`,
    [deptId],
  );

  if (result.rows.length === 0) return null;
  return result.rows.item(0) as Dept;
};

export const getDeptsByType = async (type: string): Promise<Dept[]> => {
  const db = getDatabase();
  const [result] = await db.executeSql(
    `SELECT * FROM app_depts
     WHERE type = ?
     ORDER BY created_date DESC`,
    [type],
  );

  return Array.from(
    { length: result.rows.length },
    (_, i) => result.rows.item(i) as Dept,
  );
};

export const getDeptsPaging = async (
  page: number,
  pageSize: number,
  keyword: string = ''
): Promise<{ depts: Dept[]; total: number }> => {
  const db = getDatabase();
  const offset = (page - 1) * pageSize;

  // Chuẩn hoá keyword
  const kw = keyword.trim();

  // Build SQL động
  let where = 'WHERE 1 = 1';
  const params: any[] = [];

  if (kw) {
    where += ' AND (description LIKE ? OR type LIKE ?)';
    params.push(`%${kw}%`, `%${kw}%`);
  }

  try {
    // Lấy danh sách theo paging
    const [listResult] = await db.executeSql(
      `
      SELECT *
      FROM app_depts
      ${where}
      ORDER BY created_date DESC
      LIMIT ? OFFSET ?
      `,
      [...params, pageSize, offset]
    );

    const depts: Dept[] = Array.from(
      { length: listResult.rows.length },
      (_, i) => listResult.rows.item(i) as Dept,
    );

    // Lấy tổng số dòng
    const [countResult] = await db.executeSql(
      `
      SELECT COUNT(*) AS count
      FROM app_depts
      ${where}
      `,
      params
    );

    const total = countResult.rows.item(0).count;

    return { depts, total };
  } catch (ex) {
    console.error('getDeptsPaging error:', ex);
    return { depts: [], total: 0 };
  }
};


export const deleteDept1 = async (deptId: string) => {
  const db = getDatabase();
  await db.executeSql("PRAGMA foreign_keys = ON");
  await db.executeSql(
    `DELETE FROM app_depts WHERE dept_id = ?`,
    [deptId],
  );
};


export const deleteDept = async (deptId: string) => {
  try {
    console.log(deptId, '111')
    const db = getDatabase();

    // Lấy các transaction_id liên quan
    const result = await db.executeSql(
      `SELECT transaction_id FROM app_dept_details WHERE dept_id = ?`,
      [deptId]
    );
    const ids = result[0].rows.raw().map(r => r.transaction_id);

    console.log(ids, 'aaa')      // Xóa transaction
    for (const id of ids) {
      await db.executeSql(
        `DELETE FROM app_transactions WHERE transaction_id = ?`,
        [id]
      );
    }

    // Xóa detail
    await db.executeSql(
      `DELETE FROM app_dept_details WHERE dept_id = ?`,
      [deptId]
    );

    // Xóa dept
    await db.executeSql(
      `DELETE FROM app_depts WHERE dept_id = ?`,
      [deptId]
    );
  } catch (ex) {
    console.log(ex)
  }
};
