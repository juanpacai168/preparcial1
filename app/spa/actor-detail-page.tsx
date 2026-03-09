"use client";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Actor, mapActor } from "./types";
import { useI18n } from "./i18n";
import { AppShell, StatusMessage } from "./ui";

export default function ActorDetailPage() {
  const { t } = useI18n();
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
    <AppShell
      title={t("actorDetailTitle")}
      intro={actor?.name}
      actions={
        <>
          <Link className="btn btn-outline-secondary" to="/actors">{t("back")}</Link>
          {actor ? <Link className="btn btn-outline-primary" to={`/actors/${actor.id}/edit`}>{t("editActor")}</Link> : null}
          <Link className="btn btn-primary" to="/movies/new">{t("actorCreatedMovie")}</Link>
        </>
      }
    >
      <div className="d-grid gap-3">
        {loading ? <StatusMessage type="info">{t("loading")}</StatusMessage> : null}
        {error ? <StatusMessage type="error">{error}</StatusMessage> : null}

        {actor ? (
          <>
            <section className="card border-0 shadow-sm app-surface">
              <div className="card-body p-3 p-lg-4">
                <div className="row g-3">
                  <div className="col-md-4"><div className="p-3 rounded-4 detail-metric"><strong>{t("name")}</strong>{actor.name}</div></div>
                  <div className="col-md-4"><div className="p-3 rounded-4 detail-metric"><strong>{t("nationality")}</strong>{actor.nationality}</div></div>
                  <div className="col-md-4"><div className="p-3 rounded-4 detail-metric"><strong>{t("birthDate")}</strong>{actor.birthDate}</div></div>
                  <div className="col-12"><div className="p-3 rounded-4 detail-metric"><strong>{t("biography")}</strong>{actor.biography}</div></div>
                </div>
              </div>
            </section>

            <section className="card border-0 shadow-sm app-surface">
              <div className="card-body p-3 p-lg-4">
                <h3 className="h5 mb-3">{t("actorMovies")} ({actor.movies.length})</h3>
                {actor.movies.length === 0 ? (
                  <p className="text-secondary mb-0">{t("noActorMovies")}</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <caption className="table-caption">{t("actorMovies")}</caption>
                      <thead className="table-light">
                        <tr>
                          <th scope="col">{t("title")}</th>
                          <th scope="col">{t("duration")}</th>
                          <th scope="col">{t("country")}</th>
                          <th scope="col">{t("premiere")}</th>
                          <th scope="col">{t("popularity")}</th>
                          <th scope="col">{t("actions")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {actor.movies.map((movie) => (
                          <tr key={movie.id}>
                            <td>{movie.title}</td>
                            <td>{movie.duration} min</td>
                            <td>{movie.country}</td>
                            <td>{movie.releaseDate}</td>
                            <td>{movie.popularity}</td>
                            <td><Link className="btn btn-sm btn-outline-secondary" to={`/movies/${movie.id}/edit`}>{t("edit")}</Link></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}
