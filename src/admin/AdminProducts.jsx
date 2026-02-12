import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

const CATEGORIES = [
  { id: "accessoires", label: "Accessoires" },
  { id: "pieces", label: "Pièces détachées" },
  { id: "telephones", label: "Téléphones" },
  { id: "ordinateurs", label: "Ordinateurs" },
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const { register, handleSubmit, reset } = useForm();

  const loadProducts = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
      alert("Erreur chargement produits");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const onSubmit = async (data) => {
    try {
      const images = [];
      if (data.imageUrl) images.push(data.imageUrl);
      if (data.image2) images.push(data.image2);
      if (data.image3) images.push(data.image3);

      const res = await fetch("http://localhost:5001/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          price: parseFloat(data.price),
          category: data.category,
          promoPrice: data.promoPrice ? parseFloat(data.promoPrice) : null,
          imageUrl: data.imageUrl || null,
          images,
          description: data.description || "",
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        alert(result.error || "Erreur création produit");
        return;
      }

      reset();
      loadProducts();
    } catch (err) {
      console.error(err);
      alert("Erreur réseau");
    }
  };

  return (
    <section>
      <h2>Admin produits</h2>

      <h3>Ajouter un produit</h3>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          placeholder="Nom du produit"
          {...register("name", { required: true })}
        />

        <input
          type="number"
          step="0.01"
          placeholder="Prix"
          {...register("price", { required: true })}
        />

        <select {...register("category", { required: true })}>
          <option value="">Catégorie</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <input
          type="number"
          step="0.01"
          placeholder="Prix promo (optionnel)"
          {...register("promoPrice")}
        />

        <input
          type="text"
          placeholder="Image principale (URL)"
          {...register("imageUrl")}
        />
        <input
          type="text"
          placeholder="Image 2 (URL optionnelle)"
          {...register("image2")}
        />
        <input
          type="text"
          placeholder="Image 3 (URL optionnelle)"
          {...register("image3")}
        />

        <textarea
          placeholder="Description du produit"
          {...register("description")}
        />

        <button type="submit">Enregistrer le produit</button>
      </form>

      <h3 style={{ marginTop: "20px" }}>Produits existants</h3>
      {products.length === 0 && <p>Aucun produit pour le moment.</p>}
      {products.map((p) => (
        <p key={p.id}>
          #{p.id} – {p.name} ({p.category}) :{" "}
          {p.promoPrice ? (
            <>
              <s>{p.price} €</s> <strong>{p.promoPrice} €</strong>
            </>
          ) : (
            <>{p.price} €</>
          )}
        </p>
      ))}
    </section>
  );
}
