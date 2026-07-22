const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** Convert any number/string to Bengali digits. */
export function bn(value: number | string): string {
  return value.toString().replace(/\d/g, (d) => BN_DIGITS[Number(d)]);
}

/** Format an amount as Bengali Taka, e.g. ৳১,২৫০ */
export function money(value: number): string {
  return "৳" + bn(Math.round(value).toLocaleString("en-US"));
}

/** Human friendly Bengali date. */
export function bnDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function bnDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("bn-BD", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export const STATUS_BN: Record<string, string> = {
  pending: "পেন্ডিং",
  processing: "প্রসেসিং",
  posted: "পোস্টেড",
  shipped: "শিপড",
  delivered: "ডেলিভার্ড",
  failed: "ব্যর্থ",
  returned: "রিটার্ন",
};

export const COURIER_NAME: Record<string, string> = {
  steadfast: "Steadfast",
  pathao: "Pathao",
  redx: "RedX",
};

export const MEDIA_TYPE_BN: Record<string, string> = {
  image: "ছবি",
  video: "ভিডিও",
  multi: "মাল্টি",
};
