"use client";

import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

type FormData = {
  name: string;
  photo: string;
  nationality: string;
  birthday: string;
  biography: string;
};

const emptyForm: FormData = {
  name: "",
  photo: "",
  nationality: "",
  birthday: "",
  biography: "",
};

function mapActor(raw: Record<string, unknown>): FormData {
  return {
    name: String(raw.name ?? ""),
    photo: String(raw.photo ?? ""),
    nationality: String(raw.nationality ?? ""),
    birthday: String(raw.birthday ?? raw.birthDate ?? "").slice(0, 10),
    biography: String(raw.biography ?? ""),
  };
}

function toPayload(form: FormData) {
  return {
    name: form.name,
    photo: form.photo,
    nationality: form.nationality,
    birthDate: form.birthday,
    birthday: form.birthday,
    biography: form.biography,
  };
}

export default function EditarPage() {
  const navigate = useNavigate();
  const { actorId } = useParams<{ actorId: string }>();
  const [form, setForm] = useState<FormData>(emptyForm);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarActor() {
      if (!actorId) {
        setError("No se encontro el ID del actor.");
        setCargando(false);
        return;
      }

      try {
        const response = await fetch(`/api/v1/actors/${encodeURIComponent(actorId)}`);
        if (!response.ok) {
          throw new Error("No se pudo cargar el actor.");
        }
        const data = (await response.json()) as Record<string, unknown>;
        setForm(mapActor(data));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error de red al cargar actor.");
      } finally {
        setCargando(false);
      }
    }

    cargarActor();
  }, [actorId]);

  const onChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const guardar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!actorId) return;

    setGuardando(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/actors/${encodeURIComponent(actorId)}`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(toPayload(form)),
      });
      if (!response.ok) {
        throw new Error("No se pudo actualizar el actor.");
      }
      navigate("/actors");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de red al actualizar actor.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <main style={{ padding: "1.5rem" }}>
      <h1>Editar actor</h1>
      <section style={card}>
        {cargando && <p>Cargando actor...</p>}
        {error && <p style={{ color: "#ba1b1b" }}>{error}</p>}
        {!cargando && (
          <form onSubmit={guardar} style={formGrid}>
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
              value={form.birthday}
              onChange={(e) => onChange("birthday", e.target.value)}
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
              <button style={buttonPrimary} type="submit" disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>{" "}
              <Link to="/actors" style={buttonLight}>
                Cancelar
              </Link>
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
};
