import { ArchivePaths } from "../../components/home/ArchivePaths/ArchivePaths";
import "./HomePage.css";

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero__ornament" aria-hidden="true"><span /></div>
        <p className="hero__eyebrow">Registros dos Sete Territórios</p>
        <h1>Arquivo das Linhagens</h1>
        <p className="hero__subtitle">Famílias, sangue e histórias entrelaçadas em Prythian.</p>
      </section>
      <ArchivePaths />
    </>
  );
}
