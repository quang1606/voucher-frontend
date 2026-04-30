import ExcelJS from "exceljs";

const COLUMNS = [
  { header: "Voucher Name", key: "voucherName", width: 25 },
  { header: "Description", key: "description", width: 40 },
  { header: "Customer Tier", key: "customerTier", width: 15 },
  { header: "Voucher Purpose", key: "voucherPurpose", width: 18 },
  { header: "Discount Type", key: "discountType", width: 15 },
  { header: "Discount Value", key: "discountValue", width: 15 },
  { header: "Max Discount", key: "maxDiscount", width: 15 },
  { header: "Min Order Value", key: "minOrderValue", width: 18 },
  { header: "Total Stock", key: "totalStock", width: 12 },
  { header: "Max Collect", key: "maxCollect", width: 12 },
  { header: "Start Date", key: "startDate", width: 22 },
  { header: "End Date", key: "endDate", width: 22 },
];

export async function GET(req: Request) {
  const type = new URL(req.url).searchParams.get("type") || "FIXED";

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Vouchers");
  sheet.columns = COLUMNS;

  if (type === "FIXED") {
    sheet.addRow({ voucherName: "Giam 50K don 200K", description: "Voucher giam 50K cho don tu 200K", customerTier: "ALL", voucherPurpose: "HUNT", discountType: "FIXED", discountValue: 50000, maxDiscount: "", minOrderValue: 200000, totalStock: 1000, maxCollect: 1, startDate: "2025-07-01 00:00:00", endDate: "2025-07-31 23:59:59" });
    sheet.addRow({ voucherName: "Giam 100K don 500K", description: "Voucher giam 100K cho don tu 500K", customerTier: "GOLD", voucherPurpose: "REWARD", discountType: "FIXED", discountValue: 100000, maxDiscount: "", minOrderValue: 500000, totalStock: 500, maxCollect: 2, startDate: "2025-07-01 00:00:00", endDate: "2025-07-31 23:59:59" });
  } else {
    sheet.addRow({ voucherName: "Giam 20% toi da 100K", description: "Voucher giam 20% toi da 100K", customerTier: "ALL", voucherPurpose: "HUNT", discountType: "PERCENT", discountValue: 20, maxDiscount: 100000, minOrderValue: "", totalStock: 1000, maxCollect: 1, startDate: "2025-07-01 00:00:00", endDate: "2025-07-31 23:59:59" });
    sheet.addRow({ voucherName: "Giam 50% toi da 200K", description: "Voucher giam 50% cho khach VIP", customerTier: "PLATINUM", voucherPurpose: "REWARD", discountType: "PERCENT", discountValue: 50, maxDiscount: 200000, minOrderValue: "", totalStock: 200, maxCollect: 1, startDate: "2025-07-01 00:00:00", endDate: "2025-07-31 23:59:59" });
  }

  sheet.getRow(1).font = { bold: true };
  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="voucher-template-${type.toLowerCase()}.xlsx"`,
    },
  });
}
