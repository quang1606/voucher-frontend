# CHƯƠNG 3: XÂY DỰNG VÀ PHÁT TRIỂN ỨNG DỤNG

## 3.x Frontend - Giao diện người dùng

### 3.x.1 Tổng quan công nghệ sử dụng

| Công nghệ | Phiên bản | Vai trò |
|---|---|---|
| Next.js | 16.2.2 | Framework React fullstack |
| React | 19.2.4 | Thư viện xây dựng UI |
| TypeScript | 5.x | Ngôn ngữ lập trình |
| Tailwind CSS | 4.x | CSS utility framework |
| shadcn/ui (Radix UI) | Latest | Hệ thống component UI |
| Zustand | 5.0.12 | Quản lý state |
| Axios | 1.15.0 | HTTP client |
| Recharts | 3.8.1 | Biểu đồ thống kê |
| React Hook Form + Zod | 7.72 / 4.3 | Quản lý form + validation |
| ExcelJS | 4.4.0 | Tạo file Excel template |
| Lucide React | 1.7.0 | Icon library |

---

### 3.x.2 Next.js - Framework chính

**Lý do lựa chọn:**

Next.js được chọn làm framework chính vì các ưu điểm sau:

1. **App Router & Server Components**: Next.js 16 cung cấp kiến trúc App Router hiện đại, cho phép tổ chức code theo cấu trúc thư mục trực quan. Server Components giúp giảm JavaScript gửi về client, cải thiện hiệu năng tải trang.

2. **API Routes (BFF Pattern)**: Next.js cho phép tạo API routes ngay trong project, đóng vai trò Backend-For-Frontend (BFF). Frontend không gọi trực tiếp đến microservices mà thông qua API routes của Next.js, giúp:
   - Ẩn URL và cấu hình backend khỏi client
   - Tập trung xử lý authentication header
   - Dễ dàng chuyển đổi backend service mà không ảnh hưởng client code

3. **Hỗ trợ TypeScript tốt**: Tích hợp TypeScript sẵn, type-safe routing, tự động generate types cho dynamic routes.

4. **Tối ưu production**: Tự động code splitting, image optimization, font optimization, và hỗ trợ standalone output cho Docker deployment.

5. **Hệ sinh thái lớn**: Cộng đồng đông đảo, tài liệu phong phú, dễ tuyển dụng và bảo trì.

---

### 3.x.3 React 19 - Thư viện UI

**Lý do lựa chọn:**

React 19 là phiên bản mới nhất với nhiều cải tiến:

1. **Component-based Architecture**: Chia giao diện thành các component tái sử dụng, dễ bảo trì và mở rộng.

2. **Hooks**: Sử dụng useState, useEffect, useCallback để quản lý state và side effects một cách khai báo (declarative).

3. **Virtual DOM**: Cập nhật UI hiệu quả thông qua thuật toán reconciliation, chỉ render lại phần thay đổi.

4. **Phổ biến nhất**: React là thư viện UI phổ biến nhất hiện nay, đảm bảo khả năng bảo trì dài hạn.

---

### 3.x.4 TypeScript - Ngôn ngữ lập trình

**Lý do lựa chọn:**

1. **Type Safety**: Phát hiện lỗi tại compile-time thay vì runtime, giảm bug trong production.

2. **IntelliSense**: IDE hỗ trợ auto-complete, refactoring, và navigation tốt hơn JavaScript thuần.

3. **Tài liệu sống**: Interface và type definitions đóng vai trò như tài liệu API, giúp developer mới hiểu code nhanh hơn.

4. **Phù hợp dự án lớn**: Khi project có nhiều service, nhiều API endpoint, TypeScript giúp đảm bảo tính nhất quán giữa request/response types.

---

### 3.x.5 Tailwind CSS - Styling

**Lý do lựa chọn:**

1. **Utility-first**: Viết CSS trực tiếp trong JSX thông qua class names, không cần tạo file CSS riêng, giảm context switching.

2. **Hiệu năng**: Chỉ generate CSS cho các class thực sự sử dụng (tree-shaking), file CSS production rất nhỏ.

3. **Responsive Design**: Hệ thống breakpoint sẵn có (sm, md, lg, xl), dễ dàng tạo giao diện responsive.

4. **Dark Mode**: Hỗ trợ dark mode thông qua class strategy, tích hợp với next-themes.

5. **Consistency**: Design token (spacing, colors, typography) được định nghĩa tập trung trong config, đảm bảo UI nhất quán.

---

### 3.x.6 shadcn/ui (Radix UI) - Component Library

**Lý do lựa chọn:**

1. **Accessible by default**: Các component (Dialog, Select, Dropdown, Tabs...) tuân thủ WAI-ARIA standards, hỗ trợ keyboard navigation và screen reader.

2. **Unstyled + Customizable**: Radix UI cung cấp logic và accessibility, shadcn/ui thêm styling bằng Tailwind CSS. Developer có toàn quyền customize giao diện.

3. **Copy-paste approach**: Không phải cài package, code component nằm trong project, dễ modify theo yêu cầu riêng.

4. **Các component sử dụng**: Button, Input, Select, Dialog, AlertDialog, Table, Tabs, Badge, Card, Toast, Pagination, Switch, Checkbox, Textarea, ScrollArea, DropdownMenu.

---

### 3.x.7 Zustand - State Management

**Lý do lựa chọn:**

1. **Đơn giản**: API tối giản, không cần boilerplate như Redux (actions, reducers, dispatch). Chỉ cần `create()` và `useStore()`.

2. **Nhẹ**: Bundle size chỉ ~1KB (gzipped), nhỏ hơn nhiều so với Redux (~7KB) hay MobX (~15KB).

3. **Persist middleware**: Hỗ trợ sẵn lưu state vào localStorage, phù hợp cho auth state (token, user info) cần persist qua page refresh.

4. **Không cần Provider**: Không wrap app trong Provider component, giảm nesting và đơn giản hóa component tree.

**Ứng dụng trong project**: Quản lý authentication state (token, refreshToken, user info, allowedPages), tự động rehydrate khi reload trang.

---

### 3.x.8 Axios - HTTP Client

**Lý do lựa chọn:**

1. **Interceptors**: Hỗ trợ request/response interceptors, cho phép:
   - Tự động gắn Bearer token vào mọi request
   - Auto refresh token khi gặp 401
   - Queue multiple requests khi đang refresh

2. **Error handling**: Phân biệt rõ network error vs HTTP error, dễ xử lý từng loại.

3. **Request cancellation**: Hỗ trợ cancel request, hữu ích khi component unmount.

**Ứng dụng trong project**: Axios instance với interceptor tự động refresh token — khi access token hết hạn, interceptor gọi refresh endpoint, cập nhật token mới, và retry request gốc mà user không cần login lại.

---

### 3.x.9 Recharts - Biểu đồ

**Lý do lựa chọn:**

1. **React-native**: Xây dựng hoàn toàn bằng React components, tích hợp tự nhiên với React ecosystem.

2. **Responsive**: Hỗ trợ ResponsiveContainer, biểu đồ tự động resize theo container.

3. **Declarative**: Cấu hình biểu đồ bằng JSX, dễ đọc và maintain.

**Ứng dụng trong project**: Bar chart thống kê voucher theo tháng trên trang Dashboard.

---

### 3.x.10 React Hook Form + Zod - Form Management

**Lý do lựa chọn:**

1. **Performance**: React Hook Form sử dụng uncontrolled components, giảm re-render khi user nhập liệu.

2. **Validation**: Zod cung cấp schema-based validation với TypeScript inference, định nghĩa validation rules một lần và tự động infer types.

3. **Tích hợp**: `@hookform/resolvers` kết nối React Hook Form với Zod schema seamlessly.

**Ứng dụng trong project**: Form đăng nhập với validation username/password required.

---

### 3.x.11 Kiến trúc Frontend

```
┌─────────────────────────────────────────────────────┐
│                    Browser                           │
├─────────────────────────────────────────────────────┤
│  React Components (Pages, Layouts, UI Components)   │
│  ├── Zustand Store (Auth State)                     │
│  ├── Axios Instance (Auto Refresh Token)            │
│  └── Service Layer (voucherService, missionService) │
├─────────────────────────────────────────────────────┤
│           Next.js API Routes (BFF Layer)            │
│  ├── /api/auth/**       → Identity Service          │
│  ├── /api/system-users/** → Identity Service        │
│  ├── /api/profile/**    → Identity Service          │
│  ├── /api/vouchers/**   → Voucher Service           │
│  ├── /api/missions/**   → Voucher Service           │
│  ├── /api/invoices/**   → Voucher Service           │
│  ├── /api/dashboard/**  → Voucher Service           │
│  └── /api/audit-logs/** → Voucher Service           │
├─────────────────────────────────────────────────────┤
│              Backend Microservices                   │
│  ├── Identity Service (port 8081)                   │
│  └── Voucher Service (port 8082)                    │
└─────────────────────────────────────────────────────┘
```

**Luồng xác thực:**

1. User đăng nhập → Next.js API route gọi Identity Service → trả về accessToken + refreshToken
2. Zustand store lưu token vào localStorage (persist)
3. Axios interceptor tự động gắn token vào mọi request
4. Khi token hết hạn (401) → interceptor gọi refresh endpoint → cập nhật token mới → retry request
5. Nếu refresh cũng thất bại → force logout → redirect về trang login

**Phân quyền giao diện:**

- Sau khi login, FE gọi API `allowed-pages` với roles của user
- Sidebar navigation chỉ hiển thị các trang user được phép truy cập
- Mỗi trang wrap trong `<AuthGuard pageKey="...">` để kiểm tra quyền
- Một số UI elements (nút Duyệt/Từ chối, bộ lọc Cửa hàng/Nguồn) ẩn/hiện theo role (PARTNER vs ADMIN/CHECKER)

---

### 3.x.12 Cấu trúc thư mục

```
app/
  api/              → API proxy routes (BFF)
  dashboard/        → Các trang chính (vouchers, missions, partners, ...)
  login/            → Trang đăng nhập
components/
  ui/               → shadcn/ui components (Button, Input, Dialog, ...)
  auth/             → Login form
  dashboard/        → Navigation sidebar
  layout/           → Dashboard layout (header, sidebar)
  settings/         → System users, role management tabs
lib/
  api/
    axios.ts        → Axios instance + auto refresh interceptor
    endpoints.ts    → API endpoint constants
    services/       → Service layer (voucherService, missionService, ...)
  auth.ts           → Zustand auth store
  identity-api.ts   → Helper gọi Identity Service
  backend-api.ts    → Helper gọi Voucher Service
  types.ts          → TypeScript interfaces
  utils.ts          → Utility functions
hooks/
  use-roles.ts      → Hook kiểm tra role user
  use-toast.ts      → Hook hiển thị toast notification
```

---

### 3.x.13 Tổng kết lựa chọn công nghệ

Các công nghệ frontend được lựa chọn dựa trên tiêu chí:

1. **Hiện đại và phổ biến**: Đảm bảo cộng đồng hỗ trợ lớn, tài liệu đầy đủ
2. **Type-safe**: TypeScript xuyên suốt từ API types đến UI components
3. **Performance**: Minimal bundle size, code splitting tự động, lazy loading
4. **Developer Experience**: Hot reload, IntelliSense, error messages rõ ràng
5. **Accessibility**: Components tuân thủ WCAG standards
6. **Scalable**: Kiến trúc BFF cho phép thêm service mới mà không ảnh hưởng client code
