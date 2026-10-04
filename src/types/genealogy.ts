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

export interface SiblingRelationship {
  personIds: [string, string];
  reason: "unknown-parentage";
}

export interface GenealogyDataset {
  people: Person[];
  parentRelationships: ParentChildRelationship[];
  unions: Union[];
  siblingRelationships: SiblingRelationship[];
  lineageSeeds: Partial<Record<string, string[]>>;
  lineageBoundaries?: Partial<Record<string, string[]>>;
  lineageRootOrder?: Partial<Record<string, string[]>>;
  isDemo?: boolean;
}
