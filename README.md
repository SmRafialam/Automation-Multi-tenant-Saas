# AutoFlow — F-commerce Automation Suite

বাংলাদেশের F-commerce ও ছোট অনলাইন শপের জন্য একটি multi-tenant SaaS ড্যাশবোর্ড —
একই জায়গা থেকে **Facebook auto-posting (AI ক্যাপশন সহ)**, **অর্ডার + কুরিয়ার (Steadfast)**
আর **কানেকশন** ম্যানেজ করা যায়।

Built with **Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres + Auth + RLS)**.

---

## ✨ Features

| Module | কী করে |
|---|---|
| 🔐 Auth | Supabase email/password লগইন ও সাইন-আপ, প্রতি ইউজারের আলাদা business (RLS) |
| 📊 Dashboard | রিয়েল ডেটা থেকে KPI, বিক্রি/অর্ডার চার্ট, সাম্প্রতিক কার্যকলাপ |
| 📢 Social Posting | পোস্ট তৈরি + শিডিউল, **AI ক্যাপশন**, cron দিয়ে Facebook-এ অটো পাবলিশ |
| 📦 Orders + Courier | অর্ডার CRUD, এক ক্লিকে **Steadfast**-এ পাঠানো + tracking, auto status sync |
| 🔗 Connections | Facebook / Steadfast / Google Sheet টোকেন সেভ (DB-তে, per-business) |

---

## 🚀 Setup

### 1. Install

```bash
npm install
```

### 2. Supabase

1. [supabase.com](https://supabase.com)-এ একটি ফ্রি প্রজেক্ট তৈরি করুন।
2. **SQL Editor** খুলে এই রিপোর `supabase/schema.sql` ফাইলের পুরো কনটেন্ট paste করে **Run** করুন।
   এতে টেবিল (businesses, connections, posts, customers, orders), **Row Level Security**,
   আর নতুন ইউজারের জন্য অটো-business তৈরির trigger বসে যাবে।
3. **Project Settings → API** থেকে `Project URL`, `anon public key`, আর `service_role key` কপি করুন।

### 3. Environment

`.env.local.example` কপি করে `.env.local` বানান এবং মান বসান:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # cron জবের জন্য
CRON_SECRET=<random-string>
ANTHROPIC_API_KEY=                   # ঐচ্ছিক — না দিলে AI ক্যাপশন টেমপ্লেট থেকে আসবে
```

### 4. Run

```bash
npm run dev
```

`http://localhost:3000` → সাইন আপ → ড্যাশবোর্ড।

> Supabase কনফিগার না করলে অ্যাপ একটি সহায়ক **setup screen** দেখাবে (ক্র্যাশ করবে না)।

---

## 🔓 Google login (ঐচ্ছিক)

Supabase Dashboard → **Authentication → Providers → Google** চালু করুন, Google Cloud Console
থেকে OAuth Client ID + Secret বসান, আর Authorized redirect-এ
`https://YOUR_PROJECT.supabase.co/auth/v1/callback` যোগ করুন। ব্যস — লগইন পেজের
"Google দিয়ে চালিয়ে যান" বাটন কাজ করবে (`/auth/callback` রুট session exchange করে)।

## 👥 Roles (RBAC)

প্রতিটি ব্যবসায় তিন রোল — `owner` / `manager` / `staff`। সাইন-আপকারী স্বয়ংক্রিয়ভাবে **owner**।
Team পেজ থেকে মালিক ইমেইল দিয়ে মেম্বার যোগ করেন (সে আগে সাইন-আপ করা থাকতে হবে; এর জন্য
`SUPABASE_SERVICE_ROLE_KEY` দরকার)। রোল অনুযায়ী মেনু/বাটন ও API — দুই স্তরেই সুরক্ষিত।

| Permission | owner | manager | staff |
|---|:-:|:-:|:-:|
| পোস্ট ও অর্ডার | ✅ | ✅ | ✅ |
| কানেকশন | ✅ | ✅ | ❌ |
| টিম ম্যানেজ | ✅ | ❌ | ❌ |

## 🔌 Integrations

- **Facebook Graph API** — Connections পেজে Page ID + long-lived **Page access token** দিন।
  Text → `/feed`, Image → `/photos`, Video → `/videos` (সরাসরি `.mp4`/hosted URL, YouTube/Drive নয়)।
- **Steadfast** — Connections পেজে merchant `API Key` + `Secret Key` দিন। "Send to Steadfast" বাটন
  create-order কল করে tracking ID সেভ করে; একটি cron periodically ডেলিভারি স্ট্যাটাস আপডেট করে।
- **AI Caption** — `ANTHROPIC_API_KEY` থাকলে Claude দিয়ে, নাহলে বাংলা টেমপ্লেট থেকে।

---

## ⏱️ Cron jobs (Vercel)

`vercel.json`-এ দুটি cron সংজ্ঞায়িত:

| Path | Schedule | কাজ |
|---|---|---|
| `/api/cron/publish` | প্রতি মিনিটে | due `pending` পোস্ট Facebook-এ পাবলিশ |
| `/api/cron/track` | প্রতি ৩ ঘণ্টায় | shipped অর্ডারের Steadfast স্ট্যাটাস sync |

Vercel-এ **Project → Settings → Environment Variables**-এ `CRON_SECRET` (ও বাকি env) সেট করুন;
Vercel Cron স্বয়ংক্রিয়ভাবে `Authorization: Bearer <CRON_SECRET>` হেডার পাঠায়।

---

## 📁 Structure

```
app/
  (auth)/            login, signup, server actions
  (dashboard)/       layout (sidebar+topbar) + dashboard, posting, orders, connections
  api/               posts, orders, courier, connections, ai/caption, cron/*
components/          shell, module clients, charts, icons, toast
lib/
  supabase/          client, server, admin, proxy, env
  facebook.ts steadfast.ts ai.ts format.ts types.ts data.ts
supabase/schema.sql  DB schema + RLS + trigger
proxy.ts             session refresh + route protection (Next 16 Proxy)
```

---

## 🚢 Deploy

GitHub-এ push → [Vercel](https://vercel.com)-এ import → env vars সেট → Deploy। Cron ও RLS প্রোডাকশনে চালু থাকবে।

---

## 🗺️ Roadmap (Phase 2)

WhatsApp Cloud API বট · Auto Invoice · Daily Report · Review Collector।

> পূর্ণ ফিচার তালিকা: [`docs/AutoFlow-Capabilities-bn.md`](docs/AutoFlow-Capabilities-bn.md)

---

*Built by **S. M. Rafi**.*
