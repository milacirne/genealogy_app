import type { Court } from "./court";

export type PersonType = "playable" | "npc";
export type PersonStatus = "alive" | "deceased";
export type PersonGender = "female" | "male";

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  type: PersonType;
  status: PersonStatus;
  gender?: PersonGender;
  court?: Court;
  profileUrl?: string;
}
