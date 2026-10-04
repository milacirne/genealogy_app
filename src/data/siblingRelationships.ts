import type { SiblingRelationship } from "../types/genealogy";

// Use somente quando a irmandade for canônica e a ascendência compartilhada ainda for desconhecida.
export const siblingRelationships: SiblingRelationship[] = [
  { personIds: ["corin-stern", "alaric-stern"], reason: "unknown-parentage" },
  { personIds: ["mordred-bjorn", "ragnar-bjorn"], reason: "unknown-parentage" },
  { personIds: ["ingrid-svalinn", "nora-svalinn"], reason: "unknown-parentage" },
  { personIds: ["nora-svalinn", "balder-svalinn"], reason: "unknown-parentage" },
  { personIds: ["gerold-kunst", "malrec-kunst"], reason: "unknown-parentage" },
  { personIds: ["gerold-kunst", "liora-kunst"], reason: "unknown-parentage" },
];
