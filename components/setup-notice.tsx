import Link from "next/link";
import { IconBolt } from "@/components/icons";

export function SetupNotice() {
  return (
    <div className="content">
      <div className="card setup fade-in">
        <div className="logo" style={{ marginBottom: 18 }}>
          <span className="mark">
            <IconBolt />
          </span>
          AutoFlow
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>
          Supabase যুক্ত করুন 🔌
        </h1>
        <p className="bn" style={{ color: "var(--text-dim)", marginTop: 8 }}>
          অ্যাপটি চালু আছে, কিন্তু ডেটাবেস ও লগইন কাজ করতে Supabase কানেক্ট করতে
          হবে। মাত্র কয়েক ধাপ:
        </p>
        <ol className="bn">
          <li>
            <b>supabase.com</b>-এ একটি ফ্রি প্রজেক্ট তৈরি করুন।
          </li>
          <li>
            SQL Editor খুলে <code>supabase/schema.sql</code> ফাইলটি রান করুন
            (টেবিল + RLS তৈরি হবে)।
          </li>
          <li>
            Project Settings → API থেকে <code>URL</code> ও{" "}
            <code>anon key</code> কপি করুন।
          </li>
          <li>
            প্রজেক্টের <code>.env.local</code> ফাইলে বসিয়ে দিন, তারপর dev
            সার্ভার রিস্টার্ট করুন।
          </li>
        </ol>
        <div style={{ marginTop: 22 }}>
          <Link href="/login" className="btn primary bn">
            সেটআপ শেষে লগইন করুন
          </Link>
        </div>
      </div>
    </div>
  );
}
