export interface Person {
  id: string;
  name: string;
  level: number; // Level trong cây
  left?: string; // Node id bên trái
  right?: string; // Node id bên phải
  husband?: string; // chồng
  wife?: string[];
  dad?: string; // Id bố
  mom?: string; // Id mẹ
  isLead?: boolean;
  isBlood: boolean;
  gender: Gender;
}

export enum Gender {
  Male = 'male',
  Female = 'female',
}

export interface NodeData {
  people: Person[];
}
