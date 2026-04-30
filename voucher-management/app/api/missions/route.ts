import { NextResponse } from "next/server";
import { getBackendApiWithRequestAuth } from "@/lib/backend-api";
import { MISSION_ENDPOINTS } from "@/lib/api/endpoints";

export async function POST(req: Request) {
  try {
    const api = getBackendApiWithRequestAuth(req.headers.get("authorization"));
    const res = await api.post(MISSION_ENDPOINTS.CREATE, await req.json());
    return NextResponse.json(res.data, { status: 201 });
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string }; status?: number } };
    return NextResponse.json({ message: err?.response?.data?.message || "Error" }, { status: err?.response?.status || 500 });
  }
}
