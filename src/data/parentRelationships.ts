import type { ParentChildRelationship } from "../types/genealogy";

export const parentRelationships: ParentChildRelationship[] = [
  { parentId: "eira-svalinn", childId: "bastian-svalinn" },
  { parentId: "corin-stern", childId: "bastian-svalinn" },
  { parentId: "esther-svalinn", childId: "freya-richtorn" },
  { parentId: "harold-richtorn", childId: "freya-richtorn" },
  { parentId: "esther-svalinn", childId: "asher-richtorn" },
  { parentId: "harold-richtorn", childId: "asher-richtorn" },
];
