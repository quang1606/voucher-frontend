import { NextResponse } from "next/server";
import { getBackendApiWithRequestAuth } from "@/lib/backend-api";
import { CAMPAIGN_ENDPOINTS } from "@/lib/api/endpoints";

export async function GET(req: Request) {
  try {
    const backendApi = getBackendApiWithRequestAuth(req.headers.get("authorization"));
    const res = await backendApi.get(CAMPAIGN_ENDPOINTS.LIST, { params: Object.fromEntries(new URL(req.url).searchParams) });
    return NextResponse.json(res.data);
  } catch (e: unknown) { const err = e as { response?: { data?: { message?: string }; status?: number } }; return NextResponse.json({ message: err?.response?.data?.message || "Error" }, { status: err?.response?.status || 500 }); }
}

export async function POST(req: Request) {
  try {
    const backendApi = getBackendApiWithRequestAuth(req.headers.get("authorization"));
    const res = await backendApi.post(CAMPAIGN_ENDPOINTS.CREATE, await req.json());
    return NextResponse.json(res.data);
  } catch (e: unknown) { const err = e as { response?: { data?: { message?: string }; status?: number } }; return NextResponse.json({ message: err?.response?.data?.message || "Error" }, { status: err?.response?.status || 500 }); }
}
