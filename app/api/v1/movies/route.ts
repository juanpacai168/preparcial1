import { NextResponse } from "next/server";

const BACKEND_BASE_URL =
  process.env.BACKEND_API_BASE_URL ?? "http://localhost:3000/api/v1";

const getUrl = (path: string) => `${BACKEND_BASE_URL}${path}`;
const NO_BODY_STATUS = new Set([204, 205, 304]);

const forwardResponse = async (response: Response) => {
  if (NO_BODY_STATUS.has(response.status)) {
    return new NextResponse(null, { status: response.status });
  }

  const body = await response.text();
  return new NextResponse(body, {
    status: response.status,
    headers: {
      "content-type": response.headers.get("content-type") ?? "application/json",
    },
  });
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const actorId = searchParams.get("actorId");

    const response = await fetch(getUrl("/movies"), { cache: "no-store" });
    const rows = (await response.json()) as Record<string, unknown>[];

    if (!actorId) {
      return NextResponse.json(rows, { status: 200 });
    }

    const filtered = rows.filter((movie) => {
      if (String(movie.actorId ?? "") === actorId) return true;
      const actors = Array.isArray(movie.actors)
        ? (movie.actors as Record<string, unknown>[])
        : [];
      return actors.some((actor) => String(actor.id ?? "") === actorId);
    });

    return NextResponse.json(filtered, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "No fue posible conectar con el backend de peliculas." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const response = await fetch(getUrl("/movies"), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    return forwardResponse(response);
  } catch {
    return NextResponse.json(
      { message: "No fue posible crear la pelicula." },
      { status: 503 },
    );
  }
}
