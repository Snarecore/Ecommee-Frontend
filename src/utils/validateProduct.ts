export type DiscountTypeValue = "NONE" | "PERCENT" | "FLAT";

export function validatePricing(params: {
  price: number;
  discountType?: DiscountTypeValue | null;
  discountAmount?: number | null;
}) {
  const errors: string[] = [];
  const price = Number(params.price);
  const discountAmount = Number(params.discountAmount ?? 0);
  const type = params.discountType ?? "NONE";

  if (Number.isNaN(price)) errors.push("Price must be a number.");
  if (price < 0) errors.push("Price cannot be negative.");

  if (type === "PERCENT") {
    if (Number.isNaN(discountAmount)) errors.push("Percentage discount must be a number.");
    if (discountAmount <= 0) errors.push("Percentage discount must be greater than 0%.");
    if (discountAmount >= 100) errors.push("Percentage discount must be less than 100%.");
    const finalPrice = price * (1 - discountAmount / 100);
    if (finalPrice < 0) errors.push("Discount makes final price negative.");
  } else if (type === "FLAT") {
    if (Number.isNaN(discountAmount)) errors.push("Flat discount must be a number.");
    if (discountAmount <= 0) errors.push("Flat discount must be greater than 0.");
    if (discountAmount >= price) errors.push("Flat discount cannot be greater than or equal to price.");
    const finalPrice = price - discountAmount;
    if (finalPrice < 0) errors.push("Discount makes final price negative.");
  }
  // type === 'NONE' → no discount checks

  return errors;
}
