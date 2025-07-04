export interface Photo {
  id: number;
  url: string;
  title: string | null;
  date: string | null;
  notes: string | null;
  isFamilyOnly: boolean;
  tags: string[];
}

export interface Tag {
  id: number;
  name: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Album {
  id: number;
  name: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
