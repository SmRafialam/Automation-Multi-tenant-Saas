export type Role = "owner" | "manager" | "staff";

export interface Member {
  id: string;
  business_id: string;
  user_id: string;
  email: string | null;
  role: Role;
  created_at: string;
}

export type PostStatus = "pending" | "processing" | "posted" | "failed";
export type MediaType = "image" | "video" | "multi";
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "returned";
export type Courier = "steadfast" | "pathao" | "redx";
export type ConnectionType = "facebook" | "sheet" | "steadfast" | "whatsapp";

export interface Business {
  id: string;
  owner_user_id: string;
  name: string;
  plan: string;
  created_at: string;
}

export interface Post {
  id: string;
  business_id: string;
  caption: string | null;
  ai_caption: string | null;
  media_url: string | null;
  media_type: MediaType;
  scheduled_time: string | null;
  status: PostStatus;
  fb_post_id: string | null;
  error_message: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  business_id: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  address: string | null;
  items: string | null;
  amount: number;
  status: OrderStatus;
  courier: Courier;
  courier_tracking_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Connection {
  id: string;
  business_id: string;
  type: ConnectionType;
  fb_page_id: string | null;
  access_token: string | null;
  extra_json: Record<string, unknown>;
  status: string;
  created_at: string;
}
