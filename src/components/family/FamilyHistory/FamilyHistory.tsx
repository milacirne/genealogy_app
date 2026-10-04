import { useState } from "react";
import type { Family } from "../../../types/family";
import "./FamilyHistory.css";

const PREVIEW_LENGTH = 3;

export function FamilyHistory({ family }: { family: Family }) {
  const [expanded, setExpanded] = useState(false);
  if (!family.history?.length) return null;
  const hasMore = family.history.length > PREVIEW_LENGTH;
  const paragraphs = expanded ? family.history : family.history.slice(0, PREVIEW_LENGTH);
  return (
    <section className="family-history" aria-labelledby="family-history-title">
      <header><span>Memória preservada</span><h2 id="family-history-title">História da Casa</h2></header>
      <div className={`family-history__text${!expanded && hasMore ? " family-history__text--preview" : ""}`}>
        {paragraphs.map((paragraph, index) => <p key={`${family.id}-history-${index}`}>{paragraph}</p>)}
      </div>
      {hasMore && <button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)}>{expanded ? "Recolher história" : "Ler história completa"}<span aria-hidden="true"> {expanded ? "↑" : "↓"}</span></button>}
    </section>
  );
}
