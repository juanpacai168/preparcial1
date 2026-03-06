import { NextResponse } from "next/server";

const BACKEND_BASE_URL =
  process.env.BACKEND_API_BASE_URL ?? "http://localhost:3000/api/v1";

const getUrl = (id: string) => `${BACKEND_BASE_URL}/actors/${id}`;
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

type Params = { params: Promise<{ id: string }> };

export async function GET(
  _: Request,
  { params }: Params,
) {
  try {
    const { id } = await params;
    const response = await fetch(getUrl(id), {
      cache: "no-store",
    });
    return forwardResponse(response);
  } catch {
    return NextResponse.json(
      { message: "No fue posible cargar el actor." },
      { status: 503 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: Params,
) {
  try {
    const { id } = await params;
    const payload = await request.json();
    const response = await fetch(getUrl(id), {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    return forwardResponse(response);
  } catch {
    return NextResponse.json(
      { message: "No fue posible actualizar el actor." },
      { status: 503 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: Params,
) {
  try {
    const { id } = await params;
    const payload = await request.json();
    const response = await fetch(getUrl(id), {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    return forwardResponse(response);
  } catch {
    return NextResponse.json(
      { message: "No fue posible actualizar el actor." },
      { status: 503 },
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: Params,
) {
  try {
    const { id } = await params;
    const response = await fetch(getUrl(id), {
      method: "DELETE",
    });
    return forwardResponse(response);
  } catch {
    return NextResponse.json(
      { message: "No fue posible eliminar el actor." },
      { status: 503 },
    );
  }
}
