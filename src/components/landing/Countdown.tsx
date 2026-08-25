import { useEffect, useState } from "react";

const TOTAL = 2 * 3600 + 15 * 60 + 48;
const KEY = "d16_offer_deadline";

function useCountdown() {
  const [left, setLeft] = useState(TOTAL);

  useEffect(() => {
    let deadline = Number(localStorage.getItem(KEY));
    if (!deadline || deadline < Date.now()) {
      deadline = Date.now() + TOTAL * 1000;
      localStorage.setItem(KEY, String(deadline));
    }
    const tick = () =>
      setLeft(Math.max(0, Math.floor((deadline - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return {
    h: Math.floor(left / 3600),
    m: Math.floor((left % 3600) / 60),
    s: left % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { h, m, s } = useCountdown();
  const box =
    tone === "dark"
      ? "bg-primary-foreground/15 text-primary-foreground"
      : "bg-secondary text-foreground";
  const label = tone === "dark" ? "text-primary-foreground/70" : "text-muted-foreground";

  return (
    <div className="flex items-center justify-center gap-2">
      {[
        [pad(h), "ঘণ্টা"],
        [pad(m), "মিনিট"],
        [pad(s), "সেকেন্ড"],
      ].map(([value, name]) => (
        <div key={name} className="flex flex-col items-center gap-1">
          <div
            className={`${box} min-w-[58px] rounded-2xl px-3 py-2 text-center text-2xl font-bold tabular-nums`}
          >
            {value}
          </div>
          <span className={`text-[11px] ${label}`}>{name}</span>
        </div>
      ))}
    </div>
  );
}
