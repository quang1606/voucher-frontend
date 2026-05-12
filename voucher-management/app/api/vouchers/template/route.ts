import ExcelJS from "exceljs";

const COLUMNS = [
  { header: "Voucher Name", key: "voucherName", width: 30 },
  { header: "Description", key: "description", width: 45 },
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

const TIERS = ["ALL", "SILVER", "GOLD", "PLATINUM", "DIAMOND"];
const PURPOSES = ["HUNT"];

function randomEndDate(): string {
  const day = 13 + Math.floor(Math.random() * 5) + 1; // 14-18
  return `2026-05-${day < 10 ? "0" + day : day} 23:59:59`;
}

export async function GET(req: Request) {
  const type = new URL(req.url).searchParams.get("type") || "FIXED";
  const role = new URL(req.url).searchParams.get("role") || "";
  const isPartner = role === "PARTNER";

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Vouchers");
  sheet.columns = COLUMNS;

  for (let i = 1; i <= 30; i++) {
    const tier = TIERS[Math.floor(Math.random() * TIERS.length)];
    const purpose = PURPOSES[Math.floor(Math.random() * PURPOSES.length)];

    if (type === "FIXED") {
      const discountValue = [10000, 20000, 30000, 50000, 100000][Math.floor(Math.random() * 5)];
      const minOrder = discountValue * (2 + Math.floor(Math.random() * 3));
      sheet.addRow({
        voucherName: `Giam ${discountValue / 1000}K don ${minOrder / 1000}K - ${i}`,
        description: `Voucher giam ${discountValue / 1000}K cho don tu ${minOrder / 1000}K`,
        customerTier: isPartner ? "" : tier,
        voucherPurpose: purpose,
        discountType: "FIXED",
        discountValue,
        maxDiscount: "",
        minOrderValue: minOrder,
        totalStock: 50 + Math.floor(Math.random() * 950),
        maxCollect: Math.floor(Math.random() * 3) + 1,
        startDate: "2026-05-13 00:00:00",
        endDate: randomEndDate(),
      });
    } else {
      const discountValue = [5, 10, 15, 20, 30, 50][Math.floor(Math.random() * 6)];
      const maxDiscount = [50000, 100000, 150000, 200000, 500000][Math.floor(Math.random() * 5)];
      sheet.addRow({
        voucherName: `Giam ${discountValue}% toi da ${maxDiscount / 1000}K - ${i}`,
        description: `Voucher giam ${discountValue}% toi da ${maxDiscount / 1000}K`,
        customerTier: isPartner ? "" : tier,
        voucherPurpose: purpose,
        discountType: "PERCENT",
        discountValue,
        maxDiscount,
        minOrderValue: "",
        totalStock: 50 + Math.floor(Math.random() * 950),
        maxCollect: Math.floor(Math.random() * 3) + 1,
        startDate: "2026-05-13 00:00:00",
        endDate: randomEndDate(),
      });
    }
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
