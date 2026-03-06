"use client";

import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type FormData = {
  name: string;
  photo: string;
  nationality: string;
  birthday: string;
  biography: string;
};

const emptyForm: FormData = {
  name: "",
  photo: "",
  nationality: "",
  birthday: "",
  biography: "",
};

function toPayload(form: FormData) {
  return {
    name: form.name,
    photo: form.photo,
    nationality: form.nationality,
    birthDate: form.birthday,
    birthday: form.birthday,
    biography: form.biography,
  };
}

export default function CrearPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const crearActor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/actors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(toPayload(form)),
      });
      if (!response.ok) {
        throw new Error("No se pudo crear el actor.");
      }
      navigate("/actors");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de red al crear actor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{ padding: "1.5rem" }}>
      <h1>Formulario de creacion de actor</h1>

      <section style={card}>
        {error && <p style={{ color: "#ba1b1b" }}>{error}</p>}
        <form onSubmit={crearActor} style={formGrid}>
          <input
            style={input}
            placeholder="Nombre"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
            required
          />
          <input
            style={input}
            placeholder="Foto URL"
            value={form.photo}
            onChange={(e) => onChange("photo", e.target.value)}
            required
          />
          <input
            style={input}
            placeholder="Nacionalidad"
            value={form.nationality}
            onChange={(e) => onChange("nationality", e.target.value)}
            required
          />
          <input
            style={input}
            type="date"
            value={form.birthday}
            onChange={(e) => onChange("birthday", e.target.value)}
            required
          />
          <textarea
            style={{ ...input, gridColumn: "1 / -1" }}
            placeholder="Biografia"
            rows={3}
            value={form.biography}
            onChange={(e) => onChange("biography", e.target.value)}
            required
          />
          <div style={{ gridColumn: "1 / -1" }}>
            <button style={buttonPrimary} type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Crear"}
            </button>{" "}
            <Link to="/actors" style={buttonLight}>
              Volver a la lista de actores
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

const card = {
  border: "1px solid #d9d9d9",
  borderRadius: "10px",
  padding: "1rem",
  marginTop: "1rem",
};

const formGrid = {
  display: "grid",
  gap: "0.6rem",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
};

const input = {
  border: "1px solid #bdbdbd",
  borderRadius: "8px",
  padding: "0.6rem",
};

const buttonPrimary = {
  backgroundColor: "#0b5cab",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "0.5rem 0.8rem",
};

const buttonLight = {
  backgroundColor: "#efefef",
  color: "#111",
  border: "1px solid #bbb",
  borderRadius: "8px",
  padding: "0.5rem 0.8rem",
};
