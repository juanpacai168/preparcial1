"use client";

import dynamic from "next/dynamic";

const RouterApp = dynamic(() => import("./router-app"), {
  ssr: false,
  loading: () => <main style={{ padding: "1.5rem" }}>Cargando...</main>,
});

export default function RouterHost() {
  return <RouterApp />;
}
