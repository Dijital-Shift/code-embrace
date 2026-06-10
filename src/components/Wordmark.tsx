import { Link } from "@tanstack/react-router";

const GOLD = "#c9a84c";
const WORDMARK_FONT = "'Cinzel', 'Trajan Pro', Georgia, serif";

export function Wordmark({ size = "md", asLink = true }: { size?: "sm" | "md"; asLink?: boolean }) {
  const cls =
    size === "sm"
      ? "text-base sm:text-lg font-semibold tracking-[0.18em] uppercase"
      : "text-lg sm:text-xl font-semibold tracking-[0.18em] uppercase";

  const span = (
    <span
      className={cls}
      style={{
        fontFamily: WORDMARK_FONT,
        color: GOLD,
        textShadow: "0 0 18px rgba(201,168,76,0.45)",
      }}
    >
      Kingdom Protocol
    </span>
  );

  if (!asLink) return span;
  return (
    <Link to="/" className="flex items-center">
      {span}
    </Link>
  );
}
