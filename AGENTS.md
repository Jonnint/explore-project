# AGENTS.md

## Project Overview

Next.js 15 frontend (App Router) yang consume Laravel API sebagai microservice.
Semua data fetching ke Laravel via `src/lib/api.ts`.

## Stack

* **Framework**: Next.js 15, App Router, React 19, React Compiler aktif
* **Language**: TypeScript (strict mode)
* **Styling**: Tailwind CSS v4 + shadcn/ui
* **Auth**: Sanctum cookie-based (belum aktif, sudah disiapkan di lib/api.ts)
* **Backend**: Laravel API di `NEXT_PUBLIC_API_URL` (default: http://localhost:8000)

## Struktur Folder

```txt
src/
  app/                      # App Router pages
    dashboard/
      link-clicks/
        page.tsx            # Server Component — fetch data
        client.tsx          # Client Component — interaksi UI
  lib/
    api.ts                  # Semua HTTP call ke Laravel
  types/
    link-clicks.ts          # TypeScript interfaces
```

## Konvensi Penting

### Server vs Client Component

* `page.tsx` selalu Server Component — fetch data di sini, JANGAN pakai `useState` / `useEffect`
* `client.tsx` untuk semua interaksi — filter, pagination, form
* Nama file client component selalu `client.tsx` dalam folder yang sama dengan `page.tsx`

### Data Fetching

* Semua fetch via `apiGet()` atau `apiFetch()` dari `src/lib/api.ts`
* JANGAN fetch langsung di client component — pass data sebagai props dari `page.tsx`
* Query params (filter, pagination) selalu via URL search params, bukan state

### TypeScript

* Semua API response punya type di `src/types/`
* JANGAN pakai `any` — selalu definisikan interface
* Gunakan `?` untuk field yang nullable dari Laravel

### Routing & Navigation

* Filter dan pagination pakai `router.push()` dengan `URLSearchParams`
* Jangan pakai state lokal untuk filter yang perlu shareable

### UI Components & Styling

* **Maksimalkan penggunaan shadcn/ui** untuk komponen UI seperti `Button`, `Card`, `Table`, `Dialog`, `DropdownMenu`, `Tabs`, `Input`, `Form`, dan komponen reusable lain
* Hindari membuat komponen custom jika sudah tersedia di shadcn/ui kecuali ada kebutuhan spesifik
* **Gunakan Tailwind CSS v4 secara maksimal** untuk styling — prioritaskan utility classes dibanding custom CSS
* Hindari inline style dan CSS manual jika bisa diselesaikan dengan utility Tailwind
* Konsisten spacing, radius, typography, dan layout menggunakan design pattern shadcn/ui
* Untuk layout dashboard/table/filter, prioritaskan kombinasi `Card + Table + Input + Select + Pagination` dari shadcn/ui

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> URL Laravel API

## Laravel API Endpoints

| Method | Path                  | Deskripsi                      |
| ------ | --------------------- | ------------------------------ |
| GET    | `/api/link-clicks`    | List clicks + stats + products |
| GET    | `/api/products`       | List semua produk              |
| GET    | `/api/products/:slug` | Detail produk                  |
| POST   | `/api/track/generate` | Generate tracking link         |

## Auth Flow (belum aktif)

1. `GET /sanctum/csrf-cookie` → panggil `getCsrfToken()` dari `lib/api.ts`
2. `POST /api/login` dengan credentials
3. Semua request otomatis kirim cookie karena `credentials: 'include'`
4. Protect route Laravel dengan `->middleware('auth:sanctum')`

### Development Safety Rules

* **DONT BREAK ANYTHING** — selalu prioritaskan perubahan yang minimal, aman, dan tidak merusak flow existing
* Sebelum edit code, pahami struktur existing dan dependency antar file terlebih dahulu
* Jangan melakukan refactor besar, rename file, pindah folder, atau ubah architecture kecuali diminta secara eksplisit
* Jangan mengubah existing behavior, API contract, type, atau UI flow tanpa alasan yang jelas
* Jika ada kemungkinan breaking change, **WAJIB konfirmasi dulu sebelum implementasi**
* Jika requirement ambigu, context kurang, atau ada beberapa kemungkinan implementasi, **JANGAN menebak-nebak — tanyakan dulu**
* Jangan membuat asumsi terhadap business logic, API response, field, auth flow, atau expected behavior
* Jika menemukan inconsistency atau potensi bug, jelaskan opsi dan minta konfirmasi sebelum mengubah behavior
* Saat membuat fitur baru, prioritaskan kompatibilitas dengan code existing
* Reuse helper, util, component, dan pattern existing sebelum membuat implementation baru
* Setelah task selesai, **JANGAN membuat summary/changelog/penjelasan panjang otomatis kecuali diminta**
* Output default setelah selesai task: langsung hasil implementasi / code yang diminta tanpa unnecessary explanation
