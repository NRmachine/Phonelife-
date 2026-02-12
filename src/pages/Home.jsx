import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section style={{ padding: 20 }}>
      <h1>Phone Life - Réparations & Boutique</h1>
      <p>
        Bienvenue sur le site de <strong>Phone</strong> Life. Choisis une action
        ci‑dessous.
      </p>
      <ul>
        <li>
          <Link to="/rdv">Prendre un rendez-vous</Link>
        </li>
        <li>
          <Link to="/devis">Demander un devis</Link>
        </li>
        <li>
          <Link to="/boutique">Voir la boutique</Link>
        </li>
      </ul>
    </section>
  );
}
