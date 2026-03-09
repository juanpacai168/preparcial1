"use client";

import { Link, useLocation } from "react-router-dom";
import { useI18n } from "./i18n";

export function AppShell({
  title,
  intro,
  actions,
  children,
}: {
  title: string;
  intro?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { language, setLanguage, t } = useI18n();
  const location = useLocation();

  return (
    <>
      <a className="skip-link" href="#main-content">
        {t("skipToContent")}
      </a>
      <div className="container-xxl py-3 py-lg-4">
        <header className="card border-0 shadow-sm app-surface mb-4">
          <div className="card-body p-3 p-lg-4">
            <div className="d-flex flex-column flex-xl-row justify-content-between gap-3">
              <div>
                <p className="app-eyebrow mb-2">{t("dashboard")}</p>
                <h1 className="h2 mb-1">{t("appTitle")}</h1>
                <p className="text-secondary mb-0">{t("appSubtitle")}</p>
              </div>

              <div className="d-flex flex-column align-items-xl-end gap-3">
                <nav className="d-flex flex-wrap gap-2" aria-label="Primary">
                  <Link
                    className={`btn ${location.pathname.startsWith("/movies") ? "btn-primary" : "btn-outline-primary"}`}
                    to="/movies"
                  >
                    {t("movies")}
                  </Link>
                  <Link
                    className={`btn ${location.pathname.startsWith("/actors") ? "btn-primary" : "btn-outline-primary"}`}
                    to="/actors"
                  >
                    {t("actors")}
                  </Link>
                  <Link
                    className={`btn ${location.pathname.startsWith("/prizes") ? "btn-primary" : "btn-outline-primary"}`}
                    to="/prizes/new"
                  >
                    {t("newPrize")}
                  </Link>
                </nav>

                <fieldset className="d-flex flex-wrap align-items-center gap-2 border-0 p-0 m-0">
                  <legend className="small fw-semibold mb-0 me-2">{t("language")}</legend>
                  <button
                    type="button"
                    className={`btn btn-sm ${language === "es" ? "btn-dark" : "btn-outline-dark"}`}
                    aria-pressed={language === "es"}
                    onClick={() => setLanguage("es")}
                  >
                    ES
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${language === "en" ? "btn-dark" : "btn-outline-dark"}`}
                    aria-pressed={language === "en"}
                    onClick={() => setLanguage("en")}
                  >
                    EN
                  </button>
                </fieldset>
              </div>
            </div>
          </div>
        </header>

        <main id="main-content">
          <section className="card border-0 shadow-sm app-surface mb-4">
            <div className="card-body p-3 p-lg-4 d-flex flex-column flex-lg-row justify-content-between align-items-lg-end gap-3">
              <div>
                <p className="app-eyebrow mb-2">{t("appTitle")}</p>
                <h2 className="h3 mb-2">{title}</h2>
                {intro ? <p className="text-secondary mb-0">{intro}</p> : null}
              </div>
              {actions ? <div className="d-flex flex-wrap gap-2">{actions}</div> : null}
            </div>
          </section>
          {children}
        </main>
      </div>
    </>
  );
}

export function StatusMessage({
  type,
  children,
}: {
  type: "error" | "success" | "info";
  children: React.ReactNode;
}) {
  const role = type === "error" ? "alert" : "status";
  const className =
    type === "error" ? "alert alert-danger" : type === "success" ? "alert alert-success" : "alert alert-info";
  return (
    <div className={className} role={role} aria-live="polite">
      {children}
    </div>
  );
}
