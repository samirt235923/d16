import { useEffect, useState } from "react";

const DEFAULT_TOTAL = 2 * 3600 + 15 * 60 + 48;

function useCountdown(durationSeconds: number, storageKey: string) {
  const [left, setLeft] = useState(durationSeconds);

  useEffect(() => {
    const dayKey = `${storageKey}_${new Date().toISOString().slice(0, 10)}_${durationSeconds}`;
    let deadline = Number(localStorage.getItem(dayKey));
    if (!deadline || deadline < Date.now()) {
      deadline = Date.now() + durationSeconds * 1000;
      localStorage.setItem(dayKey, String(deadline));
    }
    const tick = () =>
      setLeft(Math.max(0, Math.floor((deadline - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [durationSeconds, storageKey]);

  return {
    d: Math.floor(left / 86400),
    h: Math.floor((left % 86400) / 3600),
    m: Math.floor((left % 3600) / 60),
    s: left % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function Countdown({ tone = "light", durationSeconds = DEFAULT_TOTAL, storageKey = "gizmozone_offer" }: { tone?: "light" | "dark"; durationSeconds?: number; storageKey?: string }) {
  const { d, h, m, s } = useCountdown(durationSeconds, storageKey);
  const box =
    tone === "dark"
      ? "bg-primary-foreground/15 text-primary-foreground"
      : "bg-secondary text-foreground";
  const label = tone === "dark" ? "text-primary-foreground/70" : "text-muted-foreground";

  return (
    <div className="flex items-center justify-center gap-2">
      {[
        [pad(d), "দিন"],
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
