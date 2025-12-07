export const removeDiacritics = (str: string): string => {
  return str
    .normalize('NFD') // Phân tách ký tự có dấu thành ký tự và dấu
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
    .replace(/đ/g, 'd') // Thay đ bằng d
    .replace(/Đ/g, 'D');
};
