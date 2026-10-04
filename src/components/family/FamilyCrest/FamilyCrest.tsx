import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import type { Family } from "../../../types/family";
import { getCourtDetails } from "../../../utils/court";
import "./FamilyCrest.css";

export function FamilyCrest({ family, linked = true }: { family: Family; linked?: boolean }) {
  const court = getCourtDetails(family.court);
  const content = (
    <>
      <span className="family-crest__halo" aria-hidden="true" />
      <span className="family-crest__shield">
        <img src={family.crest} alt="" />
        <span className="family-crest__initial">{family.name.charAt(0)}</span>
      </span>
      <strong>{family.name}</strong>
      {family.motto && <small>{family.motto}</small>}
    </>
  );

  const style = { "--crest-color": court.color } as CSSProperties;
  if (!linked) return <div className="family-crest" style={style}>{content}</div>;

  return (
    <Link className="family-crest" to={`/families/${family.id}`} style={style} aria-label={`Família ${family.name}, Corte ${court.name}`}>
      {content}
    </Link>
  );
}
