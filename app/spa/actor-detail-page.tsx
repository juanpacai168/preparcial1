"use client";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Actor, mapActor } from "./types";

export default function ActorDetailPage() {
  const { actorId } = useParams<{ actorId: string }>();
  const [actor, setActor] = useState<Actor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!actorId) {
      setError("No se encontro el actor.");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const response = await fetch(`/api/v1/actors/${encodeURIComponent(actorId)}`);
        if (!response.ok) throw new Error("No se pudo cargar el actor.");
        const data = (await response.json()) as Record<string, unknown>;
        setActor(mapActor(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar actor.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [actorId]);

  return (
    <main style={{ padding: "1.5rem" }}>
      <h1>Detalle de actor</h1>
      <p>
        <Link to="/actors" style={buttonLight}>Volver a actores</Link>{" "}
        {actorId && (
          <Link to={`/movies/new?actorId=${encodeURIComponent(actorId)}`} style={buttonPrimary}>
            Nueva pelicula para este actor
          </Link>
        )}
      </p>

      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: "#ba1b1b" }}>{error}</p>}

      {actor && (
        <>
          <section style={card}>
            <h2 style={{ marginTop: 0 }}>{actor.name}</h2>
            <p><strong>Nacionalidad:</strong> {actor.nationality}</p>
            <p><strong>Nacimiento:</strong> {actor.birthDate}</p>
            <p>{actor.biography}</p>
            <p>
              <Link to={`/actors/${actor.id}/edit`} style={buttonLight}>Editar actor</Link>
            </p>
          </section>

          <section style={card}>
            <h3 style={{ marginTop: 0 }}>Peliculas asociadas ({actor.movies.length})</h3>
            {actor.movies.length === 0 && <p>No hay peliculas para este actor.</p>}
            {actor.movies.length > 0 && (
              <table style={table}>
                <thead>
                  <tr>
                    <th style={th}>Titulo</th>
                    <th style={th}>Duracion</th>
                    <th style={th}>Pais</th>
                    <th style={th}>Estreno</th>
                    <th style={th}>Popularidad</th>
                    <th style={th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {actor.movies.map((movie) => (
                    <tr key={movie.id}>
                      <td style={td}>{movie.title}</td>
                      <td style={td}>{movie.duration} min</td>
                      <td style={td}>{movie.country}</td>
                      <td style={td}>{movie.releaseDate}</td>
                      <td style={td}>{movie.popularity}</td>
                      <td style={td}>
                        <Link to={`/movies/${movie.id}/edit`} style={buttonLight}>Editar</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </main>
  );
}

const card = {
  border: "1px solid #d9d9d9",
  borderRadius: "10px",
  padding: "1rem",
  marginTop: "1rem",
};
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
