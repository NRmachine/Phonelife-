import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { CartProvider, useCart } from "./context/CartContext";
import Home from "./pages/Home";
import Booking from "./pages/Booking";
import Quote from "./pages/Quote";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AdminDashboard from "./admin/AdminDashboard";
import "./App.css";
import logo from "./assets/logo.png";

// Composant Navigation avec effet scroll
function Navigation() {
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 1000,
        backgroundColor: "#000",
        boxShadow: scrolled ? "0 4px 20px rgba(0, 0, 0, 0.8)" : "none",
        transition: "all 0.3s ease",
        padding: scrolled ? "8px 0" : "15px 0",
      }}
    >
      <div className="nav-inner">
        <div className="nav-left">
          <Link to="/">
            <img
              src={logo}
              alt="Phone Life"
              className="logo-phone-life"
              style={{
                height: scrolled ? "40px" : "50px",
                transition: "height 0.3s ease",
              }}
            />
          </Link>
        </div>
        <div className="nav-links">
          <Link to="/rdv">Prendre un rendez-vous</Link>
          <Link to="/devis">Demande de devis</Link>
          <Link to="/boutique">Boutique</Link>
          <Link to="/admin/dashboard">Admin Dashboard</Link>
          <Link
            to="/panier"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            🛒 Panier
            {cartCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -8,
                  right: -10,
                  backgroundColor: "#ff5a1f",
                  color: "white",
                  borderRadius: "50%",
                  width: 22,
                  height: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              >
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <CartProvider>
      <Router>
        <Navigation />

        <Routes>
          {/* Pages publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/rdv" element={<Booking />} />
          <Route path="/devis" element={<Quote />} />
          <Route path="/boutique" element={<Shop />} />
          <Route path="/produits/:id" element={<ProductDetail />} />
          <Route path="/products/:id" element={<ProductDetail />} />

          {/* Panier et commande */}
          <Route path="/panier" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* Pages d'administration */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          {/* Page 404 */}
          <Route
            path="*"
            element={<div style={{ padding: 20 }}>Page introuvable</div>}
          />
        </Routes>
      </Router>
    </CartProvider>
  );
}
