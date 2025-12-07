import { getDatabase } from "./database";
import { v4 as uuidv4 } from "uuid";
import { Transaction } from "./TransactionRepository";

export interface DeptDetail extends Transaction {
  dept_detail_id: string;
  fund_name: string,
  dept_id: string;
}

// -----------------------------------------------------
// CREATE
// -----------------------------------------------------
export const createDeptDetail = async (
  data: Omit<DeptDetail, "dept_detail_id">
): Promise<string> => {
  try {
    const db = getDatabase();
    const id = uuidv4();

    await db.executeSql(
      `
        INSERT INTO app_dept_details
        (dept_detail_id, transaction_id, dept_id)
        VALUES (?, ?, ?)
      `,
      [id, data.transaction_id, data.dept_id]
    );

    return id;
  } catch (ex) {
    console.log("createDeptDetail error:", ex);
    return "";
  }
};

// -----------------------------------------------------
// UPDATE
// -----------------------------------------------------
export const updateDeptDetail = async (
  deptDetailId: string,
  data: { transaction_id: string; dept_id: string }
) => {
  try {
    const db = getDatabase();
    await db.executeSql(
      `
        UPDATE app_dept_details
        SET transaction_id = ?, dept_id = ?
        WHERE dept_detail_id = ?
      `,
      [data.transaction_id, data.dept_id, deptDetailId]
    );
  } catch (ex) {
    console.log("updateDeptDetail error:", ex);
  }
};

// -----------------------------------------------------
// DELETE
// -----------------------------------------------------
export const deleteDeptDetail = async (deptDetailId: string) => {
  try {
    const db = getDatabase();
    await db.executeSql(
      `DELETE FROM app_dept_details WHERE dept_detail_id = ?`,
      [deptDetailId]
    );
  } catch (ex) {
    console.log("deleteDeptDetail error:", ex);
  }
};

// -----------------------------------------------------
// GET BY ID
// -----------------------------------------------------
export const getDeptDetailById = async (
  id: string
): Promise<DeptDetail | null> => {
  const db = getDatabase();
  const [res] = await db.executeSql(
    `SELECT * FROM app_dept_details WHERE dept_detail_id = ?`,
    [id]
  );

  if (res.rows.length === 0) return null;
  return res.rows.item(0) as DeptDetail;
};

// -----------------------------------------------------
// GET BY DeptId
// -----------------------------------------------------
export const getDeptDetailsByDept = async (
  deptId: string
): Promise<DeptDetail[]> => {
  const db = getDatabase();

  const [res] = await db.executeSql(
    `
      SELECT *
      FROM app_dept_details
      WHERE dept_id = ?
    `,
    [deptId]
  );

  return Array.from(
    { length: res.rows.length },
    (_, i) => res.rows.item(i) as DeptDetail
  );
};

// -----------------------------------------------------
// GET BY TransactionId
// -----------------------------------------------------
export const getDeptDetailsByTransaction = async (
  transactionId: string
): Promise<DeptDetail[]> => {
  const db = getDatabase();

  const [res] = await db.executeSql(
    `
      SELECT *
      FROM app_dept_details
      WHERE transaction_id = ?
    `,
    [transactionId]
  );

  return Array.from(
    { length: res.rows.length },
    (_, i) => res.rows.item(i) as DeptDetail
  );
};

// -----------------------------------------------------
// PAGING + SEARCH
// -----------------------------------------------------
export const getDeptDetailsPaging = async (
  page: number,
  pageSize: number,
  dept_id: string,
  keyword: string = ""
): Promise<{ details: DeptDetail[]; total: number }> => {
  const db = getDatabase();
  console.log(dept_id)
  const offset = (page - 1) * pageSize;

  const kw = keyword.trim();

  let where = "WHERE 1 = 1 and dd.dept_id=? ";
  const params: any[] = [dept_id];

  // Search theo dept.description hoặc transaction.note
  if (kw) {
    where += `
      AND (
        d.description LIKE ?
        OR t.note LIKE ?
      )
    `;
    params.push(`%${kw}%`, `%${kw}%`);
  }

  try {
    const queryx = `select * from app_dept_details`;
    const [xx] = await db.executeSql(queryx);

    const detailxs = Array.from(
      { length: xx.rows.length },
      (_, i) => xx.rows.item(i) as DeptDetail
    );

    console.log(detailxs)
    // Lấy paging
    const [list] = await db.executeSql(
      `
        SELECT dd.*, t.*, f.name as fund_name
        FROM app_dept_details dd
        LEFT JOIN app_depts d ON dd.dept_id = d.dept_id
        LEFT JOIN app_transactions t ON dd.transaction_id = t.transaction_id
        LEFT JOIN app_funds f on t.fund_id = f.fund_id 
        ${where}
        LIMIT ? OFFSET ?
      `,
      [...params, pageSize, offset]
    );

    const details = Array.from(
      { length: list.rows.length },
      (_, i) => list.rows.item(i) as DeptDetail
    );
    console.log(details)
    // Lấy tổng số dòng
    const [count] = await db.executeSql(
      `
        SELECT COUNT(*) AS count
        FROM app_dept_details dd
        LEFT JOIN app_depts d ON dd.dept_id = d.dept_id
        LEFT JOIN app_transactions t ON dd.transaction_id = t.transaction_id
        ${where}
      `,
      params
    );

    return {
      details,
      total: count.rows.item(0).count,
    };
  } catch (ex) {
    console.log("getDeptDetailsPaging error:", ex);
    return { details: [], total: 0 };
  }
};

export const getDeptSummaryPaging = async (
  page: number,
  pageSize: number,
  keyword: string = ""
): Promise<{
  list: { dept_id: string; created_date: string; total: number }[];
  total: number;
  sum: number;
}> => {
  try {
    const db = getDatabase();
    const offset = (page - 1) * pageSize;

    const kw = keyword.trim();
    let where = "WHERE 1 = 1";
    const params: any[] = [];

    if (kw) {
      where += `
        AND (
          d.description LIKE ?
          OR t.note LIKE ?
        )
      `;
      params.push(`%${kw}%`, `%${kw}%`);
    }

    // ================================
    // LẤY DANH SÁCH CÓ PAGING
    // ================================
    const [list] = await db.executeSql(
      `
        SELECT 
          d.dept_id,
          d.description,
          d.created_date,
          SUM(
            CASE 
              WHEN t.type = 'income' THEN t.amount
              ELSE -t.amount 
            END
          ) AS total
        FROM app_depts d
        LEFT JOIN app_dept_details dd ON dd.dept_id = d.dept_id
        LEFT JOIN app_transactions t ON dd.transaction_id = t.transaction_id
        ${where}
        GROUP BY dd.dept_id, d.created_date, d.description
        ORDER BY d.created_date DESC
        LIMIT ? OFFSET ?
      `,
      [...params, pageSize, offset]
    );

    const listData = Array.from(
      { length: list.rows.length },
      (_, i) => list.rows.item(i) as any
    );
    console.log(listData, 'ssss');
    // ================================
    // ĐẾM TỔNG GROUP
    // ================================
    const [count] = await db.executeSql(
      `
        SELECT 
          COUNT(*) AS total
        FROM (
          SELECT dd.dept_id, date(d.created_date)
          FROM app_dept_details dd
          LEFT JOIN app_transactions t ON dd.transaction_id = t.transaction_id
          LEFT JOIN app_depts d ON dd.dept_id = d.dept_id
          ${where}
          GROUP BY dd.dept_id, date(d.created_date)
        ) x
      `,
      params
    );

    const [sumLs] = await db.executeSql(
      `
        SELECT 
          SUM(
            CASE 
              WHEN t.type = 'income' THEN t.amount
              ELSE -t.amount 
            END
          ) AS total
        FROM app_dept_details dd
        LEFT JOIN app_transactions t ON dd.transaction_id = t.transaction_id
        LEFT JOIN app_depts d ON dd.dept_id = d.dept_id
        ORDER BY d.created_date DESC
      `,
      []
    );

    return {
      list: listData,
      total: count.rows.item(0).total,
      sum: sumLs.rows.item(0).total
    };
  } catch (ex) {
    console.log("getDeptSummaryPaging error:", ex);
    return { list: [], total: 0, sum: 0 };
  }
};
