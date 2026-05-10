# Prompt: Tạo Customer Frontend App

## Mô tả
Tạo một ứng dụng Next.js (App Router) cho khách hàng (Customer) của hệ thống Voucher Loyalty. Ứng dụng giao tiếp với 2 backend service qua API Gateway.

## Tech Stack
- Next.js 15+ (App Router, "use client" cho interactive pages)
- TypeScript
- Tailwind CSS
- shadcn/ui components (Button, Input, Label, Badge, Card, Dialog, Select, Table, Tabs, Pagination, Toast)
- Zustand (state management cho auth)
- Axios (HTTP client với interceptor auto refresh token)
- Lucide React (icons)

## Kiến trúc

```
Browser → Next.js (BFF, port 3001)
            ├── /api/auth/**       → Identity Service (qua Gateway: http://localhost:8000/api/identity)
            ├── /api/profile/**    → Identity Service
            ├── /api/customers/**  → Customer Service (qua Gateway: http://localhost:8000/api/customers)
            ├── /api/vouchers/**   → Customer Service
            ├── /api/missions/**   → Customer Service
            ├── /api/leaderboard/* → Customer Service
            ├── /api/invoices/**   → Customer Service
            └── /api/payments/**   → Customer Service
```

## Cấu trúc thư mục

```
app/
  layout.tsx                    — Root layout (font, theme provider, toaster)
  page.tsx                      — Redirect to /login or /home
  login/page.tsx                — Trang đăng nhập
  register/page.tsx             — Trang đăng ký
  (main)/                       — Layout group cho authenticated pages
    layout.tsx                  — Main layout (header, bottom nav mobile, sidebar)
    home/page.tsx               — Trang chủ (profile summary, quick actions)
    vouchers/page.tsx           — Danh sách voucher khả dụng + voucher đã thu thập (2 tabs)
    missions/page.tsx           — Danh sách nhiệm vụ + tiến độ
    leaderboard/page.tsx        — Bảng xếp hạng
    invoices/page.tsx           — Danh sách hóa đơn
    payment/page.tsx            — Thanh toán (chọn hóa đơn, chọn voucher, xác nhận)
    profile/page.tsx            — Thông tin cá nhân + đổi mật khẩu
  api/
    auth/login/route.ts         — Proxy POST → Identity /api/v1/auth/login
    auth/register/route.ts      — Proxy POST → Identity /api/v1/auth/register
    auth/refresh/route.ts       — Proxy POST → Identity /api/v1/auth/refresh
    profile/route.ts            — Proxy GET/PUT → Identity /api/v1/profile
    profile/password/route.ts   — Proxy PUT → Identity /api/v1/profile/password
    customers/profile/[id]/route.ts  — Proxy GET → Customer /api/customers/profile/{id}
    vouchers/available/route.ts      — Proxy GET → Customer /api/customers/vouchers/available/with-status
    vouchers/collect/[id]/route.ts   — Proxy POST → Customer /api/customers/vouchers/collect/{id}
    vouchers/list/route.ts           — Proxy GET → Customer /api/customers/vouchers/list
    vouchers/applicable/route.ts     — Proxy GET → Customer /api/customers/vouchers/applicable
    missions/route.ts                — Proxy GET → Customer /api/customers/missions
    missions/claim/route.ts          — Proxy POST → Customer /api/customers/missions/claim-reward
    leaderboard/route.ts             — Proxy GET → Customer /api/customers/leaderboard
    invoices/route.ts                — Proxy GET → Customer /api/customers/invoices
    payments/route.ts                — Proxy POST → Customer /api/v1/payments/process
components/
  ui/                           — shadcn/ui components
  auth-guard.tsx                — Redirect to login if not authenticated
  layout/
    main-layout.tsx             — Header + content + bottom nav
    bottom-nav.tsx              — Mobile bottom navigation
lib/
  auth.ts                       — Zustand store (token, user, login/logout)
  api/
    axios.ts                    — Axios instance + auto refresh token interceptor
    endpoints.ts                — Endpoint constants
    services/
      authService.ts
      profileService.ts
      customerService.ts
      voucherService.ts
      missionService.ts
      leaderboardService.ts
      invoiceService.ts
      paymentService.ts
  identity-api.ts               — Helper gọi Identity Service
  customer-api.ts               — Helper gọi Customer Service
  types.ts                      — TypeScript interfaces
  utils.ts                      — Utility functions (cn, formatDateTime, formatCurrency)
hooks/
  use-toast.ts
```

## Environment Variables (.env)

```
IDENTITY_SERVICE_URL=http://localhost:8000/api/identity
CUSTOMER_SERVICE_URL=http://localhost:8000/api/customers
```

## Response Format

Tất cả API trả về:
```json
{ "status": 0, "code": "success", "message": "...", "data": { ... } }
```

Frontend cần unwrap: `res.data` (axios) → check `res.data` hoặc `res.data.data` cho paginated content.

## Auth Flow

1. Login → lưu accessToken + refreshToken vào Zustand (persist localStorage)
2. Axios interceptor gắn Bearer token vào mọi request
3. Khi 401 → auto refresh token → retry request
4. Nếu refresh fail → force logout → redirect /login
5. Lưu cookie `auth_token` cho SSR middleware check

## Các trang chính

### 1. Login (/login)
- Form: username, password
- Gọi POST /api/auth/login
- Lưu token, redirect /home

### 2. Register (/register)
- Form: username, password, email, firstName, lastName
- Gọi POST /api/auth/register
- Thành công → redirect /login

### 3. Home (/home)
- Hiển thị: tên user, balance, points, tier (badge màu theo tier)
- Quick actions: Vouchers, Missions, Thanh toán, Bảng xếp hạng
- Gọi GET /api/customers/profile/{customerId}

### 4. Vouchers (/vouchers) — 2 tabs
- Tab "Khả dụng": GET /api/vouchers/available?customerId=X
  - Card list: tên voucher, mô tả, giá trị giảm, hạn sử dụng, nút "Thu thập" (nếu chưa collected)
  - POST /api/vouchers/collect/{id}?customerId=X
- Tab "Của tôi": GET /api/vouchers/list?customerId=X
  - Filter: status (ACTIVE/USED/EXPIRED)
  - Card list: tên, mã voucher, trạng thái (badge màu), ngày hết hạn

### 5. Missions (/missions)
- GET /api/missions?page=0&size=20
- Card list: tên mission, mô tả, progress bar (currentProgress/targetValue), loại thưởng, trạng thái
- Nút "Nhận thưởng" khi status = COMPLETED
- POST /api/missions/claim { missionId }
- Dialog hiện kết quả nhận thưởng

### 6. Leaderboard (/leaderboard)
- GET /api/leaderboard
- Bảng top customers (rank, tên, điểm)
- Highlight vị trí hiện tại của user

### 7. Invoices (/invoices)
- GET /api/invoices?page=0&size=20
- Filter: nameStore, title
- Nút tìm kiếm (không auto-search)
- Table: tiêu đề, cửa hàng, số tiền, ngày tạo
- Click → chọn để thanh toán (redirect /payment?invoiceId=X)

### 8. Payment (/payment)
- Chọn hóa đơn (từ query param hoặc dropdown)
- Hiển thị số tiền đơn hàng
- Chọn voucher áp dụng: GET /api/vouchers/applicable?customerId=X&nameStore=Y&orderAmount=Z
- Hiển thị: giảm giá, số tiền cuối
- Nút "Thanh toán": POST /api/payments { invoiceId, voucherId, orderAmount }
- Hiển thị kết quả: transactionId, discountAmount, finalAmount, pointsEarned

### 9. Profile (/profile)
- GET /api/profile → hiển thị thông tin
- Form cập nhật: firstName, lastName, email, phone
- PUT /api/profile
- Tab đổi mật khẩu: currentPassword, newPassword, confirmPassword
- PUT /api/profile/password

## Enum Values

```typescript
type CustomerTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
type CustomerVoucherStatus = "ACTIVE" | "USED" | "EXPIRED";
type DiscountType = "FIXED" | "PERCENTAGE";
type CreatorType = "SYSTEM" | "PARTNER";
type CustomerMissionStatus = "IN_PROGRESS" | "COMPLETED" | "REWARD_CLAIMED";
type TargetType = "SPENDING" | "TRANSACTION_COUNT";
type RewardType = "POINT" | "VOUCHER";
type TaskStatus = "ACTIVE" | "COMPLETED" | "EXPIRED";
```

## UI/UX Guidelines

- Mobile-first design (bottom navigation cho mobile, sidebar cho desktop)
- Tier badge colors: BRONZE=#CD7F32, SILVER=#C0C0C0, GOLD=#FFD700, PLATINUM=#E5E4E2
- Voucher cards với gradient background theo discountType
- Progress bar cho missions (% hoàn thành)
- Toast notifications cho mọi action (thành công/lỗi)
- Loading skeleton khi fetch data
- Empty state khi không có data
- Pagination 0-based API, 1-based UI component
- Nút tìm kiếm thay vì auto-search khi thay đổi filter
- Format tiền: Intl.NumberFormat("vi-VN") + "đ"
- Format ngày: Intl.DateTimeFormat("vi-VN") hoặc timestamp → Date

## API Proxy Pattern

Mỗi Next.js API route là proxy đơn giản:
```typescript
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const params = Object.fromEntries(new URL(req.url).searchParams);
    const res = await fetch(`${process.env.CUSTOMER_SERVICE_URL}/api/customers/endpoint`, {
      headers: { ...(authHeader ? { Authorization: authHeader } : {}) },
    });
    const data = await res.json();
    if (!res.ok) return NextResponse.json(data, { status: res.status });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
```

## Axios Auto Refresh Pattern

```typescript
// Khi gặp 401 → lấy refreshToken → gọi /api/auth/refresh → cập nhật token → retry
// Nếu refresh fail → force logout
// Queue multiple 401 requests, chỉ refresh 1 lần
```
