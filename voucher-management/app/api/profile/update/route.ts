import { NextResponse } from "next/server";
import { getIdentityApi } from "@/lib/identity-api";
import { PROFILE_ENDPOINTS } from "@/lib/api/endpoints";

export async function PUT(req: Request) {
  try {
    const api = getIdentityApi(req.headers.get("authorization"));
    const body = await req.json();

    // Tách password change ra endpoint riêng
    if (body.newPassword) {
      const pwRes = await api.put(PROFILE_ENDPOINTS.PASSWORD, {
        currentPassword: body.currentPassword,
        newPassword: body.newPassword,
      });
      return NextResponse.json(pwRes.data);
    }

    const res = await api.put(PROFILE_ENDPOINTS.UPDATE, body);
    return NextResponse.json(res.data);
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string }; status?: number } };
    return NextResponse.json({ message: err?.response?.data?.message || "Error" }, { status: err?.response?.status || 500 });
  }
}
