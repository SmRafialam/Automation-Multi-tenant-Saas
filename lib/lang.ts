import { cookies } from "next/headers";
import { translate, type Lang } from "@/lib/i18n";

/** Reads the current language from the `lang` cookie (server side). */
export async function getLang(): Promise<Lang> {
  const store = await cookies();
  return store.get("lang")?.value === "en" ? "en" : "bn";
}

/** Server-side translator bound to the current language. */
export async function getT() {
  const lang = await getLang();
  return {
    lang,
    t: (key: string, vars?: Record<string, string | number>) =>
      translate(lang, key, vars),
  };
}
