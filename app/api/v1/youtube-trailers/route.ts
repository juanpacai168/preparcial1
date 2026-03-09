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

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/youtube-trailers`, {
      cache: "no-store",
    });
    return forwardResponse(response);
  } catch {
    return NextResponse.json(
      { message: "No fue posible cargar trailers." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const response = await fetch(`${BACKEND_BASE_URL}/youtube-trailers`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    return forwardResponse(response);
  } catch {
    return NextResponse.json(
      { message: "No fue posible crear trailer." },
      { status: 503 },
    );
  }
}
