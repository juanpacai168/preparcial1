"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Actor, Movie, mapActor, mapMovie } from "./types";

type Genre = { id: string; type: string };
type Director = {
  id: string;
  name: string;
  photo: string;
  nationality: string;
  birthDate: string;
  biography: string;
};
type Platform = { id: string; name: string; url: string };
type YoutubeTrailer = {
  id: string;
  name: string;
  url: string;
  duration: number;
  channel: string;
};

type FormData = {
  title: string;
  poster: string;
  duration: string;
  country: string;
  releaseDate: string;
  popularity: string;
  actorId: string;
};

const emptyForm: FormData = {
  title: "",
  poster: "",
  duration: "",
  country: "",
  releaseDate: "",
  popularity: "",
  actorId: "",
};

function movieToForm(movie: Movie): FormData {
  return {
    title: movie.title,
    poster: movie.poster,
    duration: String(movie.duration),
    country: movie.country,
    releaseDate: movie.releaseDate,
    popularity: String(movie.popularity),
    actorId: movie.actorId,
  };
}

export default function MovieFormPage() {
  const navigate = useNavigate();
  const { movieId } = useParams<{ movieId: string }>();
  const [searchParams] = useSearchParams();
  const presetActorId = searchParams.get("actorId") ?? "";
  const isEdit = useMemo(() => Boolean(movieId), [movieId]);

  const [form, setForm] = useState<FormData>({ ...emptyForm, actorId: presetActorId });
  const [actors, setActors] = useState<Actor[]>([]);
  const [baseMovie, setBaseMovie] = useState<Record<string, unknown> | null>(null);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [directors, setDirectors] = useState<Director[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [actorResponse, genreResponse, directorResponse, platformResponse] =
          await Promise.all([
            fetch("/api/v1/actors"),
            fetch("/api/v1/genres"),
            fetch("/api/v1/directors"),
            fetch("/api/v1/platforms"),
          ]);

        if (!actorResponse.ok) throw new Error("No se pudo cargar la lista de actores.");
        if (!genreResponse.ok) throw new Error("No se pudo cargar la lista de generos.");
        if (!directorResponse.ok) throw new Error("No se pudo cargar la lista de directores.");
        if (!platformResponse.ok) throw new Error("No se pudo cargar la lista de plataformas.");

        const actorRows = (await actorResponse.json()) as Record<string, unknown>[];
        const genreRows = (await genreResponse.json()) as Record<string, unknown>[];
        const directorRows = (await directorResponse.json()) as Record<string, unknown>[];
        const platformRows = (await platformResponse.json()) as Record<string, unknown>[];

        const actorList = actorRows.map(mapActor);
        setGenres(
          genreRows.map((row) => ({
            id: String(row.id ?? ""),
            type: String(row.type ?? ""),
          })),
        );
        setDirectors(
          directorRows.map((row) => ({
            id: String(row.id ?? ""),
            name: String(row.name ?? ""),
            photo: String(row.photo ?? ""),
            nationality: String(row.nationality ?? ""),
            birthDate: String(row.birthDate ?? ""),
            biography: String(row.biography ?? ""),
          })),
        );
        setPlatforms(
          platformRows.map((row) => ({
            id: String(row.id ?? ""),
            name: String(row.name ?? ""),
            url: String(row.url ?? ""),
          })),
        );
        setActors(actorList);

        if (isEdit && movieId) {
          const movieResponse = await fetch(`/api/v1/movies/${encodeURIComponent(movieId)}`);
          if (!movieResponse.ok) throw new Error("No se pudo cargar la pelicula.");
          const movieData = (await movieResponse.json()) as Record<string, unknown>;
          setBaseMovie(movieData);
          setForm(movieToForm(mapMovie(movieData)));
        } else if (!presetActorId && actorList.length > 0) {
          setForm((prev) => ({ ...prev, actorId: actorList[0].id }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar formulario.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isEdit, movieId, presetActorId]);

  const onChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const selectedActor = actors.find((actor) => actor.id === form.actorId);
    const actorPayload = selectedActor
      ? {
          id: selectedActor.id,
          name: selectedActor.name,
          photo: selectedActor.photo,
          nationality: selectedActor.nationality,
          birthDate: selectedActor.birthDate,
          biography: selectedActor.biography,
        }
      : { id: form.actorId };

    const editableFields = {
      title: form.title,
      poster: form.poster,
      duration: Number(form.duration),
      country: form.country,
      releaseDate: form.releaseDate,
      popularity: Number(form.popularity),
    };

    const payload =
      isEdit && baseMovie
        ? {
            id: String(baseMovie.id ?? movieId ?? ""),
            ...editableFields,
            actors: [{ id: form.actorId }],
            genre: { id: String((baseMovie.genre as Record<string, unknown> | undefined)?.id ?? "") },
            director: { id: String((baseMovie.director as Record<string, unknown> | undefined)?.id ?? "") },
            youtubeTrailer: {
              id: String(
                (baseMovie.youtubeTrailer as Record<string, unknown> | undefined)?.id ?? "",
              ),
            },
            platforms: Array.isArray(baseMovie.platforms)
              ? (baseMovie.platforms as Record<string, unknown>[]).map((p) => ({
                  id: String(p.id ?? ""),
                }))
              : [],
            reviews: Array.isArray(baseMovie.reviews)
              ? (baseMovie.reviews as Record<string, unknown>[]).map((r) => ({
                  id: String(r.id ?? ""),
                }))
              : [],
          }
        : null;

    try {
      const url = isEdit
        ? `/api/v1/movies/${encodeURIComponent(movieId as string)}`
        : "/api/v1/movies";
      const method = isEdit ? "PUT" : "POST";

      const finalPayload = isEdit
        ? payload
        : await (async () => {
            const genre = genres[0];
            const director = directors[0];
            const platform = platforms[0];

            if (!genre || !director) {
              throw new Error("No hay catalogos suficientes para crear la pelicula.");
            }

            const trailerDraft = {
              name: `Trailer ${Math.random().toString(36).slice(2, 8)}`,
              url: `http://example.com/${Math.random().toString(36).slice(2, 10)}`,
              duration: 2,
              channel: "web",
            };

            const trailerResponse = await fetch("/api/v1/youtube-trailers", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify(trailerDraft),
            });
            if (!trailerResponse.ok) {
              throw new Error("No se pudo crear el trailer requerido por la API.");
            }
            const trailer = (await trailerResponse.json()) as YoutubeTrailer;

            return {
              ...editableFields,
              actors: [actorPayload],
              genre,
              director,
              youtubeTrailer: trailer,
              platforms: platform ? [platform] : [],
              reviews: [],
            };
          })();

      const response = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(finalPayload),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message ?? "No se pudo guardar la pelicula.");
      }

      if (isEdit) {
        setSuccess("Pelicula actualizada correctamente.");
      } else {
        if (form.actorId) {
          navigate(`/actors/${form.actorId}`);
        } else {
          navigate("/movies");
        }
      }
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
            <input
              style={input}
              placeholder="Titulo"
              value={form.title}
              onChange={(e) => onChange("title", e.target.value)}
              required
            />
            <input
              style={input}
              placeholder="Poster URL"
              value={form.poster}
              onChange={(e) => onChange("poster", e.target.value)}
              required
            />
            <input
              style={input}
              type="number"
              min={1}
              placeholder="Duracion (min)"
              value={form.duration}
              onChange={(e) => onChange("duration", e.target.value)}
              required
            />
            <input
              style={input}
              placeholder="Pais"
              value={form.country}
              onChange={(e) => onChange("country", e.target.value)}
              required
            />
            <input
              style={input}
              type="date"
              value={form.releaseDate}
              onChange={(e) => onChange("releaseDate", e.target.value)}
              required
            />
            <input
              style={input}
              type="number"
              min={0}
              placeholder="Popularidad"
              value={form.popularity}
              onChange={(e) => onChange("popularity", e.target.value)}
              required
            />
            <select
              style={input}
              value={form.actorId}
              onChange={(e) => onChange("actorId", e.target.value)}
              required
            >
              {actors.map((actor) => (
                <option key={actor.id} value={actor.id}>
                  {actor.name}
                </option>
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
