import { NextResponse } from "next/server";
import { getIdentityApi } from "@/lib/identity-api";
import { AUTH_ENDPOINTS } from "@/lib/api/endpoints";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[AUTH] Login request to Identity Service:", process.env.IDENTITY_SERVICE_URL + AUTH_ENDPOINTS.LOGIN);
    const api = getIdentityApi();
    const res = await api.post(AUTH_ENDPOINTS.LOGIN, body);
    return NextResponse.json(res.data);
  } catch (e: unknown) {
    console.log("[AUTH] Login error:", e instanceof Error ? e.message : e);
    const err = e as { response?: { data?: { message?: string; status?: number }; status?: number }; code?: string };
    if (err.code === "ECONNREFUSED") {
      return NextResponse.json({ message: "Không thể kết nối Identity Service" }, { status: 503 });
    }
    return NextResponse.json(
      { message: err?.response?.data?.message || "Đăng nhập thất bại" },
      { status: err?.response?.status || 500 }
    );
  }
}
