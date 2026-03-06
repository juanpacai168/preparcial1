"use client";

export type Movie = {
  id: string;
  title: string;
  poster: string;
  duration: number;
  country: string;
  releaseDate: string;
  popularity: number;
  actorId: string;
};

export type Actor = {
  id: string;
  name: string;
  photo: string;
  nationality: string;
  birthDate: string;
  biography: string;
  movies: Movie[];
};

export function mapMovie(raw: Record<string, unknown>): Movie {
  const actors = Array.isArray(raw.actors)
    ? (raw.actors as Record<string, unknown>[])
    : [];
  const firstActorId = actors.length > 0 ? String(actors[0].id ?? "") : "";

  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    poster: String(raw.poster ?? ""),
    duration: Number(raw.duration ?? 0),
    country: String(raw.country ?? ""),
    releaseDate: String(raw.releaseDate ?? "").slice(0, 10),
    popularity: Number(raw.popularity ?? 0),
    actorId: String(raw.actorId ?? firstActorId),
  };
}

export function mapActor(raw: Record<string, unknown>): Actor {
  const movieRows = Array.isArray(raw.movies)
    ? (raw.movies as Record<string, unknown>[])
    : [];

  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    photo: String(raw.photo ?? ""),
    nationality: String(raw.nationality ?? ""),
    birthDate: String(raw.birthDate ?? raw.birthday ?? "").slice(0, 10),
    biography: String(raw.biography ?? ""),
    movies: movieRows.map(mapMovie),
  };
}
