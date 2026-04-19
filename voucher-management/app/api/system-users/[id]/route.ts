import { NextResponse } from "next/server";
import { getIdentityApi } from "@/lib/identity-api";
import { SYSTEM_USER_ENDPOINTS } from "@/lib/api/endpoints";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const api = getIdentityApi(req.headers.get("authorization"));
    const res = await api.put(SYSTEM_USER_ENDPOINTS.UPDATE(id), await req.json());
    return NextResponse.json(res.data);
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string }; status?: number } };
    return NextResponse.json({ message: err?.response?.data?.message || "Error" }, { status: err?.response?.status || 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const api = getIdentityApi(req.headers.get("authorization"));
    const res = await api.delete(SYSTEM_USER_ENDPOINTS.DELETE(id));
    return NextResponse.json(res.data);
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string }; status?: number } };
    return NextResponse.json({ message: err?.response?.data?.message || "Error" }, { status: err?.response?.status || 500 });
  }
}
