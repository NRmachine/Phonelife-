import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    ville: "",
    codePostal: "",
    paymentMethod: "card",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation simple
    if (!formData.nom || !formData.email || !formData.telephone) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Préparer les données de commande
    const orderData = {
      ...formData,
      items: cartItems,
      total: getCartTotal(),
      date: new Date().toISOString(),
    };

    try {
      // Envoyer la commande au backend
      const response = await fetch("http://localhost:5001/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Commande confirmée ! Numéro: ${result.orderId}`);
        clearCart();
        navigate("/");
      } else {
        alert("Erreur lors de la création de la commande");
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur de connexion au serveur");
    }
  };

  if (cartItems.length === 0) {
    return (
      <section style={{ padding: 40, textAlign: "center" }}>
        <h2>Votre panier est vide</h2>
        <button
          onClick={() => navigate("/boutique")}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            backgroundColor: "#ff5a1f",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Retour à la boutique
        </button>
      </section>
    );
  }

  return (
    <section style={{ padding: 40, maxWidth: 800, margin: "0 auto" }}>
      <h2>Finaliser la commande</h2>

      {/* Résumé du panier */}
      <div
        style={{
          marginTop: 20,
          padding: 20,
          backgroundColor: "#1a1a1a",
          borderRadius: 8,
        }}
      >
        <h3>Résumé de la commande</h3>
        {cartItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <span>
              {item.name} x {item.quantity}
            </span>
            <span>{(item.price * item.quantity).toFixed(2)} €</span>
          </div>
        ))}
        <div
          style={{
            marginTop: 15,
            paddingTop: 15,
            borderTop: "1px solid #333",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 18,
            fontWeight: "bold",
          }}
        >
          <span>Total</span>
          <span style={{ color: "#ff5a1f" }}>{getCartTotal().toFixed(2)} €</span>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} style={{ marginTop: 30 }}>
        <div style={{ display: "grid", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
            <input
              type="text"
              name="nom"
              placeholder="Nom *"
              value={formData.nom}
              onChange={handleChange}
              required
              style={inputStyle}
            />
            <input
              type="text"
              name="prenom"
              placeholder="Prénom *"
              value={formData.prenom}
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email *"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="tel"
            name="telephone"
            placeholder="Téléphone *"
            value={formData.telephone}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <input
            type="text"
            name="adresse"
            placeholder="Adresse"
            value={formData.adresse}
            onChange={handleChange}
            style={inputStyle}
          />

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 15 }}>
            <input
              type="text"
              name="ville"
              placeholder="Ville"
              value={formData.ville}
              onChange={handleChange}
              style={inputStyle}
            />
            <input
              type="text"
              name="codePostal"
              placeholder="Code postal"
              value={formData.codePostal}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>

          <div style={{ marginTop: 10 }}>
            <label style={{ display: "block", marginBottom: 10 }}>
              Mode de paiement
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="card">Carte bancaire</option>
              <option value="paypal">PayPal</option>
              <option value="cash">Espèces (retrait en magasin)</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: 15, marginTop: 20 }}>
            <button
              type="button"
              onClick={() => navigate("/panier")}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#666",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 16,
              }}
            >
              Retour au panier
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "#ff5a1f",
                color: "white",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: 16,
                fontWeight: "bold",
              }}
            >
              Confirmer la commande
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}

const inputStyle = {
  padding: "12px",
  backgroundColor: "#1a1a1a",
  border: "1px solid #333",
  borderRadius: 8,
  color: "white",
  fontSize: 14,
  width: "100%",
};
