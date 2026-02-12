import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const CATEGORIES = [
  { id: "accessoires", label: "Accessoires" },
  { id: "pieces", label: "Pièces détachées" },
  { id: "telephones", label: "Téléphones" },
  { id: "ordinateurs", label: "Ordinateurs" },
];

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("appointments");
  const [editingProduct, setEditingProduct] = useState(null);
  
  const { register, handleSubmit, reset, setValue } = useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resApp = await fetch("http://localhost:5001/api/appointments");
      const dataApp = await resApp.json();
      setAppointments(dataApp);

      const resQuotes = await fetch("http://localhost:5001/api/quotes");
      const dataQuotes = await resQuotes.json();
      setQuotes(dataQuotes);

      const resProd = await fetch("http://localhost:5001/api/products");
      const dataProd = await resProd.json();
      setProducts(dataProd);

      // Charger les notifications pour chaque produit
      const notifs = {};
      for (const prod of dataProd) {
        try {
          const resNotif = await fetch(`http://localhost:5001/api/stock-notifications/${prod.id}`);
          const dataNotif = await resNotif.json();
          notifs[prod.id] = dataNotif;
        } catch (err) {
          notifs[prod.id] = [];
        }
      }
      setNotifications(notifs);

      try {
        const resOrders = await fetch("http://localhost:5001/api/orders");
        const dataOrders = await resOrders.json();
        setOrders(dataOrders);
      } catch (err) {
        console.log("Endpoint orders pas encore créé");
        setOrders([]);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm("Supprimer ce rendez-vous ?")) return;
    try {
      await fetch(`http://localhost:5001/api/appointments/${id}`, {
        method: "DELETE",
      });
      setAppointments(appointments.filter((a) => a.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  const deleteQuote = async (id) => {
    if (!window.confirm("Supprimer cette demande de devis ?")) return;
    try {
      await fetch(`http://localhost:5001/api/quotes/${id}`, {
        method: "DELETE",
      });
      setQuotes(quotes.filter((q) => q.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Supprimer ce produit ?")) return;
    try {
      await fetch(`http://localhost:5001/api/products/${id}`, {
        method: "DELETE",
      });
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  };

  const updateStock = async (productId, newStock) => {
    try {
      await fetch(`http://localhost:5001/api/products/${productId}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      fetchData(); // Recharger pour actualiser
      alert("Stock mis à jour !");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du stock");
    }
  };

  const startEditProduct = (product) => {
    setEditingProduct(product.id);
    setValue("name", product.name);
    setValue("price", product.price);
    setValue("category", product.category);
    setValue("promoPrice", product.promoPrice || "");
    setValue("stock", product.stock || 0);
    setValue("reference", product.reference || "");
    setValue("description", product.description || "");
    const images = product.images ? JSON.parse(product.images) : [];
    setValue("imageUrl", images[0] || "");
    setValue("image2", images[1] || "");
    setValue("image3", images[2] || "");
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    reset();
  };

  const onSubmitProduct = async (data) => {
    try {
      const images = [];
      if (data.imageUrl) images.push(data.imageUrl);
      if (data.image2) images.push(data.image2);
      if (data.image3) images.push(data.image3);

      const productData = {
        name: data.name,
        price: parseFloat(data.price),
        category: data.category,
        promoPrice: data.promoPrice ? parseFloat(data.promoPrice) : null,
        stock: parseInt(data.stock) || 0,
        reference: data.reference || null,
        imageUrl: data.imageUrl || null,
        images,
        description: data.description || "",
      };

      if (editingProduct) {
        // Mode édition - UPDATE
        const res = await fetch(`http://localhost:5001/api/products/${editingProduct}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });

        if (!res.ok) {
          alert("Erreur lors de la modification");
          return;
        }
        alert("Produit modifié avec succès !");
      } else {
        // Mode création - CREATE
        const res = await fetch("http://localhost:5001/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });

        if (!res.ok) {
          alert("Erreur lors de la création");
          return;
        }
        alert("Produit ajouté avec succès !");
      }

      reset();
      setEditingProduct(null);
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    }
  };

  if (loading) {
    return (
      <section style={{ padding: 40, maxWidth: 1600, margin: "0 auto" }}>
        <h2 style={{ marginBottom: 10 }}>⏳ Chargement...</h2>
        <p style={{ color: "#999" }}>Les données se chargent, veuillez patienter.</p>
      </section>
    );
  }

  return (
    <section style={{ padding: 40, maxWidth: 1600, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 10 }}> Administration Phone Life</h2>
      <p style={{ color: "#999", marginBottom: 30 }}>Gestion complète de votre activité</p>

      {/* Statistiques rapides */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: 20, 
        marginBottom: 30 
      }}>
        <div style={statCardStyle}>
          <div style={{ fontSize: 32, marginBottom: 5 }}>📅</div>
          <div style={{ fontSize: 24, fontWeight: "bold", color: "#ff5a1f" }}>
            {appointments.length}
          </div>
          <div style={{ fontSize: 14, color: "#999" }}>Rendez-vous</div>
        </div>
        
        <div style={statCardStyle}>
          <div style={{ fontSize: 32, marginBottom: 5 }}>💰</div>
          <div style={{ fontSize: 24, fontWeight: "bold", color: "#ff5a1f" }}>
            {quotes.length}
          </div>
          <div style={{ fontSize: 14, color: "#999" }}>Demandes de devis</div>
        </div>
        
        <div style={statCardStyle}>
          <div style={{ fontSize: 32, marginBottom: 5 }}>📦</div>
          <div style={{ fontSize: 24, fontWeight: "bold", color: "#ff5a1f" }}>
            {products.length}
          </div>
          <div style={{ fontSize: 14, color: "#999" }}>Produits</div>
        </div>
        
        <div style={statCardStyle}>
          <div style={{ fontSize: 32, marginBottom: 5 }}>🛒</div>
          <div style={{ fontSize: 24, fontWeight: "bold", color: "#ff5a1f" }}>
            {orders.length}
          </div>
          <div style={{ fontSize: 14, color: "#999" }}>Commandes</div>
        </div>
      </div>

      {/* Onglets */}
      <div style={{ display: "flex", gap: 10, marginBottom: 30, flexWrap: "wrap" }}>
        <button onClick={() => setActiveTab("appointments")} style={getTabStyle(activeTab === "appointments")}>
           Rendez-vous ({appointments.length})
        </button>
        <button onClick={() => setActiveTab("quotes")} style={getTabStyle(activeTab === "quotes")}>
           Devis ({quotes.length})
        </button>
        <button onClick={() => setActiveTab("products")} style={getTabStyle(activeTab === "products")}>
           Produits ({products.length})
        </button>
        <button onClick={() => setActiveTab("orders")} style={getTabStyle(activeTab === "orders")}>
           Commandes ({orders.length})
        </button>
      </div>

      {/* ONGLET: RENDEZ-VOUS */}
      {activeTab === "appointments" && (
        <div>
          <h3 style={{ marginBottom: 20 }}> Liste des rendez-vous</h3>
          {appointments.length === 0 ? (
            <p style={{ color: "#999" }}>Aucun rendez-vous pour le moment.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ backgroundColor: "#1a1a1a" }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Nom</th>
                    <th style={thStyle}>Téléphone</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Appareil</th>
                    <th style={thStyle}>Modèle</th>
                    <th style={thStyle}>Panne</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Heure</th>
                    <th style={thStyle}>Détails</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((a) => (
                    <tr key={a.id} style={{ borderBottom: "1px solid #333" }}>
                      <td style={tdStyle}>{a.id}</td>
                      <td style={tdStyle}><strong>{a.name}</strong></td>
                      <td style={tdStyle}>{a.phone}</td>
                      <td style={tdStyle}>{a.email || "-"}</td>
                      <td style={tdStyle}>{a.deviceType}</td>
                      <td style={tdStyle}>{a.model || "-"}</td>
                      <td style={tdStyle}>{a.issueType}</td>
                      <td style={tdStyle}><strong>{a.date}</strong></td>
                      <td style={tdStyle}>{a.time}</td>
                      <td style={tdStyle}>
                        {a.details ? (
                          <span title={a.details}>
                            {a.details.length > 30 ? a.details.substring(0, 30) + "..." : a.details}
                          </span>
                        ) : ("-")}
                      </td>
                      <td style={tdStyle}>
                        <button onClick={() => deleteAppointment(a.id)} style={deleteButtonStyle}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ONGLET: DEVIS */}
      {activeTab === "quotes" && (
        <div>
          <h3 style={{ marginBottom: 20 }}> Liste des demandes de devis</h3>
          {quotes.length === 0 ? (
            <p style={{ color: "#999" }}>Aucune demande de devis.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ backgroundColor: "#1a1a1a" }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Nom</th>
                    <th style={thStyle}>Téléphone</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Appareil</th>
                    <th style={thStyle}>Modèle</th>
                    <th style={thStyle}>Panne</th>
                    <th style={thStyle}>Détails</th>
                    <th style={thStyle}>Date création</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((q) => (
                    <tr key={q.id} style={{ borderBottom: "1px solid #333" }}>
                      <td style={tdStyle}>{q.id}</td>
                      <td style={tdStyle}><strong>{q.name}</strong></td>
                      <td style={tdStyle}>{q.phone}</td>
                      <td style={tdStyle}>{q.email || "-"}</td>
                      <td style={tdStyle}>{q.deviceType}</td>
                      <td style={tdStyle}>{q.model || "-"}</td>
                      <td style={tdStyle}>{q.issueType}</td>
                      <td style={tdStyle}>
                        {q.details ? (
                          <span title={q.details}>
                            {q.details.length > 30 ? q.details.substring(0, 30) + "..." : q.details}
                          </span>
                        ) : ("-")}
                      </td>
                      <td style={tdStyle}>
                        {q.createdAt ? new Date(q.createdAt).toLocaleDateString("fr-FR") : "-"}
                      </td>
                      <td style={tdStyle}>
                        <button onClick={() => deleteQuote(q.id)} style={deleteButtonStyle}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ONGLET: PRODUITS */}
      {activeTab === "products" && (
        <div>
          <h3 style={{ marginBottom: 20 }}> Gestion des produits</h3>

          <div style={formContainerStyle}>
            <h4 style={{ marginTop: 0, marginBottom: 20 }}>
              {editingProduct ? " Modifier le produit" : " Ajouter un nouveau produit"}
            </h4>
            <form onSubmit={handleSubmit(onSubmitProduct)}>
              <div style={{ display: "grid", gap: 15 }}>
                <input
                  placeholder="Nom du produit *"
                  {...register("name", { required: true })}
                  style={inputStyle}
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                  <input
                    type="text"
                    placeholder="Référence (ex: REF-001)"
                    {...register("reference")}
                    style={inputStyle}
                  />
                  <input
                    type="number"
                    placeholder="Stock *"
                    {...register("stock", { required: true })}
                    style={inputStyle}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 15 }}>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Prix *"
                    {...register("price", { required: true })}
                    style={inputStyle}
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Prix promo"
                    {...register("promoPrice")}
                    style={inputStyle}
                  />
                  <select {...register("category", { required: true })} style={inputStyle}>
                    <option value="">Catégorie *</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Image principale (URL)"
                  {...register("imageUrl")}
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Image 2 (URL optionnelle)"
                  {...register("image2")}
                  style={inputStyle}
                />
                <input
                  type="text"
                  placeholder="Image 3 (URL optionnelle)"
                  {...register("image3")}
                  style={inputStyle}
                />

                <textarea
                  placeholder="Description du produit"
                  {...register("description")}
                  rows="4"
                  style={inputStyle}
                />

                <div style={{ display: "flex", gap: 10 }}>
                  <button type="submit" style={submitButtonStyle}>
                    {editingProduct ? " Enregistrer les modifications" : " Ajouter le produit"}
                  </button>
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      style={{...submitButtonStyle, backgroundColor: "#666"}}
                    >
                      ✕ Annuler
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* Liste des produits */}
          <h4 style={{ marginTop: 40 }}>Produits existants ({products.length})</h4>
          {products.length === 0 ? (
            <p style={{ color: "#999" }}>Aucun produit pour le moment.</p>
          ) : (
            <div style={{ display: "grid", gap: 15, marginTop: 20 }}>
              {products.map((p) => {
                const productNotifications = notifications[p.id] || [];
                const isOutOfStock = p.stock === 0;
                
                return (
                  <div
                    key={p.id}
                    style={{
                      padding: 20,
                      backgroundColor: "#1a1a1a",
                      borderRadius: 8,
                      border: isOutOfStock ? "2px solid #d32f2f" : "2px solid #333",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "start", gap: 20 }}>
                      {p.imageUrl && (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 8,
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                          <div>
                            <h4 style={{ margin: 0, marginBottom: 5 }}>
                              #{p.id} - {p.name}
                            </h4>
                            {p.reference && (
                              <p style={{ margin: 0, color: "#666", fontSize: 12 }}>
                                Réf: {p.reference}
                              </p>
                            )}
                            <p style={{ margin: "5px 0", color: "#999", fontSize: 14 }}>
                              Catégorie: {p.category}
                            </p>
                            <p style={{ margin: "5px 0", fontSize: 16 }}>
                              {p.promoPrice ? (
                                <>
                                  <s style={{ color: "#999" }}>{p.price} €</s>{" "}
                                  <strong style={{ color: "#ff5a1f" }}>
                                    {p.promoPrice} €
                                  </strong>
                                </>
                              ) : (
                                <strong style={{ color: "#ff5a1f" }}>{p.price} €</strong>
                              )}
                            </p>
                          </div>

                          {/* Actions */}
                          <div style={{ display: "flex", gap: 10 }}>
                            <button
                              onClick={() => startEditProduct(p)}
                              style={{
                                padding: "8px 12px",
                                backgroundColor: "#ff9800",
                                color: "white",
                                border: "none",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: "600",
                              }}
                            >
                                                               Modifier
                            </button>
                            <button
                              onClick={() => deleteProduct(p.id)}
                              style={deleteButtonStyle}
                            >
                              
                            </button>
                          </div>
                        </div>

                        {/* Gestion du stock */}
                        <div style={{
                          marginTop: 15,
                          padding: 15,
                          backgroundColor: "#0d0d0d",
                          borderRadius: 8,
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                            <span style={{
                              fontSize: 14,
                              fontWeight: "600",
                              color: p.stock > 5 ? "#4caf50" : (p.stock > 0 ? "#ff9800" : "#d32f2f")
                            }}>
                               Stock: {p.stock} {p.stock > 1 ? "unités" : "unité"}
                            </span>
                            
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <button
                                onClick={() => updateStock(p.id, Math.max(0, p.stock - 1))}
                                style={{
                                  padding: "4px 10px",
                                  backgroundColor: "#666",
                                  color: "white",
                                  border: "none",
                                  borderRadius: 4,
                                  cursor: "pointer",
                                  fontSize: 14,
                                }}
                              >
                                -1
                              </button>
                              <input
                                type="number"
                                defaultValue={p.stock}
                                onBlur={(e) => {
                                  const newStock = parseInt(e.target.value) || 0;
                                  if (newStock !== p.stock) {
                                    updateStock(p.id, newStock);
                                  }
                                }}
                                style={{
                                  width: 60,
                                  padding: "4px 8px",
                                  backgroundColor: "#1a1a1a",
                                  border: "1px solid #333",
                                  borderRadius: 4,
                                  color: "white",
                                  textAlign: "center",
                                  fontSize: 14,
                                }}
                              />
                              <button
                                onClick={() => updateStock(p.id, p.stock + 1)}
                                style={{
                                  padding: "4px 10px",
                                  backgroundColor: "#ff5a1f",
                                  color: "white",
                                  border: "none",
                                  borderRadius: 4,
                                  cursor: "pointer",
                                  fontSize: 14,
                                }}
                              >
                                +1
                              </button>
                              <button
                                onClick={() => updateStock(p.id, p.stock + 10)}
                                style={{
                                  padding: "4px 10px",
                                  backgroundColor: "#4caf50",
                                  color: "white",
                                  border: "none",
                                  borderRadius: 4,
                                  cursor: "pointer",
                                  fontSize: 14,
                                }}
                              >
                                +10
                              </button>
                            </div>
                          </div>

                          {/* Notifications en attente */}
                          {productNotifications.length > 0 && (
                            <div style={{
                              marginTop: 10,
                              padding: 10,
                              backgroundColor: "#1a1a1a",
                              borderRadius: 6,
                              border: "1px solid #ff9800",
                            }}>
                              <p style={{
                                margin: "0 0 8px 0",
                                fontSize: 13,
                                fontWeight: "600",
                                color: "#ff9800",
                              }}>
                                🔔 {productNotifications.length} client{productNotifications.length > 1 ? "s" : ""} à notifier :
                              </p>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {productNotifications.map((notif, idx) => (
                                  <span
                                    key={notif.id}
                                    style={{
                                      padding: "4px 8px",
                                      backgroundColor: "#0d0d0d",
                                      borderRadius: 4,
                                      fontSize: 11,
                                      color: "#ccc",
                                    }}
                                  >
                                    {notif.email}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ONGLET: COMMANDES */}
      {activeTab === "orders" && (
        <div>
          <h3 style={{ marginBottom: 20 }}> Liste des commandes</h3>
          {orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <p style={{ color: "#999", fontSize: 16 }}>
                Aucune commande pour le moment.
              </p>
              <p style={{ color: "#666", fontSize: 14, marginTop: 10 }}>
                 Les commandes apparaîtront ici quand les clients passeront des
                commandes depuis la boutique.
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={{ backgroundColor: "#1a1a1a" }}>
                    <th style={thStyle}>ID</th>
                    <th style={thStyle}>Nom</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Téléphone</th>
                    <th style={thStyle}>Adresse</th>
                    <th style={thStyle}>Produits</th>
                    <th style={thStyle}>Total</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Paiement</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: "1px solid #333" }}>
                      <td style={tdStyle}>{order.id}</td>
                      <td style={tdStyle}>
                        <strong>
                          {order.nom} {order.prenom}
                        </strong>
                      </td>
                      <td style={tdStyle}>{order.email}</td>
                      <td style={tdStyle}>{order.telephone}</td>
                      <td style={tdStyle}>
                        {order.adresse}
                        {order.ville && `, ${order.ville}`}
                        {order.codePostal && ` ${order.codePostal}`}
                      </td>
                      <td style={tdStyle}>
                        {order.items && Array.isArray(order.items) ? (
                          <div>
                            {order.items.map((item, idx) => (
                              <div key={idx} style={{ fontSize: 13 }}>
                                • {item.name} x{item.quantity} ({item.price}€)
                              </div>
                            ))}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td style={tdStyle}>
                        <strong style={{ color: "#ff5a1f" }}>
                          {order.total ? order.total.toFixed(2) : "0.00"} €
                        </strong>
                      </td>
                      <td style={tdStyle}>
                        {order.date
                          ? new Date(order.date).toLocaleDateString("fr-FR")
                          : "-"}
                      </td>
                      <td style={tdStyle}>{order.paymentMethod || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// Helper function pour les styles des onglets
const getTabStyle = (isActive) => ({
  padding: "12px 24px",
  backgroundColor: isActive ? "#ff5a1f" : "#333",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 16,
  fontWeight: isActive ? "bold" : "normal",
  transition: "all 0.2s",
});

// Styles
const statCardStyle = {
  backgroundColor: "#1a1a1a",
  padding: 20,
  borderRadius: 8,
  textAlign: "center",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: "#0d0d0d",
  borderRadius: 8,
  overflow: "hidden",
};

const thStyle = {
  padding: "14px",
  textAlign: "left",
  fontWeight: "bold",
  fontSize: 14,
  borderBottom: "2px solid #ff5a1f",
  color: "white",
};

const tdStyle = {
  padding: "12px",
  textAlign: "left",
  fontSize: 13,
  color: "#ccc",
};

const deleteButtonStyle = {
  padding: "6px 12px",
  backgroundColor: "#d32f2f",
  color: "white",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: 13,
};

const formContainerStyle = {
  backgroundColor: "#1a1a1a",
  padding: 30,
  borderRadius: 8,
  marginBottom: 30,
};

const inputStyle = {
  padding: "12px",
  backgroundColor: "#0d0d0d",
  border: "1px solid #333",
  borderRadius: 8,
  color: "white",
  fontSize: 14,
  width: "100%",
};

const submitButtonStyle = {
  padding: "12px 30px",
  backgroundColor: "#ff5a1f",
  color: "white",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 16,
  fontWeight: "bold",
};