import { NextResponse } from "next/server";
import { getIdentityApi } from "@/lib/identity-api";
import { ROLE_ENDPOINTS } from "@/lib/api/endpoints";

export async function PUT(req: Request, { params }: { params: Promise<{ roleName: string }> }) {
  try {
    const { roleName } = await params;
    const api = getIdentityApi(req.headers.get("authorization"));
    const res = await api.put(ROLE_ENDPOINTS.ATTRIBUTES(roleName), await req.json());
    return NextResponse.json(res.data);
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string }; status?: number } };
    return NextResponse.json({ message: err?.response?.data?.message || "Error" }, { status: err?.response?.status || 500 });
  }
}
