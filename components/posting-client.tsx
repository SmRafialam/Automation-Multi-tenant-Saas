"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { useLang } from "@/components/lang-provider";
import { dateFmt, translate } from "@/lib/i18n";
import type { MediaType, Post } from "@/lib/types";
import {
  IconImage,
  IconVideo,
  IconLayers,
  IconUpload,
  IconSparkle,
  IconSend,
  IconPlay,
  IconTrash,
  MEDIA_ICON,
} from "@/components/icons";

const TYPES: { t: MediaType; Icon: React.ComponentType }[] = [
  { t: "image", Icon: IconImage },
  { t: "video", Icon: IconVideo },
  { t: "multi", Icon: IconLayers },
];

export function PostingClient({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const toast = useToast();
  const { t, num, lang } = useLang();

  const [type, setType] = React.useState<MediaType>("image");
  const [mediaUrl, setMediaUrl] = React.useState("");
  const [caption, setCaption] = React.useState("");
  const [date, setDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = React.useState("19:00");
  const [busy, setBusy] = React.useState(false);
  const [aiBusy, setAiBusy] = React.useState(false);
  const [rowBusy, setRowBusy] = React.useState<string | null>(null);

  async function genCaption() {
    setAiBusy(true);
    try {
      const res = await fetch("/api/ai/caption", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ product: caption, media_type: type }),
      });
      const data = await res.json();
      if (data.caption) {
        setCaption(data.caption);
        toast("ai", t("t.ai.t"), t("t.ai.m"));
      } else {
        toast("error", t("err.title"), data.error || t("err.not_saved"));
      }
    } finally {
      setAiBusy(false);
    }
  }

  async function addPost() {
    if (!caption.trim()) {
      toast("error", t("t.cap_req.t"), t("t.cap_req.m"));
      return;
    }
    setBusy(true);
    try {
      const scheduled_time =
        date && time ? new Date(`${date}T${time}`).toISOString() : null;
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          caption,
          media_url: mediaUrl,
          media_type: type,
          scheduled_time,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCaption("");
        setMediaUrl("");
        toast("success", t("t.post_ok.t"), t("t.post_ok.m"));
        router.refresh();
      } else {
        toast("error", t("err.title"), data.error || t("err.not_saved"));
      }
    } finally {
      setBusy(false);
    }
  }

  async function publishNow(id: string) {
    setRowBusy(id);
    toast("info", t("t.publishing.t"), t("t.publishing.m"));
    try {
      const res = await fetch(`/api/posts/${id}/publish`, { method: "POST" });
      const data = await res.json();
      if (res.ok) toast("success", t("t.live.t"), t("t.live.m"));
      else toast("error", t("t.pfail.t"), data.error || t("err.title"));
      router.refresh();
    } finally {
      setRowBusy(null);
    }
  }

  async function delPost(id: string) {
    setRowBusy(id);
    try {
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
      toast("info", t("t.del.t"), t("t.del.m"));
      router.refresh();
    } finally {
      setRowBusy(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="bn">{t("posting.title")}</h1>
          <p className="bn">{t("posting.subtitle")}</p>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-head">
            <h3 className="bn">{t("posting.new")}</h3>
          </div>
          <div className="form-grid">
            <div>
              <label className="bn">{t("posting.media_type")}</label>
              <div className="seg-type">
                {TYPES.map(({ t: ty, Icon }) => (
                  <button
                    key={ty}
                    className={type === ty ? "on" : ""}
                    onClick={() => setType(ty)}
                    type="button"
                  >
                    <Icon />
                    <span className="bn">{translate(lang, `media.${ty}`)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="bn">{t("posting.media_link")}</label>
              <input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder={t("posting.media_ph")}
              />
              <div className="uploader" style={{ marginTop: 10 }}>
                <IconUpload />
                <div className="bn">{t("posting.upload")}</div>
                <div style={{ fontSize: 11.5, marginTop: 3 }}>
                  {t("posting.upload_hint")}
                </div>
              </div>
            </div>

            <div>
              <div className="caption-head">
                <label className="bn">{t("posting.caption")}</label>
                <button
                  className="ai-btn"
                  onClick={genCaption}
                  disabled={aiBusy}
                  type="button"
                >
                  <IconSparkle />
                  {aiBusy ? t("posting.ai_wait") : t("posting.ai")}
                </button>
              </div>
              <textarea
                className="bn"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={t("posting.caption_ph")}
              />
            </div>

            <div className="row2">
              <div>
                <label className="bn">{t("posting.date")}</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="bn">{t("posting.time")}</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            </div>

            <button
              className="btn primary bn"
              style={{ justifyContent: "center" }}
              onClick={addPost}
              disabled={busy}
              type="button"
            >
              <IconSend />
              {busy ? t("posting.saving") : t("posting.schedule")}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3 className="bn">
              {t("posting.scheduled_list")}{" "}
              <span className="pill-count">
                {t("count.items", { n: num(posts.length) })}
              </span>
            </h3>
          </div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t("th.post")}</th>
                  <th>{t("th.time")}</th>
                  <th>{t("th.status")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => {
                  const Icon = MEDIA_ICON[p.media_type] ?? IconImage;
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="cell-media">
                          <div className="thumb">
                            <Icon width={16} />
                          </div>
                          <div>
                            <div
                              className="cell-main"
                              style={{
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {p.caption}
                            </div>
                            <div className="cell-sub">
                              {t("posting.x_post", {
                                type: translate(lang, `media.${p.media_type}`),
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="cell-sub">
                        {p.scheduled_time
                          ? dateFmt(p.scheduled_time, lang, {
                              day: "numeric",
                              month: "short",
                              hour: "numeric",
                              minute: "2-digit",
                            })
                          : t("posting.instant")}
                      </td>
                      <td>
                        <span className={`badge-s s-${p.status}`}>
                          {translate(lang, `status.${p.status}`)}
                        </span>
                      </td>
                      <td className="row-act">
                        {p.status === "pending" && (
                          <button
                            className="mini"
                            title={t("posting.publish_now")}
                            onClick={() => publishNow(p.id)}
                            disabled={rowBusy === p.id}
                          >
                            <IconPlay />
                          </button>
                        )}
                        <button
                          className="mini"
                          title={t("posting.delete")}
                          onClick={() => delPost(p.id)}
                          disabled={rowBusy === p.id}
                        >
                          <IconTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {posts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty bn">
                      {t("posting.empty")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
