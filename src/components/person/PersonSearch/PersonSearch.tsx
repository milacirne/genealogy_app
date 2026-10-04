import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { people } from "../../../data/people";
import "./PersonSearch.css";

export function PersonSearch() {
  const [query, setQuery] = useState("");
  const matches = useMemo(() => query.trim().length < 2 ? [] : people.filter((person) => `${person.firstName} ${person.lastName}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))).slice(0, 5), [query]);
  return (
    <div className="person-search">
      <label htmlFor="person-search">Buscar nos registros</label>
      <div className="person-search__field"><span aria-hidden="true">⌕</span><input id="person-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar personagem..." autoComplete="off" /></div>
      {matches.length > 0 && <ul>{matches.map((person) => <li key={person.id}><Link to={`/people/${person.id}`}>{person.firstName} {person.lastName}{person.status === "deceased" ? " †" : ""}</Link></li>)}</ul>}
    </div>
  );
}
