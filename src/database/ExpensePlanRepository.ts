import { getDatabase } from './database';
import { v4 as uuidv4 } from 'uuid';

export interface ExpensePlan {
  expense_plan_id: string;
  tag_id: string;
  from_date: number;
  to_date: number;
  value: number;
}

// Tạo mới ExpensePlan
export const feedData = async (data: Omit<ExpensePlan, 'expense_plan_id'>): Promise<string> => {
  const db = getDatabase();
  const planId = uuidv4();

  await db.executeSql(
    `select * from 
    app_`,
    [planId, data.tag_id, data.from_date, data.to_date, data.value]
  );

  return planId;
};

// Tạo mới ExpensePlan
export const createExpensePlan = async (data: Omit<ExpensePlan, 'expense_plan_id'>): Promise<string> => {
  const db = getDatabase();
  const planId = uuidv4();

  await db.executeSql(
    "INSERT INTO app_expense_plans (expense_plan_id, tag_id, from_date, to_date, value) VALUES (?, ?, ?, ?, ?)",
    [planId, data.tag_id, data.from_date, data.to_date, data.value]
  );

  return planId;
};

// Cập nhật ExpensePlan
export const updateExpensePlan = async (
  planId: string,
  data: { tag_id?: string; from_date?: number; to_date?: number; value?: number }
) => {
  const db = getDatabase();

  const fields: string[] = [];
  const params: any[] = [];

  if (data.tag_id !== undefined) {
    fields.push("tag_id = ?");
    params.push(data.tag_id);
  }
  if (data.from_date !== undefined) {
    fields.push("from_date = ?");
    params.push(data.from_date);
  }
  if (data.to_date !== undefined) {
    fields.push("to_date = ?");
    params.push(data.to_date);
  }
  if (data.value !== undefined) {
    fields.push("value = ?");
    params.push(data.value);
  }

  if (fields.length === 0) return;

  params.push(planId);

  await db.executeSql(
    `UPDATE app_expense_plans SET ${fields.join(", ")} WHERE expense_plan_id = ?`,
    params
  );
};

// Xóa ExpensePlan
export const deleteExpensePlan = async (planId: string) => {
  const db = getDatabase();

  await db.executeSql(
    "DELETE FROM app_expense_plans WHERE expense_plan_id = ?",
    [planId]
  );
};

// Lấy tất cả ExpensePlan
export const getAllExpensePlans = async (): Promise<ExpensePlan[]> => {
  const db = getDatabase();
  const [result] = await db.executeSql("SELECT * FROM app_expense_plans ORDER BY from_date DESC");

  return Array.from({ length: result.rows.length }, (_, i) => result.rows.item(i) as ExpensePlan);
};

// Lấy 1 ExpensePlan theo ID
export const getExpensePlanById = async (planId: string): Promise<ExpensePlan | null> => {
  const db = getDatabase();
  const [result] = await db.executeSql(
    "SELECT * FROM app_expense_plans WHERE expense_plan_id = ?",
    [planId]
  );

  if (result.rows.length === 0) return null;
  return result.rows.item(0) as ExpensePlan;
};

// Lấy ExpensePlan theo paging + filter
export const getExpensePlansPaging = async (
  page: number = 1,
  pageSize: number = 20,
  tagId?: string,
  searchText?: string
): Promise<{ plans: ExpensePlan[]; total: number }> => {
  const db = getDatabase();
  const offset = (page - 1) * pageSize;

  let query = `
    SELECT p.*, t.name as tag_name
    FROM app_expense_plans p
    LEFT JOIN app_tags t ON p.tag_id = t.tag_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (tagId) {
    query += " AND p.tag_id = ?";
    params.push(tagId);
  }

  if (searchText) {
    query += " AND t.name LIKE ?";
    params.push(`%${searchText}%`);
  }

  const [result] = await db.executeSql(`${query} ORDER BY p.from_date DESC LIMIT ? OFFSET ?`, [
    ...params,
    pageSize,
    offset,
  ]);

  const plans: ExpensePlan[] = Array.from({ length: result.rows.length }, (_, i) => result.rows.item(i) as ExpensePlan);

  // lấy tổng số
  const countQuery = `
    SELECT COUNT(*) as count
    FROM app_expense_plans p
    LEFT JOIN app_tags t ON p.tag_id = t.tag_id
    WHERE 1=1
    ${tagId ? " AND p.tag_id = ?" : ""}
    ${searchText ? " AND t.name LIKE ?" : ""}
  `;
  const countParams: any[] = [];
  if (tagId) countParams.push(tagId);
  if (searchText) countParams.push(`%${searchText}%`);
  const [countResult] = await db.executeSql(countQuery, countParams);
  const total = countResult.rows.item(0).count;

  return { plans, total };
};

export const getExpensePlansPagingWithSpent = async (
  page: number = 1,
  pageSize: number = 20,
  tagId?: string,
  searchText?: string
): Promise<{ plans: (ExpensePlan & { total_spent: number })[]; total: number }> => {
  const db = getDatabase();
  const offset = (page - 1) * pageSize;

  const params: any[] = [];
  let whereClause = 'WHERE 1=1';

  if (tagId) {
    whereClause += ' AND p.tag_id = ?';
    params.push(tagId);
  }

  if (searchText) {
    whereClause += ' AND t.name LIKE ?';
    params.push(`%${searchText}%`);
  }

  const query = `
    SELECT 
      p.*,
      t.name AS tag_name,
      IFNULL(SUM(tr.amount), 0) AS total_spent
    FROM app_expense_plans p
    LEFT JOIN app_tags t ON p.tag_id = t.tag_id
    LEFT JOIN app_transactions tr
      ON tr.tag_id = p.tag_id
      AND strftime('%Y-%m', datetime(tr.transaction_date / 1000, 'unixepoch', '+7 hours')) = 
    strftime('%Y-%m', datetime(p.from_date / 1000, 'unixepoch', '+7 hours'))
    ${whereClause}
    GROUP BY p.expense_plan_id
    ORDER BY p.from_date DESC
    LIMIT ? OFFSET ?
  `;
  params.push(pageSize, offset);

  const [result] = await db.executeSql(query, params);
  const plans: (ExpensePlan & { total_spent: number })[] = Array.from(
    { length: result.rows.length },
    (_, i) => result.rows.item(i) as any
  );

  // Query tổng số plan
  const countQuery = `
    SELECT COUNT(*) AS count
    FROM app_expense_plans p
    LEFT JOIN app_tags t ON p.tag_id = t.tag_id
    ${whereClause}
  `;
  const [countResult] = await db.executeSql(countQuery, params.slice(0, params.length - 2)); // loại bỏ LIMIT/OFFSET
  const total = countResult.rows.item(0).count;

  return { plans, total };
};

