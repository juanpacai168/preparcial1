"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { useActors } from "../actor";

export default function ActorsView() {
  const { actores, cargando, error, actualizarActor, eliminarActor } = useActors();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [nationality, setNationality] = useState("");
  const [birthday, setBirthday] = useState("");
  const [biography, setBiography] = useState("");

  const startEdit = (id: string) => {
    const actor = actores.find((item) => item.id === id);
    if (!actor) return;
    setEditingId(id);
    setName(actor.name);
    setPhoto(actor.photo);
    setNationality(actor.nationality);
    setBirthday(actor.birthday);
    setBiography(actor.biography);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setPhoto("");
    setNationality("");
    setBirthday("");
    setBiography("");
  };

  const saveEdit = async () => {
    if (editingId === null) return;
    setIsSaving(true);
    const wasUpdated = await actualizarActor(editingId, {
      name,
      photo,
      nationality,
      birthday,
      biography,
    });
    setIsSaving(false);
    if (wasUpdated) {
      cancelEdit();
    }
  };

  const removeActor = async (id: string) => {
    setDeletingId(id);
    await eliminarActor(id);
    setDeletingId(null);
  };

  return (
    <main style={{ padding: "1.5rem" }}>
      <h1>Lista de Actores</h1>
      {cargando && <p>Cargando actores...</p>}
      {error && <p>{error}</p>}
      <p>
        <Link to="/crear">Ir a Crear Actor</Link>
      </p>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={headerCell}>ID</th>
              <th style={headerCell}>Nombre</th>
              <th style={headerCell}>Photo</th>
              <th style={headerCell}>Nationality</th>
              <th style={headerCell}>Birthday</th>
              <th style={headerCell}>Biography</th>
              <th style={headerCell}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {actores.map((actor) => (
              <tr key={actor.id}>
                <td style={bodyCell}>{actor.id}</td>
                <td style={bodyCell}>{actor.name}</td>
                <td style={bodyCell}>
                  {actor.photo ? (
                    <a href={actor.photo} target="_blank" rel="noreferrer">
                      {actor.photo}
                    </a>
                  ) : (
                    "Sin foto"
                  )}
                </td>
                <td style={bodyCell}>{actor.nationality}</td>
                <td style={bodyCell}>{actor.birthday}</td>
                <td style={bodyCell}>{actor.biography}</td>
                <td style={bodyCell}>
                  <button type="button" onClick={() => startEdit(actor.id)}>
                    Editar
                  </button>{" "}
                  <button
                    type="button"
                    onClick={() => removeActor(actor.id)}
                    disabled={deletingId === actor.id}
                  >
                    {deletingId === actor.id ? "Eliminando..." : "Eliminar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingId !== null && (
        <section style={editSection}>
          <h2 style={{ marginTop: 0 }}>Editar actor #{editingId}</h2>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              saveEdit();
            }}
            style={editForm}
          >
            <label style={fieldWrapper}>
              <span style={fieldLabel}>Nombre</span>
              <input
                style={fieldInput}
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
                value={photo}
                onChange={(event) => setPhoto(event.target.value)}
                placeholder="Photo URL"
                required
              />
            </label>
            <label style={fieldWrapper}>
              <span style={fieldLabel}>Nacionalidad</span>
              <input
                style={fieldInput}
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
            <div style={actionsRow}>
              <button type="submit" style={primaryButton} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </button>{" "}
              <button
                type="button"
                style={secondaryButton}
                onClick={cancelEdit}
                disabled={isSaving}
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}
    </main>
  );
}

const headerCell = {
  border: "1px solid #d9d9d9",
  textAlign: "left" as const,
  padding: "0.6rem",
  backgroundColor: "#f5f5f5",
};

const bodyCell = {
  border: "1px solid #d9d9d9",
  textAlign: "left" as const,
  padding: "0.6rem",
  verticalAlign: "top" as const,
};

const editSection = {
  marginTop: "1.5rem",
  border: "1px solid #cfd8dc",
  borderRadius: "12px",
  background: "linear-gradient(180deg, #f6fbff 0%, #ffffff 100%)",
  padding: "1rem",
  boxShadow: "0 8px 22px rgba(20, 43, 74, 0.08)",
};

const editForm = {
  display: "grid",
  gap: "0.85rem",
  maxWidth: "900px",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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

const actionsRow = {
  gridColumn: "1 / -1",
  display: "flex",
  gap: "0.6rem",
  marginTop: "0.25rem",
};

const primaryButton = {
  backgroundColor: "#0b5cab",
  color: "#ffffff",
  border: "none",
  borderRadius: "8px",
  padding: "0.55rem 0.9rem",
  cursor: "pointer",
};

const secondaryButton = {
  backgroundColor: "#eef3f8",
  color: "#123357",
  border: "1px solid #b7c4d1",
  borderRadius: "8px",
  padding: "0.55rem 0.9rem",
  cursor: "pointer",
};
