"use client";

import { useLang } from "@/components/lang-provider";

/** A clear segmented language switcher showing both options. */
export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="lang-seg" role="group" aria-label="Language / ভাষা" title="Language / ভাষা">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="lang-globe">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
      </svg>
      <button
        className={lang === "bn" ? "on" : ""}
        onClick={() => setLang("bn")}
        type="button"
      >
        বাংলা
      </button>
      <button
        className={lang === "en" ? "on" : ""}
        onClick={() => setLang("en")}
        type="button"
      >
        EN
      </button>
    </div>
  );
}
