import { NextResponse } from "next/server";
import { getBackendApiWithRequestAuth } from "@/lib/backend-api";
import { VOUCHER_ENDPOINTS } from "@/lib/api/endpoints";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const action = new URL(req.url).searchParams.get("action");
    const api = getBackendApiWithRequestAuth(req.headers.get("authorization"));
    const res = await api.put(`${VOUCHER_ENDPOINTS.CONFIRM(id)}?action=${action}`);
    return NextResponse.json(res.data);
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string }; status?: number } };
    return NextResponse.json({ message: err?.response?.data?.message || "Error" }, { status: err?.response?.status || 500 });
  }
}
