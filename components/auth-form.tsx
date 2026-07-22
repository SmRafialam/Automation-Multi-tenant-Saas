"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthState } from "@/app/(auth)/actions";
import { supabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
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
  const [oauthErr, setOauthErr] = React.useState("");

  async function google() {
    if (!supabaseConfigured) {
      setOauthErr(
        "Google লগইন চালু করতে Supabase কনফিগার ও Google provider চালু করতে হবে (README দেখুন)।",
      );
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    if (error) setOauthErr(error.message);
  }

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
        <div>
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
          <p
            style={{
              marginTop: 22,
              fontSize: 12.5,
              color: "var(--text-faint)",
            }}
          >
            Built by <b style={{ color: "var(--text-dim)" }}>S. M. Rafi</b>
          </p>
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
          {oauthErr && <div className="auth-err bn">{oauthErr}</div>}
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

          <div className="auth-divider bn">অথবা</div>
          <button className="oauth" type="button" onClick={google}>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                fill="#4285F4"
                d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.2-4.8 3.2-7.8Z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.7c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8A11 11 0 0 0 12 23Z"
              />
              <path
                fill="#FBBC05"
                d="M6 14.4a6.6 6.6 0 0 1 0-4.2V7.4H2.3a11 11 0 0 0 0 9.8L6 14.4Z"
              />
              <path
                fill="#EA4335"
                d="M12 5.5c1.6 0 3 .5 4.1 1.6l3.1-3.1A11 11 0 0 0 2.3 7.4L6 10.2c.9-2.6 3.2-4.7 6-4.7Z"
              />
            </svg>
            <span className="bn">Google দিয়ে চালিয়ে যান</span>
          </button>

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
