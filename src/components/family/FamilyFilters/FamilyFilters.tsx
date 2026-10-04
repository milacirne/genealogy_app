import type { Court } from "../../../types/court";
import { COURT_ORDER, getCourtDetails } from "../../../utils/court";
import "./FamilyFilters.css";

export type CourtFilter = Court | "all";

interface FamilyFiltersProps {
  query: string;
  selectedCourt: CourtFilter;
  onQueryChange: (query: string) => void;
  onCourtChange: (court: CourtFilter) => void;
}

export function FamilyFilters({ query, selectedCourt, onQueryChange, onCourtChange }: FamilyFiltersProps) {
  return (
    <div className="family-filters" aria-label="Ferramentas para explorar linhagens">
      <label className="family-filters__search">
        <span className="visually-hidden">Buscar família</span>
        <span aria-hidden="true">⌕</span>
        <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Buscar família..." />
      </label>
      <div className="family-filters__courts" aria-label="Filtrar por Corte">
        <button className={selectedCourt === "all" ? "is-active" : ""} onClick={() => onCourtChange("all")} type="button">Todas</button>
        {COURT_ORDER.map((court) => (
          <button className={selectedCourt === court ? "is-active" : ""} key={court} onClick={() => onCourtChange(court)} style={{ "--filter-color": getCourtDetails(court).color } as React.CSSProperties} type="button">
            {getCourtDetails(court).name}
          </button>
        ))}
      </div>
    </div>
  );
}
