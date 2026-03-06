"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Actor, Movie, mapActor, mapMovie } from "./types";

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [movieResponse, actorResponse] = await Promise.all([
          fetch("/api/v1/movies"),
          fetch("/api/v1/actors"),
        ]);
        if (!movieResponse.ok || !actorResponse.ok) {
          throw new Error("No se pudo cargar la informacion.");
        }
        const movieRows = (await movieResponse.json()) as Record<string, unknown>[];
        const actorRows = (await actorResponse.json()) as Record<string, unknown>[];
        setMovies(movieRows.map(mapMovie));
        setActors(actorRows.map(mapActor));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar peliculas.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const actorById = useMemo(
    () => new Map(actors.map((actor) => [actor.id, actor])),
    [actors],
  );

  const removeMovie = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/v1/movies/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message ?? "No se pudo eliminar la pelicula.");
      }
      setMovies((prev) => prev.filter((movie) => movie.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar pelicula.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main style={{ padding: "1.5rem" }}>
      <header style={headerStyle}>
        <h1>Peliculas</h1>
        <nav style={navStyle}>
          <Link to="/movies/new" style={buttonPrimary}>Nueva pelicula</Link>
          <Link to="/actors" style={buttonLight}>Ir a actores</Link>
        </nav>
      </header>

      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: "#ba1b1b" }}>{error}</p>}

      {!loading && (
        <section style={card}>
          <table style={table}>
            <thead>
              <tr>
                <th style={th}>Titulo</th>
                <th style={th}>Actor</th>
                <th style={th}>Duracion</th>
                <th style={th}>Pais</th>
                <th style={th}>Estreno</th>
                <th style={th}>Popularidad</th>
                <th style={th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.id}>
                  <td style={td}>{movie.title}</td>
                  <td style={td}>
                    {actorById.get(movie.actorId) ? (
                      <Link to={`/actors/${movie.actorId}`}>
                        {actorById.get(movie.actorId)?.name}
                      </Link>
                    ) : (
                      "Sin actor"
                    )}
                  </td>
                  <td style={td}>{movie.duration} min</td>
                  <td style={td}>{movie.country}</td>
                  <td style={td}>{movie.releaseDate}</td>
                  <td style={td}>{movie.popularity}</td>
                  <td style={td}>
                    <Link style={buttonLight} to={`/movies/${movie.id}/edit`}>Editar</Link>{" "}
                    <button
                      style={buttonDanger}
                      onClick={() => removeMovie(movie.id)}
                      disabled={deletingId === movie.id}
                    >
                      {deletingId === movie.id ? "Eliminando..." : "Eliminar"}
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
