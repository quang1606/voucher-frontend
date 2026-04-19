import { NextResponse } from "next/server";
import { getBackendApiWithRequestAuth } from "@/lib/backend-api";
import { VOUCHER_ENDPOINTS } from "@/lib/api/endpoints";

export async function GET(req: Request) {
  try {
    console.log("[VOUCHER] GET list, PARTNER_GW_URL:", process.env.PARTNER_GW_URL);
    const backendApi = getBackendApiWithRequestAuth(req.headers.get("authorization"));
    const res = await backendApi.get(VOUCHER_ENDPOINTS.LIST, { params: Object.fromEntries(new URL(req.url).searchParams) });
    return NextResponse.json(res.data);
  } catch (e: unknown) {
    console.log("[VOUCHER] GET error:", e instanceof Error ? e.message : e);
    const err = e as { response?: { data?: { message?: string }; status?: number } };
    return NextResponse.json({ message: err?.response?.data?.message || "Error" }, { status: err?.response?.status || 500 });
  }
}

export async function POST(req: Request) {
  try {
    console.log("[VOUCHER] POST create, PARTNER_GW_URL:", process.env.PARTNER_GW_URL);
    const backendApi = getBackendApiWithRequestAuth(req.headers.get("authorization"));
    const res = await backendApi.post(VOUCHER_ENDPOINTS.CREATE, await req.json());
    return NextResponse.json(res.data);
  } catch (e: unknown) {
    console.log("[VOUCHER] POST error:", e instanceof Error ? e.message : e);
    const err = e as { response?: { data?: { message?: string }; status?: number } };
    return NextResponse.json({ message: err?.response?.data?.message || "Error" }, { status: err?.response?.status || 500 });
  }
}
