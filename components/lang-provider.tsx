"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { translate, num as fnum, money as fmoney, type Lang } from "@/lib/i18n";

interface LangCtx {
  lang: Lang;
  t: (key: string, vars?: Record<string, string | number>) => string;
  num: (v: number | string) => string;
  money: (v: number) => string;
  setLang: (l: Lang) => void;
}

const Ctx = React.createContext<LangCtx>({
  lang: "bn",
  t: (k) => k,
  num: (v) => String(v),
  money: (v) => "৳" + v,
  setLang: () => {},
});

export function LangProvider({
  initial,
  children,
}: {
  initial: Lang;
  children: React.ReactNode;
}) {
  const [lang, setLangState] = React.useState<Lang>(initial);
  const router = useRouter();

  const setLang = React.useCallback(
    (l: Lang) => {
      document.cookie = `lang=${l}; path=/; max-age=31536000`;
      setLangState(l);
      router.refresh();
    },
    [router],
  );

  const value = React.useMemo<LangCtx>(
    () => ({
      lang,
      t: (k, vars) => translate(lang, k, vars),
      num: (v) => fnum(v, lang),
      money: (v) => fmoney(v, lang),
      setLang,
    }),
    [lang, setLang],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useLang = () => React.useContext(Ctx);
