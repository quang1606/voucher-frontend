import { NextResponse } from "next/server";
import { getIdentityApi } from "@/lib/identity-api";
import { AUTH_ENDPOINTS } from "@/lib/api/endpoints";

export async function POST(req: Request) {
  try {
    const api = getIdentityApi();
    const res = await api.post(AUTH_ENDPOINTS.ALLOWED_PAGES, await req.json());
    return NextResponse.json(res.data);
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string }; status?: number } };
    return NextResponse.json({ allowedPages: [] }, { status: err?.response?.status || 500 });
  }
}
