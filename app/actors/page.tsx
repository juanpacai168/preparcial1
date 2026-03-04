"use client";

import { useState } from "react";
import Link from "next/link";
import { useActors } from "../actors-store";

export default function ActorsPage() {
  const { actors, loading, error, updateActor, deleteActor } = useActors();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [nationality, setNationality] = useState("");
  const [birthday, setBirthday] = useState("");
  const [biography, setBiography] = useState("");

  const startEdit = (id: string) => {
    const actor = actors.find((item) => item.id === id);
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
    const wasUpdated = await updateActor(editingId, {
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
    await deleteActor(id);
    setDeletingId(null);
  };

  return (
    <main style={{ padding: "1.5rem" }}>
      <h1>Lista de Actores</h1>
      {loading && <p>Cargando actores...</p>}
      {error && <p>{error}</p>}
      <p>
        <Link href="/crear">Ir a Crear Actor</Link>
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
            {actors.map((actor) => (
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
        <section style={{ marginTop: "1.5rem" }}>
          <h2>Editar actor #{editingId}</h2>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              saveEdit();
            }}
            style={{ display: "grid", gap: "0.5rem", maxWidth: "560px" }}
          >
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nombre"
              required
            />
            <input
              value={photo}
              onChange={(event) => setPhoto(event.target.value)}
              placeholder="Photo URL"
              required
            />
            <input
              value={nationality}
              onChange={(event) => setNationality(event.target.value)}
              placeholder="Nacionalidad"
              required
            />
            <input
              type="date"
              value={birthday}
              onChange={(event) => setBirthday(event.target.value)}
              required
            />
            <textarea
              value={biography}
              onChange={(event) => setBiography(event.target.value)}
              placeholder="Biografia"
              rows={4}
              required
            />
            <div>
              <button type="submit" disabled={isSaving}>
                {isSaving ? "Guardando..." : "Guardar cambios"}
              </button>{" "}
              <button type="button" onClick={cancelEdit} disabled={isSaving}>
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

