export type CardStatus = "open" | "completed";

export type SignatureEntry = {
  id: string;
  signerName: string;
  message: string;
  createdAt: string;
};

export type BirthdayCard = {
  id: string;
  slug: string;
  recipientName: string;
  occasionTitle: string;
  coverMessage: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: CardStatus;
  completedAt: string | null;
  entries: SignatureEntry[];
};

export type CardsStore = {
  cards: BirthdayCard[];
};
