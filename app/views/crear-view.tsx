"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useActors } from "../actor";

export default function CrearView() {
  const { crearActor } = useActors();

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [nationality, setNationality] = useState("");
  const [birthday, setBirthday] = useState("");
  const [biography, setBiography] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    const seCreo = await crearActor({
      name,
      photo,
      nationality,
      birthday,
      biography,
    });

    if (seCreo) {
      setName("");
      setPhoto("");
      setNationality("");
      setBirthday("");
      setBiography("");
      setMessage("Actor creado y agregado a la lista.");
    } else {
      setMessage("No fue posible crear el actor.");
    }
    setIsSubmitting(false);
  };

  return (
    <main style={{ padding: "1.5rem" }}>
      <h1>Formulario de creacion de actor</h1>
      <p>
        <Link to="/actors">Ir a Lista de Actores</Link>
      </p>

      <form onSubmit={handleSubmit} style={createForm}>
        <label style={fieldWrapper}>
          <span style={fieldLabel}>Nombre</span>
          <input
            style={fieldInput}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nombre"
            required
          />
        </label>
        <label style={fieldWrapper}>
          <span style={fieldLabel}>Foto URL</span>
          <input
            style={fieldInput}
            type="text"
            value={photo}
            onChange={(event) => setPhoto(event.target.value)}
            placeholder="Foto URL"
            required
          />
        </label>
        <label style={fieldWrapper}>
          <span style={fieldLabel}>Nacionalidad</span>
          <input
            style={fieldInput}
            type="text"
            value={nationality}
            onChange={(event) => setNationality(event.target.value)}
            placeholder="Nacionalidad"
            required
          />
        </label>
        <label style={fieldWrapper}>
          <span style={fieldLabel}>Fecha de nacimiento</span>
          <input
            style={fieldInput}
            type="date"
            value={birthday}
            onChange={(event) => setBirthday(event.target.value)}
            required
          />
        </label>
        <label style={{ ...fieldWrapper, gridColumn: "1 / -1" }}>
          <span style={fieldLabel}>Biografia</span>
          <textarea
            style={fieldInput}
            value={biography}
            onChange={(event) => setBiography(event.target.value)}
            placeholder="Biografia"
            rows={4}
            required
          />
        </label>
        <button type="submit" style={primaryButton} disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Crear Actor"}
        </button>
      </form>
      {message && <p style={{ marginTop: "1rem" }}>{message}</p>}
    </main>
  );
}

const createForm = {
  display: "grid",
  gap: "0.85rem",
  maxWidth: "900px",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  border: "1px solid #cfd8dc",
  borderRadius: "12px",
  background: "linear-gradient(180deg, #f6fbff 0%, #ffffff 100%)",
  padding: "1rem",
  boxShadow: "0 8px 22px rgba(20, 43, 74, 0.08)",
};

const fieldWrapper = {
  display: "grid",
  gap: "0.35rem",
};

const fieldLabel = {
  fontSize: "0.88rem",
  fontWeight: 600,
  color: "#1f3b5b",
};

const fieldInput = {
  border: "1px solid #b7c4d1",
  borderRadius: "8px",
  padding: "0.6rem 0.7rem",
  fontSize: "0.95rem",
  backgroundColor: "#ffffff",
};

const primaryButton = {
  gridColumn: "1 / -1",
  justifySelf: "start",
  backgroundColor: "#0b5cab",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  padding: "0.55rem 0.9rem",
  cursor: "pointer",
};
