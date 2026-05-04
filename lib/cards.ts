import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { BirthdayCard, CardsStore, SignatureEntry } from "@/lib/types";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIRECTORY, "cards.json");

async function ensureStoreFile() {
  await mkdir(DATA_DIRECTORY, { recursive: true });

  try {
    await readFile(DATA_FILE, "utf8");
  } catch {
    const emptyStore: CardsStore = { cards: [] };
    await writeFile(DATA_FILE, JSON.stringify(emptyStore, null, 2), "utf8");
  }
}

async function readStore(): Promise<CardsStore> {
  await ensureStoreFile();
  const raw = await readFile(DATA_FILE, "utf8");
  return JSON.parse(raw) as CardsStore;
}

async function writeStore(store: CardsStore) {
  await writeFile(DATA_FILE, JSON.stringify(store, null, 2), "utf8");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function listCards() {
  const store = await readStore();
  return store.cards.sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

export async function getCardBySlug(slug: string) {
  const store = await readStore();
  return store.cards.find((card) => card.slug === slug) ?? null;
}

export async function createCard(input: {
  recipientName: string;
  occasionTitle: string;
  coverMessage: string;
  createdBy: string;
}) {
  const now = new Date().toISOString();
  const store = await readStore();
  const baseSlug = slugify(input.recipientName) || "birthday-card";
  const card: BirthdayCard = {
    id: randomUUID(),
    slug: `${baseSlug}-${randomUUID().slice(0, 8)}`,
    recipientName: input.recipientName,
    occasionTitle: input.occasionTitle,
    coverMessage: input.coverMessage,
    createdBy: input.createdBy,
    createdAt: now,
    updatedAt: now,
    status: "open",
    completedAt: null,
    entries: [],
  };

  store.cards.unshift(card);
  await writeStore(store);
  return card;
}

export async function addSignatureToCard(input: {
  slug: string;
  signerName: string;
  message: string;
}) {
  const store = await readStore();
  const card = store.cards.find((item) => item.slug === input.slug);

  if (!card) {
    throw new Error("Card not found.");
  }

  if (card.status === "completed") {
    throw new Error("This card is already completed.");
  }

  const entry: SignatureEntry = {
    id: randomUUID(),
    signerName: input.signerName,
    message: input.message,
    createdAt: new Date().toISOString(),
  };

  card.entries.push(entry);
  card.updatedAt = entry.createdAt;

  await writeStore(store);
  return card;
}

export async function completeCard(slug: string) {
  const store = await readStore();
  const card = store.cards.find((item) => item.slug === slug);

  if (!card) {
    throw new Error("Card not found.");
  }

  if (card.status === "completed") {
    return card;
  }

  const now = new Date().toISOString();
  card.status = "completed";
  card.completedAt = now;
  card.updatedAt = now;

  await writeStore(store);
  return card;
}
