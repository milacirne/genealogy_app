import type { CSSProperties } from "react";
import type { Family } from "../../../types/family";
import { getCourtDetails } from "../../../utils/court";
import "./FamilyHeader.css";

export function FamilyHeader({ family }: { family: Family }) {
  const court = getCourtDetails(family.court);
  const nameMeaningParagraphs = family.nameMeaning?.split("\n\n");
  const style = {
    "--family-accent": court.color,
    "--family-artwork": family.artwork ? `url(${family.artwork})` : "none",
  } as CSSProperties;
  return (
    <header className="family-header" style={style}>
      <div className="family-header__content">
        <p className="family-header__court">Corte {court.name}</p>
        <h1>{family.name}</h1>
        {family.motto && <blockquote>“{family.motto}”</blockquote>}
        {nameMeaningParagraphs?.length && (
          <div className="family-header__meaning">
            {nameMeaningParagraphs.map((paragraph, index) => <p key={`${family.id}-meaning-${index}`}>{paragraph}</p>)}
          </div>
        )}
      </div>
    </header>
  );
}
