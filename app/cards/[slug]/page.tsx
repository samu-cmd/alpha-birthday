import Link from "next/link";
import { notFound } from "next/navigation";
import { signCardAction } from "@/app/actions";
import { CardCanvas } from "@/components/card-canvas";
import { FormStatusButton } from "@/components/form-status-button";
import { getCardBySlug } from "@/lib/cards";

type CardPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function Alert({
  tone,
  children,
}: {
  tone: "error" | "success" | "neutral";
  children: React.ReactNode;
}) {
  const className =
    tone === "error"
      ? "border-[rgba(142,59,59,0.16)] bg-[rgba(142,59,59,0.08)] text-[var(--danger)]"
      : tone === "success"
        ? "border-[rgba(37,103,74,0.16)] bg-[rgba(37,103,74,0.08)] text-[var(--success)]"
        : "border-[rgba(185,144,75,0.18)] bg-[rgba(185,144,75,0.1)] text-[#6f5320]";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${className}`}>
      {children}
    </div>
  );
}

export default async function CardPage({
  params,
  searchParams,
}: CardPageProps) {
  const { slug } = await params;
  const card = await getCardBySlug(slug);

  if (!card) {
    notFound();
  }

  const query = await searchParams;
  const error = readSearchValue(query.error);
  const signed = readSearchValue(query.signed);

  return (
    <main className="app-shell">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="screen-only flex items-center justify-between gap-4">
          <Link
            href="/"
            className="btn btn-secondary border-white/20 bg-white/12 text-white"
          >
            Back to home
          </Link>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-white/70">
            Public card link
          </p>
        </div>

        <CardCanvas card={card} />

        <section className="paper-panel rounded-[2rem] p-6 sm:p-8">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--brand)]">
              Leave your message
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
              Sign the birthday card for {card.recipientName}
            </h2>
            <p className="mt-3 text-base leading-7 text-[var(--ink-soft)]">
              Add your name and message below. Once the creator completes the
              card, this form closes automatically.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {signed === "1" ? (
              <Alert tone="success">
                Your message has been added to the card. Thank you for signing.
              </Alert>
            ) : null}
            {error === "missing" ? (
              <Alert tone="error">
                Please enter both your name and your birthday message.
              </Alert>
            ) : null}
            {error === "locked" ? (
              <Alert tone="neutral">
                This card has already been completed, so no more signatures can be
                added.
              </Alert>
            ) : null}
          </div>

          {card.status === "completed" ? (
            <div className="mt-8 rounded-[1.7rem] border border-dashed border-[rgba(185,144,75,0.28)] bg-white/55 px-6 py-10 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#7d642f]">
                Signing closed
              </p>
              <p className="mt-4 text-lg leading-8 text-[var(--ink-soft)]">
                The creator has finalized this card and it is now locked for PDF
                download.
              </p>
            </div>
          ) : (
            <form action={signCardAction} className="mt-8 grid gap-5 lg:grid-cols-2">
              <input type="hidden" name="slug" value={card.slug} />

              <div className="lg:col-span-1">
                <label className="mb-2 block text-sm font-semibold">Your name</label>
                <input
                  className="field"
                  name="signerName"
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-semibold">
                  Birthday message
                </label>
                <textarea
                  className="field min-h-36"
                  name="message"
                  placeholder="Write something kind, encouraging, or celebratory."
                  required
                />
              </div>

              <div className="lg:col-span-2">
                <FormStatusButton
                  label="Add message to card"
                  pendingLabel="Adding message..."
                  className="btn btn-primary"
                />
              </div>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
