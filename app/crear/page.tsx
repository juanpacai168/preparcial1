"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Link from "next/link";
import { useActors } from "../actors-store";

export default function CrearPage() {
  const { addActor } = useActors();

  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [nationality, setNationality] = useState("");
  const [birthday, setBirthday] = useState("");
  const [biography, setBiography] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    const wasCreated = await addActor({
      name,
      photo,
      nationality,
      birthday,
      biography,
    });

    if (wasCreated) {
      setName("");
      setPhoto("");
      setNationality("");
      setBirthday("");
      setBiography("");
      setMessage("Actor creado y agregado a la lista.");
    } else {
      setMessage("No fue posible crear el actor.");
    }
    setIsSubmitting(false);
  };

  return (
    <main style={{ padding: "1.5rem" }}>
      <h1>Formulario de creacion de actor</h1>
      <p>
        <Link href="/actors">Ir a Lista de Actores</Link>
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "grid", gap: "0.5rem", maxWidth: "560px" }}
      >
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Nombre"
          required
        />
        <input
          type="text"
          value={photo}
          onChange={(event) => setPhoto(event.target.value)}
          placeholder="Foto URL"
          required
        />
        <input
          type="text"
          value={nationality}
          onChange={(event) => setNationality(event.target.value)}
          placeholder="Nacionalidad"
          required
        />
        <input
          type="date"
          value={birthday}
          onChange={(event) => setBirthday(event.target.value)}
          required
        />
        <textarea
          value={biography}
          onChange={(event) => setBiography(event.target.value)}
          placeholder="Biografia"
          rows={4}
          required
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Crear Actor"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
