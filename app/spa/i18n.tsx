"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Language = "es" | "en";

type Dictionary = Record<string, string>;

const dictionaries: Record<Language, Dictionary> = {
  es: {
    appTitle: "Arte7 Studio",
    appSubtitle: "Gestion accesible de peliculas, actores y premios",
    skipToContent: "Saltar al contenido principal",
    movies: "Peliculas",
    actors: "Actores",
    newPrize: "Nuevo premio",
    language: "Idioma",
    spanish: "Espanol",
    english: "English",
    loading: "Cargando...",
    back: "Volver",
    save: "Guardar",
    saving: "Guardando...",
    delete: "Eliminar",
    deleting: "Eliminando...",
    edit: "Editar",
    detail: "Detalle",
    create: "Crear",
    listEmpty: "No hay datos disponibles.",
    name: "Nombre",
    category: "Categoria",
    year: "Ano",
    status: "Estado",
    won: "Ganado",
    nominated: "Nominado",
    posterUrl: "URL del poster",
    country: "Pais",
    releaseDate: "Fecha de lanzamiento",
    duration: "Duracion",
    popularity: "Popularidad",
    genre: "Genero",
    director: "Director",
    trailer: "Trailer",
    actions: "Acciones",
    photoUrl: "URL de la foto",
    nationality: "Nacionalidad",
    birthDate: "Fecha de nacimiento",
    biography: "Biografia",
    title: "Titulo",
    moviesPageTitle: "Peliculas",
    moviesPageIntro: "Explora, crea y administra peliculas con una interfaz clara y rapida.",
    actorsPageTitle: "Actores",
    actorsPageIntro: "Consulta el reparto, edita perfiles y navega sus peliculas asociadas.",
    newMovie: "Nueva pelicula",
    newActor: "Nuevo actor",
    goToActors: "Ir a actores",
    goToMovies: "Ir a peliculas",
    premiere: "Estreno",
    mainAuthor: "Autor principal",
    prize: "Premio",
    noPrize: "Sin premio",
    noAuthor: "Sin autor",
    actorDetailTitle: "Detalle del actor",
    actorMovies: "Peliculas asociadas",
    noActorMovies: "No hay peliculas para este actor.",
    editActor: "Editar actor",
    actorCreatedMovie: "Nueva pelicula para este actor",
    actorFormCreateTitle: "Crear actor",
    actorFormEditTitle: "Editar actor",
    actorFormIntro: "Completa los datos principales del actor.",
    movieDetailTitle: "Detalle de la pelicula",
    createPrizeForMovie: "Crear premio",
    editPrize: "Editar premio",
    platforms: "Plataformas",
    prizes: "Premios",
    authorsActors: "Autores / actores",
    noAuthors: "No hay autores asociados.",
    movieFormCreateTitle: "Crear pelicula",
    movieFormEditTitle: "Editar pelicula",
    movieFormIntro: "Completa los datos principales y las relaciones obligatorias.",
    movieData: "Datos de la pelicula",
    requiredRelations: "Relaciones obligatorias",
    trailerData: "Datos del trailer",
    trailerName: "Nombre del trailer",
    trailerUrl: "URL del trailer",
    trailerDuration: "Duracion del trailer",
    trailerChannel: "Canal del trailer",
    existingTrailer: "Trailer existente",
    prizeFormCreateTitle: "Crear premio",
    prizeFormEditTitle: "Editar premio",
    prizeFormMovieTitle: "Crear premio para pelicula",
    prizeFormIntro: "Registra el premio y, si llegaste desde una pelicula, se asociara al guardar.",
    prizeName: "Nombre del premio",
    prizeStatus: "Estado del premio",
    updatePrize: "Actualizar premio",
    savePrize: "Guardar premio",
    dashboard: "Panel principal",
  },
  en: {
    appTitle: "Arte7 Studio",
    appSubtitle: "Accessible management for movies, actors, and awards",
    skipToContent: "Skip to main content",
    movies: "Movies",
    actors: "Actors",
    newPrize: "New award",
    language: "Language",
    spanish: "Spanish",
    english: "English",
    loading: "Loading...",
    back: "Back",
    save: "Save",
    saving: "Saving...",
    delete: "Delete",
    deleting: "Deleting...",
    edit: "Edit",
    detail: "Details",
    create: "Create",
    listEmpty: "No data available.",
    name: "Name",
    category: "Category",
    year: "Year",
    status: "Status",
    won: "Won",
    nominated: "Nominated",
    posterUrl: "Poster URL",
    country: "Country",
    releaseDate: "Release date",
    duration: "Duration",
    popularity: "Popularity",
    genre: "Genre",
    director: "Director",
    trailer: "Trailer",
    actions: "Actions",
    photoUrl: "Photo URL",
    nationality: "Nationality",
    birthDate: "Birth date",
    biography: "Biography",
    title: "Title",
    moviesPageTitle: "Movies",
    moviesPageIntro: "Browse, create, and manage movies through a clearer and faster interface.",
    actorsPageTitle: "Actors",
    actorsPageIntro: "Review cast members, edit profiles, and navigate their related movies.",
    newMovie: "New movie",
    newActor: "New actor",
    goToActors: "Go to actors",
    goToMovies: "Go to movies",
    premiere: "Release",
    mainAuthor: "Main author",
    prize: "Award",
    noPrize: "No award",
    noAuthor: "No author",
    actorDetailTitle: "Actor details",
    actorMovies: "Related movies",
    noActorMovies: "There are no movies for this actor.",
    editActor: "Edit actor",
    actorCreatedMovie: "New movie for this actor",
    actorFormCreateTitle: "Create actor",
    actorFormEditTitle: "Edit actor",
    actorFormIntro: "Complete the actor's main details.",
    movieDetailTitle: "Movie details",
    createPrizeForMovie: "Create award",
    editPrize: "Edit award",
    platforms: "Platforms",
    prizes: "Awards",
    authorsActors: "Authors / actors",
    noAuthors: "There are no linked authors.",
    movieFormCreateTitle: "Create movie",
    movieFormEditTitle: "Edit movie",
    movieFormIntro: "Complete the main fields and required relationships.",
    movieData: "Movie data",
    requiredRelations: "Required relationships",
    trailerData: "Trailer data",
    trailerName: "Trailer name",
    trailerUrl: "Trailer URL",
    trailerDuration: "Trailer duration",
    trailerChannel: "Trailer channel",
    existingTrailer: "Existing trailer",
    prizeFormCreateTitle: "Create award",
    prizeFormEditTitle: "Edit award",
    prizeFormMovieTitle: "Create award for movie",
    prizeFormIntro: "Register the award and, if you came from a movie, it will be linked on save.",
    prizeName: "Award name",
    prizeStatus: "Award status",
    updatePrize: "Update award",
    savePrize: "Save award",
    dashboard: "Main dashboard",
  },
};

type I18nValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") return "es";
    const stored = window.localStorage.getItem("arte7-language");
    return stored === "es" || stored === "en" ? stored : "es";
  });

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("arte7-language", language);
  }, [language]);

  const value = useMemo<I18nValue>(
    () => ({
      language,
      setLanguage,
      t: (key) => dictionaries[language][key] ?? key,
    }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}
