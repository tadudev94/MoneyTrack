import { getDatabase } from './database';
import { v4 as uuidv4 } from 'uuid';

export const TAG_ID_CHO_VAY = "6934ed6c-ffe8-8321-bf6b-48239d9460f7";
export const TAG_ID_DUOC_TRA_NO = "3d8bc5a0-1d1e-4cbf-9db8-9c3a4c9f21aa";

export interface Tag {
  tag_id: string;
  name: string;
}

export const getTagsPaging = async (
  page: number = 1,
  pageSize: number = 20,
  searchText?: string
): Promise<{ tags: Tag[]; total: number }> => {
  const db = getDatabase();
  const offset = (page - 1) * pageSize;

  let query = "SELECT * FROM app_tags WHERE 1=1";
  const params: any[] = [];

  if (searchText) {
    query += " AND name LIKE ?";
    params.push(`%${searchText}%`);
  }

  const [result] = await db.executeSql(`${query} ORDER BY name ASC LIMIT ? OFFSET ?`, [
    ...params,
    pageSize,
    offset,
  ]);

  const tags: Tag[] = Array.from({ length: result.rows.length }, (_, i) => result.rows.item(i) as Tag);

  const [countResult] = await db.executeSql(`SELECT COUNT(*) as count FROM app_tags WHERE 1=1${searchText ? " AND name LIKE ?" : ""}`, searchText ? [`%${searchText}%`] : []);

  const total = countResult.rows.item(0).count;

  return { tags, total };
};

export const createTag = async (data: Omit<Tag, 'tag_id'>): Promise<string> => {
  const db = getDatabase();
  const tagId = uuidv4();

  await db.executeSql(
    "INSERT INTO app_tags (tag_id, name) VALUES (?, ?)",
    [tagId, data.name]
  );

  return tagId;
};

export const updateTag = async (tagId: string, data: { name: string }) => {
  const db = getDatabase();

  await db.executeSql(
    "UPDATE app_tags SET name = ? WHERE tag_id = ?",
    [data.name, tagId]
  );
};

export const deleteTag = async (tagId: string) => {
  const db = getDatabase();

  await db.executeSql(
    "DELETE FROM app_tags WHERE tag_id = ?",
    [tagId]
  );
};

export const getAllTags = async (): Promise<Tag[]> => {
  const db = getDatabase();
  const [result] = await db.executeSql("SELECT * FROM app_tags");

  return Array.from(
    { length: result.rows.length },
    (_, i) => result.rows.item(i) as Tag
  );
};

export const getTagById = async (tagId: string): Promise<Tag | null> => {
  const db = getDatabase();
  const [result] = await db.executeSql(
    "SELECT * FROM app_tags WHERE tag_id = ?",
    [tagId]
  );

  if (result.rows.length === 0) return null;
  return result.rows.item(0) as Tag;
};

export const ensureDefaultTags = async (): Promise<string[]> => {
  const db = getDatabase();

  const defaults = [
    {
      tag_id: TAG_ID_CHO_VAY,
      name: "Cho Vay",
    },
    {
      tag_id: TAG_ID_DUOC_TRA_NO, // hardcode
      name: "Được Trả Nợ",
    },
  ];

  const createdIds: string[] = [];

  try {
    for (const item of defaults) {
      const { tag_id, name } = item;

      // check by id
      const [byId] = await db.executeSql(
        `SELECT tag_id FROM app_tags WHERE tag_id = ? LIMIT 1`,
        [tag_id]
      );

      if (byId.rows.length > 0) {
        createdIds.push(tag_id);
        continue;
      }

      // check by name (avoid duplicate)
      const [byName] = await db.executeSql(
        `SELECT tag_id FROM app_tags WHERE name = ? LIMIT 1`,
        [name]
      );

      if (byName.rows.length > 0) {
        createdIds.push(byName.rows.item(0).tag_id);
        continue;
      }

      // insert default
      await db.executeSql(
        `
          INSERT INTO app_tags (tag_id, name)
          VALUES (?, ?)
        `,
        [tag_id, name]
      );

      createdIds.push(tag_id);
    }

    return createdIds;
  } catch (err) {
    console.log("ensureDefaultTags error:", err);
    return [];
  }
};
