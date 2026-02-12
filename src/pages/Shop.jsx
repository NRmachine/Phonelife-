import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [notifyEmail, setNotifyEmail] = useState({});
  const [showNotifyForm, setShowNotifyForm] = useState({});
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      alert("Erreur lors du chargement des produits");
    } finally {
      setLoading(false);
    }
  };

  const handleNotifyMe = async (productId) => {
    const email = notifyEmail[productId];
    
    if (!email) {
      alert("Veuillez entrer votre email");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/stock-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, email }),
      });

      if (res.ok) {
        alert("✓ Vous serez notifié quand le produit sera disponible !");
        setShowNotifyForm({ ...showNotifyForm, [productId]: false });
        setNotifyEmail({ ...notifyEmail, [productId]: "" });
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (p.reference && p.reference.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const categories = [
    { id: "all", label: "Tous les produits" },
    { id: "accessoires", label: "Accessoires" },
    { id: "pieces", label: "Pièces détachées" },
    { id: "telephones", label: "Téléphones" },
    { id: "ordinateurs", label: "Ordinateurs" },
  ];

  if (loading) {
    return (
      <section style={styles.container}>
        <h2>Chargement...</h2>
      </section>
    );
  }

  return (
    <section style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🛍️ Boutique Phone Life</h1>
        <p style={styles.subtitle}>
          Découvrez notre sélection de {products.length} produits
        </p>
      </div>

      <div style={styles.filtersBar}>
        <input
          type="text"
          placeholder="🔍 Rechercher un produit ou une référence..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />

        <div style={styles.categoryButtons}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                ...styles.categoryButton,
                ...(selectedCategory === cat.id ? styles.categoryButtonActive : {}),
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.resultsInfo}>
        {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""} trouvé
        {filteredProducts.length > 1 ? "s" : ""}
      </div>

      <div style={styles.productsGrid}>
        {filteredProducts.length === 0 ? (
          <div style={styles.noProducts}>
            <p>Aucun produit trouvé</p>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const images = p.images ? JSON.parse(p.images) : [];
            const mainImage = images[0] || p.imageUrl;
            const secondImage = images[1] || mainImage;
            const isHovered = hoveredProduct === p.id;
            const isInStock = p.stock > 0;
            const isLowStock = p.stock > 0 && p.stock <= 5;

            return (
              <div
                key={p.id}
                style={styles.productCard}
                onMouseEnter={() => setHoveredProduct(p.id)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {p.promoPrice && (
                  <div style={styles.promoBadge}>
                    -{Math.round(((p.price - p.promoPrice) / p.price) * 100)}%
                  </div>
                )}

                {!isInStock && (
                  <div style={{
                    position: "absolute",
                    top: 15,
                    left: 15,
                    backgroundColor: "#d32f2f",
                    color: "white",
                    padding: "6px 12px",
                    borderRadius: 20,
                    fontSize: 12,
                    fontWeight: "bold",
                    zIndex: 10,
                  }}>
                    Rupture
                  </div>
                )}

                {isLowStock && (
                  <div style={{
                    position: "absolute",
                    bottom: 220,
                    left: 250,
                    backgroundColor: "#ff9800",
                    color: "white",
                    padding: "4px 10px",
                    borderRadius: 11,
                    fontSize: 11,
                    fontWeight: "bold",
                    zIndex: 10,
                  }}>
                  limité
                  </div>
                )}

                <div
                  style={styles.imageContainer}
                  onClick={() => navigate(`/produits/${p.id}`)}
                >
                  {mainImage || secondImage ? (
                    <img
                      src={isHovered ? secondImage : mainImage}
                      alt={p.name}
                      style={styles.productImage}
                    />
                  ) : (
                    <div style={styles.noImage}>📦</div>
                  )}
                </div>

                <div style={styles.productInfo}>
                  {p.reference && (
                    <span style={styles.reference}>Réf: {p.reference}</span>
                  )}
                  
                  <h3
                    style={styles.productName}
                    onClick={() => navigate(`/produits/${p.id}`)}
                  >
                    {p.name}
                  </h3>

                  <div style={styles.categoryBadge}>{p.category}</div>

                  <div style={{
                    fontSize: 12,
                    color: isInStock ? "#4caf50" : "#d32f2f",
                    marginBottom: 10,
                    fontWeight: "600",
                  }}>
                   {isInStock ? "✓ En stock" : "✗ Rupture de stock"}
                  </div>

                  <div style={styles.priceContainer}>
                    {p.promoPrice ? (
                      <>
                        <span style={styles.oldPrice}>{p.price} €</span>
                        <span style={styles.promoPrice}>{p.promoPrice} €</span>
                      </>
                    ) : (
                      <span style={styles.normalPrice}>{p.price} €</span>
                    )}
                  </div>

                  {isInStock ? (
                    <button
                      style={{
                        ...styles.addButton,
                        backgroundColor: "#ff5a1f",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#e64a17";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#ff5a1f";
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(p, 1);
                      }}
                    >
                      Ajouter au panier
                    </button>
                  ) : (
                    <>
                      {!showNotifyForm[p.id] ? (
                        <button
                          style={{
                            ...styles.addButton,
                            backgroundColor: "#ff9800",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowNotifyForm({ ...showNotifyForm, [p.id]: true });
                          }}
                        >
                           Me prévenir
                        </button>
                      ) : (
                        <div style={styles.notifyForm} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="email"
                            placeholder="Votre email"
                            value={notifyEmail[p.id] || ""}
                            onChange={(e) =>
                              setNotifyEmail({ ...notifyEmail, [p.id]: e.target.value })
                            }
                            style={styles.notifyInput}
                          />2q1
                          <div style={{ display: "flex", gap: 5 }}>
                            <button
                              onClick={() => handleNotifyMe(p.id)}
                              style={styles.notifyButton}
                            >
                              ✓
                            </button>
                            <button
                              onClick={() =>
                                setShowNotifyForm({ ...showNotifyForm, [p.id]: false })
                              }
                              style={styles.cancelButton}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

const styles = {
  container: { padding: "40px 20px", maxWidth: 1400, margin: "0 auto" },
  header: { textAlign: "center", marginBottom: 40 },
  title: { fontSize: 36, margin: 0, marginBottom: 10 },
  subtitle: { fontSize: 16, color: "#999", margin: 0 },
  filtersBar: { marginBottom: 30 },
  searchInput: { width: "100%", padding: "15px 20px", fontSize: 16, backgroundColor: "#1a1a1a", border: "2px solid #333", borderRadius: 12, color: "white", marginBottom: 20, outline: "none" },
  categoryButtons: { display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" },
  categoryButton: { padding: "10px 20px", backgroundColor: "#1a1a1a", border: "2px solid #333", borderRadius: 25, color: "white", cursor: "pointer", fontSize: 14, transition: "all 0.3s" },
  categoryButtonActive: { backgroundColor: "#ff5a1f", borderColor: "#ff5a1f", fontWeight: "bold" },
  resultsInfo: { textAlign: "center", color: "#999", marginBottom: 30, fontSize: 14 },
  productsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 25 },
  productCard: { position: "relative", backgroundColor: "#1a1a1a", borderRadius: 16, overflow: "hidden", border: "2px solid #222", display: "flex", flexDirection: "column", height: "100%" },
  promoBadge: { position: "absolute", top: 15, right: 15, backgroundColor: "#ff5a1f", color: "white", padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: "bold", zIndex: 10 },
  imageContainer: { width: "100%", height: 280, backgroundColor: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, cursor: "pointer" },
  productImage: { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s ease" },
  noImage: { fontSize: 60, color: "#333" },
  productInfo: { padding: 20, display: "flex", flexDirection: "column", flexGrow: 1 },
  reference: { fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 },
  productName: { fontSize: 18, margin: "0 0 10px 0", fontWeight: "600", cursor: "pointer", minHeight: 48, lineHeight: "1.3" },
  categoryBadge: { display: "inline-block", padding: "4px 12px", backgroundColor: "#0d0d0d", borderRadius: 12, fontSize: 12, color: "#999", marginBottom: 15, width: "fit-content" },
  priceContainer: { marginBottom: 15, display: "flex", alignItems: "center", gap: 10, marginTop: "auto" },
  oldPrice: { fontSize: 16, color: "#666", textDecoration: "line-through" },
  promoPrice: { fontSize: 24, fontWeight: "bold", color: "#ff5a1f" },
  normalPrice: { fontSize: 24, fontWeight: "bold", color: "#ff5a1f" },
  addButton: { width: "100%", padding: "12px", border: "none", borderRadius: 10, color: "white", fontSize: 14, fontWeight: "600", cursor: "pointer", transition: "background-color 0.3s" },
  notifyForm: { backgroundColor: "#0d0d0d", padding: 10, borderRadius: 8 },
  notifyInput: { width: "100%", padding: "8px", backgroundColor: "#1a1a1a", border: "1px solid #333", borderRadius: 6, color: "white", fontSize: 12, marginBottom: 8, outline: "none" },
  notifyButton: { flex: 1, padding: "8px", backgroundColor: "#ff5a1f", border: "none", borderRadius: 6, color: "white", fontSize: 12, fontWeight: "600", cursor: "pointer" },
  cancelButton: { flex: 1, padding: "8px", backgroundColor: "#666", border: "none", borderRadius: 6, color: "white", fontSize: 12, fontWeight: "600", cursor: "pointer" },
  noProducts: { gridColumn: "1 / -1", textAlign: "center", padding: 60, color: "#666" },
};
