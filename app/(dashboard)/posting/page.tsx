import { getBusiness } from "@/lib/data";
import { PostingClient } from "@/components/posting-client";
import type { Post } from "@/lib/types";

export default async function PostingPage() {
  const { supabase, business } = await getBusiness();
  if (!business) return null;

  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return <PostingClient posts={(data ?? []) as Post[]} />;
}
