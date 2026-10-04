import type { CSSProperties } from "react";
import type { Family } from "../../../types/family";
import { COURT_ORDER, getCourtDetails } from "../../../utils/court";
import { EmptyState } from "../../ui/EmptyState/EmptyState";
import { FamilyCard } from "../FamilyCard/FamilyCard";
import "./FamilyCatalog.css";

export function FamilyCatalog({ families }: { families: Family[] }) {
  if (!families.length) return <EmptyState title="Nenhuma linhagem encontrada." />;

  return (
    <div className="family-catalog">
      {COURT_ORDER.map((court) => {
        const courtFamilies = families.filter((family) => family.court === court);
        if (!courtFamilies.length) return null;
        const details = getCourtDetails(court);
        return (
          <section className="family-catalog__court" key={court} style={{ "--court-accent": details.color } as CSSProperties}>
            <header><h2>Corte {details.name}</h2><span /></header>
            <div className="family-catalog__grid">{courtFamilies.map((family) => <FamilyCard family={family} key={family.id} />)}</div>
          </section>
        );
      })}
    </div>
  );
}
