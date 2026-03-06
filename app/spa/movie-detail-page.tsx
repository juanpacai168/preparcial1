"use client";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Movie, mapMovie } from "./types";

export default function MovieDetailPage() {
  const { movieId } = useParams<{ movieId: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId) {
      setError("No se encontro la pelicula.");
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const response = await fetch(`/api/v1/movies/${encodeURIComponent(movieId)}`);
        if (!response.ok) throw new Error("No se pudo cargar la pelicula.");
        const data = (await response.json()) as Record<string, unknown>;
        setMovie(mapMovie(data));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar pelicula.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [movieId]);

  return (
    <main style={{ padding: "1.5rem" }}>
      <h1>Detalle de pelicula</h1>
      <p>
        <Link to="/movies" style={buttonLight}>Volver a peliculas</Link>{" "}
        {movie && <Link to={`/movies/${movie.id}/edit`} style={buttonPrimary}>Editar</Link>}{" "}
        {movie && (
          <Link to={`/prizes/new?movieId=${encodeURIComponent(movie.id)}`} style={buttonPrimary}>
            Crear premio
          </Link>
        )}
      </p>

      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: "#ba1b1b" }}>{error}</p>}

      {movie && (
        <>
          <section style={card}>
            <h2 style={{ marginTop: 0 }}>{movie.title}</h2>
            <p><strong>ID:</strong> {movie.id}</p>
            <p><strong>Poster:</strong> {movie.poster}</p>
            <p><strong>Duracion:</strong> {movie.duration} min</p>
            <p><strong>Pais:</strong> {movie.country}</p>
            <p><strong>Fecha de lanzamiento:</strong> {movie.releaseDate}</p>
            <p><strong>Popularidad:</strong> {movie.popularity}</p>
            <p><strong>Genero:</strong> {movie.genreName || "N/A"}</p>
            <p><strong>Director:</strong> {movie.directorName || "N/A"}</p>
            <p><strong>Trailer:</strong> {movie.trailerUrl || "N/A"}</p>
            <p>
              <strong>Plataformas:</strong>{" "}
              {movie.platforms.length > 0
                ? movie.platforms.map((platform) => platform.name).join(", ")
                : "N/A"}
            </p>
            <p>
              <strong>Premios:</strong>{" "}
              {movie.prizes.length > 0
                ? movie.prizes.map((prize) => prize.name).join(", ")
                : "N/A"}
            </p>
          </section>

          <section style={card}>
            <h3 style={{ marginTop: 0 }}>Autores / actores ({movie.actors.length})</h3>
            {movie.actors.length === 0 && <p>No hay autores asociados.</p>}
            {movie.actors.length > 0 && (
              <ul>
                {movie.actors.map((actor) => (
                  <li key={actor.id}>
                    {actor.name}{" "}
                    {actor.id && (
                      <Link to={`/actors/${actor.id}`} style={link}>
                        Ver actor
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
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
const link = {
  color: "#0b5cab",
};
