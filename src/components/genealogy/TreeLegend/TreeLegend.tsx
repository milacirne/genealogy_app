import { COURT_ORDER, getCourtDetails } from "../../../utils/court";
import "./TreeLegend.css";

function RelationshipIcon({ type }: { type: "union" | "descent" | "sibling" }) {
  const path = type === "union" ? "M 2 9 H 38" : type === "descent" ? "M 20 2 V 9 M 4 9 H 36 M 4 9 V 16 M 36 9 V 16" : "M 2 9 H 38";
  return (
    <svg className={`legend-relation legend-relation--${type}`} viewBox="0 0 40 18" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

export function TreeLegend() {
  return (
    <aside className="tree-legend" aria-label="Legenda da árvore genealógica">
      <div className="tree-legend__types">
        <span><i className="legend-node legend-node--playable" /> Jogável</span>
        <span><i className="legend-node legend-node--npc" /> NPC</span>
        <span><b>†</b> Falecido</span>
      </div>
      <div className="tree-legend__relations">
        <span><RelationshipIcon type="union" /> União</span>
        <span><RelationshipIcon type="descent" /> Descendência</span>
        <span><RelationshipIcon type="sibling" /> Irmandade</span>
      </div>
      <div className="tree-legend__courts">
        {COURT_ORDER.map((court) => <span key={court}><i style={{ backgroundColor: getCourtDetails(court).color }} />{getCourtDetails(court).name}</span>)}
      </div>
    </aside>
  );
}
