import { NextResponse } from "next/server";
import { getIdentityApi } from "@/lib/identity-api";
import { SYSTEM_USER_ENDPOINTS } from "@/lib/api/endpoints";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const api = getIdentityApi(req.headers.get("authorization"));
    const res = await api.post(SYSTEM_USER_ENDPOINTS.RESET_PASSWORD(id), await req.json());
    return NextResponse.json(res.data);
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string }; status?: number } };
    return NextResponse.json({ message: err?.response?.data?.message || "Error" }, { status: err?.response?.status || 500 });
  }
}
