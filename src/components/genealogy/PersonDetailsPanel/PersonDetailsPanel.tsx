import type { GenealogyDataset } from "../../../types/genealogy";
import type { Person } from "../../../types/person";
import { getChildren, getLineages, getParents } from "../../../utils/genealogy";
import { getCourtDetails } from "../../../utils/court";
import "./PersonDetailsPanel.css";

const Names = ({ people }: { people: Person[] }) => <span>{people.length ? people.map((person) => `${person.firstName} ${person.lastName}`).join(", ") : "Nenhum registro"}</span>;

export function PersonDetailsPanel({ person, data, onClose }: { person: Person; data: GenealogyDataset; onClose: () => void }) {
  const court = person.court ? getCourtDetails(person.court) : undefined;
  const lineages = getLineages(person.id, data);
  return (
    <aside className="person-details" aria-label={`Detalhes de ${person.firstName} ${person.lastName}`}>
      <button className="person-details__close" type="button" onClick={onClose} aria-label="Fechar detalhes">×</button>
      <span className="person-details__eyebrow">Registro individual</span>
      <h3>{person.firstName} {person.lastName}{person.status === "deceased" && <span aria-hidden="true"> †</span>}</h3>
      <p>{person.type === "playable" ? "Personagem jogável" : "NPC"}{court ? ` · Corte ${court.name}` : ""}</p>
      <dl>
        <div><dt>Status</dt><dd>{person.status === "deceased" ? "Falecido" : "Vivo"}</dd></div>
        <div><dt>Pais</dt><dd><Names people={getParents(person.id, data)} /></dd></div>
        <div><dt>Filhos</dt><dd><Names people={getChildren(person.id, data)} /></dd></div>
        <div><dt>Linhagens</dt><dd>{lineages.length ? lineages.map((family) => family.name).join(", ") : "Em catalogação"}</dd></div>
      </dl>
    </aside>
  );
}
