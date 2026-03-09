"use client";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Actor, mapActor } from "./types";
import { useI18n } from "./i18n";
import { AppShell, StatusMessage } from "./ui";

export default function ActorsPage() {
  const { t } = useI18n();
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch("/api/v1/actors");
        if (!response.ok) throw new Error("No se pudo cargar la lista de actores.");
        const rows = (await response.json()) as Record<string, unknown>[];
        setActors(rows.map(mapActor));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error de red al cargar actores.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const removeActor = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/v1/actors/${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) throw new Error("No se pudo eliminar el actor.");
      setActors((prev) => prev.filter((actor) => actor.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar actor.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppShell
      title={t("actorsPageTitle")}
      intro={t("actorsPageIntro")}
      actions={
        <>
          <Link className="btn btn-primary" to="/actors/new">{t("newActor")}</Link>
          <Link className="btn btn-outline-primary" to="/prizes/new">{t("newPrize")}</Link>
          <Link className="btn btn-outline-secondary" to="/movies">{t("goToMovies")}</Link>
        </>
      }
    >
      <section className="card border-0 shadow-sm app-surface">
        <div className="card-body p-3 p-lg-4">
          <h3 className="h4 mb-1">{t("actors")}</h3>
          <p className="table-caption mb-3">{loading ? t("loading") : `${actors.length} registros`}</p>
          {error ? <StatusMessage type="error">{error}</StatusMessage> : null}
          {loading ? <StatusMessage type="info">{t("loading")}</StatusMessage> : null}

          {!loading && (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <caption className="table-caption">{t("actors")}</caption>
                <thead className="table-light">
                  <tr>
                    <th scope="col">{t("name")}</th>
                    <th scope="col">{t("nationality")}</th>
                    <th scope="col">{t("birthDate")}</th>
                    <th scope="col">{t("movies")}</th>
                    <th scope="col">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {actors.length === 0 ? (
                    <tr><td colSpan={5}>{t("listEmpty")}</td></tr>
                  ) : actors.map((actor) => (
                    <tr key={actor.id}>
                      <td>{actor.name}</td>
                      <td>{actor.nationality}</td>
                      <td>{actor.birthDate}</td>
                      <td>{actor.movies.length}</td>
                      <td>
                        <div className="d-flex flex-wrap gap-2">
                          <Link className="btn btn-sm btn-outline-primary" to={`/actors/${actor.id}`}>{t("detail")}</Link>
                          <Link className="btn btn-sm btn-outline-secondary" to={`/actors/${actor.id}/edit`}>{t("edit")}</Link>
                          <button className="btn btn-sm btn-danger" onClick={() => removeActor(actor.id)} disabled={deletingId === actor.id}>
                            {deletingId === actor.id ? t("deleting") : t("delete")}
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
