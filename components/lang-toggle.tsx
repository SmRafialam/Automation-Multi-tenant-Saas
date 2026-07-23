"use client";

import { useLang } from "@/components/lang-provider";

export function LangToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <button
      className={className ?? "icon-btn"}
      onClick={() => setLang(lang === "bn" ? "en" : "bn")}
      title="Language / ভাষা"
      type="button"
    >
      <span style={{ fontWeight: 700, fontSize: 12.5 }}>
        {lang === "bn" ? "EN" : "বাং"}
      </span>
    </button>
  );
}
