import type { CSSProperties } from "react";
import type { Person } from "../../../types/person";
import { getCourtDetails } from "../../../utils/court";
import "./PersonNode.css";

interface PersonNodeProps {
  person: Person;
  compact?: boolean;
  selected?: boolean;
  onSelect?: (person: Person) => void;
}

export function PersonNode({ person, compact = false, selected = false, onSelect }: PersonNodeProps) {
  const court = person.court ? getCourtDetails(person.court) : undefined;
  return (
    <button
      className={`person-node person-node--${person.type}${compact ? " person-node--compact" : ""}`}
      style={{ "--person-accent": court?.color ?? "var(--silver)" } as CSSProperties}
      type="button"
      aria-pressed={selected}
      aria-label={`${person.firstName} ${person.lastName}, ${person.type === "playable" ? "personagem jogável" : "NPC"}${person.status === "deceased" ? ", falecido" : ""}`}
      onClick={() => onSelect?.(person)}
    >
      <span className="person-node__name">{person.firstName} {!compact && person.lastName} {person.status === "deceased" && <span className="person-node__deceased" aria-hidden="true">†</span>}</span>
    </button>
  );
}
