import type { Court } from "./court";

export type PersonType = "playable" | "npc";
export type PersonStatus = "alive" | "deceased";

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  type: PersonType;
  status: PersonStatus;
  court?: Court;
  profileUrl?: string;
}
