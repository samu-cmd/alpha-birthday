"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  addSignatureToCard,
  completeCard,
  createCard,
  getCardBySlug,
} from "@/lib/cards";
import {
  clearAdminSession,
  createAdminSession,
  getAdminSession,
  isAdminCredentials,
} from "@/lib/auth";

function readRequiredText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function requireAdminOrRedirect() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/?auth=required");
  }

  return session;
}

export async function loginAction(formData: FormData) {
  const email = readRequiredText(formData, "email");
  const password = readRequiredText(formData, "password");

  if (!isAdminCredentials(email, password)) {
    redirect("/?auth=failed");
  }

  await createAdminSession();
  redirect("/?auth=success");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/");
}

export async function createCardAction(formData: FormData) {
  const session = await requireAdminOrRedirect();
  const recipientName = readRequiredText(formData, "recipientName");
  const occasionTitle = readRequiredText(formData, "occasionTitle");
  const coverMessage = readRequiredText(formData, "coverMessage");

  if (!recipientName || !coverMessage) {
    redirect("/?create=missing");
  }

  const card = await createCard({
    recipientName,
    occasionTitle: occasionTitle || `Birthday Wishes for ${recipientName}`,
    coverMessage,
    createdBy: session.email,
  });

  refresh();
  redirect(`/?created=${card.slug}`);
}

export async function signCardAction(formData: FormData) {
  const slug = readRequiredText(formData, "slug");
  const signerName = readRequiredText(formData, "signerName");
  const message = readRequiredText(formData, "message");

  if (!slug) {
    redirect("/");
  }

  if (!signerName || !message) {
    redirect(`/cards/${slug}?error=missing`);
  }

  const card = await getCardBySlug(slug);
  if (!card) {
    redirect("/");
  }

  if (card.status === "completed") {
    redirect(`/cards/${slug}?error=locked`);
  }

  await addSignatureToCard({
    slug,
    signerName,
    message,
  });

  refresh();
  redirect(`/cards/${slug}?signed=1`);
}

export async function completeCardAction(formData: FormData) {
  await requireAdminOrRedirect();
  const slug = readRequiredText(formData, "slug");

  if (!slug) {
    redirect("/");
  }

  await completeCard(slug);
  refresh();
  redirect(`/?completed=${slug}`);
}
