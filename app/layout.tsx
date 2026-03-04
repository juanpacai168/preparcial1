import type { Metadata } from "next";
import "./globals.css";
import { ActorsProvider } from "./actor";

export const metadata: Metadata = {
  title: "Preparcial 1",
  description: "Listado y creacion de actores",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <ActorsProvider>{children}</ActorsProvider>
      </body>
    </html>
  );
}
