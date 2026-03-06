"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Actor, mapActor } from "./types";

export default function ActorsPage() {
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/v1/actors");
        if (!response.ok) throw new Error("No se pudo cargar la lista de actores.");
        const rows = (await response.json()) as Record<string, unknown>[];
        setActors(rows.map(mapActor));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error de red al cargar actores.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const removeActor = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/v1/actors/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("No se pudo eliminar el actor.");
      setActors((prev) => prev.filter((actor) => actor.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar actor.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main style={mainStyle}>
      <header style={headerStyle}>
        <h1>Actores</h1>
        <nav style={navStyle}>
          <Link to="/actors/new" style={buttonPrimary}>Nuevo actor</Link>
          <Link to="/prizes/new" style={buttonLight}>Nuevo premio</Link>
          <Link to="/movies" style={buttonLight}>Ir a peliculas</Link>
        </nav>
      </header>

      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: "#ba1b1b" }}>{error}</p>}

      {!loading && (
        <section style={card}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Nombre</th>
                <th style={th}>Nacionalidad</th>
                <th style={th}>Nacimiento</th>
                <th style={th}>Peliculas</th>
                <th style={th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {actors.map((actor) => (
                <tr key={actor.id}>
                  <td style={td}>{actor.name}</td>
                  <td style={td}>{actor.nationality}</td>
                  <td style={td}>{actor.birthDate}</td>
                  <td style={td}>{actor.movies.length}</td>
                  <td style={td}>
                    <Link style={buttonLight} to={`/actors/${actor.id}`}>Ver</Link>{" "}
                    <Link style={buttonLight} to={`/actors/${actor.id}/edit`}>Editar</Link>{" "}
                    <button
                      style={buttonDanger}
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
        </section>
      )}
    </main>
  );
}

const mainStyle = { padding: "1.5rem" };
const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "1rem",
  flexWrap: "wrap" as const,
};
const navStyle = { display: "flex", gap: "0.5rem", alignItems: "center" };
const card = { border: "1px solid #d9d9d9", borderRadius: "10px", padding: "1rem" };
const table = { width: "100%", borderCollapse: "collapse" as const };
const th = {
  border: "1px solid #ddd",
  padding: "0.5rem",
  textAlign: "left" as const,
  backgroundColor: "#f5f5f5",
};
const td = { border: "1px solid #ddd", padding: "0.5rem" };
const buttonPrimary = {
  backgroundColor: "#0b5cab",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "0.5rem 0.8rem",
  textDecoration: "none",
};
const buttonLight = {
  backgroundColor: "#efefef",
  color: "#111",
  border: "1px solid #bbb",
  borderRadius: "8px",
  padding: "0.45rem 0.7rem",
  textDecoration: "none",
};
const buttonDanger = {
  backgroundColor: "#ba1b1b",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "0.45rem 0.7rem",
};
