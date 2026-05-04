import { getAdminSession } from "@/lib/auth";
import { getCardBySlug } from "@/lib/cards";
import { buildBirthdayCardPdf } from "@/lib/card-pdf";

function toFileSlug(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "birthday-card";
}

export async function GET(
  request: Request,
  context: {
    params: Promise<{ slug: string }>;
  },
) {
  const session = await getAdminSession();

  if (!session) {
    return Response.redirect(new URL("/?auth=required", request.url), 302);
  }

  const { slug } = await context.params;
  const card = await getCardBySlug(slug);

  if (!card) {
    return Response.redirect(new URL("/", request.url), 302);
  }

  if (card.status !== "completed") {
    return Response.redirect(new URL(`/cards/${slug}`, request.url), 302);
  }

  const pdf = buildBirthdayCardPdf(card);
  const fileName = `${toFileSlug(card.recipientName)}-birthday-card.pdf`;

  return new Response(pdf, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": pdf.byteLength.toString(),
      "Content-Type": "application/pdf",
    },
  });
}
