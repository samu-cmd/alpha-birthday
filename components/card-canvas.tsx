import Image from "next/image";
import type { CSSProperties } from "react";
import type { BirthdayCard } from "@/lib/types";

type CardCanvasProps = {
  card: BirthdayCard;
  compact?: boolean;
};

const balloons: CSSProperties[] = [
  { top: "1.8rem", left: "1.5rem", ["--balloon-color" as string]: "#ff8f6b" },
  { top: "3.6rem", left: "4.8rem", ["--balloon-color" as string]: "#ffd166" },
  { top: "1.4rem", right: "4rem", ["--balloon-color" as string]: "#66c7be" },
  { top: "3.5rem", right: "1.4rem", ["--balloon-color" as string]: "#7ab6ff" },
];

const confetti: CSSProperties[] = [
  {
    top: "7.4rem",
    left: "28%",
    ["--rotate" as string]: "12deg",
    ["--confetti-color" as string]: "#ff8f6b",
  },
  {
    top: "9rem",
    left: "37%",
    ["--rotate" as string]: "-18deg",
    ["--confetti-color" as string]: "#ffd166",
  },
  {
    top: "6.2rem",
    right: "30%",
    ["--rotate" as string]: "10deg",
    ["--confetti-color" as string]: "#66c7be",
  },
  {
    top: "11rem",
    right: "24%",
    ["--rotate" as string]: "-26deg",
    ["--confetti-color" as string]: "#e97bb1",
  },
  {
    top: "13rem",
    left: "12%",
    ["--rotate" as string]: "24deg",
    ["--confetti-color" as string]: "#7ab6ff",
  },
  {
    top: "14.2rem",
    right: "10%",
    ["--rotate" as string]: "8deg",
    ["--confetti-color" as string]: "#ffb44d",
  },
];

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}

export function CardCanvas({ card, compact = false }: CardCanvasProps) {
  return (
    <article className="alpha-card p-6 sm:p-8">
      <span className="message-tape" />
      <div aria-hidden="true" className="balloon-scene">
        {balloons.map((style, index) => (
          <span key={`balloon-${index}`} className="balloon" style={style} />
        ))}
      </div>
      <div aria-hidden="true" className="confetti-layer">
        {confetti.map((style, index) => (
          <span key={`confetti-${index}`} className="confetti-dot" style={style} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="celebration-kicker">Happy Birthday</p>
            <p className="mt-4 font-[family-name:var(--font-plex-mono)] text-sm uppercase tracking-[0.38em] text-[var(--brand)]">
              {card.occasionTitle}
            </p>
            <h1
              className={`mt-3 font-semibold tracking-[-0.04em] text-[var(--ink)] ${
                compact ? "text-3xl sm:text-4xl" : "text-4xl sm:text-5xl"
              }`}
            >
              {card.recipientName}
            </h1>
            <p
              className={`mt-4 max-w-2xl leading-8 text-[var(--ink-soft)] ${
                compact ? "text-base" : "text-lg"
              }`}
            >
              {card.coverMessage}
            </p>
          </div>

          <div className="celebration-meta">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/70 p-3 shadow-[0_12px_30px_rgba(217,93,74,0.12)]">
                <Image
                  src="/Alpha-Color-Dark.png"
                  alt="Alpha logo"
                  width={146}
                  height={40}
                  priority
                />
              </div>
              <div>
                <p className="font-[family-name:var(--font-plex-mono)] text-xs uppercase tracking-[0.32em] text-[var(--ink-soft)]">
                  Shared Celebration Card
                </p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">
                  Created on {formatDate(card.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`badge ${card.status === "completed" ? "badge-complete" : "badge-open"}`}
              >
                {card.status === "completed" ? "Completed" : "Open for signing"}
              </span>
              <span className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--ink-soft)]">
                {card.entries.length} {card.entries.length === 1 ? "message" : "messages"}
              </span>
            </div>
            <p className="text-sm leading-7 text-[var(--ink-soft)]">
              {card.completedAt
                ? `Final card prepared on ${formatDate(card.completedAt)}`
                : "Share the link so everyone can add a message before the card is closed."}
            </p>
          </div>
        </div>

        <section className="signature-paper relative rounded-[1.6rem] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-[family-name:var(--font-plex-mono)] text-xs uppercase tracking-[0.26em] text-[var(--brand)]">
                Birthday wishes
              </p>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">
                {card.entries.length} {card.entries.length === 1 ? "person has" : "people have"}{" "}
                signed this card.
              </p>
            </div>
            {card.completedAt ? (
              <p className="text-right text-sm text-[var(--ink-soft)]">
                Finalized on {formatDate(card.completedAt)}
              </p>
            ) : null}
          </div>

          {card.entries.length === 0 ? (
            <div className="wish-empty mt-6 rounded-[1.4rem] px-5 py-8 text-center text-[var(--ink-soft)]">
              The card is ready to share. Messages will appear here as people sign.
            </div>
          ) : (
            <div className="message-grid mt-6 grid gap-4 md:grid-cols-2">
              {card.entries.map((entry) => (
                <div key={entry.id} className="wish-card rounded-[1.25rem] p-4">
                  <p className="text-base leading-7 text-[var(--ink)]">
                    &ldquo;{entry.message}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[var(--ink-soft)]">
                    <span className="font-semibold text-[var(--brand-strong)]">
                      {entry.signerName}
                    </span>
                    <span>{formatDate(entry.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </article>
  );
}
