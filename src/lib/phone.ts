/** Live phone mask: (555) 123-4567 for North America; "+" numbers keep digits with spaces. */
export function formatPhone(raw: string): string {
  const value = raw ?? "";
  if (value.trim().startsWith("+")) {
    const digits = value.replace(/\D/g, "").slice(0, 15);
    if (digits.startsWith("1")) return "+1 " + formatPhone(digits.slice(1));
    return "+" + digits.replace(/(\d{1,3})(\d{0,4})(\d{0,4})(\d{0,4})/, (_, a, b, c, d) => [a, b, c, d].filter(Boolean).join(" "));
  }
  let d = value.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  d = d.slice(0, 10);
  if (!d) return "";
  if (d.length < 4) return `(${d}`;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export function isValidPhone(raw: string): boolean {
  const digits = (raw ?? "").replace(/\D/g, "");
  return raw.trim().startsWith("+") ? digits.length >= 8 && digits.length <= 15 : digits.length === 10;
}
