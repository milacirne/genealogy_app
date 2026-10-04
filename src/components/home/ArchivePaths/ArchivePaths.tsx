import { Link } from "react-router-dom";
import "./ArchivePaths.css";

function HeraldrySymbol() {
  return (
    <svg aria-hidden="true" className="archive-path__symbol" viewBox="0 0 96 96">
      <path d="M48 12 74 22v27c0 17-10 29-26 36-16-7-26-19-26-36V22z" />
      <path d="M48 24v46M35 38h26M38 30l10 8 10-8" />
      <circle cx="48" cy="49" r="5" />
    </svg>
  );
}

function GenealogySymbol() {
  return (
    <svg aria-hidden="true" className="archive-path__symbol" viewBox="0 0 96 96">
      <path d="M48 76V49M48 49 27 30M48 49l21-19M27 30V18M69 30V18M48 49V24" />
      <circle cx="27" cy="18" r="5" /><circle cx="48" cy="18" r="5" /><circle cx="69" cy="18" r="5" /><circle cx="48" cy="78" r="5" />
    </svg>
  );
}

const paths = [
  { to: "/families", title: "Linhagens", description: "Explore as casas, brasões e histórias das famílias das sete Cortes.", action: "Explorar linhagens", symbol: <HeraldrySymbol /> },
  { to: "/tree", title: "Grande Árvore", description: "Percorra os laços de sangue que conectam famílias e gerações através de Prythian.", action: "Explorar a árvore", symbol: <GenealogySymbol /> },
];

export function ArchivePaths() {
  return (
    <section className="archive-paths" aria-label="Caminhos do Arquivo">
      <div className="archive-paths__grid">
        {paths.map((path) => (
          <Link className="archive-path" key={path.to} to={path.to}>
            <span className="archive-path__corner" aria-hidden="true" />
            {path.symbol}
            <h2>{path.title}</h2>
            <p>{path.description}</p>
            <span className="archive-path__action">{path.action} <i aria-hidden="true">→</i></span>
          </Link>
        ))}
      </div>
      <footer className="archive-paths__closing">
        <div className="archive-paths__ornament" aria-hidden="true"><span /></div>
        <p>Sete Cortes. Inúmeras casas. Uma história escrita através de gerações.</p>
      </footer>
    </section>
  );
}
