import { useEffect, useState } from "react";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("appointments");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les rendez-vous
        const resApp = await fetch("http://localhost:5001/api/appointments");
        const dataApp = await resApp.json();
        setAppointments(dataApp);

        // Récupérer les devis
        const resQuotes = await fetch("http://localhost:5001/api/quotes");
        const dataQuotes = await resQuotes.json();
        setQuotes(dataQuotes);
      } catch (err) {
        console.error(err);
        alert("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  if (loading) {
    return (
      <section style={{ padding: 40 }}>
        <h2>Chargement...</h2>
      </section>
    );
  }

  return (
    <section style={{ padding: 40, maxWidth: 1600, margin: "0 auto" }}>
      <h2>Administration - Rendez-vous & Devis</h2>

      {/* Onglets */}
      <div style={{ display: "flex", gap: 10, marginTop: 30, marginBottom: 30 }}>
        <button
          onClick={() => setActiveTab("appointments")}
          style={{
            padding: "12px 24px",
            backgroundColor: activeTab === "appointments" ? "#ff5a1f" : "#333",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 16,
            fontWeight: activeTab === "appointments" ? "bold" : "normal",
          }}
        >
          📅 Rendez-vous ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab("quotes")}
          style={{
            padding: "12px 24px",
            backgroundColor: activeTab === "quotes" ? "#ff5a1f" : "#333",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 16,
            fontWeight: activeTab === "quotes" ? "bold" : "normal",
          }}
        >
          💰 Demandes de devis ({quotes.length})
        </button>
      </div>

      {/* Table Rendez-vous */}
      {activeTab === "appointments" && (
        <div>
          <h3 style={{ marginBottom: 20 }}>Liste des rendez-vous</h3>
          {appointments.length === 0 ? (
            <p style={{ color: "#999" }}>Aucun rendez-vous pour le moment.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  backgroundColor: "#0d0d0d",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
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
                    <tr
                      key={a.id}
                      style={{
                        borderBottom: "1px solid #333",
                      }}
                    >
                      <td style={tdStyle}>{a.id}</td>
                      <td style={tdStyle}>{a.name}</td>
                      <td style={tdStyle}>{a.phone}</td>
                      <td style={tdStyle}>{a.email || "-"}</td>
                      <td style={tdStyle}>{a.deviceType}</td>
                      <td style={tdStyle}>{a.model || "-"}</td>
                      <td style={tdStyle}>{a.issueType}</td>
                      <td style={tdStyle}>{a.date}</td>
                      <td style={tdStyle}>{a.time}</td>
                      <td style={tdStyle}>
                        {a.details ? (
                          <span title={a.details}>
                            {a.details.length > 30
                              ? a.details.substring(0, 30) + "..."
                              : a.details}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => deleteAppointment(a.id)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#d32f2f",
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                            fontSize: 13,
                          }}
                        >
                          🗑️ Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Table Devis */}
      {activeTab === "quotes" && (
        <div>
          <h3 style={{ marginBottom: 20 }}>Liste des demandes de devis</h3>
          {quotes.length === 0 ? (
            <p style={{ color: "#999" }}>Aucune demande de devis pour le moment.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  backgroundColor: "#0d0d0d",
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
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
                    <tr
                      key={q.id}
                      style={{
                        borderBottom: "1px solid #333",
                      }}
                    >
                      <td style={tdStyle}>{q.id}</td>
                      <td style={tdStyle}>{q.name}</td>
                      <td style={tdStyle}>{q.phone}</td>
                      <td style={tdStyle}>{q.email || "-"}</td>
                      <td style={tdStyle}>{q.deviceType}</td>
                      <td style={tdStyle}>{q.model || "-"}</td>
                      <td style={tdStyle}>{q.issueType}</td>
                      <td style={tdStyle}>
                        {q.details ? (
                          <span title={q.details}>
                            {q.details.length > 30
                              ? q.details.substring(0, 30) + "..."
                              : q.details}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td style={tdStyle}>
                        {q.createdAt
                          ? new Date(q.createdAt).toLocaleDateString("fr-FR")
                          : "-"}
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => deleteQuote(q.id)}
                          style={{
                            padding: "6px 12px",
                            backgroundColor: "#d32f2f",
                            color: "white",
                            border: "none",
                            borderRadius: 4,
                            cursor: "pointer",
                            fontSize: 13,
                          }}
                        >
                          🗑️ Supprimer
                        </button>
                      </td>
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

// Styles pour le tableau
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
