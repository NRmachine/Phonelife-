import { useState } from "react";

export default function Booking() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    deviceType: "",
    model: "",
    issueType: "",
    date: "",
    time: "",
    details: "",
  });

  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    try {
      const res = await fetch("http://localhost:5001/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "error", message: data.error || "Erreur serveur" });
        return;
      }
      setStatus({ type: "success", message: "Rendez-vous enregistré." });
      setForm({
        name: "",
        phone: "",
        email: "",
        deviceType: "",
        model: "",
        issueType: "",
        date: "",
        time: "",
        details: "",
      });
    } catch (err) {
      setStatus({ type: "error", message: "Erreur réseau" });
    }
  };

  return (
    <section style={{ padding: 20 }}>
      <h2>Prendre un rendez-vous</h2>
      <form onSubmit={handleSubmit} className="simple-form">
        <input
          name="name"
          placeholder="Nom complet"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="phone"
          placeholder="Téléphone"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email (optionnel)"
          value={form.email}
          onChange={handleChange}
        />
        <input
          name="deviceType"
          placeholder="Type d'appareil (iPhone, PC...)"
          value={form.deviceType}
          onChange={handleChange}
          required
        />
        <input
          name="model"
          placeholder="Modèle (ex : iPhone 12)"
          value={form.model}
          onChange={handleChange}
        />
        <input
          name="issueType"
          placeholder="Type de panne"
          value={form.issueType}
          onChange={handleChange}
          required
        />
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          required
        />
        <input
          name="time"
          type="time"
          value={form.time}
          onChange={handleChange}
          required
        />
        <textarea
          name="details"
          placeholder="Détails supplémentaires"
          value={form.details}
          onChange={handleChange}
        />
        <button type="submit">Envoyer</button>
      </form>

      {status && (
        <p
          style={{
            marginTop: 10,
            color: status.type === "success" ? "green" : "red",
          }}
        >
          {status.message}
        </p>
      )}
    </section>
  );
}
