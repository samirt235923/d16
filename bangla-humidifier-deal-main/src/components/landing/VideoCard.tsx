import { useState } from "react";

export function VideoCard({
  src,
  poster,
  label,
}: {
  src: string;
  poster: string;
  label: string;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing && src) {
    return (
      <video
        className="aspect-video w-full rounded-3xl bg-foreground/5 shadow-soft"
        src={src}
        poster={poster}
        controls
        autoPlay
        playsInline
        preload="none"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => src && setPlaying(true)}
      className="group relative block w-full overflow-hidden rounded-3xl shadow-soft active:scale-[0.99] transition-transform"
      aria-label={label}
    >
      <img
        src={poster}
        alt={label}
        loading="lazy"
        width={1280}
        height={720}
        className="aspect-video w-full object-cover"
      />
      <span className="absolute inset-0 bg-foreground/20" />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-background/90 shadow-soft">
          <span className="ml-1 block h-0 w-0 border-y-[11px] border-l-[18px] border-y-transparent border-l-primary" />
        </span>
      </span>
      {!src && (
        <span className="absolute bottom-3 left-3 right-3 rounded-xl bg-background/90 px-3 py-2 text-xs text-muted-foreground">
          ভিডিও লিংক যুক্ত করুন (src/lib/media.ts)
        </span>
      )}
    </button>
  );
}
