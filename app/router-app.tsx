"use client";

import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ActorsView from "./views/actors-view";
import CrearView from "./views/crear-view";

export default function RouterApp() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/actors" replace />} />
        <Route path="/actors" element={<ActorsView />} />
        <Route path="/crear" element={<CrearView />} />
        <Route path="*" element={<Navigate to="/actors" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
