"use client";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ActorsPage from "./actors-page";
import ActorFormPage from "./actor-form-page";
import ActorDetailPage from "./actor-detail-page";
import MoviesPage from "./movies-page";
import MovieFormPage from "./movie-form-page";

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/actors" replace />} />
        <Route path="/actors" element={<ActorsPage />} />
        <Route path="/actors/new" element={<ActorFormPage />} />
        <Route path="/actors/:actorId" element={<ActorDetailPage />} />
        <Route path="/actors/:actorId/edit" element={<ActorFormPage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/movies/new" element={<MovieFormPage />} />
        <Route path="/movies/:movieId/edit" element={<MovieFormPage />} />
        <Route path="/crear" element={<Navigate to="/actors/new" replace />} />
        <Route path="/actors/:actorId/editar" element={<ActorFormPage />} />
        <Route path="*" element={<Navigate to="/actors" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
