"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Movie, mapMovie } from "./types";
import { useI18n } from "./i18n";
import { AppShell, StatusMessage } from "./ui";

type MovieFormData = {
  title: string;
  poster: string;
  duration: string;
  country: string;
  releaseDate: string;
  popularity: string;
};

type TrailerFormData = {
  name: string;
  url: string;
  duration: string;
  channel: string;
};

type OptionItem = {
  id: string;
  label: string;
};

const emptyMovieForm: MovieFormData = { title: "", poster: "", duration: "", country: "", releaseDate: "", popularity: "" };
const emptyTrailerForm: TrailerFormData = { name: "", url: "", duration: "2", channel: "" };

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
  return (await response.json().catch(() => ({}))) as Record<string, unknown> & { message?: string };
}

async function assertOk(response: Response, fallbackMessage: string) {
  if (response.ok) return;
  const body = await parseBody(response);
  throw new Error(body.message ?? fallbackMessage);
}

const toArray = (value: unknown): Record<string, unknown>[] => Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
const normalizeUrl = (value: string) => /^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`;

export default function MovieFormPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { movieId } = useParams<{ movieId: string }>();
  const isEdit = useMemo(() => Boolean(movieId), [movieId]);

  const [movieForm, setMovieForm] = useState<MovieFormData>(emptyMovieForm);
  const [trailerForm, setTrailerForm] = useState<TrailerFormData>(emptyTrailerForm);
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

        const genreOptions = toArray(await genresResponse.json()).map((row) => ({ id: String(row.id ?? ""), label: String(row.type ?? row.name ?? "Genero") })).filter((item) => item.id);
        const directorOptions = toArray(await directorsResponse.json()).map((row) => ({ id: String(row.id ?? ""), label: String(row.name ?? "Director") })).filter((item) => item.id);
        const trailerOptions = toArray(await trailersResponse.json()).map((row) => ({ id: String(row.id ?? ""), label: String(row.name ?? row.url ?? "Trailer") })).filter((item) => item.id);

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
          setTrailerForm((prev) => ({ ...prev, name: prev.name || "Official Trailer" }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar formulario.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isEdit, movieId]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const selectedGenreId = genreId || genres[0]?.id;
      const selectedDirectorId = directorId || directors[0]?.id;
      if (!selectedGenreId) throw new Error("No hay genero disponible para la pelicula.");
      if (!selectedDirectorId) throw new Error("No hay director disponible para la pelicula.");

      const basePayload = {
        title: movieForm.title,
        poster: normalizeUrl(movieForm.poster),
        duration: Number(movieForm.duration),
        country: movieForm.country,
        releaseDate: movieForm.releaseDate,
        popularity: Number(movieForm.popularity),
        genre: { id: selectedGenreId },
        director: { id: selectedDirectorId },
      };

      if (isEdit && movieId) {
        const selectedTrailerId = trailerId || trailers[0]?.id;
        if (!selectedTrailerId) throw new Error("No hay trailer disponible para la pelicula.");
        const response = await fetch(`/api/v1/movies/${encodeURIComponent(movieId)}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...(baseMovie ?? {}), ...basePayload, youtubeTrailer: { id: selectedTrailerId } }),
        });
        await assertOk(response, "No se pudo actualizar la pelicula.");
        setSuccess("Pelicula actualizada correctamente.");
        return;
      }

      const trailerResponse = await fetch("/api/v1/youtube-trailers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: trailerForm.name.trim() || `${movieForm.title.trim() || "Movie"} Trailer`,
          url: normalizeUrl(trailerForm.url),
          duration: Number(trailerForm.duration),
          channel: trailerForm.channel.trim() || "Official Channel",
        }),
      });
      await assertOk(trailerResponse, "No se pudo crear el trailer.");
      const createdTrailer = await parseBody(trailerResponse);
      const createdTrailerId = String(createdTrailer.id ?? "");
      if (!createdTrailerId) throw new Error("La API no devolvio el id del trailer creado.");

      const movieResponse = await fetch("/api/v1/movies", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...basePayload, youtubeTrailer: { id: createdTrailerId }, actors: [], platforms: [], reviews: [] }),
      });
      await assertOk(movieResponse, "No se pudo crear la pelicula.");
      const createdMovie = await parseBody(movieResponse);
      navigate(`/movies/${String(createdMovie.id ?? "")}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar pelicula.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell
      title={isEdit ? t("movieFormEditTitle") : t("movieFormCreateTitle")}
      intro={t("movieFormIntro")}
      actions={<Link className="btn btn-outline-secondary" to="/movies">{t("back")}</Link>}
    >
      <section className="card border-0 shadow-sm app-surface">
        <div className="card-body p-3 p-lg-4">
          {loading ? <StatusMessage type="info">{t("loading")}</StatusMessage> : null}
          {error ? <StatusMessage type="error">{error}</StatusMessage> : null}
          {success ? <StatusMessage type="success">{success}</StatusMessage> : null}

          {!loading && (
            <form onSubmit={onSubmit}>
              <div className="card border-0 bg-light-subtle mb-4">
                <div className="card-body">
                  <h3 className="h5 mb-3">{t("movieData")}</h3>
                  <div className="row g-3">
                    <div className="col-md-6"><label htmlFor="movie-title" className="form-label">{t("title")}</label><input id="movie-title" className="form-control" value={movieForm.title} onChange={(e) => setMovieForm((prev) => ({ ...prev, title: e.target.value }))} required /></div>
                    <div className="col-md-6"><label htmlFor="movie-poster" className="form-label">{t("posterUrl")}</label><input id="movie-poster" className="form-control" value={movieForm.poster} onChange={(e) => setMovieForm((prev) => ({ ...prev, poster: e.target.value }))} required /></div>
                    <div className="col-md-4"><label htmlFor="movie-duration" className="form-label">{t("duration")}</label><input id="movie-duration" className="form-control" type="number" min={1} value={movieForm.duration} onChange={(e) => setMovieForm((prev) => ({ ...prev, duration: e.target.value }))} required /></div>
                    <div className="col-md-4"><label htmlFor="movie-country" className="form-label">{t("country")}</label><input id="movie-country" className="form-control" value={movieForm.country} onChange={(e) => setMovieForm((prev) => ({ ...prev, country: e.target.value }))} required /></div>
                    <div className="col-md-4"><label htmlFor="movie-release-date" className="form-label">{t("releaseDate")}</label><input id="movie-release-date" className="form-control" type="date" value={movieForm.releaseDate} onChange={(e) => setMovieForm((prev) => ({ ...prev, releaseDate: e.target.value }))} required /></div>
                    <div className="col-md-4"><label htmlFor="movie-popularity" className="form-label">{t("popularity")}</label><input id="movie-popularity" className="form-control" type="number" min={0} value={movieForm.popularity} onChange={(e) => setMovieForm((prev) => ({ ...prev, popularity: e.target.value }))} required /></div>
                  </div>
                </div>
              </div>

              <div className="card border-0 bg-light-subtle mb-4">
                <div className="card-body">
                  <h3 className="h5 mb-3">{t("requiredRelations")}</h3>
                  <div className="row g-3">
                    <div className="col-md-4"><label htmlFor="movie-genre" className="form-label">{t("genre")}</label><select id="movie-genre" className="form-select" value={genreId} onChange={(e) => setGenreId(e.target.value)} required>{genres.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
                    <div className="col-md-4"><label htmlFor="movie-director" className="form-label">{t("director")}</label><select id="movie-director" className="form-select" value={directorId} onChange={(e) => setDirectorId(e.target.value)} required>{directors.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
                    {isEdit ? (
                      <div className="col-md-4"><label htmlFor="movie-trailer" className="form-label">{t("existingTrailer")}</label><select id="movie-trailer" className="form-select" value={trailerId} onChange={(e) => setTrailerId(e.target.value)} required>{trailers.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
                    ) : (
                      <>
                        <div className="col-md-6"><label htmlFor="trailer-name" className="form-label">{t("trailerName")}</label><input id="trailer-name" className="form-control" value={trailerForm.name} onChange={(e) => setTrailerForm((prev) => ({ ...prev, name: e.target.value }))} required /></div>
                        <div className="col-md-6"><label htmlFor="trailer-url" className="form-label">{t("trailerUrl")}</label><input id="trailer-url" className="form-control" value={trailerForm.url} onChange={(e) => setTrailerForm((prev) => ({ ...prev, url: e.target.value }))} required /></div>
                        <div className="col-md-6"><label htmlFor="trailer-duration" className="form-label">{t("trailerDuration")}</label><input id="trailer-duration" className="form-control" type="number" min={1} value={trailerForm.duration} onChange={(e) => setTrailerForm((prev) => ({ ...prev, duration: e.target.value }))} required /></div>
                        <div className="col-md-6"><label htmlFor="trailer-channel" className="form-label">{t("trailerChannel")}</label><input id="trailer-channel" className="form-control" value={trailerForm.channel} onChange={(e) => setTrailerForm((prev) => ({ ...prev, channel: e.target.value }))} required /></div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? t("saving") : t("save")}</button>
                <Link className="btn btn-outline-secondary" to="/movies">{t("back")}</Link>
              </div>
            </form>
          )}
        </div>
      </section>
    </AppShell>
  );
}
