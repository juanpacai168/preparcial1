"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Actor, mapActor } from "./types";

type FormData = {
  name: string;
  photo: string;
  nationality: string;
  birthDate: string;
  biography: string;
};

const emptyForm: FormData = {
  name: "",
  photo: "",
  nationality: "",
  birthDate: "",
  biography: "",
};

function actorToForm(actor: Actor): FormData {
  return {
    name: actor.name,
    photo: actor.photo,
    nationality: actor.nationality,
    birthDate: actor.birthDate,
    biography: actor.biography,
  };
}

export default function ActorFormPage() {
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

  const onChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      photo: form.photo,
      nationality: form.nationality,
      birthDate: form.birthDate,
      biography: form.biography,
    };

    try {
      const url = isEdit
        ? `/api/v1/actors/${encodeURIComponent(actorId as string)}`
        : "/api/v1/actors";
      const method = isEdit ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

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
    <main style={{ padding: "1.5rem" }}>
      <h1>{isEdit ? "Editar actor" : "Crear actor"}</h1>
      <section style={card}>
        {loading && <p>Cargando...</p>}
        {error && <p style={{ color: "#ba1b1b" }}>{error}</p>}

        {!loading && (
          <form onSubmit={onSubmit} style={formGrid}>
            <input
              style={input}
              placeholder="Nombre"
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              required
            />
            <input
              style={input}
              placeholder="Foto URL"
              value={form.photo}
              onChange={(e) => onChange("photo", e.target.value)}
              required
            />
            <input
              style={input}
              placeholder="Nacionalidad"
              value={form.nationality}
              onChange={(e) => onChange("nationality", e.target.value)}
              required
            />
            <input
              style={input}
              type="date"
              value={form.birthDate}
              onChange={(e) => onChange("birthDate", e.target.value)}
              required
            />
            <textarea
              style={{ ...input, gridColumn: "1 / -1" }}
              placeholder="Biografia"
              rows={3}
              value={form.biography}
              onChange={(e) => onChange("biography", e.target.value)}
              required
            />
            <div style={{ gridColumn: "1 / -1" }}>
              <button style={buttonPrimary} type="submit" disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </button>{" "}
              <Link to="/actors" style={buttonLight}>Volver</Link>
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
