import { Link, useParams } from "react-router-dom";
import "./PlaceholderPage.css";

export function PlaceholderPage({ title }: { title: string }) {
  const params = useParams();
  return (
    <section className="placeholder-page">
      <span>Registro preparado</span>
      <h1>{title}</h1>
      {params.familyId && <p>Família: {params.familyId}</p>}
      {params.personId && <p>Personagem: {params.personId}</p>}
      <p>Esta rota já faz parte do arquivo e será desenvolvida na próxima etapa.</p>
      <Link to="/">Retornar ao Arquivo</Link>
    </section>
  );
}
