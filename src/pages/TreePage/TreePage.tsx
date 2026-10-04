import { Breadcrumb } from "../../components/navigation/Breadcrumb/Breadcrumb";
import { FamilyTree } from "../../components/genealogy/FamilyTree/FamilyTree";
import { TreeLegend } from "../../components/genealogy/TreeLegend/TreeLegend";
import { genealogyData } from "../../utils/genealogy";
import "./TreePage.css";

export function TreePage() {
  return (
    <div className="tree-page">
      <Breadcrumb items={[{ label: "Arquivo", to: "/" }, { label: "A Grande Árvore" }]} />
      <section className="tree-page__content" aria-labelledby="great-tree-title">
        <header className="tree-page__heading">
          <span>Registro genealógico de Prythian</span>
          <h1 id="great-tree-title">A Grande Árvore</h1>
          <p>Casas, uniões e descendências reunidas em um único registro.</p>
        </header>
        <FamilyTree data={genealogyData} scaleMultiplier={.8} />
        <TreeLegend />
      </section>
    </div>
  );
}
