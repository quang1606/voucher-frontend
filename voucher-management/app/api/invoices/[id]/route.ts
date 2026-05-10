import { NextResponse } from "next/server";
import { getBackendApiWithRequestAuth } from "@/lib/backend-api";
import { INVOICE_ENDPOINTS } from "@/lib/api/endpoints";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const api = getBackendApiWithRequestAuth(req.headers.get("authorization"));
    const res = await api.get(INVOICE_ENDPOINTS.DETAIL(id));
    return NextResponse.json(res.data);
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string }; status?: number } };
    return NextResponse.json({ message: err?.response?.data?.message || "Error" }, { status: err?.response?.status || 500 });
  }
}
