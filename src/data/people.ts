import type { Person } from "../types/person";

export const people: Person[] = [
  { id: "bastian-svalinn", firstName: "Bastian", lastName: "Svalinn", type: "playable", status: "alive", court: "winter" },
  { id: "eira-svalinn", firstName: "Eira", lastName: "Svalinn", type: "npc", status: "deceased", gender: "female", court: "winter" },
  { id: "corin-stern", firstName: "Corin", lastName: "Stern", type: "npc", status: "alive", gender: "male", court: "autumn" },
  { id: "esther-svalinn", firstName: "Esther", lastName: "Svalinn", type: "npc", status: "alive", gender: "female", court: "winter" },
  { id: "harold-richtorn", firstName: "Harold", lastName: "Richtorn", type: "npc", status: "alive", gender: "male", court: "winter" },
  { id: "freya-richtorn", firstName: "Freya", lastName: "Richtorn", type: "playable", status: "alive", court: "winter" },
  { id: "asher-richtorn", firstName: "Asher", lastName: "Richtorn", type: "npc", status: "alive", court: "winter" },
];
