"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { login, signup, type AuthState } from "@/app/(auth)/actions";
import { supabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/components/lang-provider";
import { LangToggle } from "@/components/lang-toggle";
import { IconBolt, IconMail, IconLock, IconBuilding, IconCheck } from "@/components/icons";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { t, lang } = useLang();
  const action = mode === "login" ? login : signup;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    {},
  );
  const [oauthErr, setOauthErr] = React.useState("");

  async function google() {
    if (!supabaseConfigured) {
      setOauthErr(t("auth.note.google"));
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

  const stats =
    lang === "bn"
      ? ["২,৪০০+", "১.২M", "৯৯.৯%"]
      : ["2,400+", "1.2M", "99.9%"];

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
            {t("auth.hero.pre")}
            <span>{t("auth.hero.mark")}</span>
            {t("auth.hero.post")}
          </h1>
          <p className="bn">{t("auth.subtitle")}</p>
          <div className="auth-feats">
            {[t("auth.feat1"), t("auth.feat2"), t("auth.feat3")].map((f) => (
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
              <b>{stats[0]}</b>
              <span className="bn">{t("auth.stat1")}</span>
            </div>
            <div className="s">
              <b>{stats[1]}</b>
              <span className="bn">{t("auth.stat2")}</span>
            </div>
            <div className="s">
              <b>{stats[2]}</b>
              <span>{t("auth.stat3")}</span>
            </div>
          </div>
          <p style={{ marginTop: 22, fontSize: 12.5, color: "var(--text-faint)" }}>
            {t("auth.builtby")}{" "}
            <b style={{ color: "var(--text-dim)" }}>S. M. Rafi</b>
          </p>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-card">
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 8,
            }}
          >
            <LangToggle />
          </div>
          <h2 className="bn">
            {mode === "login" ? t("auth.welcome") : t("auth.create")}
          </h2>
          <p className="sub bn">
            {mode === "login" ? t("auth.sub.login") : t("auth.sub.signup")}
          </p>

          {!supabaseConfigured && (
            <div className="auth-note bn">{t("auth.note.supabase")}</div>
          )}
          {state.error && <div className="auth-err bn">{state.error}</div>}
          {oauthErr && <div className="auth-err bn">{oauthErr}</div>}
          {state.message && (
            <div className="auth-note bn">✅ {state.message}</div>
          )}

          <form action={formAction}>
            {mode === "signup" && (
              <div className="field">
                <label className="bn">{t("auth.f.business")}</label>
                <div className="ip">
                  <IconBuilding />
                  <input name="business_name" placeholder={t("auth.ph.business")} />
                </div>
              </div>
            )}
            <div className="field">
              <label className="bn">{t("auth.f.email")}</label>
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
              <label className="bn">{t("auth.f.password")}</label>
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
                ? t("auth.btn.wait")
                : mode === "login"
                  ? t("auth.btn.login")
                  : t("auth.btn.signup")}
            </button>
          </form>

          <div className="auth-divider bn">{t("auth.or")}</div>
          <button className="oauth" type="button" onClick={google}>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="#4285F4" d="M22.5 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.2-4.8 3.2-7.8Z" />
              <path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.6-2.7c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8A11 11 0 0 0 12 23Z" />
              <path fill="#FBBC05" d="M6 14.4a6.6 6.6 0 0 1 0-4.2V7.4H2.3a11 11 0 0 0 0 9.8L6 14.4Z" />
              <path fill="#EA4335" d="M12 5.5c1.6 0 3 .5 4.1 1.6l3.1-3.1A11 11 0 0 0 2.3 7.4L6 10.2c.9-2.6 3.2-4.7 6-4.7Z" />
            </svg>
            <span className="bn">{t("auth.google")}</span>
          </button>

          <p className="auth-alt bn">
            {mode === "login" ? (
              <>
                {t("auth.no_account")} <Link href="/signup">{t("auth.btn.signup")}</Link>
              </>
            ) : (
              <>
                {t("auth.have_account")} <Link href="/login">{t("auth.btn.login")}</Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
