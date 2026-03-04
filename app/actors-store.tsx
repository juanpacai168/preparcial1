"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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
  actors: Actor[];
  loading: boolean;
  error: string | null;
  addActor: (input: ActorInput) => Promise<boolean>;
  updateActor: (id: string, input: ActorInput) => Promise<boolean>;
  deleteActor: (id: string) => Promise<boolean>;
};

const ActorsContext = createContext<ActorsContextValue | null>(null);

const createLocalId = () =>
  `local-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const normalizeActor = (raw: Record<string, unknown>): Actor => ({
  id: String(raw.id ?? createLocalId()),
  name: String(raw.name ?? ""),
  photo: String(raw.photo ?? ""),
  nationality: String(raw.nationality ?? ""),
  birthday: String(raw.birthday ?? raw.birthDate ?? ""),
  biography: String(raw.biography ?? ""),
});

const parseJsonObject = async (
  response: Response,
): Promise<Record<string, unknown> | null> => {
  const rawBody = await response.text();
  if (!rawBody) return null;
  try {
    return JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return null;
  }
};

export function ActorsProvider({ children }: { children: ReactNode }) {
  const [actors, setActors] = useState<Actor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/actors")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Error ${response.status} al consultar actores`);
        }
        const data = (await response.json()) as Record<string, unknown>[];
        setActors(data.map(normalizeActor));
      })
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "No fue posible cargar actores",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const value = useMemo<ActorsContextValue>(
    () => ({
      actors,
      loading,
      error,
      addActor: (input) => {
        return fetch("/api/v1/actors", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
        })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(`Error ${response.status} al crear actor`);
            }
            const data = await parseJsonObject(response);
            setActors((prev) => {
              const actor = data
                ? normalizeActor(data)
                : { id: createLocalId(), ...input };
              return [...prev, actor];
            });
            setError(null);
            return true;
          })
          .catch((err: unknown) => {
            setError(
              err instanceof Error ? err.message : "No fue posible crear actor",
            );
            return false;
          });
      },
      updateActor: (id, input) => {
        return fetch(`/api/v1/actors/${id}`, {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
        })
          .then(async (response) => {
            if (!response.ok) {
              throw new Error(`Error ${response.status} al actualizar actor`);
            }
            const data = await parseJsonObject(response);
            const updated = data ? normalizeActor(data) : { id, ...input };
            setActors((prev) =>
              prev.map((actor) => (actor.id === id ? updated : actor)),
            );
            setError(null);
            return true;
          })
          .catch((err: unknown) => {
            setError(
              err instanceof Error
                ? err.message
                : "No fue posible actualizar actor",
            );
            return false;
          });
      },
      deleteActor: (id) => {
        return fetch(`/api/v1/actors/${id}`, {
          method: "DELETE",
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Error ${response.status} al eliminar actor`);
            }
            setActors((prev) => prev.filter((actor) => actor.id !== id));
            setError(null);
            return true;
          })
          .catch((err: unknown) => {
            setError(
              err instanceof Error ? err.message : "No fue posible eliminar actor",
            );
            return false;
          });
      },
    }),
    [actors, loading, error],
  );

  return (
    <ActorsContext.Provider value={value}>{children}</ActorsContext.Provider>
  );
}

export function useActors() {
  const context = useContext(ActorsContext);
  if (!context) {
    throw new Error("useActors debe usarse dentro de ActorsProvider");
  }
  return context;
}
