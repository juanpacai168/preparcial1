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

type Params = { params: Promise<{ prizeId: string }> };

const getUrl = (prizeId: string) => `${BACKEND_BASE_URL}/prizes/${prizeId}`;

export async function GET(_: Request, { params }: Params) {
  try {
    const { prizeId } = await params;
    const response = await fetch(getUrl(prizeId), { cache: "no-store" });
    return forwardResponse(response);
  } catch {
    return NextResponse.json(
      { message: "No fue posible cargar el premio." },
      { status: 503 },
    );
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const payload = await request.json();
    const { prizeId } = await params;
    const response = await fetch(getUrl(prizeId), {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    return forwardResponse(response);
  } catch {
    return NextResponse.json(
      { message: "No fue posible actualizar el premio." },
      { status: 503 },
    );
  }
}
