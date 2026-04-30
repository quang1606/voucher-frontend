import { NextResponse } from "next/server";
import { getBackendApiWithRequestAuth } from "@/lib/backend-api";
import { MISSION_ENDPOINTS } from "@/lib/api/endpoints";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const api = getBackendApiWithRequestAuth(req.headers.get("authorization"));
    const res = await api.put(MISSION_ENDPOINTS.CONFIRM(id), body);
    return NextResponse.json(res.data);
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string }; status?: number } };
    return NextResponse.json({ message: err?.response?.data?.message || "Error" }, { status: err?.response?.status || 500 });
  }
}
