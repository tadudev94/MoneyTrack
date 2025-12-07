// moneyFormat.ts

/** 
 * Format số tiền theo dạng 500000 -> "500,000"
 */
export function formatMoney(value: string | number): string {
  if (value === null || value === undefined) return "";
  const num = typeof value === "string" ? parseInt(value.replace(/,/g, ""), 10) : value;
  if (isNaN(num)) return "";
  return num.toLocaleString("en-US");
}

/**
 * Lấy giá trị gốc (số nguyên) từ chuỗi có format
 * "500,000" -> 500000
 */
export function parseMoney(value: string): number {
  if (!value) return 0;
  const num = parseInt(value.replace(/,/g, ""), 10);
  return isNaN(num) ? 0 : num;
}
