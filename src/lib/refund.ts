export const REFUND_WINDOW_DAYS = 30;

/** True when a charge made at `paidAtMs` is still inside the self-serve refund window. */
export function isWithinRefundWindow(paidAtMs: number, nowMs: number = Date.now()): boolean {
  const ageDays = (nowMs - paidAtMs) / 86_400_000;
  return ageDays >= 0 && ageDays <= REFUND_WINDOW_DAYS;
}
