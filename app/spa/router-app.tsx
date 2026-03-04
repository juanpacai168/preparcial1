"use client";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ActorsPage from "./actors-page";
import CrearPage from "./crear-page";
import EditarPage from "./editar-page";

export default function RouterApp() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/actors" replace />} />
        <Route path="/actors" element={<ActorsPage />} />
        <Route path="/crear" element={<CrearPage />} />
        <Route path="/actors/:actorId/editar" element={<EditarPage />} />
        <Route path="*" element={<Navigate to="/actors" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
