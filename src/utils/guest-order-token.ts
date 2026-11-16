// Guests prove access to their order with the signed token the API returns from POST /orders.
// It is scoped to one order and lives only for this browser tab session.
const storageKey = (orderId: string) => `guest_order_token_${orderId}`;

export const getGuestOrderHeaders = (...orderIds: Array<string | null | undefined>): Record<string, string> => {
  if (typeof window === "undefined") return {};
  try {
    for (const id of orderIds) {
      const token = id ? sessionStorage.getItem(storageKey(id)) : null;
      if (token) return { "x-guest-order-token": token };
    }
  } catch {}
  return {};
};
