import { NextResponse } from "next/server";
import { getIdentityApi } from "@/lib/identity-api";
import { PROFILE_ENDPOINTS } from "@/lib/api/endpoints";

export async function GET(req: Request) {
  try {
    const api = getIdentityApi(req.headers.get("authorization"));
    const res = await api.get(PROFILE_ENDPOINTS.GET);
    return NextResponse.json(res.data);
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string }; status?: number } };
    return NextResponse.json({ message: err?.response?.data?.message || "Error" }, { status: err?.response?.status || 500 });
  }
}
