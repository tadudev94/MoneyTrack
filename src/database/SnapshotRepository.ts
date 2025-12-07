import { getDatabase } from './database';
import uuidv4 from '../utils/uuid';

// ====== TYPES ======
export interface Snapshot {
    snapshot_id: string;
    balance: number;
    created_at: number;
}

export interface FundSnapshot {
    fund_snapshot_id: string;
    snapshot_id: string;
    fund_id: string;
    fund_name: string;
    balance: number;
}

// ====== HELPER: tính balance của 1 quỹ ======
const getFundBalance = async (fundId: string): Promise<number> => {
    const db = getDatabase();
    const [incomeRes] = await db.executeSql(
        `SELECT IFNULL(SUM(amount), 0) as total 
     FROM app_transactions 
     WHERE fund_id = ? AND type = 'income'`,
        [fundId]
    );

    const [expenseRes] = await db.executeSql(
        `SELECT IFNULL(SUM(amount), 0) as total 
     FROM app_transactions 
     WHERE fund_id = ? AND type = 'expense'`,
        [fundId]
    );

    const income = incomeRes.rows.item(0).total;
    const expense = expenseRes.rows.item(0).total;

    return income - expense;
};

// ====== Tạo snapshot tổng ======
export const createSnapshot = async (groupId: string): Promise<string> => {
    const db = getDatabase();

    // Lấy tất cả fund của group
    const [fundsResult] = await db.executeSql(
        `SELECT fund_id FROM app_funds WHERE group_id = ?`,
        [groupId]
    );

    if (fundsResult.rows.length === 0) {
        throw new Error("Group không có quỹ nào để snapshot");
    }

    // Tạo snapshot tổng
    const snapshotId = uuidv4();
    const createdAt = Date.now();

    // Tính tổng balance của group
    let totalBalance = 0;

    for (let i = 0; i < fundsResult.rows.length; i++) {
        const fundId = fundsResult.rows.item(i).fund_id;
        const balance = await getFundBalance(fundId);
        totalBalance += balance;
    }

    await db.executeSql(
        `INSERT INTO app_snapshots (snapshot_id, balance, created_at) VALUES (?, ?, ?)`,
        [snapshotId, totalBalance, createdAt]
    );

    // Lưu từng fund snapshot
    for (let i = 0; i < fundsResult.rows.length; i++) {
        const fundId = fundsResult.rows.item(i).fund_id;
        const balance = await getFundBalance(fundId);

        await db.executeSql(
            `INSERT INTO app_fund_snapshots 
       (fund_snapshot_id, snapshot_id, fund_id, balance)
       VALUES (?, ?, ?, ?)`,
            [uuidv4(), snapshotId, fundId, balance]
        );
    }

    return snapshotId;
};

export const snapshotAndCleanTrans = async (groupId: string): Promise<string> => {
    const db = getDatabase();

    try {
        // 1️⃣ Tạo snapshot tổng
        const snapshotId = await createSnapshot(groupId);
        const fundSnapshots = await getFundSnapshots(snapshotId);
        // 2️⃣ Xóa toàn bộ transaction của group
        await db.executeSql(
            `DELETE FROM app_transactions WHERE group_id = ?`,
            [groupId]
        );
        for (const fund of fundSnapshots) {
            await db.executeSql(
                `INSERT INTO app_transactions 
           (transaction_id, fund_id, group_id, type, amount, created_at, description, transaction_date )
           VALUES (?, ?, ?, ?, ?, ?,?,?)`,
                [uuidv4(), fund.fund_id, groupId, 'income', fund.balance, Date.now(), 'snapshot trans', Date.now()]
            );
        }

        console.log(`Snapshot ${snapshotId} created and transactions cleared.`);

        return snapshotId;
    } catch (err) {
        console.log('snapshotAndClean error:', err);
        throw err;
    }
};


// ====== Lấy snapshot theo paging ======
export const getSnapshotsPaging = async (
    page: number,
    pageSize: number
): Promise<{ snapshots: Snapshot[]; total: number }> => {
    const db = getDatabase();

    const [countRes] = await db.executeSql(
        `SELECT COUNT(*) as total FROM app_snapshots`
    );
    const total = countRes.rows.item(0).total;

    const offset = (page - 1) * pageSize;

    const [result] = await db.executeSql(
        `SELECT * FROM app_snapshots 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
        [pageSize, offset]
    );

    const snapshots: Snapshot[] = Array.from(
        { length: result.rows.length },
        (_, i) => result.rows.item(i)
    );

    return { snapshots, total };
};

// ====== Lấy fund snapshots theo snapshot_id ====== 
export const getFundSnapshots = async (snapshotId: string): Promise<FundSnapshot[]> => {
    const db = getDatabase();
    const [result] = await db.executeSql(
        `SELECT sf.*, f.name AS fund_name 
     FROM app_fund_snapshots sf
     LEFT JOIN app_funds f ON sf.fund_id = f.fund_id
     WHERE sf.snapshot_id = ?`,
        [snapshotId]
    );

    const fundSnapshots: FundSnapshot[]
        = Array.from({ length: result.rows.length }, (_, i) => result.rows.item(i));
    return fundSnapshots;
};

export const deleteSnapshot = async (snapshotId: string) => {
    const db = getDatabase();
    await db.executeSql(`DELETE FROM app_snapshots WHERE snapshot_id = ?`, [snapshotId]);
    await db.executeSql(`DELETE FROM app_fund_snapshots WHERE snapshot_id = ?`, [snapshotId]);
};