"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Actor, mapActor } from "./types";
import { useI18n } from "./i18n";
import { AppShell, StatusMessage } from "./ui";

type FormData = { name: string; photo: string; nationality: string; birthDate: string; biography: string };
const emptyForm: FormData = { name: "", photo: "", nationality: "", birthDate: "", biography: "" };

function actorToForm(actor: Actor): FormData {
  return { name: actor.name, photo: actor.photo, nationality: actor.nationality, birthDate: actor.birthDate, biography: actor.biography };
}

export default function ActorFormPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { actorId } = useParams<{ actorId: string }>();
  const isEdit = useMemo(() => Boolean(actorId), [actorId]);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!actorId) return;
    const loadActor = async () => {
      try {
        const response = await fetch(`/api/v1/actors/${encodeURIComponent(actorId)}`);
        if (!response.ok) throw new Error("No se pudo cargar el actor.");
        const data = (await response.json()) as Record<string, unknown>;
        setForm(actorToForm(mapActor(data)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar actor.");
      } finally {
        setLoading(false);
      }
    };
    loadActor();
  }, [actorId]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = isEdit ? `/api/v1/actors/${encodeURIComponent(actorId as string)}` : "/api/v1/actors";
      const method = isEdit ? "PUT" : "POST";
      const response = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message ?? "No se pudo guardar el actor.");
      }
      navigate("/actors");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar actor.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell
      title={isEdit ? t("actorFormEditTitle") : t("actorFormCreateTitle")}
      intro={t("actorFormIntro")}
      actions={<Link className="btn btn-outline-secondary" to="/actors">{t("back")}</Link>}
    >
      <section className="card border-0 shadow-sm app-surface">
        <div className="card-body p-3 p-lg-4">
          {loading ? <StatusMessage type="info">{t("loading")}</StatusMessage> : null}
          {error ? <StatusMessage type="error">{error}</StatusMessage> : null}

          {!loading && (
            <form onSubmit={onSubmit}>
              <div className="row g-3">
                <div className="col-md-6"><label htmlFor="actor-name" className="form-label">{t("name")}</label><input id="actor-name" className="form-control" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required /></div>
                <div className="col-md-6"><label htmlFor="actor-photo" className="form-label">{t("photoUrl")}</label><input id="actor-photo" className="form-control" value={form.photo} onChange={(e) => setForm((prev) => ({ ...prev, photo: e.target.value }))} required /></div>
                <div className="col-md-6"><label htmlFor="actor-nationality" className="form-label">{t("nationality")}</label><input id="actor-nationality" className="form-control" value={form.nationality} onChange={(e) => setForm((prev) => ({ ...prev, nationality: e.target.value }))} required /></div>
                <div className="col-md-6"><label htmlFor="actor-birth-date" className="form-label">{t("birthDate")}</label><input id="actor-birth-date" className="form-control" type="date" value={form.birthDate} onChange={(e) => setForm((prev) => ({ ...prev, birthDate: e.target.value }))} required /></div>
                <div className="col-12"><label htmlFor="actor-biography" className="form-label">{t("biography")}</label><textarea id="actor-biography" className="form-control" rows={5} value={form.biography} onChange={(e) => setForm((prev) => ({ ...prev, biography: e.target.value }))} required /></div>
              </div>
              <div className="d-flex flex-wrap gap-2 mt-4">
                <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? t("saving") : t("save")}</button>
                <Link className="btn btn-outline-secondary" to="/actors">{t("back")}</Link>
              </div>
            </form>
          )}
        </div>
      </section>
    </AppShell>
  );
}
