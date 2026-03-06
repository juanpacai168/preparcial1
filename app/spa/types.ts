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
  actors: PersonRef[];
  prizes: PrizeRef[];
  genreName: string;
  directorName: string;
  trailerUrl: string;
  platforms: PlatformRef[];
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

export type PersonRef = { id: string; name: string };
export type PrizeRef = { id: string; name: string };
export type PlatformRef = { id: string; name: string };

const asObjectArray = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value) ? (value as Record<string, unknown>[]) : [];

const mapPeople = (value: unknown): PersonRef[] =>
  asObjectArray(value).map((entry) => ({
    id: String(entry.id ?? ""),
    name: String(entry.name ?? entry.fullName ?? ""),
  }));

const mapPrizes = (value: unknown): PrizeRef[] =>
  asObjectArray(value).map((entry) => ({
    id: String(entry.id ?? ""),
    name: String(entry.name ?? entry.title ?? ""),
  }));

const mapPlatforms = (value: unknown): PlatformRef[] =>
  asObjectArray(value).map((entry) => ({
    id: String(entry.id ?? ""),
    name: String(entry.name ?? ""),
  }));

export function mapMovie(raw: Record<string, unknown>): Movie {
  const actors = mapPeople(raw.actors);
  const actorNode = raw.actor as Record<string, unknown> | undefined;
  if (actors.length === 0 && actorNode) {
    actors.push({
      id: String(actorNode.id ?? ""),
      name: String(actorNode.name ?? actorNode.fullName ?? ""),
    });
  }

  const prizes = mapPrizes(raw.prizes);
  const prizeNode = raw.prize as Record<string, unknown> | undefined;
  if (prizes.length === 0 && prizeNode) {
    prizes.push({
      id: String(prizeNode.id ?? ""),
      name: String(prizeNode.name ?? prizeNode.title ?? ""),
    });
  }

  const firstActorId = actors.length > 0
    ? String(actors[0].id ?? "")
    : String(raw.actorId ?? "");
  const genre = raw.genre as Record<string, unknown> | undefined;
  const director = raw.director as Record<string, unknown> | undefined;
  const trailer = raw.youtubeTrailer as Record<string, unknown> | undefined;

  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    poster: String(raw.poster ?? ""),
    duration: Number(raw.duration ?? 0),
    country: String(raw.country ?? ""),
    releaseDate: String(raw.releaseDate ?? "").slice(0, 10),
    popularity: Number(raw.popularity ?? 0),
    actorId: firstActorId,
    actors,
    prizes,
    genreName: String(genre?.type ?? genre?.name ?? ""),
    directorName: String(director?.name ?? ""),
    trailerUrl: String(trailer?.url ?? ""),
    platforms: mapPlatforms(raw.platforms),
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
