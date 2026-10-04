import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import type { Family } from "../../../types/family";
import { getCourtDetails } from "../../../utils/court";
import { FamilyCrest } from "../FamilyCrest/FamilyCrest";
import "./FamilyCard.css";

export function FamilyCard({ family }: { family: Family }) {
  const court = getCourtDetails(family.court);
  const style = {
    "--family-color": court.color,
    ...(family.artwork ? { "--family-artwork": `url(${family.artwork})` } : {}),
  } as CSSProperties;

  if (family.artwork) {
    return (
      <Link className="family-card family-card--artwork" to={`/families/${family.id}`} style={style} aria-label={`Ver linhagem ${family.name}, Corte ${court.name}`}>
        <div className="family-card__panoramic-content">
          <h3>{family.name}</h3>
          {family.description && <p>{family.description}</p>}
          <span className="family-card__panoramic-action">Ver linhagem <i aria-hidden="true">→</i></span>
        </div>
      </Link>
    );
  }

  return (
    <Link className="family-card" to={`/families/${family.id}`} style={style} aria-label={`Ver linhagem ${family.name}, Corte ${court.name}`}>
      <FamilyCrest family={family} linked={false} />
      <div className="family-card__record">
        {family.description && <p>{family.description}</p>}
      </div>
      <span className="family-card__action">Ver linhagem <i aria-hidden="true">→</i></span>
    </Link>
  );
}
