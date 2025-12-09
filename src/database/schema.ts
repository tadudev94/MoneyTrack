export const createTablesQuery = `
CREATE TABLE IF NOT EXISTS app_groups (
    group_id TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS app_members (
    member_id TEXT PRIMARY KEY NOT NULL,
    group_id TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (group_id) REFERENCES app_groups(group_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_funds (
    fund_id TEXT PRIMARY KEY NOT NULL,
    group_id TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (group_id) REFERENCES app_groups(group_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_snapshots (
    snapshot_id TEXT PRIMARY KEY NOT NULL,
    balance INTEGER NOT NULL,
    created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS app_fund_snapshots (
    fund_snapshot_id TEXT PRIMARY KEY NOT NULL,
    snapshot_id TEXT NOT NULL,
    fund_id TEXT NOT NULL,
    balance INTEGER NOT NULL,
    FOREIGN KEY (snapshot_id) REFERENCES app_snapshots(snapshot_id) ON DELETE CASCADE,
    FOREIGN KEY (fund_id) REFERENCES app_funds(fund_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_transactions (
    transaction_id TEXT PRIMARY KEY NOT NULL,
    type TEXT NOT NULL, -- 'income' | 'expense'
    amount INTEGER NOT NULL,
    description TEXT,
    transaction_date INTEGER NOT NULL,
    group_id TEXT NOT NULL,
    fund_id TEXT,
    to_fund_id TEXT,
    member_id TEXT,
    tag_id TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (group_id) REFERENCES app_groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (fund_id) REFERENCES app_funds(fund_id)  ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES app_members(member_id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES app_tags(tag_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_fund_members (
    fund_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    joined_at INTEGER NOT NULL, -- thời điểm tham gia Ví
    PRIMARY KEY (fund_id, member_id),
    FOREIGN KEY (fund_id) REFERENCES app_funds(fund_id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES app_members(member_id) ON DELETE CASCADE
);

-- new
CREATE TABLE IF NOT EXISTS app_tags (
    tag_id TEXT NOT NULL,
    name TEXT NOT NULL,
    PRIMARY KEY (tag_id)
);

CREATE TABLE IF NOT EXISTS app_expense_plans (
    expense_plan_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    from_date INTEGER NOT NULL,
    to_date  INTEGER NOT NULL,
    value INTEGER NOT NULL,
    PRIMARY KEY (expense_plan_id),
    FOREIGN KEY (tag_id) REFERENCES app_tags(tag_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS app_depts (
    dept_id TEXT NOT NULL,
    description TEXT NOT NULL,
    created_date INTEGER NOT NULL,
    promise_date INTEGER,
    PRIMARY KEY (dept_id)
);

CREATE TABLE IF NOT EXISTS app_dept_details (
    dept_detail_id TEXT NOT NULL,
    transaction_id TEXT NOT NULL,
    dept_id TEXT NOT NULL,
    PRIMARY KEY (dept_detail_id),
    FOREIGN KEY (transaction_id) REFERENCES app_transactions(transaction_id) ON DELETE CASCADE,
    FOREIGN KEY (dept_id) REFERENCES app_depts(dept_id) ON DELETE CASCADE
);

`;
