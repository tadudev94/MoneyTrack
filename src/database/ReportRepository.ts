import { getDatabase } from './database';

export type FundReport = {
  fund_id: string;
  name: string;
  balance: number;
};

export type MemberFundReport = {
  member_id: string;
  member_name: string;
  fund_balances: { [fund_id: string]: number }; // còn thiếu ở từng Ví
};

export type TransactionReport = {
  transaction_id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string | null;
  transaction_date: number;
  fund_id: string | null;
  fund_name: string | null;
  to_fund_name: string | null;
  member_id: string | null;
  member_name: string | null;
};

export type TransactionSummary = {
  transactions: TransactionReport[];
  total_income: number;
  total_expense: number;
  balance: number;
};

export const getTransactionsReport = async (
  groupId: string,
): Promise<TransactionSummary> => {
  const db = getDatabase();

  // lấy toàn bộ giao dịch + join Ví + member
  const [result] = await db.executeSql(
    `SELECT t.transaction_id,
            t.type,
            t.amount,
            t.description,
            t.transaction_date,
            t.fund_id,
            f.name AS fund_name,
            t.to_fund_id,
            ft.name as to_fund_name,
            t.member_id,
            m.name AS member_name
     FROM app_transactions t
     LEFT JOIN app_funds f ON t.fund_id = f.fund_id
     LEFT JOIN app_funds ft ON ft.fund_id = t.to_fund_id
     LEFT JOIN app_members m ON t.member_id = m.member_id
     WHERE t.group_id = ?
     ORDER BY t.transaction_date DESC`,
    [groupId],
  );


  const transactions: TransactionReport[] = [];
  let total_income = 0;
  let total_expense = 0;

  for (let i = 0; i < result.rows.length; i++) {
    const row = result.rows.item(i);

    transactions.push({
      transaction_id: row.transaction_id,
      type: row.type,
      amount: row.amount,
      to_fund_name: row.to_fund_name,
      description: row.description,
      transaction_date: row.transaction_date,
      fund_id: row.fund_id,
      fund_name: row.fund_name,
      member_id: row.member_id,
      member_name: row.member_name,
    });

    if (row.type === 'income') total_income += row.amount;
    if (row.type === 'expense') total_expense += row.amount;
  }

  return {
    transactions,
    total_income,
    total_expense,
    balance: total_income - total_expense,
  };
};

// Lấy tổng quan nhóm: thu / chi / số dư
export const getGroupOverview = async (groupId: string) => {
  const db = getDatabase();

  const [incomeResult] = await db.executeSql(
    `SELECT IFNULL(SUM(amount), 0) as total FROM app_transactions 
     WHERE group_id = ? AND type = 'income'`,
    [groupId],
  );

  const [expenseResult] = await db.executeSql(
    `SELECT IFNULL(SUM(amount), 0) as total FROM app_transactions 
     WHERE group_id = ? AND type = 'expense'`,
    [groupId],
  );

  const income = incomeResult.rows.item(0).total;
  const expense = expenseResult.rows.item(0).total;

  return { income, expense, balance: income - expense };
};

// Lấy danh sách Ví + tổng cần thu + đã thu + còn thiếu
export const getFundsReport = async (
  groupId: string,
): Promise<FundReport[]> => {
  const db = getDatabase();

  // Lấy tất cả ví trong group
  const [fundsResult] = await db.executeSql(
    `
    SELECT fund_id, name
    FROM app_funds
    WHERE group_id = ?
    `,
    [groupId]
  );

  const funds: FundReport[] = [];

  for (let i = 0; i < fundsResult.rows.length; i++) {
    const row = fundsResult.rows.item(i);

    // === LẤY BALANCE DỰA TRÊN TRANSACTIONS ===
    const [balanceResult] = await db.executeSql(
      `
      SELECT 
        IFNULL(SUM(
          CASE
            WHEN t.type = 'income' THEN t.amount                -- thu vào
            WHEN t.type = 'expense' THEN -t.amount              -- chi ra
            WHEN t.type = 'move' AND t.fund_id = ? THEN -t.amount     -- chuyển đi
            WHEN t.type = 'move' AND t.to_fund_id = ? THEN t.amount   -- chuyển đến
            ELSE 0
          END
        ), 0) AS balance
      FROM app_transactions t
      WHERE t.group_id = ?
        AND (
              t.fund_id = ? 
              OR (t.type = 'move' AND t.to_fund_id = ?)
            )
      `,
      [row.fund_id, row.fund_id, groupId, row.fund_id, row.fund_id]
    );

    const balance = balanceResult.rows.item(0).balance;

    funds.push({
      fund_id: row.fund_id,
      name: row.name,
      balance,        // chỉ trả ra balance
    });
  }

  return funds;
};


// Lấy danh sách thành viên trong group và số tiền còn thiếu theo từng Ví
export const getMembersFundReport = async (
  groupId: string,
): Promise<MemberFundReport[]> => {
  const db = getDatabase();

  // Lấy thành viên trong group
  const [membersResult] = await db.executeSql(
    `SELECT member_id, name FROM app_members WHERE group_id = ?`,
    [groupId],
  );

  const members: MemberFundReport[] = [];
  for (let i = 0; i < membersResult.rows.length; i++) {
    const m = membersResult.rows.item(i);

    // Lấy danh sách Ví mà member này tham gia
    const [fundsResult] = await db.executeSql(
      `SELECT f.fund_id, 0,
              IFNULL(SUM(t.amount), 0) as paid
       FROM app_fund_members fm
       JOIN app_funds f ON f.fund_id = fm.fund_id
       LEFT JOIN app_transactions t
         ON t.fund_id = f.fund_id AND t.member_id = fm.member_id
       WHERE fm.member_id = ?
       GROUP BY f.fund_id`,
      [m.member_id],
    );

    const fund_balances: { [fund_id: string]: number } = {};
    for (let j = 0; j < fundsResult.rows.length; j++) {
      const f = fundsResult.rows.item(j);
      const remaining = 0 - f.paid;
      fund_balances[f.fund_id] = remaining;
    }

    members.push({
      member_id: m.member_id,
      member_name: m.name,
      fund_balances,
    });
  }
  return members;
};
