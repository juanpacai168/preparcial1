import { Actor, ActorInput, Movie, MovieInput } from "./models";

type ActorRecord = Omit<Actor, "movies">;
type MovieRecord = Movie;

type DataStore = {
  actors: ActorRecord[];
  movies: MovieRecord[];
};

declare global {
  var __actors_movies_store__: DataStore | undefined;
}

const parseDate = (value: string | Date, field: string): Date => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`El campo ${field} no tiene una fecha valida.`);
  }
  return date;
};

const validateUrl = (value: string, field: string) => {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error();
    }
  } catch {
    throw new Error(`El campo ${field} debe ser una URL valida.`);
  }
};

const validateNumber = (value: unknown, field: string, min = 0) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n < min) {
    throw new Error(`El campo ${field} debe ser un numero mayor o igual a ${min}.`);
  }
  return n;
};

const createId = (prefix: "actor" | "movie") =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

const seed = (): DataStore => {
  const actorA: ActorRecord = {
    id: "actor_1",
    name: "Ana Torres",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    nationality: "Colombiana",
    birthDate: new Date("1989-06-14"),
    biography: "Actriz reconocida por dramas y series de television.",
  };

  const actorB: ActorRecord = {
    id: "actor_2",
    name: "David Rojas",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
    nationality: "Mexicano",
    birthDate: new Date("1982-01-22"),
    biography: "Actor de cine de accion y producciones internacionales.",
  };

  const movieA: MovieRecord = {
    id: "movie_1",
    title: "Horizonte Azul",
    poster: "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4",
    duration: 122,
    country: "Colombia",
    releaseDate: new Date("2020-09-01"),
    popularity: 78,
    actorId: "actor_1",
  };

  const movieB: MovieRecord = {
    id: "movie_2",
    title: "Ciudad de Sombras",
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba",
    duration: 108,
    country: "Mexico",
    releaseDate: new Date("2022-04-18"),
    popularity: 84,
    actorId: "actor_2",
  };

  return { actors: [actorA, actorB], movies: [movieA, movieB] };
};

const getStore = (): DataStore => {
  if (!globalThis.__actors_movies_store__) {
    globalThis.__actors_movies_store__ = seed();
  }
  return globalThis.__actors_movies_store__;
};

const actorResponse = (record: ActorRecord): Actor => {
  const store = getStore();
  return {
    ...record,
    movies: store.movies.filter((movie) => movie.actorId === record.id),
  };
};

export function listActors(): Actor[] {
  return getStore().actors.map(actorResponse);
}

export function getActorById(id: string): Actor | null {
  const record = getStore().actors.find((actor) => actor.id === id);
  return record ? actorResponse(record) : null;
}

export function createActor(input: ActorInput): Actor {
  const name = String(input.name ?? "").trim();
  const photo = String(input.photo ?? "").trim();
  const nationality = String(input.nationality ?? "").trim();
  const biography = String(input.biography ?? "").trim();
  const birthDate = parseDate(input.birthDate, "birthDate");

  if (!name || !nationality || !biography) {
    throw new Error("Los campos name, nationality y biography son obligatorios.");
  }
  validateUrl(photo, "photo");

  const newActor: ActorRecord = {
    id: createId("actor"),
    name,
    photo,
    nationality,
    birthDate,
    biography,
  };

  getStore().actors.push(newActor);
  return actorResponse(newActor);
}

export function updateActor(id: string, input: Partial<ActorInput>): Actor | null {
  const store = getStore();
  const index = store.actors.findIndex((actor) => actor.id === id);
  if (index < 0) return null;

  const current = store.actors[index];
  const next: ActorRecord = { ...current };

  if (input.name !== undefined) {
    const value = String(input.name).trim();
    if (!value) throw new Error("El campo name no puede estar vacio.");
    next.name = value;
  }
  if (input.photo !== undefined) {
    const value = String(input.photo).trim();
    validateUrl(value, "photo");
    next.photo = value;
  }
  if (input.nationality !== undefined) {
    const value = String(input.nationality).trim();
    if (!value) throw new Error("El campo nationality no puede estar vacio.");
    next.nationality = value;
  }
  if (input.biography !== undefined) {
    const value = String(input.biography).trim();
    if (!value) throw new Error("El campo biography no puede estar vacio.");
    next.biography = value;
  }
  if (input.birthDate !== undefined) {
    next.birthDate = parseDate(input.birthDate, "birthDate");
  }

  store.actors[index] = next;
  return actorResponse(next);
}

export function deleteActor(id: string): boolean {
  const store = getStore();
  const initial = store.actors.length;
  store.actors = store.actors.filter((actor) => actor.id !== id);
  if (store.actors.length === initial) return false;

  // Cascade delete: remove all movies belonging to deleted actor.
  store.movies = store.movies.filter((movie) => movie.actorId !== id);
  return true;
}

export function listMovies(actorId?: string): Movie[] {
  const all = getStore().movies;
  return actorId ? all.filter((movie) => movie.actorId === actorId) : all;
}

export function getMovieById(id: string): Movie | null {
  return getStore().movies.find((movie) => movie.id === id) ?? null;
}

export function createMovie(input: MovieInput): Movie {
  const title = String(input.title ?? "").trim();
  const poster = String(input.poster ?? "").trim();
  const country = String(input.country ?? "").trim();
  const actorId = String(input.actorId ?? "").trim();
  const duration = validateNumber(input.duration, "duration", 1);
  const popularity = validateNumber(input.popularity, "popularity", 0);
  const releaseDate = parseDate(input.releaseDate, "releaseDate");

  if (!title || !country || !actorId) {
    throw new Error("Los campos title, country y actorId son obligatorios.");
  }
  validateUrl(poster, "poster");

  const actorExists = getStore().actors.some((actor) => actor.id === actorId);
  if (!actorExists) {
    throw new Error("El actorId enviado no existe.");
  }

  const movie: Movie = {
    id: createId("movie"),
    title,
    poster,
    duration,
    country,
    releaseDate,
    popularity,
    actorId,
  };
  getStore().movies.push(movie);
  return movie;
}

export function updateMovie(id: string, input: Partial<MovieInput>): Movie | null {
  const store = getStore();
  const index = store.movies.findIndex((movie) => movie.id === id);
  if (index < 0) return null;

  const current = store.movies[index];
  const next: Movie = { ...current };

  if (input.title !== undefined) {
    const value = String(input.title).trim();
    if (!value) throw new Error("El campo title no puede estar vacio.");
    next.title = value;
  }
  if (input.poster !== undefined) {
    const value = String(input.poster).trim();
    validateUrl(value, "poster");
    next.poster = value;
  }
  if (input.country !== undefined) {
    const value = String(input.country).trim();
    if (!value) throw new Error("El campo country no puede estar vacio.");
    next.country = value;
  }
  if (input.duration !== undefined) {
    next.duration = validateNumber(input.duration, "duration", 1);
  }
  if (input.popularity !== undefined) {
    next.popularity = validateNumber(input.popularity, "popularity", 0);
  }
  if (input.releaseDate !== undefined) {
    next.releaseDate = parseDate(input.releaseDate, "releaseDate");
  }
  if (input.actorId !== undefined) {
    const value = String(input.actorId).trim();
    if (!value) throw new Error("El campo actorId no puede estar vacio.");
    const actorExists = store.actors.some((actor) => actor.id === value);
    if (!actorExists) throw new Error("El actorId enviado no existe.");
    next.actorId = value;
  }

  store.movies[index] = next;
  return next;
}

export function deleteMovie(id: string): boolean {
  const store = getStore();
  const initial = store.movies.length;
  store.movies = store.movies.filter((movie) => movie.id !== id);
  return store.movies.length < initial;
}
