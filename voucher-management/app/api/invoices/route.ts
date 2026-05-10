import { NextResponse } from "next/server";
import { getBackendApiWithRequestAuth } from "@/lib/backend-api";
import { INVOICE_ENDPOINTS } from "@/lib/api/endpoints";

export async function GET(req: Request) {
  try {
    const params = Object.fromEntries(new URL(req.url).searchParams);
    const api = getBackendApiWithRequestAuth(req.headers.get("authorization"));
    console.log("[INVOICES] GET", process.env.PARTNER_GW_URL + INVOICE_ENDPOINTS.LIST, params);
    const res = await api.get(INVOICE_ENDPOINTS.LIST, { params });
    return NextResponse.json(res.data);
  } catch (e: unknown) {
    const err = e as { response?: { data?: unknown; status?: number }; message?: string };
    console.log("[INVOICES] GET error:", err?.message, err?.response?.data);
    return NextResponse.json({ message: (err?.response?.data as { message?: string })?.message || "Error" }, { status: err?.response?.status || 500 });
  }
}

export async function POST(req: Request) {
  try {
    const api = getBackendApiWithRequestAuth(req.headers.get("authorization"));
    const body = await req.json();
    console.log("[INVOICES] POST", process.env.PARTNER_GW_URL + INVOICE_ENDPOINTS.CREATE, body);
    const res = await api.post(INVOICE_ENDPOINTS.CREATE, body);
    return NextResponse.json(res.data);
  } catch (e: unknown) {
    const err = e as { response?: { data?: unknown; status?: number }; message?: string };
    console.log("[INVOICES] POST error:", err?.message, err?.response?.data);
    return NextResponse.json({ message: (err?.response?.data as { message?: string })?.message || "Error" }, { status: err?.response?.status || 500 });
  }
}
