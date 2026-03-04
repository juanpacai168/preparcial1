"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Actor = {
  id: string;
  name: string;
  photo: string;
  nationality: string;
  birthday: string;
  biography: string;
};

export type ActorInput = Omit<Actor, "id">;

type ActorsContextValue = {
  actores: Actor[];
  cargando: boolean;
  error: string | null;
  crearActor: (input: ActorInput) => Promise<boolean>;
  actualizarActor: (id: string, input: ActorInput) => Promise<boolean>;
  eliminarActor: (id: string) => Promise<boolean>;
};

const ActorsContext = createContext<ActorsContextValue | null>(null);

function mapActor(raw: Record<string, unknown>): Actor {
  return {
    id: String(raw.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    name: String(raw.name ?? ""),
    photo: String(raw.photo ?? ""),
    nationality: String(raw.nationality ?? ""),
    birthday: String(raw.birthday ?? raw.birthDate ?? "").slice(0, 10),
    biography: String(raw.biography ?? ""),
  };
}

function toPayload(input: ActorInput) {
  return {
    name: input.name,
    photo: input.photo,
    nationality: input.nationality,
    birthDate: input.birthday,
    birthday: input.birthday,
    biography: input.biography,
  };
}

export function ActorsProvider({ children }: { children: ReactNode }) {
  const [actores, setActores] = useState<Actor[]>([]);
  const [cargando, setCargando] = useState(true);
  const error = null;

  useEffect(() => {
    async function cargarActores() {
      const response = await fetch("/api/v1/actors");
      const data = (await response.json()) as Record<string, unknown>[];
      setActores(data.map(mapActor));
      setCargando(false);
    }

    cargarActores();
  }, []);

  async function crearActor(input: ActorInput) {
    const response = await fetch("/api/v1/actors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toPayload(input)),
    });
    const data = (await response.json()) as Record<string, unknown>;
    setActores((listaAnterior) => [...listaAnterior, mapActor(data)]);
    return true;
  }

  async function actualizarActor(id: string, input: ActorInput) {
    const response = await fetch(`/api/v1/actors/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(toPayload(input)),
    });
    const data = (await response.json()) as Record<string, unknown>;
    setActores((listaAnterior) =>
      listaAnterior.map((actor) => (actor.id === id ? mapActor(data) : actor)),
    );
    return true;
  }

  async function eliminarActor(id: string) {
    await fetch(`/api/v1/actors/${id}`, { method: "DELETE" });
    setActores((listaAnterior) => listaAnterior.filter((actor) => actor.id !== id));
    return true;
  }

  return (
    <ActorsContext.Provider
      value={{
        actores,
        cargando,
        error,
        crearActor,
        actualizarActor,
        eliminarActor,
      }}
    >
      {children}
    </ActorsContext.Provider>
  );
}

export function useActors() {
  const context = useContext(ActorsContext);
  if (!context) {
    throw new Error("useActors debe usarse dentro de ActorsProvider");
  }
  return context;
}
