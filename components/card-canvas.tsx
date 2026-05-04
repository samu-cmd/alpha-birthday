import Image from "next/image";
import type { BirthdayCard } from "@/lib/types";

type CardCanvasProps = {
  card: BirthdayCard;
  compact?: boolean;
};

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

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-[rgba(13,90,83,0.08)] p-3">
              <Image
                src="/Alpha-Color-Dark.png"
                alt="Alpha logo"
                width={146}
                height={40}
                priority
              />
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.32em] text-[var(--ink-soft)]">
                Shared Celebration Card
              </p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">
                Created on {formatDate(card.createdAt)}
              </p>
            </div>
          </div>

          <span
            className={`badge ${card.status === "completed" ? "badge-complete" : "badge-open"}`}
          >
            {card.status === "completed" ? "Completed" : "Open for signing"}
          </span>
        </div>

        <div className="max-w-3xl">
          <p className="font-mono text-sm uppercase tracking-[0.38em] text-[var(--brand)]">
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

        <section className="signature-paper relative rounded-[1.6rem] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.26em] text-[var(--brand)]">
                Messages and signatures
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
            <div className="mt-6 rounded-[1.4rem] border border-dashed border-[rgba(13,90,83,0.22)] bg-white/50 px-5 py-8 text-center text-[var(--ink-soft)]">
              The card is ready to share. Messages will appear here as people sign.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {card.entries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-[1.25rem] border border-[rgba(15,18,20,0.08)] bg-white/72 p-4"
                >
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
