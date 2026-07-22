const STEADFAST_BASE =
  process.env.STEADFAST_BASE_URL || "https://portal.packzy.com/api/v1";

export interface SteadfastCredentials {
  apiKey: string;
  secretKey: string;
}

export interface CreateOrderInput {
  invoice: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  amount: number;
  note?: string;
}

export interface CreateOrderResult {
  ok: boolean;
  consignmentId?: string;
  trackingCode?: string;
  status?: string;
  error?: string;
}

function headers(creds: SteadfastCredentials) {
  return {
    "Api-Key": creds.apiKey,
    "Secret-Key": creds.secretKey,
    "Content-Type": "application/json",
  };
}

/** Creates a delivery order in Steadfast and returns the tracking code. */
export async function createSteadfastOrder(
  creds: SteadfastCredentials,
  order: CreateOrderInput,
): Promise<CreateOrderResult> {
  try {
    const res = await fetch(`${STEADFAST_BASE}/create_order`, {
      method: "POST",
      headers: headers(creds),
      body: JSON.stringify({
        invoice: order.invoice,
        recipient_name: order.recipientName,
        recipient_phone: order.recipientPhone,
        recipient_address: order.recipientAddress,
        cod_amount: order.amount,
        note: order.note || "",
      }),
    });
    const data = await res.json();

    if (!res.ok || data.status === 400 || data.status === 401) {
      return { ok: false, error: data.message || `Steadfast error (${res.status})` };
    }

    const c = data.consignment ?? data;
    return {
      ok: true,
      consignmentId: c.consignment_id?.toString(),
      trackingCode: c.tracking_code,
      status: c.status,
    };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}

/** Checks delivery status by tracking code. Maps to our internal statuses. */
export async function getSteadfastStatus(
  creds: SteadfastCredentials,
  trackingCode: string,
): Promise<{ ok: boolean; status?: string; error?: string }> {
  try {
    const res = await fetch(
      `${STEADFAST_BASE}/status_by_trackingcode/${trackingCode}`,
      { headers: headers(creds) },
    );
    const data = await res.json();
    if (!res.ok) return { ok: false, error: `Steadfast error (${res.status})` };

    // Steadfast delivery_status -> our order status
    const map: Record<string, string> = {
      pending: "shipped",
      in_review: "shipped",
      hold: "shipped",
      delivered: "delivered",
      partial_delivered: "delivered",
      cancelled: "returned",
      returned: "returned",
    };
    const raw = (data.delivery_status || "").toLowerCase();
    return { ok: true, status: map[raw] || "shipped" };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
