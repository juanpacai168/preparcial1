"use client";

import { useEffect, useMemo, useState } from "react";
import MovieList from "./MovieList";
import ActorList from "./ActorList";
import AwardList from "./AwardList";

type Language = "es" | "en";

type MovieItem = {
  id: string;
  title: string;
  director: string;
  genre: string;
  rating: number;
  releaseDate: string;
  poster: string;
};

type ActorItem = {
  id: string;
  name: string;
  nationality: string;
  birthDate: string;
  biography: string;
  movieCount: number;
  photo: string;
};

type AwardItem = {
  id: string;
  name: string;
  category: string;
  year: number;
  movie: string;
  actor: string;
  status: "won" | "nominated";
};

const copy = {
  es: {
    title: "Archivo de cine",
    subtitle: "Una seleccion curada de peliculas, actores y premios con una presentacion clara, refinada y cinematografica.",
    movies: "Peliculas",
    actors: "Actores",
    awards: "Premios",
    moviesSub: "Coleccion curada",
    actorsSub: "Talento destacado",
    awardsSub: "Reconocimientos clave",
    movieLabel: "Film",
    won: "Ganado",
    nominated: "Nominado",
    language: "Idioma",
  },
  en: {
    title: "Cinema archive",
    subtitle: "A curated selection of movies, actors, and awards presented through a refined and cinematic layout.",
    movies: "Movies",
    actors: "Actors",
    awards: "Awards",
    moviesSub: "Curated collection",
    actorsSub: "Featured talent",
    awardsSub: "Key recognitions",
    movieLabel: "Film",
    won: "Won",
    nominated: "Nominated",
    language: "Language",
  },
} as const;

const normalizeMovie = (row: Record<string, unknown>): MovieItem => ({
  id: String(row.id ?? ""),
  title: String(row.title ?? ""),
  director: String((row.director as Record<string, unknown> | undefined)?.name ?? "Unknown"),
  genre: String((row.genre as Record<string, unknown> | undefined)?.type ?? "Unspecified"),
  rating: Number(row.popularity ?? 0),
  releaseDate: String(row.releaseDate ?? "").slice(0, 10),
  poster: String(row.poster ?? ""),
});

const normalizeActor = (row: Record<string, unknown>): ActorItem => ({
  id: String(row.id ?? ""),
  name: String(row.name ?? ""),
  nationality: String(row.nationality ?? ""),
  birthDate: String(row.birthDate ?? "").slice(0, 10),
  biography: String(row.biography ?? "").slice(0, 120),
  movieCount: Array.isArray(row.movies) ? row.movies.length : 0,
  photo: String(row.photo ?? ""),
});

export default function HomePage() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") return "es";
    const stored = window.localStorage.getItem("archive-language");
    return stored === "en" ? "en" : "es";
  });
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [actors, setActors] = useState<ActorItem[]>([]);
  const [awards, setAwards] = useState<AwardItem[]>([]);

  useEffect(() => {
    window.localStorage.setItem("archive-language", language);
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const load = async () => {
      try {
        const [moviesResponse, actorsResponse, prizesResponse] = await Promise.all([
          fetch("/api/v1/movies"),
          fetch("/api/v1/actors"),
          fetch("/api/v1/prizes"),
        ]);

        const movieRows = moviesResponse.ok ? ((await moviesResponse.json()) as Record<string, unknown>[]) : [];
        const actorRows = actorsResponse.ok ? ((await actorsResponse.json()) as Record<string, unknown>[]) : [];
        const prizeRows = prizesResponse.ok ? ((await prizesResponse.json()) as Record<string, unknown>[]) : [];

        if (movieRows.length > 0) {
          setMovies(movieRows.slice(0, 6).map(normalizeMovie));
        }

        if (actorRows.length > 0) {
          setActors(actorRows.slice(0, 6).map(normalizeActor));
        }

        const derivedAwards: AwardItem[] = [];
        const moviePrizeMap = new Map<string, { movie: string; actor: string }>();
        movieRows.forEach((movie) => {
          const movieTitle = String(movie.title ?? "");
          const actorName = Array.isArray(movie.actors) && movie.actors.length > 0
            ? String((movie.actors[0] as Record<string, unknown>).name ?? "")
            : "N/A";
          const prizes = Array.isArray(movie.prizes) ? (movie.prizes as Record<string, unknown>[]) : [];
          prizes.forEach((prize) => {
            moviePrizeMap.set(String(prize.id ?? ""), { movie: movieTitle, actor: actorName });
          });
        });

        prizeRows.forEach((prize) => {
          const id = String(prize.id ?? "");
          const relation = moviePrizeMap.get(id);
          derivedAwards.push({
            id,
            name: String(prize.name ?? ""),
            category: String(prize.category ?? ""),
            year: Number(prize.year ?? 0),
            movie: relation?.movie ?? "Not assigned",
            actor: relation?.actor ?? "N/A",
            status: String(prize.status ?? "nominated") === "won" ? "won" : "nominated",
          });
        });

        if (derivedAwards.length > 0) {
          setAwards(derivedAwards.slice(0, 6));
        }
      } catch {
        setMovies([]);
        setActors([]);
        setAwards([]);
      }
    };

    load();
  }, []);

  const text = useMemo(() => copy[language], [language]);

  return (
    <main className="archive-shell container-xxl py-4 py-lg-5">
      <header className="archive-header mx-auto mb-5">
        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-4">
          <div>
            <p className="archive-overline mb-2">Curated cinema collection</p>
            <h1 className="archive-main-title mb-3">{text.title}</h1>
            <p className="archive-lead mb-0">{text.subtitle}</p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="archive-language-label">{text.language}</span>
            <button
              type="button"
              className={`btn btn-sm ${language === "es" ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => setLanguage("es")}
              aria-pressed={language === "es"}
            >
              ES
            </button>
            <button
              type="button"
              className={`btn btn-sm ${language === "en" ? "btn-dark" : "btn-outline-dark"}`}
              onClick={() => setLanguage("en")}
              aria-pressed={language === "en"}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <div className="d-grid gap-4 gap-xl-5">
        <MovieList
          title={text.movies}
          subtitle={text.moviesSub}
          detailsLabel={text.movieLabel}
          items={movies}
        />
        <ActorList title={text.actors} subtitle={text.actorsSub} items={actors} />
        <AwardList
          title={text.awards}
          subtitle={text.awardsSub}
          statusWon={text.won}
          statusNominated={text.nominated}
          items={awards}
        />
      </div>
    </main>
  );
}
