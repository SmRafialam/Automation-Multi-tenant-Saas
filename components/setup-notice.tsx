import Link from "next/link";
import { getT } from "@/lib/lang";
import { IconBolt } from "@/components/icons";

export async function SetupNotice() {
  const { t } = await getT();
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
          {t("setup.title")}
        </h1>
        <p className="bn" style={{ color: "var(--text-dim)", marginTop: 8 }}>
          {t("setup.intro")}
        </p>
        <ol className="bn">
          <li>{t("setup.s1")}</li>
          <li>
            {t("setup.s2").split("supabase/schema.sql")[0]}
            <code>supabase/schema.sql</code>
            {t("setup.s2").split("supabase/schema.sql")[1] ?? ""}
          </li>
          <li>{t("setup.s3")}</li>
          <li>
            {t("setup.s4").split(".env.local")[0]}
            <code>.env.local</code>
            {t("setup.s4").split(".env.local")[1] ?? ""}
          </li>
        </ol>
        <div style={{ marginTop: 22 }}>
          <Link href="/login" className="btn primary bn">
            {t("setup.cta")}
          </Link>
        </div>
      </div>
    </div>
  );
}
