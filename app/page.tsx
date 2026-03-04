import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "1.5rem" }}>
      <h1>Aplicacion de Actores</h1>
      <p>Rutas principales del ejercicio:</p>
      <div style={{ display: "grid", gap: "0.5rem", maxWidth: "240px" }}>
        <Link href="/actors">/actors</Link>
        <Link href="/crear">/crear</Link>
      </div>
    </main>
  );
}
