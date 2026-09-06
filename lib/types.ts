export interface Skill {
  _id: string;
  name: string;
  slug: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  version: string;
  status: "draft" | "published";
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  count?: number;
  error?: string;
}
