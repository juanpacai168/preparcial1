"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Movie, mapMovie } from "./types";
import { useI18n } from "./i18n";
import { AppShell, StatusMessage } from "./ui";

export default function MoviesPage() {
  const { t } = useI18n();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const movieResponse = await fetch("/api/v1/movies");
        if (!movieResponse.ok) throw new Error("No se pudo cargar la informacion.");
        const movieRows = (await movieResponse.json()) as Record<string, unknown>[];
        setMovies(movieRows.map(mapMovie));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar peliculas.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
    <AppShell
      title={t("moviesPageTitle")}
      intro={t("moviesPageIntro")}
      actions={
        <>
          <Link className="btn btn-primary" to="/movies/new">{t("newMovie")}</Link>
          <Link className="btn btn-outline-primary" to="/prizes/new">{t("newPrize")}</Link>
          <Link className="btn btn-outline-secondary" to="/actors">{t("goToActors")}</Link>
        </>
      }
    >
      <section className="card border-0 shadow-sm app-surface">
        <div className="card-body p-3 p-lg-4">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2 mb-3">
            <div>
              <h3 className="h4 mb-1">{t("movies")}</h3>
              <p className="table-caption mb-0">{loading ? t("loading") : `${movies.length} registros`}</p>
            </div>
          </div>

          {error ? <StatusMessage type="error">{error}</StatusMessage> : null}
          {loading ? <StatusMessage type="info">{t("loading")}</StatusMessage> : null}

          {!loading && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <caption className="table-caption">{t("movies")}</caption>
                <thead className="table-light">
                  <tr>
                    <th scope="col">{t("title")}</th>
                    <th scope="col">{t("premiere")}</th>
                    <th scope="col">{t("mainAuthor")}</th>
                    <th scope="col">{t("prize")}</th>
                    <th scope="col">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.length === 0 ? (
                    <tr><td colSpan={5}>{t("listEmpty")}</td></tr>
                  ) : movies.map((movie) => (
                    <tr key={movie.id}>
                      <td><Link to={`/movies/${movie.id}`}>{movie.title}</Link></td>
                      <td>{movie.releaseDate}</td>
                      <td>{movie.actors[0]?.name || t("noAuthor")}</td>
                      <td>{movie.prizes[0]?.name || t("noPrize")}</td>
                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          <Link className="btn btn-sm btn-outline-primary" to={`/movies/${movie.id}`}>{t("detail")}</Link>
                          <Link className="btn btn-sm btn-outline-secondary" to={`/movies/${movie.id}/edit`}>{t("edit")}</Link>
                          <button className="btn btn-sm btn-danger" onClick={() => removeMovie(movie.id)} disabled={deletingId === movie.id}>
                            {deletingId === movie.id ? t("deleting") : t("delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
