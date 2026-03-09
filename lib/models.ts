export type Movie = {
  id: string;
  title: string;
  poster: string;
  duration: number;
  country: string;
  releaseDate: Date;
  popularity: number;
  actorId: string;
};

export type Actor = {
  id: string;
  name: string;
  photo: string;
  nationality: string;
  birthDate: Date;
  biography: string;
  movies: Movie[];
};

export type ActorInput = {
  name: string;
  photo: string;
  nationality: string;
  birthDate: string | Date;
  biography: string;
};

export type MovieInput = {
  title: string;
  poster: string;
  duration: number;
  country: string;
  releaseDate: string | Date;
  popularity: number;
  actorId: string;
};
