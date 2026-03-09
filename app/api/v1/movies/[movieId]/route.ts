import { NextResponse } from "next/server";

const BACKEND_BASE_URL =
  process.env.BACKEND_API_BASE_URL ?? "http://localhost:3000/api/v1";

const getUrl = (movieId: string) => `${BACKEND_BASE_URL}/movies/${movieId}`;
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

type Params = { params: Promise<{ movieId: string }> };

export async function GET(
  _: Request,
  { params }: Params,
) {
  try {
    const { movieId } = await params;
    const response = await fetch(getUrl(movieId), {
      cache: "no-store",
    });
    return forwardResponse(response);
  } catch {
    return NextResponse.json(
      { message: "No fue posible cargar la pelicula." },
      { status: 503 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: Params,
) {
  try {
    const { movieId } = await params;
    const payload = await request.json();
    const response = await fetch(getUrl(movieId), {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    return forwardResponse(response);
  } catch {
    return NextResponse.json(
      { message: "No fue posible actualizar la pelicula." },
      { status: 503 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: Params,
) {
  try {
    const { movieId } = await params;
    const payload = await request.json();
    const response = await fetch(getUrl(movieId), {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    return forwardResponse(response);
  } catch {
    return NextResponse.json(
      { message: "No fue posible actualizar la pelicula." },
      { status: 503 },
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: Params,
) {
  try {
    const { movieId } = await params;
    const currentResponse = await fetch(getUrl(movieId), {
      cache: "no-store",
    });

    if (!currentResponse.ok) {
      return forwardResponse(currentResponse);
    }

    const current = (await currentResponse.json()) as Record<string, unknown>;
    const normalized = {
      ...current,
      actors: [],
      platforms: [],
      reviews: [],
    };

    const detachResponse = await fetch(getUrl(movieId), {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(normalized),
    });

    if (!detachResponse.ok) {
      return forwardResponse(detachResponse);
    }

    const response = await fetch(getUrl(movieId), {
      method: "DELETE",
    });
    return forwardResponse(response);
  } catch {
    return NextResponse.json(
      { message: "No fue posible eliminar la pelicula." },
      { status: 503 },
    );
  }
}
