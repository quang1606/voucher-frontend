import { NextResponse } from "next/server";
import { getBackendApiWithRequestAuth } from "@/lib/backend-api";
import { VOUCHER_ENDPOINTS } from "@/lib/api/endpoints";

export async function GET(req: Request) {
  try {
    const params = Object.fromEntries(new URL(req.url).searchParams);
    const api = getBackendApiWithRequestAuth(req.headers.get("authorization"));
    const res = await api.get(VOUCHER_ENDPOINTS.DETAILS, { params });
    return NextResponse.json(res.data);
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string }; status?: number } };
    return NextResponse.json({ message: err?.response?.data?.message || "Error" }, { status: err?.response?.status || 500 });
  }
}
