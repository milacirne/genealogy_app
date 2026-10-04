import type { ParentChildRelationship } from "../types/genealogy";

export const parentRelationships: ParentChildRelationship[] = [
  { parentId: "eira-svalinn", childId: "bastian-svalinn" },
  { parentId: "corin-stern", childId: "bastian-svalinn" },
  { parentId: "alaric-stern", childId: "johann-stern" },
  { parentId: "liesel-stern", childId: "johann-stern" },
  { parentId: "alaric-stern", childId: "lysandra-stern" },
  { parentId: "liesel-stern", childId: "lysandra-stern" },
  { parentId: "esther-svalinn", childId: "freya-richtorn" },
  { parentId: "harold-richtorn", childId: "freya-richtorn" },
  { parentId: "esther-svalinn", childId: "asher-richtorn" },
  { parentId: "harold-richtorn", childId: "asher-richtorn" },
];
