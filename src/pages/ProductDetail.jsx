import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [email, setEmail] = useState("");
  const [showNotificationForm, setShowNotificationForm] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://localhost:5001/api/products");
        const all = await res.json();
        const p = all.find((x) => x.id === Number(id));
        setProduct(p || null);
      } catch (err) {
        console.error("Erreur chargement produit:", err);
      }
    };
    load();
  }, [id]);

  const handleAddToCart = () => {
    if (product.stock < quantity) {
      alert("Stock insuffisant !");
      return;
    }
    addToCart(product, quantity);
    alert(`${quantity} x ${product.name} ajouté(s) au panier !`);
  };

  const handleNotifyMe = async () => {
    if (!email) {
      alert("Veuillez entrer votre email");
      return;
    }

    try {
      const res = await fetch("http://localhost:5001/api/stock-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          email: email,
        }),
      });

      if (res.ok) {
        alert("✓ Vous serez notifié quand le produit sera disponible !");
        setShowNotificationForm(false);
        setEmail("");
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    }
  };

  if (!product) {
    return (
      <section style={styles.container}>
        <p>Produit introuvable.</p>
      </section>
    );
  }

  const images = product.images ? JSON.parse(product.images) : [];
  const allImages = images.length > 0 ? images : [product.imageUrl];
  const mainImage = allImages[selectedImage] || product.imageUrl;
  const isInStock = product.stock > 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <section style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.backButton}>
        ← Retour
      </button>

      <div style={styles.productLayout}>
        <div style={styles.imageSection}>
          {product.promoPrice && (
            <div style={styles.promoBadge}>
              -{Math.round(((product.price - product.promoPrice) / product.price) * 100)}%
            </div>
          )}

          {!isInStock && (
            <div style={styles.outOfStockBadge}>⚠️ Rupture de stock</div>
          )}

          <div style={styles.mainImageContainer}>
            {mainImage ? (
              <img src={mainImage} alt={product.name} style={styles.mainImage} />
            ) : (
              <div style={styles.noImage}>📦</div>
            )}
          </div>

          {allImages.length > 1 && (
            <div style={styles.thumbnails}>
              {allImages.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`${product.name} ${i + 1}`}
                  style={{
                    ...styles.thumbnail,
                    border: selectedImage === i ? "3px solid #ff5a1f" : "3px solid transparent",
                  }}
                  onClick={() => setSelectedImage(i)}
                />
              ))}
            </div>
          )}
        </div>

        <div style={styles.infoSection}>
          {product.reference && (
            <span style={styles.reference}>Réf: {product.reference}</span>
          )}

          <h1 style={styles.productName}>{product.name}</h1>
          <div style={styles.categoryBadge}>{product.category}</div>

          {/* Badge de stock */}
          <div style={styles.stockStatus}>
            {isInStock ? (
              <span
                style={{
                  ...styles.stockBadge,
                  backgroundColor: isLowStock ? "#ff9800" : "#4caf50",
                }}
              >
                {isLowStock ? "⚠️ Stock limité" : "✓ En stock"}
              </span>
            ) : (
              <span
                style={{ ...styles.stockBadge, backgroundColor: "#d32f2f" }}
              >
                ✗ Rupture de stock
              </span>
            )}
          </div>

          <div style={styles.priceSection}>
            {product.promoPrice ? (
              <>
                <span style={styles.oldPrice}>{product.price} €</span>
                <span style={styles.promoPrice}>{product.promoPrice} €</span>
              </>
            ) : (
              <span style={styles.normalPrice}>{product.price} €</span>
            )}
          </div>

          <div style={styles.divider}></div>

          <div style={styles.descriptionSection}>
            <h3 style={styles.sectionTitle}>📝 Description</h3>
            <p style={styles.description}>
              {product.description || "Aucune description disponible."}
            </p>
          </div>

          <div style={styles.featuresSection}>
            <h3 style={styles.sectionTitle}>✨ Caractéristiques</h3>
            <ul style={styles.featuresList}>
              <li>Catégorie : {product.category}</li>
              <li>Prix : {product.promoPrice || product.price} €</li>
              {product.reference && <li>Référence : {product.reference}</li>}
              <li>
                  Disponibilité : {isInStock ? "En stock" : "Rupture de stock"} 
              </li>
            </ul>
          </div>

          <div style={styles.divider}></div>

          {isInStock ? (
            <>
              <div style={styles.quantitySection}>
                <label style={styles.quantityLabel}>Quantité :</label>
                <div style={styles.quantityControls}>
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={styles.quantityButton}
                  >
                    -
                  </button>
                  <span style={styles.quantityValue}>{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    style={styles.quantityButton}
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={styles.actionButtons}>
                <button onClick={handleAddToCart} style={styles.addToCartButton}>
                  🛒 Ajouter au panier
                </button>
                <button
                  onClick={() => {
                    handleAddToCart();
                    navigate("/panier");
                  }}
                  style={styles.buyNowButton}
                >
                  💳 Acheter maintenant
                </button>
              </div>
            </>
          ) : (
            <>
              {!showNotificationForm ? (
                <button
                  onClick={() => setShowNotificationForm(true)}
                  style={styles.notifyButton}
                >
                   Me prévenir quand disponible
                </button>
              ) : (
                <div style={styles.notificationForm}>
                  <input
                    type="email"
                    placeholder="Votre email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.emailInput}
                  />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={handleNotifyMe}
                      style={styles.submitNotifyButton}
                    >
                      Envoyer
                    </button>
                    <button
                      onClick={() => setShowNotificationForm(false)}
                      style={styles.cancelButton}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <div style={styles.infoBox}>
            <p style={styles.infoText}>✓ Livraison gratuite dès 50€</p>
            <p style={styles.infoText}>✓ Retour gratuit sous 14 jours</p>
            <p style={styles.infoText}>✓ Garantie 2 ans</p>
          </div>
        </div>
      </div>
    </section>
  );
}
 
const styles = {
  container: {
    padding: "40px 20px",
    maxWidth: 1400,
    margin: "0 auto",
  },
  backButton: {
    padding: "10px 20px",
    backgroundColor: "#ff5a1f",
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 30,
  },
  productLayout: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 60,
  },
  imageSection: {
    position: "relative",
  },
  promoBadge: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#ff5a1f",
    color: "white",
    padding: "8px 16px",
    borderRadius: 25,
    fontSize: 14,
    fontWeight: "bold",
    zIndex: 10,
  },
  outOfStockBadge: {
    position: "absolute",
    top: 70,
    right: 20,
    backgroundColor: "#d32f2f",
    color: "white",
    padding: "8px 16px",
    borderRadius: 25,
    fontSize: 14,
    fontWeight: "bold",
    zIndex: 10,
  },
  mainImageContainer: {
    width: "100%",
    height: 500,
    backgroundColor: "#1a1a1a",
    borderRadius: 16,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  noImage: {
    fontSize: 80,
    color: "#333",
  },
  thumbnails: {
    display: "flex",
    gap: 12,
    marginTop: 16,
  },
  thumbnail: {
    width: 90,
    height: 90,
    objectFit: "cover",
    borderRadius: 8,
    cursor: "pointer",
    transition: "border 0.2s",
  },
  infoSection: {
    display: "flex",
    flexDirection: "column",
  },
  reference: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  productName: {
    fontSize: 32,
    fontWeight: "700",
    margin: "0 0 15px 0",
  },
  categoryBadge: {
    display: "inline-block",
    padding: "6px 16px",
    backgroundColor: "#1a1a1a",
    borderRadius: 20,
    fontSize: 13,
    color: "#999",
    marginBottom: 20,
    width: "fit-content",
  },
  stockStatus: {
    marginBottom: 20,
  },
  stockBadge: {
    display: "inline-block",
    padding: "8px 16px",
    borderRadius: 20,
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  priceSection: {
    display: "flex",
    alignItems: "center",
    gap: 15,
    marginBottom: 30,
  },
  oldPrice: {
    fontSize: 22,
    color: "#666",
    textDecoration: "line-through",
  },
  promoPrice: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ff5a1f",
  },
  normalPrice: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ff5a1f",
  },
  divider: {
    height: 1,
    backgroundColor: "#333",
    margin: "30px 0",
  },
  descriptionSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
  },
  description: {
    fontSize: 15,
    lineHeight: "1.8",
    color: "#ccc",
  },
  featuresSection: {
    marginBottom: 30,
  },
  featuresList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  quantitySection: {
    display: "flex",
    alignItems: "center",
    gap: 20,
    marginBottom: 25,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  quantityControls: {
    display: "flex",
    alignItems: "center",
    gap: 15,
    backgroundColor: "#1a1a1a",
    padding: "8px 20px",
    borderRadius: 10,
  },
  quantityButton: {
    width: 35,
    height: 35,
    backgroundColor: "#ff5a1f",
    border: "none",
    borderRadius: 8,
    color: "white",
    fontSize: 18,
    cursor: "pointer",
    fontWeight: "bold",
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: "600",
    minWidth: 30,
    textAlign: "center",
  },
    actionButtons: {
    display: "flex",
    gap: 15,
    marginBottom: 30,
  },
  addToCartButton: {
    flex: 1,
    padding: "16px",
    backgroundColor: "#ff5a1f",
    border: "none",
    borderRadius: 12,
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    cursor: "pointer",
    transition: "background-color 0.3s",
  },
  buyNowButton: {
    flex: 1,
    padding: "16px",
    backgroundColor: "#1a1a1a",
    border: "2px solid #ff5a1f",
    borderRadius: 12,
    color: "#ff5a1f",
    fontSize: 16,
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  notifyButton: {
    width: "100%",
    padding: "16px",
    backgroundColor: "#ff9800",
    border: "none",
    borderRadius: 12,
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    cursor: "pointer",
    marginBottom: 30,
  },
  notificationForm: {
    backgroundColor: "#1a1a1a",
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  emailInput: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#0d0d0d",
    border: "1px solid #333",
    borderRadius: 8,
    color: "white",
    fontSize: 14,
    marginBottom: 15,
    outline: "none",
  },
  submitNotifyButton: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#ff5a1f",
    border: "none",
    borderRadius: 8,
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    cursor: "pointer",
  },
  cancelButton: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#666",
    border: "none",
    borderRadius: 8,
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    cursor: "pointer",
  },
  infoBox: {
    backgroundColor: "#1a1a1a",
    padding: 20,
    borderRadius: 12,
    border: "1px solid #333",
  },
  infoText: {
    margin: "8px 0",
    fontSize: 14,
    color: "#999",
  },
};
