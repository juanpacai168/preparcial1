"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Movie, mapMovie } from "./types";

type MovieFormData = {
  title: string;
  poster: string;
  duration: string;
  country: string;
  releaseDate: string;
  popularity: string;
};

type OptionItem = {
  id: string;
  label: string;
};

const emptyMovieForm: MovieFormData = {
  title: "",
  poster: "",
  duration: "",
  country: "",
  releaseDate: "",
  popularity: "",
};

function movieToForm(movie: Movie): MovieFormData {
  return {
    title: movie.title,
    poster: movie.poster,
    duration: String(movie.duration),
    country: movie.country,
    releaseDate: movie.releaseDate,
    popularity: String(movie.popularity),
  };
}

async function parseBody(response: Response) {
  return (await response.json().catch(() => ({}))) as Record<string, unknown> & {
    message?: string;
  };
}

async function assertOk(response: Response, fallbackMessage: string) {
  if (response.ok) return;
  const body = await parseBody(response);
  throw new Error(body.message ?? fallbackMessage);
}

const toArray = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? (value as Record<string, unknown>[]) : [];

export default function MovieFormPage() {
  const navigate = useNavigate();
  const { movieId } = useParams<{ movieId: string }>();
  const isEdit = useMemo(() => Boolean(movieId), [movieId]);

  const [movieForm, setMovieForm] = useState<MovieFormData>(emptyMovieForm);
  const [genres, setGenres] = useState<OptionItem[]>([]);
  const [directors, setDirectors] = useState<OptionItem[]>([]);
  const [trailers, setTrailers] = useState<OptionItem[]>([]);
  const [genreId, setGenreId] = useState("");
  const [directorId, setDirectorId] = useState("");
  const [trailerId, setTrailerId] = useState("");
  const [baseMovie, setBaseMovie] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [genresResponse, directorsResponse, trailersResponse] = await Promise.all([
          fetch("/api/v1/genres"),
          fetch("/api/v1/directors"),
          fetch("/api/v1/youtube-trailers"),
        ]);

        await assertOk(genresResponse, "No se pudieron cargar los generos.");
        await assertOk(directorsResponse, "No se pudieron cargar los directores.");
        await assertOk(trailersResponse, "No se pudieron cargar los trailers.");

        const genreRows = toArray(await genresResponse.json());
        const directorRows = toArray(await directorsResponse.json());
        const trailerRows = toArray(await trailersResponse.json());

        const genreOptions = genreRows.map((row) => ({
          id: String(row.id ?? ""),
          label: String(row.type ?? row.name ?? "Genero"),
        })).filter((item) => item.id);

        const directorOptions = directorRows.map((row) => ({
          id: String(row.id ?? ""),
          label: String(row.name ?? "Director"),
        })).filter((item) => item.id);

        const trailerOptions = trailerRows.map((row) => ({
          id: String(row.id ?? ""),
          label: String(row.name ?? row.url ?? "Trailer"),
        })).filter((item) => item.id);

        setGenres(genreOptions);
        setDirectors(directorOptions);
        setTrailers(trailerOptions);

        if (isEdit && movieId) {
          const movieResponse = await fetch(`/api/v1/movies/${encodeURIComponent(movieId)}`);
          await assertOk(movieResponse, "No se pudo cargar la pelicula.");
          const movieData = (await movieResponse.json()) as Record<string, unknown>;
          setBaseMovie(movieData);
          setMovieForm(movieToForm(mapMovie(movieData)));

          const movieGenre = movieData.genre as Record<string, unknown> | undefined;
          const movieDirector = movieData.director as Record<string, unknown> | undefined;
          const movieTrailer = movieData.youtubeTrailer as Record<string, unknown> | undefined;

          setGenreId(String(movieGenre?.id ?? genreOptions[0]?.id ?? ""));
          setDirectorId(String(movieDirector?.id ?? directorOptions[0]?.id ?? ""));
          setTrailerId(String(movieTrailer?.id ?? trailerOptions[0]?.id ?? ""));
        } else {
          setGenreId(genreOptions[0]?.id ?? "");
          setDirectorId(directorOptions[0]?.id ?? "");
          setTrailerId(trailerOptions[0]?.id ?? "");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar formulario.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isEdit, movieId]);

  const onMovieChange = (field: keyof MovieFormData, value: string) => {
    setMovieForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const selectedGenreId = genreId || genres[0]?.id;
      const selectedDirectorId = directorId || directors[0]?.id;
      const selectedTrailerId = trailerId || trailers[0]?.id;

      if (!selectedGenreId) throw new Error("No hay genero disponible para la pelicula.");
      if (!selectedDirectorId) throw new Error("No hay director disponible para la pelicula.");
      if (!selectedTrailerId) throw new Error("No hay trailer disponible para la pelicula.");

      const basePayload = {
        title: movieForm.title,
        poster: movieForm.poster,
        duration: Number(movieForm.duration),
        country: movieForm.country,
        releaseDate: movieForm.releaseDate,
        popularity: Number(movieForm.popularity),
        genre: { id: selectedGenreId },
        director: { id: selectedDirectorId },
        youtubeTrailer: { id: selectedTrailerId },
      };

      if (isEdit && movieId) {
        const payload = {
          ...(baseMovie ?? {}),
          ...basePayload,
        };

        const response = await fetch(`/api/v1/movies/${encodeURIComponent(movieId)}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        await assertOk(response, "No se pudo actualizar la pelicula.");
        setSuccess("Pelicula actualizada correctamente.");
        return;
      }

      const movieResponse = await fetch("/api/v1/movies", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...basePayload,
          actors: [],
          platforms: [],
          reviews: [],
        }),
      });

      await assertOk(movieResponse, "No se pudo crear la pelicula.");
      const createdMovie = await parseBody(movieResponse);
      const createdMovieId = String(createdMovie.id ?? "");
      if (!createdMovieId) throw new Error("La API no devolvio el id de la pelicula creada.");

      navigate(`/movies/${createdMovieId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar pelicula.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{ padding: "1.5rem" }}>
      <h1>{isEdit ? "Editar pelicula" : "Crear pelicula"}</h1>
      <section style={card}>
        {loading && <p>Cargando...</p>}
        {error && <p style={{ color: "#ba1b1b" }}>{error}</p>}
        {success && <p style={{ color: "#166534" }}>{success}</p>}

        {!loading && (
          <form onSubmit={onSubmit} style={formGrid}>
            <h2 style={sectionTitle}>Datos de la pelicula</h2>
            <input
              style={input}
              placeholder="Titulo"
              value={movieForm.title}
              onChange={(e) => onMovieChange("title", e.target.value)}
              required
            />
            <input
              style={input}
              placeholder="Poster URL"
              value={movieForm.poster}
              onChange={(e) => onMovieChange("poster", e.target.value)}
              required
            />
            <input
              style={input}
              type="number"
              min={1}
              placeholder="Duracion (min)"
              value={movieForm.duration}
              onChange={(e) => onMovieChange("duration", e.target.value)}
              required
            />
            <input
              style={input}
              placeholder="Pais"
              value={movieForm.country}
              onChange={(e) => onMovieChange("country", e.target.value)}
              required
            />
            <input
              style={input}
              type="date"
              value={movieForm.releaseDate}
              onChange={(e) => onMovieChange("releaseDate", e.target.value)}
              required
            />
            <input
              style={input}
              type="number"
              min={0}
              placeholder="Popularidad"
              value={movieForm.popularity}
              onChange={(e) => onMovieChange("popularity", e.target.value)}
              required
            />

            <h2 style={sectionTitle}>Relaciones obligatorias</h2>
            <select style={input} value={genreId} onChange={(e) => setGenreId(e.target.value)} required>
              {genres.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
            <select style={input} value={directorId} onChange={(e) => setDirectorId(e.target.value)} required>
              {directors.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
            <select style={input} value={trailerId} onChange={(e) => setTrailerId(e.target.value)} required>
              {trailers.map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>

            <div style={{ gridColumn: "1 / -1" }}>
              <button style={buttonPrimary} type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </button>{" "}
              <Link to="/movies" style={buttonLight}>Volver</Link>
            </div>
          </form>
        )}
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

const sectionTitle = {
  gridColumn: "1 / -1",
  marginBottom: "0.1rem",
  marginTop: "0.9rem",
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
  textDecoration: "none",
};
