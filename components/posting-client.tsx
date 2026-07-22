"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";
import { bn, bnDateTime, STATUS_BN, MEDIA_TYPE_BN } from "@/lib/format";
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

const TYPES: { t: MediaType; label: string; Icon: React.ComponentType }[] = [
  { t: "image", label: "ছবি", Icon: IconImage },
  { t: "video", label: "ভিডিও", Icon: IconVideo },
  { t: "multi", label: "মাল্টি", Icon: IconLayers },
];

export function PostingClient({ posts }: { posts: Post[] }) {
  const router = useRouter();
  const toast = useToast();

  const [type, setType] = React.useState<MediaType>("image");
  const [mediaUrl, setMediaUrl] = React.useState("");
  const [caption, setCaption] = React.useState("");
  const [date, setDate] = React.useState(
    new Date().toISOString().slice(0, 10),
  );
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
        toast("ai", "AI ক্যাপশন তৈরি", "পছন্দমতো এডিট করে নিন");
      } else {
        toast("error", "সমস্যা", data.error || "ক্যাপশন তৈরি হয়নি");
      }
    } finally {
      setAiBusy(false);
    }
  }

  async function addPost() {
    if (!caption.trim()) {
      toast("error", "ক্যাপশন দিন", "পোস্টের জন্য ক্যাপশন লিখুন");
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
        toast("success", "পোস্ট শিডিউল হয়েছে", "cron চললে Facebook-এ যাবে");
        router.refresh();
      } else {
        toast("error", "সমস্যা", data.error || "সেভ হয়নি");
      }
    } finally {
      setBusy(false);
    }
  }

  async function publishNow(id: string) {
    setRowBusy(id);
    toast("info", "পাবলিশ হচ্ছে...", "Facebook Graph API-তে পাঠানো হচ্ছে");
    try {
      const res = await fetch(`/api/posts/${id}/publish`, { method: "POST" });
      const data = await res.json();
      if (res.ok) toast("success", "পোস্ট লাইভ!", "Facebook-এ পোস্ট হয়েছে");
      else toast("error", "পোস্ট ব্যর্থ", data.error || "Graph API error");
      router.refresh();
    } finally {
      setRowBusy(null);
    }
  }

  async function delPost(id: string) {
    setRowBusy(id);
    try {
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
      toast("info", "ডিলিট হয়েছে", "পোস্টটি সরানো হয়েছে");
      router.refresh();
    } finally {
      setRowBusy(null);
    }
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1 className="bn">সোশ্যাল পোস্টিং</h1>
          <p className="bn">
            পোস্ট তৈরি করুন, শিডিউল করুন — Facebook-এ অটো পাবলিশ হবে
          </p>
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-head">
            <h3 className="bn">নতুন পোস্ট তৈরি</h3>
          </div>
          <div className="form-grid">
            <div>
              <label className="bn">মিডিয়া টাইপ</label>
              <div className="seg-type">
                {TYPES.map(({ t, label, Icon }) => (
                  <button
                    key={t}
                    className={type === t ? "on" : ""}
                    onClick={() => setType(t)}
                    type="button"
                  >
                    <Icon />
                    <span className="bn">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="bn">মিডিয়া লিংক (URL)</label>
              <input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://... (ভিডিওর জন্য সরাসরি .mp4)"
              />
              <div className="uploader" style={{ marginTop: 10 }}>
                <IconUpload />
                <div className="bn">অথবা মিডিয়া আপলোড করুন</div>
                <div style={{ fontSize: 11.5, marginTop: 3 }}>
                  ভিডিওর জন্য YouTube/Drive লিংক নয় — সরাসরি হোস্টেড .mp4
                </div>
              </div>
            </div>

            <div>
              <div className="caption-head">
                <label className="bn">ক্যাপশন</label>
                <button
                  className="ai-btn"
                  onClick={genCaption}
                  disabled={aiBusy}
                  type="button"
                >
                  <IconSparkle />
                  {aiBusy ? "লিখছে..." : "AI ক্যাপশন"}
                </button>
              </div>
              <textarea
                className="bn"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="প্রোডাক্ট সম্পর্কে লিখুন, অথবা AI দিয়ে জেনারেট করুন..."
              />
            </div>

            <div className="row2">
              <div>
                <label className="bn">শিডিউল তারিখ</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div>
                <label className="bn">সময়</label>
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
              {busy ? "সেভ হচ্ছে..." : "পোস্ট শিডিউল করুন"}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3 className="bn">
              শিডিউল করা পোস্ট{" "}
              <span className="pill-count">{bn(posts.length)} টি</span>
            </h3>
          </div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>পোস্ট</th>
                  <th>সময়</th>
                  <th>স্ট্যাটাস</th>
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
                              {MEDIA_TYPE_BN[p.media_type]} পোস্ট
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="cell-sub">
                        {p.scheduled_time
                          ? bnDateTime(p.scheduled_time)
                          : "তাৎক্ষণিক"}
                      </td>
                      <td>
                        <span className={`badge-s s-${p.status}`}>
                          {STATUS_BN[p.status]}
                        </span>
                      </td>
                      <td className="row-act">
                        {p.status === "pending" && (
                          <button
                            className="mini"
                            title="এখনই পোস্ট"
                            onClick={() => publishNow(p.id)}
                            disabled={rowBusy === p.id}
                          >
                            <IconPlay />
                          </button>
                        )}
                        <button
                          className="mini"
                          title="ডিলিট"
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
                      এখনো কোনো পোস্ট নেই — বাঁ পাশ থেকে তৈরি করুন
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
