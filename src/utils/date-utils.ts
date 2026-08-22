import moment from "moment";

export interface OrderLike {
  createdAt?: string | Date;
  created_at?: string | Date;
  createAt?: string | Date;
  date?: string | Date;
}

export const formatDate = (date: Date | string, format: string = "YYYY-MM-DD HH:mm"): string => {
  if (!date) return "Date unavailable";
  const m = moment(date);
  if (!m.isValid()) return "Date unavailable";
  const res = m.format(format);
  return res === "Invalid date" ? "Date unavailable" : res;
};

export const getCurrentDate = (format: string = "YYYY-MM-DD HH:mm"): string => {
  return moment().format(format);
};

export const addTimeToDate = (date: Date | string, amount: number, unit: moment.unitOfTime.DurationConstructor = "days"): string => {
  if (!date) return "Date unavailable";
  const m = moment(date);
  if (!m.isValid()) return "Date unavailable";
  return m.add(amount, unit).format("YYYY-MM-DD HH:mm");
};

export const subtractTimeFromDate = (date: Date | string, amount: number, unit: moment.unitOfTime.DurationConstructor = "days"): string => {
  if (!date) return "Date unavailable";
  const m = moment(date);
  if (!m.isValid()) return "Date unavailable";
  return m.subtract(amount, unit).format("YYYY-MM-DD HH:mm");
};

export const getStartOf = (unit: moment.unitOfTime.StartOf): string => {
  return moment().startOf(unit).format("YYYY-MM-DD HH:mm");
};

export const getEndOf = (unit: moment.unitOfTime.StartOf): string => {
  return moment().endOf(unit).format("YYYY-MM-DD HH:mm");
};

export const formatPrettyDate = (date: Date | string): string => {
  if (!date) return "Date unavailable";
  const m = moment(date);
  if (!m.isValid()) return "Date unavailable";
  const res = m.format("LL");
  return res === "Invalid date" ? "Date unavailable" : res;
};

export const formatPrettyDateWithTime = (date: Date | string): string => {
  if (!date) return "Date unavailable";
  const m = moment(date);
  if (!m.isValid()) return "Date unavailable";
  const res = m.format("LLL");
  return res === "Invalid date" ? "Date unavailable" : res;
};

export const getOrderCreatedAt = (order?: OrderLike | null): string => {
  if (!order) return "Date unavailable";
  const rawDate = order.createdAt || order.created_at || order.createAt || order.date;
  if (!rawDate) return "Date unavailable";
  return formatPrettyDateWithTime(rawDate);
};
