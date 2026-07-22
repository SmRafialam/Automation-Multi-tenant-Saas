const GRAPH_VERSION = process.env.FACEBOOK_GRAPH_VERSION || "v21.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

export interface PublishInput {
  pageId: string;
  accessToken: string;
  caption: string;
  mediaUrl?: string | null;
  mediaType: "image" | "video" | "multi";
}

export interface PublishResult {
  ok: boolean;
  postId?: string;
  error?: string;
}

/**
 * Publishes a post to a Facebook Page using the Graph API.
 *
 * Proven rules carried over from the guide:
 *  - Text  -> POST /{page}/feed        (message)
 *  - Image -> POST /{page}/photos      (url, caption)
 *  - Video -> POST /{page}/videos      (file_url — must be a direct .mp4 /
 *             public URL, NOT a YouTube/Drive share link)
 */
export async function publishToFacebook(
  input: PublishInput,
): Promise<PublishResult> {
  const { pageId, accessToken, caption, mediaUrl, mediaType } = input;

  try {
    let endpoint: string;
    const body = new URLSearchParams();
    body.set("access_token", accessToken);

    if (mediaType === "video" && mediaUrl) {
      endpoint = `${GRAPH_BASE}/${pageId}/videos`;
      body.set("file_url", mediaUrl);
      body.set("description", caption);
    } else if ((mediaType === "image" || mediaType === "multi") && mediaUrl) {
      // For a single image (multi-image albums need the unpublished-photos flow).
      endpoint = `${GRAPH_BASE}/${pageId}/photos`;
      body.set("url", mediaUrl);
      body.set("caption", caption);
    } else {
      endpoint = `${GRAPH_BASE}/${pageId}/feed`;
      body.set("message", caption);
    }

    const res = await fetch(endpoint, { method: "POST", body });
    const data = await res.json();

    if (!res.ok || data.error) {
      return {
        ok: false,
        error: data.error?.message || `Graph API error (${res.status})`,
      };
    }

    return { ok: true, postId: data.post_id || data.id };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/** Exchanges a short-lived token for a long-lived Page token (helper). */
export async function getLongLivedToken(
  appId: string,
  appSecret: string,
  shortToken: string,
): Promise<string | null> {
  try {
    const url = new URL(`${GRAPH_BASE}/oauth/access_token`);
    url.searchParams.set("grant_type", "fb_exchange_token");
    url.searchParams.set("client_id", appId);
    url.searchParams.set("client_secret", appSecret);
    url.searchParams.set("fb_exchange_token", shortToken);
    const res = await fetch(url);
    const data = await res.json();
    return data.access_token ?? null;
  } catch {
    return null;
  }
}
