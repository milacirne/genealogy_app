import { Link, useParams } from "react-router-dom";
import { FamilyHeader } from "../../components/family/FamilyHeader/FamilyHeader";
import { FamilyLineage } from "../../components/family/FamilyLineage/FamilyLineage";
import { FamilyHistory } from "../../components/family/FamilyHistory/FamilyHistory";
import { EmptyState } from "../../components/ui/EmptyState/EmptyState";
import { Breadcrumb } from "../../components/navigation/Breadcrumb/Breadcrumb";
import { families } from "../../data/families";
import { getGenealogyForFamily } from "../../utils/genealogy";
import "./FamilyPage.css";

export function FamilyPage() {
  const { familyId } = useParams();
  const family = families.find((candidate) => candidate.id === familyId);

  if (!family) {
    return (
      <div className="family-page family-page--missing">
        <EmptyState title="Linhagem não encontrada."><Link to="/families">Retornar às Linhagens</Link></EmptyState>
      </div>
    );
  }

  const genealogy = getGenealogyForFamily(family.id);

  return (
    <article className="family-page">
      <Breadcrumb items={[{ label: "Arquivo", to: "/" }, { label: "Linhagens", to: "/families" }, { label: family.name }]} />
      <FamilyHeader family={family} />
      <FamilyLineage familyId={family.id} data={genealogy} />
      <FamilyHistory family={family} />
    </article>
  );
}
