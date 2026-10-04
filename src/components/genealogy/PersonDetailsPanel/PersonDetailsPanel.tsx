import { Link, useParams } from "react-router-dom";
import type { GenealogyDataset } from "../../../types/genealogy";
import type { Person } from "../../../types/person";
import { getChildren, getLineages, getParents } from "../../../utils/genealogy";
import { getCourtDetails } from "../../../utils/court";
import "./PersonDetailsPanel.css";

const Names = ({ people }: { people: Person[] }) => <span>{people.map((person) => `${person.firstName} ${person.lastName}`).join(", ")}</span>;

function ParentNames({ people }: { people: Person[] }) {
  const ordered = [...people].sort((first, second) => {
    const order = { male: 0, female: 1 } as const;
    return (first.gender ? order[first.gender] : 2) - (second.gender ? order[second.gender] : 2);
  });
  return (
    <span className="person-details__parents">
      {ordered.map((parent, index) => (
        <span key={parent.id}>
          {index > 0 && <span aria-hidden="true">, </span>}
          {parent.gender && <span className={`person-details__gender person-details__gender--${parent.gender}`} aria-label={parent.gender === "male" ? "Pai" : "Mãe"}>{parent.gender === "male" ? "♂" : "♀"}</span>}
          {parent.firstName} {parent.lastName}
        </span>
      ))}
    </span>
  );
}

export function PersonDetailsPanel({ person, data, onClose }: { person: Person; data: GenealogyDataset; onClose: () => void }) {
  const { familyId } = useParams();
  const court = person.court ? getCourtDetails(person.court) : undefined;
  const lineages = getLineages(person.id, data);
  const parents = getParents(person.id, data);
  const children = getChildren(person.id, data);
  return (
    <aside className="person-details" aria-label={`Detalhes de ${person.firstName} ${person.lastName}`}>
      <button className="person-details__close" type="button" onClick={onClose} aria-label="Fechar detalhes">×</button>
      <span className="person-details__eyebrow">Registro individual</span>
      <h3>{person.firstName} {person.lastName}{person.status === "deceased" && <span aria-hidden="true"> †</span>}</h3>
      <p>{person.type === "playable" ? "Personagem jogável" : "NPC"}{court ? ` · Corte ${court.name}` : ""}</p>
      <dl>
        {parents.length > 0 && <div><dt>Pais</dt><dd><ParentNames people={parents} /></dd></div>}
        {children.length > 0 && <div><dt>Filhos</dt><dd><Names people={children} /></dd></div>}
        {lineages.length > 0 && <div><dt>Linhagens</dt><dd className="person-details__lineages">{lineages.map((family, index) => <span key={family.id}>{index > 0 && <span aria-hidden="true">, </span>}{family.id === familyId ? family.name : <Link to={`/families/${family.id}`}>{family.name}</Link>}</span>)}</dd></div>}
      </dl>
    </aside>
  );
}
