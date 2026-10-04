import { useMemo, useState } from "react";
import { FamilyCatalog } from "../../components/family/FamilyCatalog/FamilyCatalog";
import { FamilyFilters, type CourtFilter } from "../../components/family/FamilyFilters/FamilyFilters";
import { Breadcrumb } from "../../components/navigation/Breadcrumb/Breadcrumb";
import { families } from "../../data/families";
import "./FamiliesPage.css";

export function FamiliesPage() {
  const [query, setQuery] = useState("");
  const [selectedCourt, setSelectedCourt] = useState<CourtFilter>("all");
  const visibleFamilies = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return families.filter((family) =>
      (selectedCourt === "all" || family.court === selectedCourt) &&
      family.name.toLocaleLowerCase("pt-BR").includes(normalizedQuery),
    );
  }, [query, selectedCourt]);

  return (
    <div className="families-page">
      <Breadcrumb items={[{ label: "Arquivo", to: "/" }, { label: "Linhagens" }]} />
      <header className="families-page__hero">
        <div className="page-ornament" aria-hidden="true"><span /></div>
        <h1>Linhagens</h1>
        <p>As famílias cujos nomes moldaram a história de Prythian.</p>
      </header>
      <FamilyFilters query={query} selectedCourt={selectedCourt} onQueryChange={setQuery} onCourtChange={setSelectedCourt} />
      <FamilyCatalog families={visibleFamilies} />
    </div>
  );
}
