"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useI18n } from "./i18n";
import { AppShell, StatusMessage } from "./ui";

type PrizeFormData = { name: string; category: string; year: string; status: "won" | "nominated" | "" };
type PrizePayload = { name: string; category: string; year: number; status: "won" | "nominated" };

const emptyForm: PrizeFormData = { name: "", category: "", year: "", status: "" };
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (value: string) => UUID_PATTERN.test(value.trim());

async function parseBody(response: Response) {
  return (await response.json().catch(() => ({}))) as Record<string, unknown> & { message?: string };
}

async function assertOk(response: Response, fallbackMessage: string) {
  if (response.ok) return;
  const body = await parseBody(response);
  throw new Error(body.message ?? fallbackMessage);
}

export default function PrizeFormPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { prizeId } = useParams<{ prizeId: string }>();
  const [searchParams] = useSearchParams();
  const movieId = (searchParams.get("movieId") ?? "").trim();
  const isEdit = useMemo(() => Boolean(prizeId), [prizeId]);

  const [form, setForm] = useState<PrizeFormData>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !prizeId) return;
    if (!isUuid(prizeId)) {
      setError("La URL no tiene un id de premio valido. Entra desde el detalle de la pelicula.");
      setLoading(false);
      return;
    }

    const loadPrize = async () => {
      try {
        const response = await fetch(`/api/v1/prizes/${encodeURIComponent(prizeId)}`);
        await assertOk(response, "No se pudo cargar el premio.");
        const data = await parseBody(response);
        setForm({
          name: String(data.name ?? ""),
          category: String(data.category ?? ""),
          year: String(data.year ?? ""),
          status: (String(data.status ?? "") as PrizeFormData["status"]) || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar premio.");
      } finally {
        setLoading(false);
      }
    };

    loadPrize();
  }, [isEdit, prizeId]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = { name: form.name, category: form.category, year: Number(form.year), status: form.status };
      if (!payload.status) throw new Error("Debes seleccionar un estado del premio.");

      if (isEdit && prizeId) {
        const response = await fetch(`/api/v1/prizes/${encodeURIComponent(prizeId)}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        await assertOk(response, "No se pudo actualizar premio.");
        setSuccess("Premio actualizado correctamente.");
        setTimeout(() => navigate(isUuid(movieId) ? `/movies/${movieId}` : "/movies"), 500);
        return;
      }

      const createResponse = await fetch("/api/v1/prizes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload as PrizePayload),
      });
      await assertOk(createResponse, "No se pudo crear premio.");
      const createdPrize = await parseBody(createResponse);
      const createdPrizeId = String(createdPrize.id ?? "");
      if (!createdPrizeId) throw new Error("La API no devolvio el id del premio creado.");

      if (movieId) {
        const relationResponse = await fetch(`/api/v1/movies/${encodeURIComponent(movieId)}/prizes/${encodeURIComponent(createdPrizeId)}`, { method: "POST" });
        await assertOk(relationResponse, "No se pudo asociar premio con pelicula.");
      }

      setSuccess(movieId ? "Premio creado y asociado correctamente." : "Premio creado correctamente.");
      setForm(emptyForm);
      setTimeout(() => navigate(isUuid(movieId) ? `/movies/${movieId}` : "/movies"), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar premio.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell
      title={isEdit ? t("prizeFormEditTitle") : movieId ? t("prizeFormMovieTitle") : t("prizeFormCreateTitle")}
      intro={t("prizeFormIntro")}
      actions={<Link className="btn btn-outline-secondary" to={isUuid(movieId) ? `/movies/${movieId}` : "/movies"}>{t("back")}</Link>}
    >
      <section className="card border-0 shadow-sm app-surface">
        <div className="card-body p-3 p-lg-4">
          {loading ? <StatusMessage type="info">{t("loading")}</StatusMessage> : null}
          {error ? <StatusMessage type="error">{error}</StatusMessage> : null}
          {success ? <StatusMessage type="success">{success}</StatusMessage> : null}

          {!loading && (
            <form onSubmit={onSubmit}>
              <div className="row g-3">
                <div className="col-md-6"><label htmlFor="prize-name" className="form-label">{t("prizeName")}</label><input id="prize-name" className="form-control" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required /></div>
                <div className="col-md-6"><label htmlFor="prize-category" className="form-label">{t("category")}</label><input id="prize-category" className="form-control" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} required /></div>
                <div className="col-md-6"><label htmlFor="prize-year" className="form-label">{t("year")}</label><input id="prize-year" className="form-control" type="number" min={1900} value={form.year} onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))} required /></div>
                <div className="col-md-6"><label htmlFor="prize-status" className="form-label">{t("prizeStatus")}</label><select id="prize-status" className="form-select" value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as PrizeFormData["status"] }))} required><option value="">{t("prizeStatus")}</option><option value="won">{t("won")}</option><option value="nominated">{t("nominated")}</option></select></div>
              </div>
              <div className="d-flex flex-wrap gap-2 mt-4">
                <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? t("saving") : isEdit ? t("updatePrize") : t("savePrize")}</button>
                <Link className="btn btn-outline-secondary" to={isUuid(movieId) ? `/movies/${movieId}` : "/movies"}>{t("back")}</Link>
              </div>
            </form>
          )}
        </div>
      </section>
    </AppShell>
  );
}
