"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthState } from "@/app/(auth)/actions";
import { supabaseConfigured } from "@/lib/supabase/env";
import {
  IconBolt,
  IconMail,
  IconLock,
  IconBuilding,
  IconCheck,
} from "@/components/icons";

const FEATURES = [
  "AI ক্যাপশন সহ সোশ্যাল অটো-পোস্টিং",
  "এক ক্লিকে Steadfast/Pathao কুরিয়ার",
  "রিয়েল-টাইম অর্ডার ট্র্যাকিং ও রিপোর্ট",
];

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    {},
  );

  return (
    <div className="auth-wrap">
      <div className="auth-brand">
        <div className="logo">
          <span className="mark">
            <IconBolt />
          </span>
          AutoFlow
        </div>
        <div className="auth-hero">
          <h1 className="bn">
            এক জায়গা থেকে <span>পুরো ব্যবসা</span> অটোমেট করুন
          </h1>
          <p className="bn">
            Facebook পোস্টিং, অর্ডার, কুরিয়ার আর কাস্টমার — F-commerce-এর সব
            automation একটাই ড্যাশবোর্ডে।
          </p>
          <div className="auth-feats">
            {FEATURES.map((f) => (
              <div className="auth-feat bn" key={f}>
                <span className="tick">
                  <IconCheck strokeWidth={3} />
                </span>
                {f}
              </div>
            ))}
          </div>
        </div>
        <div className="auth-stats">
          <div className="s">
            <b>২,৪০০+</b>
            <span className="bn">শপ ব্যবহার করছে</span>
          </div>
          <div className="s">
            <b>১.২M</b>
            <span className="bn">অর্ডার প্রসেস</span>
          </div>
          <div className="s">
            <b>৯৯.৯%</b>
            <span>Uptime</span>
          </div>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <h2 className="bn">
            {mode === "login" ? "আবার স্বাগতম 👋" : "অ্যাকাউন্ট তৈরি করুন 🚀"}
          </h2>
          <p className="sub bn">
            {mode === "login"
              ? "আপনার ড্যাশবোর্ডে ঢুকতে লগইন করুন"
              : "৩০ সেকেন্ডে শুরু করুন, কার্ড লাগবে না"}
          </p>

          {!supabaseConfigured && (
            <div className="auth-note bn">
              ⚠️ Supabase এখনো যুক্ত হয়নি। লগইন কাজ করতে{" "}
              <code>.env.local</code>-এ আপনার Supabase URL ও anon key দিন
              (README দেখুন)।
            </div>
          )}

          {state.error && <div className="auth-err bn">{state.error}</div>}
          {state.message && (
            <div className="auth-note bn">✅ {state.message}</div>
          )}

          <form action={formAction}>
            {mode === "signup" && (
              <div className="field">
                <label className="bn">ব্যবসার নাম</label>
                <div className="ip">
                  <IconBuilding />
                  <input
                    name="business_name"
                    placeholder="যেমন: Rupkotha Fashion"
                  />
                </div>
              </div>
            )}
            <div className="field">
              <label className="bn">ইমেইল</label>
              <div className="ip">
                <IconMail />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@business.com"
                />
              </div>
            </div>
            <div className="field">
              <label className="bn">পাসওয়ার্ড</label>
              <div className="ip">
                <IconLock />
                <input
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button className="btn-primary bn" type="submit" disabled={pending}>
              {pending
                ? "অপেক্ষা করুন..."
                : mode === "login"
                  ? "লগইন করুন"
                  : "সাইন আপ করুন"}
            </button>
          </form>

          <p className="auth-alt bn">
            {mode === "login" ? (
              <>
                অ্যাকাউন্ট নেই? <Link href="/signup">সাইন আপ করুন</Link>
              </>
            ) : (
              <>
                অ্যাকাউন্ট আছে? <Link href="/login">লগইন করুন</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
