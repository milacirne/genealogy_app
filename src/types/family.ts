import type { Court } from "./court";

export interface Family {
  id: string;
  name: string;
  court: Court;
  crest: string;
  artwork?: string;
  description?: string;
  nameMeaning?: string;
  motto?: string;
  crestDescription?: string;
  location?: string;
  history?: string[];
}
