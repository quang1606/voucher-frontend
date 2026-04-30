import { NextResponse } from "next/server";
import { getBackendApiWithRequestAuth } from "@/lib/backend-api";
import { MISSION_ENDPOINTS } from "@/lib/api/endpoints";

export async function GET(req: Request) {
  try {
    const params = Object.fromEntries(new URL(req.url).searchParams);
    const api = getBackendApiWithRequestAuth(req.headers.get("authorization"));
    console.log("[MISSION-SEARCH] URL:", process.env.PARTNER_GW_URL + MISSION_ENDPOINTS.SEARCH, "params:", params);
    const res = await api.get(MISSION_ENDPOINTS.SEARCH, { params });
    return NextResponse.json(res.data);
  } catch (e: unknown) {
    console.log("[MISSION-SEARCH] Error:", (e as { message?: string })?.message, (e as { response?: { status?: number; data?: unknown } })?.response?.data);
    const err = e as { response?: { data?: { message?: string }; status?: number } };
    return NextResponse.json({ message: err?.response?.data?.message || "Error" }, { status: err?.response?.status || 500 });
  }
}
