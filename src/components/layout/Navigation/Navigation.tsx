import { NavLink } from "react-router-dom";
import "./Navigation.css";

export function Navigation() {
  return (
    <nav className="navigation" aria-label="Navegação principal">
      <NavLink to="/">Início</NavLink>
      <NavLink to="/families">Linhagens</NavLink>
      <NavLink to="/tree">Grande Árvore</NavLink>
    </nav>
  );
}
