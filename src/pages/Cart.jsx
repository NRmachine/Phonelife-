import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const {
    cartItems,
    addToCart,
    removeOneFromCart,
    removeFromCart,
    clearCart,
    getCartTotal,
  } = useCart();
  
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <section style={{ padding: 40, textAlign: "center" }}>
        <h2>Votre panier est vide</h2>
        <p style={{ marginTop: 20, color: "#999" }}>
          Ajoutez des produits depuis la boutique
        </p>
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
            fontSize: 16,
          }}
        >
          Retour à la boutique
        </button>
      </section>
    );
  }

  return (
    <section style={{ padding: 40, maxWidth: 1200, margin: "0 auto" }}>
      <h2>Votre Panier</h2>

      <div style={{ marginTop: 30 }}>
        {cartItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              gap: 20,
              padding: 20,
              marginBottom: 20,
              backgroundColor: "#1a1a1a",
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            {/* Image */}
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.name}
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            )}

            {/* Info produit */}
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: 18 }}>{item.name}</h3>
              <p style={{ margin: "8px 0", color: "#ff5a1f", fontSize: 16 }}>
                {item.price} €
              </p>
            </div>

            {/* Contrôles quantité */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <button
                onClick={() => removeOneFromCart(item.id)}
                style={{
                  padding: "5px 12px",
                  backgroundColor: "#333",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                -
              </button>
              <span style={{ fontSize: 16, minWidth: 30, textAlign: "center" }}>
                {item.quantity}
              </span>
              <button
                onClick={() => addToCart(item, 1)}
                style={{
                  padding: "5px 12px",
                  backgroundColor: "#333",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                +
              </button>
            </div>

            {/* Sous-total */}
            <div style={{ minWidth: 80, textAlign: "right" }}>
              <strong>{(item.price * item.quantity).toFixed(2)} €</strong>
            </div>

            {/* Bouton supprimer */}
            <button
              onClick={() => removeFromCart(item.id)}
              style={{
                padding: "8px 12px",
                backgroundColor: "#d32f2f",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Supprimer
            </button>
          </div>
        ))}
      </div>

      {/* Total et actions */}
      <div
        style={{
          marginTop: 30,
          padding: 20,
          backgroundColor: "#1a1a1a",
          borderRadius: 8,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>
            Total: <span style={{ color: "#ff5a1f" }}>{getCartTotal().toFixed(2)} €</span>
          </h3>
        </div>

        <div style={{ display: "flex", gap: 15 }}>
          <button
            onClick={clearCart}
            style={{
              padding: "10px 20px",
              backgroundColor: "#666",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Vider le panier
          </button>
          <button
            onClick={() => navigate("/checkout")}
            style={{
              padding: "10px 30px",
              backgroundColor: "#ff5a1f",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 16,
              fontWeight: "bold",
            }}
          >
            Commander
          </button>
        </div>
      </div>
    </section>
  );
}
