import { NextResponse } from "next/server";
import { getIdentityApi } from "@/lib/identity-api";
import { ROLE_ENDPOINTS } from "@/lib/api/endpoints";

export async function GET(req: Request) {
  try {
    const api = getIdentityApi(req.headers.get("authorization"));
    const res = await api.get(ROLE_ENDPOINTS.LIST);
    return NextResponse.json(res.data);
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string }; status?: number } };
    return NextResponse.json([], { status: err?.response?.status || 500 });
  }
}

export async function POST(req: Request) {
  try {
    const api = getIdentityApi(req.headers.get("authorization"));
    const res = await api.post(ROLE_ENDPOINTS.CREATE, await req.json());
    return NextResponse.json(res.data, { status: 201 });
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string }; status?: number } };
    return NextResponse.json({ message: err?.response?.data?.message || "Error" }, { status: err?.response?.status || 500 });
  }
}
