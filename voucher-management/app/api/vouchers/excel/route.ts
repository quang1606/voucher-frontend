import { NextResponse } from "next/server";
import { VOUCHER_ENDPOINTS } from "@/lib/api/endpoints";

export async function POST(req: Request) {
  try {
    const incomingForm = await req.formData();
    const file = incomingForm.get("file") as File | null;
    const discountType = incomingForm.get("discountType") as string;
    const requestId = incomingForm.get("requestId") as string;
    const authHeader = req.headers.get("authorization");
    const url = `${process.env.PARTNER_GW_URL}${VOUCHER_ENDPOINTS.EXCEL}`;

    if (!file) {
      return NextResponse.json({ message: "File is required" }, { status: 400 });
    }

    console.log("[VOUCHER-EXCEL] file:", file.name, "size:", file.size, "type:", file.type);
    console.log("[VOUCHER-EXCEL] discountType:", discountType, "requestId:", requestId);
    console.log("[VOUCHER-EXCEL] Uploading to:", url);

    // Tạo FormData mới với file buffer để đảm bảo binary content đúng
    const bytes = await file.arrayBuffer();
    const blob = new Blob([bytes], { type: file.type || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    const forwardForm = new FormData();
    forwardForm.append("file", blob, file.name);
    forwardForm.append("discountType", discountType);
    forwardForm.append("requestId", requestId);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: forwardForm,
    });

    const data = await res.json();
    if (!res.ok) {
      console.log("[VOUCHER-EXCEL] BE error:", res.status, data);
      return NextResponse.json(data, { status: res.status });
    }
    return NextResponse.json(data);
  } catch (e: unknown) {
    console.log("[VOUCHER-EXCEL] Exception:", e);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
