"use client";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Movie, mapMovie } from "./types";
import { useI18n } from "./i18n";
import { AppShell, StatusMessage } from "./ui";

export default function MovieDetailPage() {
  const { t } = useI18n();
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
    <AppShell
      title={t("movieDetailTitle")}
      intro={movie?.title}
      actions={
        <>
          <Link className="btn btn-outline-secondary" to="/movies">{t("back")}</Link>
          {movie ? <Link className="btn btn-outline-primary" to={`/movies/${movie.id}/edit`}>{t("edit")}</Link> : null}
          {movie ? <Link className="btn btn-primary" to={`/prizes/new?movieId=${encodeURIComponent(movie.id)}`}>{t("createPrizeForMovie")}</Link> : null}
        </>
      }
    >
      <div className="d-grid gap-3">
        {loading ? <StatusMessage type="info">{t("loading")}</StatusMessage> : null}
        {error ? <StatusMessage type="error">{error}</StatusMessage> : null}

        {movie ? (
          <>
            <section className="card border-0 shadow-sm app-surface">
              <div className="card-body p-3 p-lg-4">
                <h3 className="h4 mb-3">{movie.title}</h3>
                <div className="row g-3">
                  <div className="col-md-4"><div className="p-3 rounded-4 detail-metric"><strong>ID</strong>{movie.id}</div></div>
                  <div className="col-md-4"><div className="p-3 rounded-4 detail-metric"><strong>{t("posterUrl")}</strong>{movie.poster}</div></div>
                  <div className="col-md-4"><div className="p-3 rounded-4 detail-metric"><strong>{t("duration")}</strong>{movie.duration} min</div></div>
                  <div className="col-md-4"><div className="p-3 rounded-4 detail-metric"><strong>{t("country")}</strong>{movie.country}</div></div>
                  <div className="col-md-4"><div className="p-3 rounded-4 detail-metric"><strong>{t("releaseDate")}</strong>{movie.releaseDate}</div></div>
                  <div className="col-md-4"><div className="p-3 rounded-4 detail-metric"><strong>{t("popularity")}</strong>{movie.popularity}</div></div>
                  <div className="col-md-4"><div className="p-3 rounded-4 detail-metric"><strong>{t("genre")}</strong>{movie.genreName || "N/A"}</div></div>
                  <div className="col-md-4"><div className="p-3 rounded-4 detail-metric"><strong>{t("director")}</strong>{movie.directorName || "N/A"}</div></div>
                  <div className="col-md-4"><div className="p-3 rounded-4 detail-metric"><strong>{t("trailer")}</strong>{movie.trailerUrl || "N/A"}</div></div>
                  <div className="col-md-6"><div className="p-3 rounded-4 detail-metric"><strong>{t("platforms")}</strong>{movie.platforms.length > 0 ? movie.platforms.map((platform) => platform.name).join(", ") : "N/A"}</div></div>
                  <div className="col-md-6"><div className="p-3 rounded-4 detail-metric"><strong>{t("prizes")}</strong>{movie.prizes.length > 0 ? movie.prizes.map((prize) => prize.name).join(", ") : "N/A"}</div></div>
                </div>
                {movie.prizes.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2 mt-4">
                    {movie.prizes.map((prize, index) => (
                      <Link key={prize.id || `${prize.name}-${index}`} className="btn btn-outline-primary" to={`/prizes/${prize.id}/edit?movieId=${encodeURIComponent(movie.id)}`}>
                        {t("editPrize")}: {prize.name}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            </section>

            <section className="card border-0 shadow-sm app-surface">
              <div className="card-body p-3 p-lg-4">
                <h3 className="h5 mb-3">{t("authorsActors")} ({movie.actors.length})</h3>
                {movie.actors.length === 0 ? <p className="text-secondary mb-0">{t("noAuthors")}</p> : (
                  <ul className="mb-0">
                    {movie.actors.map((actor) => (
                      <li key={actor.id}>
                        {actor.name} {actor.id ? <Link to={`/actors/${actor.id}`}>{t("detail")}</Link> : null}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
