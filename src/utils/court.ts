import type { Court } from "../types/court";

interface CourtDetails {
  name: string;
  adjective: string;
  color: string;
}

export const COURT_ORDER: Court[] = ["dawn", "day", "summer", "winter", "night", "autumn", "spring"];

export const COURTS: Record<Court, CourtDetails> = {
  dawn: { name: "Crepuscular", adjective: "Crepuscular", color: "var(--court-dawn)" },
  day: { name: "Diurna", adjective: "Diurna", color: "var(--court-day)" },
  summer: { name: "Estival", adjective: "Estival", color: "var(--court-summer)" },
  winter: { name: "Invernal", adjective: "Invernal", color: "var(--court-winter)" },
  night: { name: "Noturna", adjective: "Noturna", color: "var(--court-night)" },
  autumn: { name: "Outonal", adjective: "Outonal", color: "var(--court-autumn)" },
  spring: { name: "Primaveril", adjective: "Primaveril", color: "var(--court-spring)" },
};

export const getCourtDetails = (court: Court): CourtDetails => COURTS[court];
