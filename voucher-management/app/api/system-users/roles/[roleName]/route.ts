import { NextResponse } from "next/server";
import { getIdentityApi } from "@/lib/identity-api";
import { ROLE_ENDPOINTS } from "@/lib/api/endpoints";

export async function GET(req: Request, { params }: { params: Promise<{ roleName: string }> }) {
  try {
    const { roleName } = await params;
    const api = getIdentityApi(req.headers.get("authorization"));
    const res = await api.get(ROLE_ENDPOINTS.GET(roleName));
    return NextResponse.json(res.data);
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string }; status?: number } };
    return NextResponse.json({ message: err?.response?.data?.message || "Error" }, { status: err?.response?.status || 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ roleName: string }> }) {
  try {
    const { roleName } = await params;
    const api = getIdentityApi(req.headers.get("authorization"));
    const res = await api.put(ROLE_ENDPOINTS.UPDATE(roleName), await req.json());
    return NextResponse.json(res.data);
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string }; status?: number } };
    return NextResponse.json({ message: err?.response?.data?.message || "Error" }, { status: err?.response?.status || 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ roleName: string }> }) {
  try {
    const { roleName } = await params;
    const api = getIdentityApi(req.headers.get("authorization"));
    const res = await api.delete(ROLE_ENDPOINTS.DELETE(roleName));
    return NextResponse.json(res.data);
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string }; status?: number } };
    return NextResponse.json({ message: err?.response?.data?.message || "Error" }, { status: err?.response?.status || 500 });
  }
}
