import { NextResponse } from "next/server";

const BACKEND_BASE_URL =
  process.env.BACKEND_API_BASE_URL ?? "http://localhost:3000/api/v1";
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

type Params = { params: Promise<{ movieId: string; prizeId: string }> };

const getUrl = (movieId: string, prizeId: string) =>
  `${BACKEND_BASE_URL}/movies/${movieId}/prizes/${prizeId}`;

export async function POST(
  _: Request,
  { params }: Params,
) {
  try {
    const { movieId, prizeId } = await params;
    const response = await fetch(getUrl(movieId, prizeId), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    return forwardResponse(response);
  } catch {
    return NextResponse.json(
      { message: "No fue posible asociar premio y pelicula." },
      { status: 503 },
    );
  }
}
