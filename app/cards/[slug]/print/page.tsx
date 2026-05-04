import Link from "next/link";
import { redirect } from "next/navigation";
import { CardCanvas } from "@/components/card-canvas";
import { PrintButton } from "@/components/print-button";
import { getAdminSession } from "@/lib/auth";
import { getCardBySlug } from "@/lib/cards";

type CardPrintPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CardPrintPage({ params }: CardPrintPageProps) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/?auth=required");
  }

  const { slug } = await params;
  const card = await getCardBySlug(slug);

  if (!card) {
    redirect("/");
  }

  if (card.status !== "completed") {
    redirect(`/cards/${slug}`);
  }

  return (
    <main className="app-shell">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <section className="paper-panel screen-only rounded-[1.8rem] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--brand)]">
                PDF-ready view
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                Final birthday card for {card.recipientName}
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--ink-soft)]">
                Use the button on the right, then choose &quot;Save as PDF&quot; in
                the print dialog to download the finished card.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link className="btn btn-secondary" href="/">
                Back to dashboard
              </Link>
              <PrintButton />
            </div>
          </div>
        </section>

        <CardCanvas card={card} />
      </div>
    </main>
  );
}
