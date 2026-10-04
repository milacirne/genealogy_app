import { Link } from "react-router-dom";
import heraldryIcon from "../../../assets/brasao-icon.png";
import genealogyIcon from "../../../assets/genealogia-icon.png";
import "./ArchivePaths.css";

const paths = [
  { to: "/families", title: "Linhagens", description: "Explore as casas, brasões e histórias das famílias das sete Cortes.", action: "Explorar linhagens", symbol: <img aria-hidden="true" className="archive-path__symbol archive-path__symbol--image" src={heraldryIcon} alt="" /> },
  { to: "/tree", title: "A Grande Árvore", description: "Percorra os laços de sangue que conectam famílias e gerações através de Prythian.", action: "Explorar a árvore", symbol: <img aria-hidden="true" className="archive-path__symbol archive-path__symbol--image" src={genealogyIcon} alt="" /> },
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
