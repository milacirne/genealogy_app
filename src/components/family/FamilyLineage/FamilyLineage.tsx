import type { GenealogyDataset } from "../../../types/genealogy";
import { FamilyTree } from "../../genealogy/FamilyTree/FamilyTree";
import { TreeLegend } from "../../genealogy/TreeLegend/TreeLegend";
import "./FamilyLineage.css";

export function FamilyLineage({ familyId, data }: { familyId: string; data: GenealogyDataset }) {
  return (
    <section className="family-lineage" aria-labelledby="family-tree-title">
      <header className="family-record-section__heading">
        <span>Registro genealógico</span>
        <h2 id="family-tree-title">Árvore da Linhagem</h2>
        <p>Ancestrais, uniões e descendências preservados nos registros da Casa.</p>
      </header>
      <FamilyTree familyId={familyId} data={data} />
      <TreeLegend />
    </section>
  );
}
