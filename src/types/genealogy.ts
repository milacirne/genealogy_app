import type { Person } from "./person";

export interface ParentChildRelationship {
  parentId: string;
  childId: string;
}

export interface Union {
  id: string;
  personAId: string;
  personBId: string;
}

export interface GenealogyDataset {
  people: Person[];
  parentRelationships: ParentChildRelationship[];
  unions: Union[];
  lineageSeeds: Partial<Record<string, string[]>>;
  isDemo?: boolean;
}
