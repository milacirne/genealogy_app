import type { GenealogyDataset } from "../types/genealogy";

// Dados estritamente visuais e temporários. Não representam personagens canônicos.
export const DEMO_GENEALOGY: GenealogyDataset = {
  isDemo: true,
  lineageSeeds: { svalinn: ["mock-svalinn-01"] },
  people: [
    { id: "mock-svalinn-01", firstName: "Registro", lastName: "Demo 01", type: "npc", status: "deceased", court: "winter" },
    { id: "mock-svalinn-02", firstName: "Registro", lastName: "Demo 02", type: "npc", status: "deceased", court: "winter" },
    { id: "mock-svalinn-03", firstName: "Registro", lastName: "Demo 03", type: "playable", status: "alive", court: "winter" },
    { id: "mock-other-01", firstName: "Registro", lastName: "Demo 04", type: "npc", status: "alive", court: "autumn" },
    { id: "mock-svalinn-04", firstName: "Registro", lastName: "Demo 05", type: "npc", status: "alive", court: "winter" },
    { id: "mock-svalinn-05", firstName: "Registro", lastName: "Demo 06", type: "playable", status: "alive", court: "winter" },
  ],
  unions: [
    { id: "mock-union-01", personAId: "mock-svalinn-01", personBId: "mock-svalinn-02" },
    { id: "mock-union-02", personAId: "mock-svalinn-03", personBId: "mock-other-01" },
  ],
  parentRelationships: [
    { parentId: "mock-svalinn-01", childId: "mock-svalinn-03" },
    { parentId: "mock-svalinn-02", childId: "mock-svalinn-03" },
    { parentId: "mock-svalinn-03", childId: "mock-svalinn-04" },
    { parentId: "mock-other-01", childId: "mock-svalinn-04" },
    { parentId: "mock-svalinn-03", childId: "mock-svalinn-05" },
    { parentId: "mock-other-01", childId: "mock-svalinn-05" },
  ],
};
