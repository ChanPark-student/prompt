// lib/subjects.ts
export interface Category {
  id: string;
  name: string;
  path: string;
}

export const subjects: Category[] = [
  { id: "1", name: "산업공학입문", path: "/prompts/1" },
  { id: "2", name: "경제성공학", path: "/prompts/2" },
  { id: "3", name: "확률통계", path: "/prompts/3" },
];
