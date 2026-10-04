import { Link } from "react-router-dom";
import "./Header.css";

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="site-mark" to="/" aria-label="Arquivo das Linhagens — página inicial">
          <span className="site-mark__sigil" aria-hidden="true">A</span>
          <span><strong>Arquivo</strong><small>das Linhagens</small></span>
        </Link>
      </div>
    </header>
  );
}
