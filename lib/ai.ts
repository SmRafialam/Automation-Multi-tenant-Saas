export interface CaptionInput {
  product?: string;
  tone?: string;
  mediaType?: string;
}

const FALLBACK_CAPTIONS = [
  "নতুন কালেকশন এসে গেছে! ✨ সীমিত স্টক, আজই অর্ডার করুন। ইনবক্সে দাম জানতে মেসেজ দিন 📩\n\n#fashion #bdshopping #onlineshopbd #dhaka",
  "কোয়ালিটি নিয়ে কোনো কম্প্রোমাইজ নয় 💯 প্রিমিয়াম ফেব্রিক, হাতে বানানো ডিজাইন। সারা দেশে হোম ডেলিভারি 🚚\n\n#handmade #premiumquality #freeDelivery",
  "আপনার পছন্দের রঙে, আপনার সাইজে 🌸 এখনই বুক করুন — স্টক শেষ হওয়ার আগে!\n\n#customorder #bdfashion #trendybd",
];

/**
 * Generates a Facebook caption. Uses the Anthropic API when ANTHROPIC_API_KEY
 * is set, otherwise returns a sensible Bengali template so the feature still
 * works out of the box.
 */
export async function generateCaption(input: CaptionInput): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const product = input.product?.trim();

  if (apiKey && product) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 400,
          messages: [
            {
              role: "user",
              content: `তুমি একজন বাংলাদেশি F-commerce সোশ্যাল মিডিয়া এক্সপার্ট। নিচের প্রোডাক্টের জন্য একটা আকর্ষণীয় Facebook ক্যাপশন লেখো — বাংলায়, ইমোজি সহ, শেষে ৪-৫টি প্রাসঙ্গিক হ্যাশট্যাগ দাও। শুধু ক্যাপশনটাই দাও, অন্য কিছু নয়।\n\nপ্রোডাক্ট: ${product}\nটোন: ${input.tone || "বন্ধুত্বপূর্ণ ও বিক্রয়মুখী"}`,
            },
          ],
        }),
      });
      const data = await res.json();
      const text = data?.content?.[0]?.text;
      if (text) return text.trim();
    } catch {
      // fall through to template
    }
  }

  // Deterministic-ish fallback (varies by product length so it feels fresh).
  const idx = (product?.length || Date.now()) % FALLBACK_CAPTIONS.length;
  return FALLBACK_CAPTIONS[idx];
}
