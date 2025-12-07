import { deleteAllTag, getAllTags } from './TagManager';
import { deleteAllKey, getAllKey } from './KeyManager';
import { deleteAllKeyTag, getAllKeyTags } from './KeyTagManager';
import { deleteAllData, getAllData } from './DataManager';

export const GetExportData = async (): Promise<{
  tags: object;
  keyTags: object;
  keys: object;
  data: object;
}> => {
  try {
    const tags = await getAllTags();
    const keys = await getAllKey();
    const keyTags = await getAllKeyTags();
    const data = await getAllData();
    return {
      tags,
      keyTags,
      keys,
      data,
    };
  } catch (error) {
    console.error('Error creating tag:', error);
    throw error;
  }
};

export const CleanAllData = async (): Promise<void> => {
  try {
    await deleteAllKeyTag();
    await deleteAllData();
    await deleteAllTag();
    await deleteAllKey();
  } catch (error) {
    console.error('Error celanAll tag:', error);
    throw error;
  }
};


