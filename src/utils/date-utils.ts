// date-utils.ts — moment replaced with native Intl API (saves ~67KB bundle)

export interface OrderLike {
  createdAt?: string | Date;
  created_at?: string | Date;
  createAt?: string | Date;
  date?: string | Date;
}

const isValidDate = (d: Date): boolean => d instanceof Date && !isNaN(d.getTime());

const toDate = (date: Date | string): Date | null => {
  if (!date) return null;
  const d = typeof date === "string" ? new Date(date) : date;
  return isValidDate(d) ? d : null;
};

/** Format: "2024-01-15 14:30" */
export const formatDate = (date: Date | string, format: string = "YYYY-MM-DD HH:mm"): string => {
  const d = toDate(date);
  if (!d) return "Date unavailable";

  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes);
};

/** Current date/time in given format */
export const getCurrentDate = (format: string = "YYYY-MM-DD HH:mm"): string => {
  return formatDate(new Date(), format);
};

/** Add time to a date */
export const addTimeToDate = (date: Date | string, amount: number, unit: string = "days"): string => {
  const d = toDate(date);
  if (!d) return "Date unavailable";

  const result = new Date(d);
  switch (unit) {
    case "days": result.setDate(result.getDate() + amount); break;
    case "hours": result.setHours(result.getHours() + amount); break;
    case "minutes": result.setMinutes(result.getMinutes() + amount); break;
    case "months": result.setMonth(result.getMonth() + amount); break;
    case "years": result.setFullYear(result.getFullYear() + amount); break;
    default: result.setDate(result.getDate() + amount);
  }
  return formatDate(result);
};

/** Subtract time from a date */
export const subtractTimeFromDate = (date: Date | string, amount: number, unit: string = "days"): string => {
  return addTimeToDate(date, -amount, unit);
};

/** Start of unit — e.g. start of "month" */
export const getStartOf = (unit: string): string => {
  const now = new Date();
  switch (unit) {
    case "day": now.setHours(0, 0, 0, 0); break;
    case "month": now.setDate(1); now.setHours(0, 0, 0, 0); break;
    case "year": now.setMonth(0, 1); now.setHours(0, 0, 0, 0); break;
    case "week": {
      const day = now.getDay();
      now.setDate(now.getDate() - day);
      now.setHours(0, 0, 0, 0);
      break;
    }
  }
  return formatDate(now);
};

/** End of unit */
export const getEndOf = (unit: string): string => {
  const now = new Date();
  switch (unit) {
    case "day": now.setHours(23, 59, 59, 999); break;
    case "month": now.setMonth(now.getMonth() + 1, 0); now.setHours(23, 59, 59, 999); break;
    case "year": now.setMonth(11, 31); now.setHours(23, 59, 59, 999); break;
    case "week": {
      const day = now.getDay();
      now.setDate(now.getDate() + (6 - day));
      now.setHours(23, 59, 59, 999);
      break;
    }
  }
  return formatDate(now);
};

/** Pretty date: "January 15, 2024" */
export const formatPrettyDate = (date: Date | string): string => {
  const d = toDate(date);
  if (!d) return "Date unavailable";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  } catch {
    return "Date unavailable";
  }
};

/** Pretty date with time: "January 15, 2024 at 2:30 PM" */
export const formatPrettyDateWithTime = (date: Date | string): string => {
  const d = toDate(date);
  if (!d) return "Date unavailable";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return "Date unavailable";
  }
};

export const getOrderCreatedAt = (order?: OrderLike | null): string => {
  if (!order) return "Date unavailable";
  const rawDate = order.createdAt || order.created_at || order.createAt || order.date;
  if (!rawDate) return "Date unavailable";
  return formatPrettyDateWithTime(rawDate);
};
