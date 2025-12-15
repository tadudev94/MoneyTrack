import { getDatabase } from './database';
import uuidv4 from '../utils/uuid';
import { getExpensePlanById } from './ExpensePlanRepository';

export interface Transaction {
  transaction_id: string;
  group_id: string;
  type: 'income' | 'expense' | 'move';
  amount: number;
  description?: string;
  transaction_date: number;
  fund_id: string;
  to_fund_id?: string;
  tag_id?: string | undefined;
  tag_name?: string | undefined;
  fund_name?: string;
  to_fund_name?: string;
  member_id?: string;
  member_name?: string;
  created_at: number;
}

export type IncomeFilterType = {
  fundIds?: string[];
  memberIds?: string[];
  startDate?: Date;
  endDate?: Date;
  keyword?: string;
};

export const getTransactionsByGroupPaging = async (
  groupId: string,
  page: number = 1,
  pageSize: number = 20,
  type?: 'income' | 'expense',
  tag_id?: string,
  searchText?: string,
): Promise<Transaction[]> => {
  const db = getDatabase();
  const offset = (page - 1) * pageSize;
  let query = `
    SELECT t.transaction_id, t.group_id, t.type, t.amount, t.description,
           t.transaction_date, t.fund_id, t.member_id, t.created_at,
           m.name as member_name, f.name as fund_name, tg.name as tag_name, tg.tag_id
    FROM app_transactions t
    LEFT JOIN app_members m ON t.member_id = m.member_id
    LEFT JOIN app_funds f ON f.fund_id = t.fund_id
    LEFT JOIN app_tags tg ON t.tag_id = tg.tag_id
    WHERE t.group_id = ?
  `;
  const params: any[] = [groupId];

  // filter theo type
  if (type) {
    query += ` AND t.type = ?`;
    params.push(type);
  }

  if (tag_id) {
    query += ` AND t.tag_id = ?`;
    params.push(tag_id);
  }

  if (searchText) {
    query += ` AND (t.description LIKE ? OR m.name LIKE ? OR f.name LIKE ?)`;
    const kw = `%${searchText}%`;
    params.push(kw, kw, kw);
  }

  query += `
    ORDER BY t.transaction_date DESC
    LIMIT ? OFFSET ?
  `;
  params.push(pageSize, offset);

  const [result] = await db.executeSql(query, params);

  const rows: Transaction[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    rows.push(result.rows.item(i));
  }
  return rows;
};

export const debugExpensePlansWithTransactions = async () => {
  const db = getDatabase();

  const query = `
    SELECT 
      p.expense_plan_id,
      p.tag_id AS plan_tag_id,
      tg.name AS tag_name,
      p.from_date,
      p.to_date,

      t.transaction_id,
      t.amount,
      t.transaction_date,
      t.tag_id AS transaction_tag_id,

      -- debug so sánh tháng
      strftime('%Y-%m', datetime(p.from_date / 1000, 'unixepoch', '+7 hours')) AS plan_month,
      strftime('%Y-%m', datetime(t.transaction_date / 1000, 'unixepoch', '+7 hours')) AS transaction_month,

      -- debug range
      CASE 
        WHEN t.transaction_date BETWEEN p.from_date AND p.to_date 
        THEN 1 ELSE 0 
      END AS in_date_range

    FROM app_expense_plans p
    LEFT JOIN app_tags tg ON tg.tag_id = p.tag_id
    LEFT JOIN app_transactions t 
      ON t.tag_id = p.tag_id
    ORDER BY p.from_date DESC, t.transaction_date DESC
  `;

  const [result] = await db.executeSql(query);

  const rows: any[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    rows.push(result.rows.item(i));
  }

  console.log('==== DEBUG expense_plan + transactions ====');
  rows.forEach(r => {
    console.log({
      expense_plan_id: r.expense_plan_id,
      tag_id: r.plan_tag_id,
      tag_name: r.tag_name,
      plan_month: r.plan_month,
      from_date: new Date(r.from_date).toISOString(),
      to_date: new Date(r.to_date).toISOString(),

      transaction_id: r.transaction_id,
      transaction_amount: r.amount,
      transaction_date: r.transaction_date
        ? new Date(r.transaction_date).toISOString()
        : null,
      transaction_month: r.transaction_month,
      same_tag: r.plan_tag_id === r.transaction_tag_id,
      same_month: r.plan_month === r.transaction_month,
      in_date_range: r.in_date_range === 1
    });
  });

  return rows;
};

export const getTransactionsWithPlanPaging = async (
  groupId: string,
  page: number = 1,
  pageSize: number = 20,
  type?: 'income' | 'expense' | '',
  fund_id?: string,
  expense_plan_id?: string,
  searchText?: string,
): Promise<Transaction[]> => {

  const db = getDatabase();
  const offset = (page - 1) * pageSize;

  // 1️⃣ Lấy plan nếu có
  let plan: ExpensePlan | null = null;
  let planMonth: string | null = null;

  console.log(expense_plan_id)
  if (expense_plan_id) {
    plan = await getExpensePlanById(expense_plan_id);
    if (plan) {
      const d = new Date(plan.from_date);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      planMonth = `${y}-${m}`; // vd: 2025-12
    }
  }

  // 2️⃣ Build query
  let query = `
    SELECT
      t.transaction_id,
      t.group_id,
      t.type,
      t.amount,
      t.description,
      t.transaction_date,
      t.fund_id,
      t.member_id,
      t.created_at,
      t.to_fund_id,
      ft.name AS to_fund_name,
      f.name AS fund_name,
      tg.name AS tag_name,
      tg.tag_id
    FROM app_transactions t
    LEFT JOIN app_funds f ON f.fund_id = t.fund_id
    LEFT JOIN app_funds ft ON ft.fund_id = t.to_fund_id
    LEFT JOIN app_tags tg ON t.tag_id = tg.tag_id
    WHERE t.group_id = ?
  `;

  let params: any[] = [groupId];
  console.log(plan, planMonth)
  // 3️⃣ Áp điều kiện theo plan (same tag + same month)
  if (plan && planMonth) {
    query += `
      AND t.tag_id = ?
      AND strftime(
            '%Y-%m',
            datetime(t.transaction_date / 1000, 'unixepoch', '+7 hours')
          ) = ?
    `;
    params.push(plan.tag_id, planMonth);
  }

  // 4️⃣ Filter khác
  if (type) {
    query += ` AND t.type = ?`;
    params.push(type);
  }

  if (fund_id) {
    query += `
      AND (
        t.fund_id = ?
        OR (t.type = 'move' AND t.to_fund_id = ?)
      )
    `;
    params.push(fund_id, fund_id);
  }

  if (searchText) {
    const kw = `%${searchText}%`;
    query += ` AND (t.description LIKE ? OR f.name LIKE ?)`;
    params.push(kw, kw);
  }

  // 5️⃣ Paging
  query += `
    ORDER BY t.transaction_date DESC
    LIMIT ? OFFSET ?
  `;
  params.push(pageSize, offset);

  // 6️⃣ Execute
  const [result] = await db.executeSql(query, params);

  const rows: Transaction[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    rows.push(result.rows.item(i));
  }

  return rows;
};


// Tạo mới transaction
export const createTransaction = async (
  tx: Omit<Transaction, 'transaction_id' | 'created_at'>,
): Promise<Transaction> => {
  try {
    console.log(tx)
    const db = getDatabase();
    const id = uuidv4();
    const createdAt = Date.now();
    if (tx.type == 'expense') {
      const balance = await getBalanceByFund(tx.fund_id);
      if (balance < tx.amount) {
        return {
          transaction_id: "",
          created_at: 0,
          ...tx,
        };
      }
    }

    await db.executeSql(
      `INSERT INTO app_transactions 
      (transaction_id, tag_id, group_id, type, amount, description, transaction_date, fund_id, member_id, created_at, to_fund_id) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        tx.tag_id,
        tx.group_id,
        tx.type,
        tx.amount,
        tx.description ?? null,
        tx.transaction_date,
        tx.fund_id ?? null,
        tx.member_id ?? null,
        createdAt,
        tx.to_fund_id
      ],
    );
    return {
      transaction_id: id,
      created_at: createdAt,
      ...tx,
    };
  } catch (ex) {
    console.log(ex)
  }
};


// Lấy danh sách transaction theo group
export const getTransactionsByGroup = async (
  groupId: string,
): Promise<Transaction[]> => {
  const db = getDatabase();
  const [result] = await db.executeSql(
    `SELECT * FROM app_transactions WHERE group_id = ? ORDER BY transaction_date ASC`,
    [groupId],
  );
  const rows: Transaction[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    rows.push(result.rows.item(i));
  }
  return rows;
};

// Lấy danh sách transaction theo fund
export const getTransactionsByFund = async (
  fundId: string,
): Promise<Transaction[]> => {
  const db = getDatabase();
  const [result] = await db.executeSql(
    `SELECT * FROM app_transactions WHERE fund_id = ? ORDER BY transaction_date ASC`,
    [fundId],
  );
  const rows: Transaction[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    rows.push(result.rows.item(i));
  }
  return rows;
};

// Tính số dư của nhóm
export const getBalanceByGroup = async (groupId: string): Promise<number> => {
  const db = getDatabase();
  const [result] = await db.executeSql(
    `SELECT 
  SUM(
    CASE 
      WHEN type = 'income' THEN amount
      WHEN type = 'expense' THEN -amount
      ELSE 0
    END
  ) AS balance
FROM app_transactions
WHERE group_id = ?
  AND type IN ('income', 'expense');`,
    [groupId],
  );
  return result.rows.item(0).balance ?? 0;
};

// Tính số dư của Ví
export const getBalanceByFund = async (fundId: string): Promise<number> => {
  const db = getDatabase();
  const [result] = await db.executeSql(
    `SELECT SUM(
        CASE 
          WHEN type = 'income' THEN amount
          WHEN type = 'expense' THEN -amount
          WHEN type = 'move' AND fund_id = ? THEN -amount          -- chuyển đi
          WHEN type = 'move' AND to_fund_id = ? THEN amount        -- chuyển đến
          ELSE 0
        END
      ) AS balance
     FROM app_transactions
     WHERE fund_id = ? OR to_fund_id = ?`,
    [fundId, fundId, fundId, fundId]
  );

  return result.rows.item(0).balance ?? 0;
};

// Xóa 1 transaction
export const deleteTransaction = async (
  transactionId: string,
): Promise<void> => {
  const db = getDatabase();
  await db.executeSql(`DELETE FROM app_transactions WHERE transaction_id = ?`, [
    transactionId,
  ]);
};

// Cập nhật transaction
export const updateTransaction1 = async (tx: Transaction): Promise<void> => {
  const db = getDatabase();
  await db.executeSql(
    `UPDATE app_transactions 
     SET group_id = ?, type = ?, amount = ?, description = ?, transaction_date = ?, fund_id = ?, member_id = ?
     WHERE transaction_id = ?`,
    [
      tx.group_id,
      tx.type,
      tx.amount,
      tx.description ?? null,
      tx.transaction_date,
      tx.fund_id ?? null,
      tx.member_id ?? null,
      tx.transaction_id,
    ],
  );
};

export const updateTransaction = async (tx: Transaction): Promise<void> => {
  const db = getDatabase();

  // Câu query cơ bản
  let query = `
    UPDATE app_transactions 
    SET group_id = ?, type = ?, amount = ?, description = ?, transaction_date = ?, fund_id = ?, member_id = ?
  `;
  const params: any[] = [
    tx.group_id,
    tx.type,
    tx.amount,
    tx.description ?? null,
    tx.transaction_date,
    tx.fund_id ?? null,
    tx.member_id ?? null,
  ];

  // Nếu tag_id khác rỗng thì thêm vào
  if (tx.tag_id && tx.tag_id !== '') {
    query += `, tag_id = ?`;
    params.push(tx.tag_id);
  }

  // WHERE clause
  query += ` WHERE transaction_id = ?`;
  params.push(tx.transaction_id);

  await db.executeSql(query, params);
};

export const getTotalTransByGroup = async (
  groupId: string,
  type: string,
  keyword?: string,
): Promise<number> => {
  const db = getDatabase();
  let query = `
    SELECT IFNULL(SUM(t.amount), 0) as total
    FROM app_transactions t
    LEFT JOIN app_members m ON t.member_id = m.member_id
    LEFT JOIN app_funds f ON f.fund_id = t.fund_id
    WHERE t.group_id = ? AND t.type = ?
  `;
  const params: any[] = [groupId, type];

  if (keyword) {
    query += ` AND (t.description LIKE ? OR m.name LIKE ? OR f.name LIKE ?)`;
    const kw = `%${keyword}%`;
    params.push(kw, kw, kw);
  }

  const [res] = await db.executeSql(query, params);
  return res.rows.item(0).total;
};


// Tổng thu theo group
export const getTotalIncomeByGroup = async (
  groupId: string,
  keyword?: string,
): Promise<number> => {
  const db = getDatabase();
  let query = `
    SELECT IFNULL(SUM(t.amount), 0) as total
    FROM app_transactions t
    LEFT JOIN app_members m ON t.member_id = m.member_id
    LEFT JOIN app_funds f ON f.fund_id = t.fund_id
    WHERE t.group_id = ? AND t.type = 'income'
  `;
  const params: any[] = [groupId];

  if (keyword) {
    query += ` AND (t.description LIKE ? OR m.name LIKE ? OR f.name LIKE ?)`;
    const kw = `%${keyword}%`;
    params.push(kw, kw, kw);
  }

  const [res] = await db.executeSql(query, params);
  return res.rows.item(0).total;
};

// Tổng thu theo group
export const getTotalFundIncomeByGroup = async (
  groupId: string,
): Promise<number> => {
  const db = getDatabase();
  const [res] = await db.executeSql(
    `SELECT IFNULL(SUM(amount), 0) as total 
     FROM app_transactions 
     WHERE group_id = ? AND type = 'income' and fund_id is not null`,
    [groupId],
  );
  return res.rows.item(0).total;
};

export const getTotalIncomeByGroupAndFund = async (
  groupId: string,
  fundId: string,
): Promise<number> => {
  const db = getDatabase();
  const [res] = await db.executeSql(
    `SELECT IFNULL(SUM(amount), 0) as total 
     FROM app_transactions 
     WHERE group_id = ? AND type = 'income' and fund_id = ?`,
    [groupId, fundId],
  );
  return res.rows.item(0).total;
};

export const getCountTransByGroup = async (
  groupId: string,
  type: string,
  keyword?: string,
): Promise<number> => {
  const db = getDatabase();
  try {
    let query = `SELECT COUNT(*) as count 
     FROM app_transactions t
    LEFT JOIN app_members m ON t.member_id = m.member_id
    LEFT JOIN app_funds f ON f.fund_id = t.fund_id and f.group_id = t.group_id
     WHERE t.group_id = ? AND t.type = ?`;
    const params: any[] = [groupId, type];
    if (keyword) {
      query += ` AND (t.description LIKE ? OR m.name LIKE ? OR f.name LIKE ?)`;
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }

    const [res] = await db.executeSql(query, params);
    return res.rows.item(0).count;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

export const getCountIncomeByGroup = async (
  groupId: string,
  keyword?: string,
): Promise<number> => {
  const db = getDatabase();
  try {
    // `SELECT t.transaction_id, t.group_id, t.type, t.amount, t.description,
    //        t.transaction_date, t.fund_id, t.member_id, t.created_at,
    //        m.name as member_name, f.name as fund_name
    // FROM app_transactions t
    // LEFT JOIN app_members m ON t.member_id = m.member_id
    // LEFT JOIN app_funds f ON f.fund_id = t.fund_id
    // WHERE t.group_id = `

    let query = `SELECT COUNT(*) as count 
     FROM app_transactions t
    LEFT JOIN app_members m ON t.member_id = m.member_id
    LEFT JOIN app_funds f ON f.fund_id = t.fund_id and f.group_id = t.group_id
     WHERE t.group_id = ? AND t.type = 'income'`;
    const params: any[] = [groupId];
    if (keyword) {
      query += ` AND (t.description LIKE ? OR m.name LIKE ? OR f.name LIKE ?)`;
      const kw = `%${keyword}%`;
      params.push(kw, kw, kw);
    }

    const [res] = await db.executeSql(query, params);
    return res.rows.item(0).count;
  } catch (error) {
    console.log(error);
    return 0;
  }
};

// Tổng chi theo group
export const getTotalExpenseByGroup = async (
  groupId: string,
): Promise<number> => {
  const db = getDatabase();
  const [res] = await db.executeSql(
    `SELECT IFNULL(SUM(amount), 0) as total 
     FROM app_transactions 
     WHERE group_id = ? AND type = 'expense'`,
    [groupId],
  );
  return res.rows.item(0).total;
};

export const getCountExpenseByGroup = async (
  groupId: string,
): Promise<number> => {
  const db = getDatabase();
  const [res] = await db.executeSql(
    `SELECT COUNT(*) as count 
     FROM app_transactions 
     WHERE group_id = ? AND type = 'expense'`,
    [groupId],
  );
  return res.rows.item(0).count;
};

export const getTotalIncomeByFunds = async (
  groupId: string,
  fundIds: string[],
): Promise<Record<string, number>> => {
  if (fundIds.length === 0) return {};

  const db = getDatabase();
  const placeholders = fundIds.map(() => '?').join(',');
  const [res] = await db.executeSql(
    `SELECT fund_id, IFNULL(SUM(amount), 0) as total
     FROM app_transactions
     WHERE fund_id IN (${placeholders}) 
       AND type = 'income' 
       AND group_id = ?
     GROUP BY fund_id`,
    [...fundIds, groupId],
  );

  const result: Record<string, number> = {};
  for (let i = 0; i < res.rows.length; i++) {
    const row = res.rows.item(i);
    result[row.fund_id] = row.total;
  }

  // đảm bảo fund nào không có transaction thì trả về 0
  fundIds.forEach(fundId => {
    if (!(fundId in result)) result[fundId] = 0;
  });

  return result;
};

export const getBalanceByFunds1 = async (
  groupId: string,
  fundIds: string[],
): Promise<Record<string, number>> => {
  if (fundIds.length === 0) return {};

  const db = getDatabase();
  const placeholders = fundIds.map(() => '?').join(',');
  const [res] = await db.executeSql(
    `SELECT 
  fund_id,
  SUM(
    CASE 
      WHEN type = 'income' THEN amount
      WHEN type = 'expense' THEN -amount
      ELSE 0
    END
  ) AS total
FROM app_transactions
WHERE fund_id IN (${placeholders})
  AND group_id = ?
GROUP BY fund_id;`,
    [...fundIds, groupId],
  );

  const result: Record<string, number> = {};
  for (let i = 0; i < res.rows.length; i++) {
    const row = res.rows.item(i);
    result[row.fund_id] = row.total;
  }

  // đảm bảo fund nào không có transaction thì trả về 0
  fundIds.forEach(fundId => {
    if (!(fundId in result)) result[fundId] = 0;
  });

  return result;
};

export const getBalanceByFunds = async (
  groupId: string,
  fundIds: string[],
): Promise<Record<string, number>> => {
  if (fundIds.length === 0) return {};

  const db = getDatabase();
  const placeholders = fundIds.map(() => '?').join(',');

  const sql = `
    SELECT 
        tmp.fund_id,
        SUM(tmp.value) AS total
    FROM (
        -- income / expense
        SELECT 
            fund_id,
            CASE 
                WHEN type = 'income' THEN amount
                WHEN type = 'expense' THEN -amount
                ELSE 0
            END AS value
        FROM app_transactions
        WHERE type IN ('income', 'expense')
          AND fund_id IN (${placeholders})
          AND group_id = ?

        UNION ALL

        -- move (source fund)
        SELECT 
            fund_id,
            -amount AS value
        FROM app_transactions
        WHERE type = 'move'
          AND fund_id IN (${placeholders})
          AND group_id = ?

        UNION ALL

        -- move (destination fund)
        SELECT 
            to_fund_id AS fund_id,
            amount AS value
        FROM app_transactions
        WHERE type = 'move'
          AND to_fund_id IN (${placeholders})
          AND group_id = ?
    ) AS tmp
    GROUP BY tmp.fund_id;
  `;

  const params = [
    ...fundIds, groupId,      // income/expense
    ...fundIds, groupId,      // move source
    ...fundIds, groupId,      // move destination
  ];

  const [res] = await db.executeSql(sql, params);

  const result: Record<string, number> = {};

  for (let i = 0; i < res.rows.length; i++) {
    const row = res.rows.item(i);
    result[row.fund_id] = row.total ?? 0;
  }

  // fund nào không có giao dịch -> trả 0
  fundIds.forEach(id => {
    if (!(id in result)) result[id] = 0;
  });

  return result;
};


export const getPaidAmountByMembers = async (
  group_id: string,
  fundId: string,
): Promise<Record<string, number>> => {
  const db = getDatabase();
  const [res] = await db.executeSql(
    `SELECT member_id, IFNULL(SUM(amount), 0) as total_paid
     FROM app_transactions
     WHERE fund_id = ? AND type = 'income' AND group_id = ?
     GROUP BY member_id`,
    [fundId, group_id],
  );

  const result: Record<string, number> = {};
  for (let i = 0; i < res.rows.length; i++) {
    const row = res.rows.item(i);
    result[row.member_id] = row.total_paid;
  }

  return result;
};

export const countFullyPaidMembersOfFund = async (
  fundId: string,
): Promise<number> => {
  const db = getDatabase();

  const [results] = await db.executeSql(
    `
    SELECT COUNT(*) as total
    FROM (
      SELECT fm.member_id, SUM(t.amount) as total_paid, 0
      FROM app_fund_members fm
      JOIN app_funds f ON f.fund_id = fm.fund_id
      LEFT JOIN app_transactions t 
        ON t.fund_id = fm.fund_id 
        AND t.member_id = fm.member_id 
        AND t.type = 'income'
      WHERE fm.fund_id = ?
      GROUP BY fm.member_id
      HAVING total_paid >= 0
    ) AS sub
    `,
    [fundId],
  );

  if (results.rows.length > 0) {
    return results.rows.item(0).total as number;
  }

  return 0;
};

export const getFundIdsWithTransactionsByMember = async (
  memberId: string,
): Promise<string[]> => {
  const db = getDatabase();

  const [result] = await db.executeSql(
    `
    SELECT DISTINCT fund_id
    FROM app_transactions
    WHERE member_id = ?
    `,
    [memberId],
  );

  const fundIds: string[] = [];
  for (let i = 0; i < result.rows.length; i++) {
    fundIds.push(result.rows.item(i).fund_id);
  }

  return fundIds;
};
