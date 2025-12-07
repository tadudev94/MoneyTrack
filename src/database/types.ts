export interface Key {
  key_id: string;
  name: string;
}

export interface Data {
  data_id: string;
  key_id: string;
  text: string;
}

export interface Tag {
  tag_id: string;
  updated_at: string;
  tag: string;
}

export interface TagWithCount extends Tag {
  count: number;
}

export interface KeyTag {
  key_id: string;
  tag_id: string;
  key_name: string;
  tag_name: string;
}
