import type { SiblingRelationship } from "../types/genealogy";

// Use somente quando a irmandade for canônica e a ascendência compartilhada ainda for desconhecida.
export const siblingRelationships: SiblingRelationship[] = [
  { personIds: ["eira-svalinn", "esther-svalinn"], reason: "unknown-parentage" },
  { personIds: ["corin-stern", "alaric-stern"], reason: "unknown-parentage" },
];
