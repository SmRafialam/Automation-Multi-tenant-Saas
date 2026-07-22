"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export interface AuthState {
  error?: string;
  message?: string;
}

function toBangla(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "ইমেইল বা পাসওয়ার্ড ভুল।";
  if (m.includes("already registered") || m.includes("already been"))
    return "এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট আছে — লগইন করুন।";
  if (m.includes("password")) return "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।";
  if (m.includes("email")) return "সঠিক ইমেইল দিন।";
  return msg;
}

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!supabaseConfigured)
    return {
      error:
        "Supabase এখনো কনফিগার করা হয়নি। README.md-এর সেটআপ ধাপ অনুসরণ করুন।",
    };

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "ইমেইল ও পাসওয়ার্ড দিন।" };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: toBangla(error.message) };

  redirect("/dashboard");
}

export async function signup(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!supabaseConfigured)
    return {
      error:
        "Supabase এখনো কনফিগার করা হয়নি। README.md-এর সেটআপ ধাপ অনুসরণ করুন।",
    };

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const businessName = String(formData.get("business_name") || "").trim();
  if (!email || !password) return { error: "ইমেইল ও পাসওয়ার্ড দিন।" };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { business_name: businessName || "My Business" } },
  });
  if (error) return { error: toBangla(error.message) };

  if (!data.session) {
    // Email confirmation is enabled on the Supabase project.
    return {
      message:
        "অ্যাকাউন্ট তৈরি হয়েছে! ইমেইল ভেরিফাই করে তারপর লগইন করুন।",
    };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
