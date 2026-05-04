import Image from "next/image";
import Link from "next/link";
import {
  completeCardAction,
  createCardAction,
  loginAction,
  logoutAction,
} from "@/app/actions";
import { CopyLinkButton } from "@/components/copy-link-button";
import { FormStatusButton } from "@/components/form-status-button";
import { CardCanvas } from "@/components/card-canvas";
import { ADMIN_EMAIL, getAdminSession } from "@/lib/auth";
import { listCards } from "@/lib/cards";

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function readSearchValue(
  value: string | string[] | undefined,
  expected = "",
): string {
  if (typeof value === "string") {
    return value;
  }

  return expected;
}

function Notification({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: React.ReactNode;
}) {
  const palette =
    tone === "error"
      ? "border-[rgba(142,59,59,0.18)] bg-[rgba(142,59,59,0.08)] text-[var(--danger)]"
      : "border-[rgba(37,103,74,0.18)] bg-[rgba(37,103,74,0.08)] text-[var(--success)]";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${palette}`}>
      {children}
    </div>
  );
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await getAdminSession();
  const params = await searchParams;
  const cards = session ? await listCards() : [];
  const authState = readSearchValue(params.auth);
  const createdSlug = readSearchValue(params.created);
  const completedSlug = readSearchValue(params.completed);
  const createError = readSearchValue(params.create);

  return (
    <main className="app-shell">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <section className="glass-panel hero-grid overflow-hidden rounded-[2.4rem] border px-6 py-8 text-white shadow-[0_30px_90px_rgba(6,15,18,0.18)] sm:px-10 sm:py-10">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2">
                <Image
                  src="/Alpha-Color-Dark.png"
                  alt="Alpha logo"
                  width={124}
                  height={34}
                  priority
                  className="rounded-lg bg-white/65 px-2 py-1"
                />
                <span className="font-mono text-xs uppercase tracking-[0.32em] text-white/78">
                  Birthday card studio
                </span>
              </div>

              <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                Create one beautiful card, share one link, collect every message.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/78">
                Simukelo signs in to create and complete cards. Everyone else opens
                the shared link, writes a message, and signs. Once the card is
                completed, signing closes and the final version is ready to
                download as a PDF.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/14 bg-black/10 p-5 lg:max-w-sm">
              <p className="font-mono text-xs uppercase tracking-[0.26em] text-white/65">
                Admin access
              </p>
              <p className="mt-3 text-sm leading-7 text-white/78">
                Only <span className="font-semibold text-white">{ADMIN_EMAIL}</span>{" "}
                can create cards, close signing, and download the final PDF.
              </p>
            </div>
          </div>
        </section>

        {!session ? (
          <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="paper-panel rounded-[2rem] p-6 sm:p-8">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--brand)]">
                How it works
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  "Create a birthday card for someone special.",
                  "Share the public signing link with the whole team.",
                  "Complete the card and download the final version as a PDF.",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="rounded-[1.4rem] border border-[rgba(15,18,20,0.08)] bg-white/60 p-5"
                  >
                    <p className="font-mono text-sm text-[var(--brand)]">
                      0{index + 1}
                    </p>
                    <p className="mt-3 text-base leading-7 text-[var(--ink-soft)]">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <CardCanvas
                  compact
                  card={{
                    id: "preview",
                    slug: "preview",
                    recipientName: "Samu",
                    occasionTitle: "Birthday Wishes for Samu",
                    coverMessage:
                      "Samu, this is a card full of messages from people who appreciate your energy, your kindness, and the way you show up for everyone around you.",
                    createdBy: ADMIN_EMAIL,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    status: "open",
                    completedAt: null,
                    entries: [
                      {
                        id: "entry-1",
                        signerName: "Alpha Team",
                        message: "Wishing you a year full of joy, growth, and unforgettable wins.",
                        createdAt: new Date().toISOString(),
                      },
                    ],
                  }}
                />
              </div>
            </div>

            <div className="paper-panel rounded-[2rem] p-6 sm:p-8">
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--brand)]">
                Creator login
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                Sign in to create and manage cards
              </h2>
              <p className="mt-3 max-w-lg text-base leading-7 text-[var(--ink-soft)]">
                The creator account is the only one that can start a card, complete
                it, and download the final PDF card.
              </p>

              <div className="mt-6 space-y-3">
                {authState === "failed" ? (
                  <Notification tone="error">
                    The email or password did not match the creator account.
                  </Notification>
                ) : null}
                {authState === "required" ? (
                  <Notification tone="error">
                    Please sign in as the creator to manage birthday cards.
                  </Notification>
                ) : null}
                {authState === "success" ? (
                  <Notification tone="success">
                    Login successful. You can now create and manage cards.
                  </Notification>
                ) : null}
              </div>

              <form action={loginAction} className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--ink)]">
                    Email
                  </label>
                  <input
                    className="field"
                    type="email"
                    name="email"
                    placeholder="simukelo@alpha.co.za"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[var(--ink)]">
                    Password
                  </label>
                  <input
                    className="field"
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    required
                  />
                </div>

                <FormStatusButton
                  label="Login as creator"
                  pendingLabel="Signing in..."
                  className="btn btn-primary w-full"
                />
              </form>
            </div>
          </section>
        ) : (
          <section className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
            <div className="paper-panel rounded-[2rem] p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--brand)]">
                    Creator dashboard
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                    Create a new birthday card
                  </h2>
                </div>

                <form action={logoutAction}>
                  <FormStatusButton
                    label="Logout"
                    pendingLabel="Logging out..."
                    className="btn btn-secondary"
                  />
                </form>
              </div>

              <div className="mt-6 space-y-3">
                {createError === "missing" ? (
                  <Notification tone="error">
                    Recipient name and opening message are required to create a card.
                  </Notification>
                ) : null}
                {createdSlug ? (
                  <Notification tone="success">
                    Card created successfully. Scroll down to copy and share the link.
                  </Notification>
                ) : null}
                {completedSlug ? (
                  <Notification tone="success">
                    Card completed. It is now locked and ready to download.
                  </Notification>
                ) : null}
              </div>

              <form action={createCardAction} className="mt-8 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Recipient name
                  </label>
                  <input
                    className="field"
                    name="recipientName"
                    placeholder="Samu"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Card title
                  </label>
                  <input
                    className="field"
                    name="occasionTitle"
                    placeholder="Birthday Wishes for Samu"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Opening message
                  </label>
                  <textarea
                    className="field min-h-36"
                    name="coverMessage"
                    placeholder="Write the main birthday note that appears at the top of the card."
                    required
                  />
                </div>

                <FormStatusButton
                  label="Create card"
                  pendingLabel="Creating card..."
                  className="btn btn-primary"
                />
              </form>
            </div>

            <div className="paper-panel rounded-[2rem] p-6 sm:p-8">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--brand)]">
                    Your cards
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                    Share, monitor, and complete cards
                  </h2>
                </div>
                <div className="rounded-[1.2rem] border border-[rgba(15,18,20,0.08)] bg-white/60 px-4 py-3 text-right">
                  <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--brand)]">
                    Total cards
                  </p>
                  <p className="mt-1 text-2xl font-semibold">{cards.length}</p>
                </div>
              </div>

              {cards.length === 0 ? (
                <div className="mt-8 rounded-[1.6rem] border border-dashed border-[rgba(13,90,83,0.28)] bg-white/55 px-6 py-10 text-center text-[var(--ink-soft)]">
                  No cards yet. Create one on the left and it will appear here
                  immediately.
                </div>
              ) : (
                <div className="mt-8 space-y-5">
                  {cards.map((card) => {
                    const cardUrl = `/cards/${card.slug}`;
                    const printUrl = `/cards/${card.slug}/print`;

                    return (
                      <article
                        key={card.id}
                        className="rounded-[1.7rem] border border-[rgba(15,18,20,0.08)] bg-white/65 p-5"
                      >
                        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-2xl font-semibold tracking-[-0.04em]">
                                {card.recipientName}
                              </h3>
                              <span
                                className={`badge ${
                                  card.status === "completed"
                                    ? "badge-complete"
                                    : "badge-open"
                                }`}
                              >
                                {card.status === "completed"
                                  ? "Completed"
                                  : "Open"}
                              </span>
                            </div>
                            <p className="mt-2 text-sm uppercase tracking-[0.22em] text-[var(--brand)]">
                              {card.occasionTitle}
                            </p>
                            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--ink-soft)]">
                              {card.coverMessage}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-4 text-sm text-[var(--ink-soft)]">
                              <span>{card.entries.length} messages</span>
                              <span>Created by {card.createdBy}</span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <CopyLinkButton path={cardUrl} />
                            <Link className="btn btn-secondary" href={cardUrl}>
                              Open public card
                            </Link>

                            {card.status === "open" ? (
                              <form action={completeCardAction}>
                                <input type="hidden" name="slug" value={card.slug} />
                                <FormStatusButton
                                  label="Complete card"
                                  pendingLabel="Completing..."
                                  className="btn btn-danger"
                                />
                              </form>
                            ) : (
                              <Link className="btn btn-primary" href={printUrl}>
                                Open final card
                              </Link>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
