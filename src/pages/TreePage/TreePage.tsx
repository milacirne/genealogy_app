import { Breadcrumb } from "../../components/navigation/Breadcrumb/Breadcrumb";
import "./TreePage.css";

export function TreePage() {
  return (
    <div className="tree-page">
      <Breadcrumb items={[{ label: "Arquivo", to: "/" }, { label: "Grande Árvore" }]} />
      <section className="tree-page__placeholder">
        <div className="tree-page__ornament" aria-hidden="true"><span /></div>
        <p>Mapa genealógico de Prythian</p>
        <h1>A Grande Árvore</h1>
        <span>A estrutura completa das conexões entre famílias e gerações será aberta em uma próxima etapa.</span>
      </section>
    </div>
  );
}
