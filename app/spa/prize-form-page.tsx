"use client";

import { FormEvent, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

type PrizeFormData = {
  name: string;
  category: string;
  year: string;
  status: "won" | "nominated" | "";
};

type PrizePayload = {
  name: string;
  category: string;
  year: number;
  status: "won" | "nominated";
};

const emptyForm: PrizeFormData = {
  name: "",
  category: "",
  year: "",
  status: "",
};

async function createPrize(payload: PrizePayload) {
  const res = await fetch("/api/v1/prizes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  return parseBody(res);
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

export default function PrizeFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const movieId = (searchParams.get("movieId") ?? "").trim();

  const [form, setForm] = useState<PrizeFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onChange = (field: keyof PrizeFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        name: form.name,
        category: form.category,
        year: Number(form.year),
        status: form.status,
      };
      if (!payload.status) throw new Error("Debes seleccionar un estado del premio.");
      const createdPrize = await createPrize(payload as PrizePayload);
      const createdPrizeId = String(createdPrize.id ?? "");
      if (!createdPrizeId) throw new Error("La API no devolvio el id del premio creado.");

      if (movieId) {
        const relationResponse = await fetch(
          `/api/v1/movies/${encodeURIComponent(movieId)}/prizes/${encodeURIComponent(createdPrizeId)}`,
          { method: "POST" },
        );
        await assertOk(relationResponse, "No se pudo asociar premio con pelicula.");
      }

      setSuccess(movieId ? "Premio creado y asociado correctamente." : "Premio creado correctamente.");
      setForm(emptyForm);

      setTimeout(() => {
        if (movieId) {
          navigate(`/movies/${movieId}`);
          return;
        }
        navigate("/movies");
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear premio.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main style={{ padding: "1.5rem" }}>
      <h1>{movieId ? "Crear premio para pelicula" : "Crear premio"}</h1>
      <section style={card}>
        {error && <p style={{ color: "#ba1b1b" }}>{error}</p>}
        {success && <p style={{ color: "#166534" }}>{success}</p>}

        <form onSubmit={onSubmit} style={formGrid}>
          <input
            style={input}
            placeholder="Nombre del premio"
            value={form.name}
            onChange={(e) => onChange("name", e.target.value)}
            required
          />
          <input
            style={input}
            placeholder="Categoria"
            value={form.category}
            onChange={(e) => onChange("category", e.target.value)}
            required
          />
          <input
            style={input}
            type="number"
            min={1900}
            placeholder="Año"
            value={form.year}
            onChange={(e) => onChange("year", e.target.value)}
            required
          />
          <select
            style={input}
            value={form.status}
            onChange={(e) => onChange("status", e.target.value)}
            required
          >
            <option value="">Estado del premio</option>
            <option value="won">won</option>
            <option value="nominated">nominated</option>
          </select>

          <div style={{ gridColumn: "1 / -1" }}>
            <button style={buttonPrimary} type="submit" disabled={saving}>
              {saving ? "Guardando..." : "Guardar premio"}
            </button>{" "}
            <Link to={movieId ? `/movies/${movieId}` : "/movies"} style={buttonLight}>
              Volver
            </Link>
          </div>
        </form>
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
