"use client";

import dynamic from "next/dynamic";
import { I18nProvider } from "./i18n";

const RouterApp = dynamic(() => import("./router-app"), {
  ssr: false,
  loading: () => <main className="route-loading">Cargando...</main>,
});

export default function RouterHost() {
  return (
    <I18nProvider>
      <RouterApp />
    </I18nProvider>
  );
}
