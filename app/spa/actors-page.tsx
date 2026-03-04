"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type Actor = {
  id: string;
  name: string;
  photo: string;
  nationality: string;
  birthday: string;
  biography: string;
};

function mapActor(raw: Record<string, unknown>): Actor {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    photo: String(raw.photo ?? ""),
    nationality: String(raw.nationality ?? ""),
    birthday: String(raw.birthday ?? raw.birthDate ?? "").slice(0, 10),
    biography: String(raw.biography ?? ""),
  };
}

export default function ActorsPage() {
  const [actores, setActores] = useState<Actor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      try {
        const response = await fetch("/api/v1/actors");
        if (!response.ok) {
          throw new Error("No se pudo cargar la lista de actores.");
        }
        const data = (await response.json()) as Record<string, unknown>[];
        setActores(data.map(mapActor));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error de red al cargar actores.");
      } finally {
        setCargando(false);
      }
    }

    cargar();
  }, []);

  const eliminarActor = async (id: string) => {
    setDeletingId(id);
    await fetch(`/api/v1/actors/${encodeURIComponent(id)}`, { method: "DELETE" });
    setActores((prev) => prev.filter((actor) => actor.id !== id));
    setDeletingId(null);
  };

  return (
    <main style={{ padding: "1.5rem" }}>
      <h1>Lista de actores</h1>
      <Link to="/crear" style={buttonPrimary}>
        Ir a crear actor
      </Link>

      <section style={card}>
        <h2 style={title}>Lista</h2>
        {cargando && <p>Cargando...</p>}
        {error && <p style={{ color: "#ba1b1b" }}>{error}</p>}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Nombre</th>
                <th style={th}>Nacionalidad</th>
                <th style={th}>Nacimiento</th>
                <th style={th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {actores.map((actor) => (
                <tr key={actor.id}>
                  <td style={td}>{actor.name}</td>
                  <td style={td}>{actor.nationality}</td>
                  <td style={td}>{actor.birthday}</td>
                  <td style={td}>
                    <Link style={buttonLight} to={`/actors/${actor.id}/editar`}>
                      Editar
                    </Link>{" "}
                    <button
                      style={buttonDanger}
                      onClick={() => eliminarActor(actor.id)}
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

const title = {
  marginTop: 0,
};

const th = {
  border: "1px solid #ddd",
  padding: "0.5rem",
  textAlign: "left" as const,
  backgroundColor: "#f5f5f5",
};

const td = {
  border: "1px solid #ddd",
  padding: "0.5rem",
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

const buttonDanger = {
  backgroundColor: "#ba1b1b",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  padding: "0.5rem 0.8rem",
};
