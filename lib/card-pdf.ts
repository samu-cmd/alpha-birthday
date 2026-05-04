import type { BirthdayCard, SignatureEntry } from "@/lib/types";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const PAGE_MARGIN = 36;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
const ENTRY_COLUMNS = 2;
const ENTRY_ROWS_PER_PAGE = 2;
const ENTRIES_PER_PAGE = ENTRY_COLUMNS * ENTRY_ROWS_PER_PAGE;

type PdfColor = [number, number, number];

type PdfPage = {
  content: string;
};

type TextOptions = {
  font: "F1" | "F2";
  size: number;
  x: number;
  y: number;
  color: PdfColor;
  align?: "left" | "center" | "right";
};

const COLORS = {
  background: toPdfColor("#fff8ef"),
  cardFill: toPdfColor("#fff2df"),
  cardBorder: toPdfColor("#f2c185"),
  messageFill: toPdfColor("#fffdf9"),
  messageBorder: toPdfColor("#efc1ae"),
  ribbon: toPdfColor("#f28d42"),
  ribbonShadow: toPdfColor("#d95d4a"),
  teal: toPdfColor("#66c7be"),
  coral: toPdfColor("#ff8f6b"),
  gold: toPdfColor("#ffd166"),
  blue: toPdfColor("#7ab6ff"),
  pink: toPdfColor("#e97bb1"),
  ink: toPdfColor("#172028"),
  softInk: toPdfColor("#4d4b58"),
  line: toPdfColor("#d5b8aa"),
};

export function buildBirthdayCardPdf(card: BirthdayCard) {
  const pages = createPages(card);
  return buildPdfDocument(pages);
}

function createPages(card: BirthdayCard) {
  const entryChunks =
    card.entries.length === 0 ? [[]] : chunkEntries(card.entries, ENTRIES_PER_PAGE);

  return entryChunks.map((entries, index) =>
    index === 0 ? createCoverPage(card, entries) : createMessagesPage(card, entries, index + 1),
  );
}

function createCoverPage(card: BirthdayCard, entries: SignatureEntry[]): PdfPage {
  const commands: string[] = [];

  drawPageBackground(commands);
  drawHeaderDecorations(commands);

  roundedRect(commands, PAGE_MARGIN, 100, CONTENT_WIDTH, 646, 30, COLORS.cardFill, COLORS.cardBorder);
  roundedRect(
    commands,
    PAGE_MARGIN + 28,
    132,
    CONTENT_WIDTH - 56,
    54,
    18,
    COLORS.ribbon,
    COLORS.ribbonShadow,
  );

  drawText(commands, "Happy Birthday", {
    font: "F2",
    size: 24,
    x: PAGE_WIDTH / 2,
    y: 166,
    color: [1, 1, 1],
    align: "center",
  });

  drawText(commands, sanitizePdfText(card.occasionTitle || "Birthday Wishes"), {
    font: "F1",
    size: 12,
    x: PAGE_WIDTH / 2,
    y: 208,
    color: COLORS.ribbonShadow,
    align: "center",
  });

  const titleLines = wrapText(`For ${card.recipientName}`, CONTENT_WIDTH - 112, 30, 2);
  drawParagraph(commands, titleLines, {
    font: "F2",
    size: 30,
    x: PAGE_WIDTH / 2,
    y: 252,
    lineHeight: 36,
    color: COLORS.ink,
    align: "center",
  });

  roundedRect(
    commands,
    PAGE_MARGIN + 42,
    304,
    CONTENT_WIDTH - 84,
    132,
    22,
    COLORS.messageFill,
    COLORS.messageBorder,
  );

  const coverLines = wrapText(card.coverMessage, CONTENT_WIDTH - 132, 15, 6);
  drawParagraph(commands, coverLines, {
    font: "F1",
    size: 15,
    x: PAGE_MARGIN + 66,
    y: 334,
    lineHeight: 22,
    color: COLORS.softInk,
  });

  drawText(commands, "Shared celebration card", {
    font: "F2",
    size: 13,
    x: PAGE_MARGIN + 50,
    y: 470,
    color: COLORS.ribbonShadow,
  });
  drawText(commands, `Created ${formatDate(card.createdAt)}`, {
    font: "F1",
    size: 11,
    x: PAGE_MARGIN + 50,
    y: 490,
    color: COLORS.softInk,
  });
  drawText(commands, `${card.entries.length} ${card.entries.length === 1 ? "message" : "messages"} collected`, {
    font: "F1",
    size: 11,
    x: PAGE_WIDTH - PAGE_MARGIN - 50,
    y: 490,
    color: COLORS.softInk,
    align: "right",
  });

  drawText(commands, "Birthday wishes", {
    font: "F2",
    size: 18,
    x: PAGE_MARGIN + 44,
    y: 540,
    color: COLORS.ink,
  });
  drawText(commands, "A few notes from the people celebrating with you.", {
    font: "F1",
    size: 11,
    x: PAGE_MARGIN + 44,
    y: 560,
    color: COLORS.softInk,
  });

  drawEntryGrid(commands, entries, 582, 92);
  drawFooter(commands, card, 1, Math.max(1, Math.ceil(card.entries.length / ENTRIES_PER_PAGE)));

  return { content: commands.join("\n") };
}

function createMessagesPage(card: BirthdayCard, entries: SignatureEntry[], pageNumber: number): PdfPage {
  const commands: string[] = [];

  drawPageBackground(commands);
  drawHeaderDecorations(commands);

  roundedRect(commands, PAGE_MARGIN, 82, CONTENT_WIDTH, 678, 30, COLORS.cardFill, COLORS.cardBorder);

  drawText(commands, `More birthday wishes for ${sanitizePdfText(card.recipientName)}`, {
    font: "F2",
    size: 24,
    x: PAGE_MARGIN + 38,
    y: 132,
    color: COLORS.ink,
  });

  drawText(commands, "Messages collected on this card", {
    font: "F1",
    size: 12,
    x: PAGE_MARGIN + 38,
    y: 156,
    color: COLORS.softInk,
  });

  drawEntryGrid(commands, entries, 206, 240);
  drawFooter(commands, card, pageNumber, Math.max(1, Math.ceil(card.entries.length / ENTRIES_PER_PAGE)));

  return { content: commands.join("\n") };
}

function drawPageBackground(commands: string[]) {
  rect(commands, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, COLORS.background);

  const confetti = [
    [80, 70, COLORS.coral],
    [160, 110, COLORS.gold],
    [260, 90, COLORS.teal],
    [360, 64, COLORS.pink],
    [470, 96, COLORS.blue],
    [520, 154, COLORS.coral],
    [92, 778, COLORS.gold],
    [190, 754, COLORS.teal],
    [430, 766, COLORS.pink],
    [520, 730, COLORS.blue],
  ] as const;

  for (const [x, y, color] of confetti) {
    rect(commands, x, y, 10, 4, color, undefined, 22);
  }
}

function drawHeaderDecorations(commands: string[]) {
  drawBalloon(commands, 98, 742, 28, 36, COLORS.coral, 92, 660);
  drawBalloon(commands, 154, 700, 26, 34, COLORS.gold, 162, 622);
  drawBalloon(commands, 490, 738, 28, 36, COLORS.teal, 480, 650);
  drawBalloon(commands, 438, 700, 26, 34, COLORS.blue, 448, 626);
}

function drawBalloon(
  commands: string[],
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  fill: PdfColor,
  stringEndX: number,
  stringEndY: number,
) {
  ellipse(commands, centerX, centerY, radiusX, radiusY, fill);
  setStroke(commands, COLORS.softInk, 1);
  moveTo(commands, centerX, centerY - radiusY + 2);
  curveTo(
    commands,
    centerX - 8,
    centerY - radiusY - 24,
    stringEndX + 8,
    stringEndY + 24,
    stringEndX,
    stringEndY,
  );
  commands.push("S");
}

function drawEntryGrid(commands: string[], entries: SignatureEntry[], topY: number, cardHeight: number) {
  const columnGap = 18;
  const rowGap = 18;
  const availableWidth = CONTENT_WIDTH - 88;
  const cardWidth = (availableWidth - columnGap) / ENTRY_COLUMNS;
  const startX = PAGE_MARGIN + 44;

  if (entries.length === 0) {
    roundedRect(
      commands,
      startX,
      topY,
      availableWidth,
      120,
      20,
      COLORS.messageFill,
      COLORS.messageBorder,
    );
    drawText(commands, "The card is ready. Messages will appear here once people sign it.", {
      font: "F1",
      size: 14,
      x: PAGE_WIDTH / 2,
      y: topY + 68,
      color: COLORS.softInk,
      align: "center",
    });
    return;
  }

  entries.forEach((entry, index) => {
    const row = Math.floor(index / ENTRY_COLUMNS);
    const column = index % ENTRY_COLUMNS;
    const x = startX + column * (cardWidth + columnGap);
    const y = topY + row * (cardHeight + rowGap);

    roundedRect(commands, x, y, cardWidth, cardHeight, 18, COLORS.messageFill, COLORS.messageBorder);

    const messageLines = wrapText(entry.message, cardWidth - 34, 12, cardHeight > 140 ? 8 : 2);
    drawParagraph(commands, messageLines, {
      font: "F1",
      size: 12,
      x: x + 17,
      y: y + 28,
      lineHeight: 17,
      color: COLORS.ink,
    });

    drawText(commands, sanitizePdfText(entry.signerName), {
      font: "F2",
      size: 11,
      x: x + 17,
      y: y + cardHeight - 34,
      color: COLORS.ribbonShadow,
    });

    drawText(commands, formatDate(entry.createdAt), {
      font: "F1",
      size: 9,
      x: x + cardWidth - 17,
      y: y + cardHeight - 34,
      color: COLORS.softInk,
      align: "right",
    });
  });
}

function drawFooter(commands: string[], card: BirthdayCard, pageNumber: number, pageCount: number) {
  const footerY = 794;

  setStroke(commands, COLORS.line, 1);
  moveTo(commands, PAGE_MARGIN + 18, footerY - 18);
  lineTo(commands, PAGE_WIDTH - PAGE_MARGIN - 18, footerY - 18);
  commands.push("S");

  drawText(commands, `Finalized ${formatDate(card.completedAt ?? card.updatedAt)}`, {
    font: "F1",
    size: 10,
    x: PAGE_MARGIN + 20,
    y: footerY,
    color: COLORS.softInk,
  });

  drawText(commands, `Page ${pageNumber} of ${pageCount}`, {
    font: "F1",
    size: 10,
    x: PAGE_WIDTH - PAGE_MARGIN - 20,
    y: footerY,
    color: COLORS.softInk,
    align: "right",
  });
}

function buildPdfDocument(pages: PdfPage[]) {
  const objects: string[] = [];
  const pageIds: number[] = [];
  const fontRegularId = 3;
  const fontBoldId = 4;

  objects[0] = "";
  objects[1] = "";
  objects[2] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

  for (const page of pages) {
    const pageId = objects.length + 1;
    const contentId = pageId + 1;

    pageIds.push(pageId);

    objects[pageId - 1] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] ` +
      `/Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> ` +
      `/Contents ${contentId} 0 R >>`;

    const stream = page.content;
    objects[contentId - 1] =
      `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`;
  }

  objects[1] = `<< /Type /Pages /Count ${pageIds.length} /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] >>`;
  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  objects.forEach((object, index) => {
    offsets[index + 1] = Buffer.byteLength(pdf, "utf8");
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index <= objects.length; index += 1) {
    pdf += `${offsets[index].toString().padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

function roundedRect(
  commands: string[],
  x: number,
  yTop: number,
  width: number,
  height: number,
  radius: number,
  fill: PdfColor,
  stroke?: PdfColor,
) {
  const y = toPdfY(yTop + height);
  const right = x + width;
  const top = y + height;
  const k = 0.5522847498;
  const control = radius * k;

  setFill(commands, fill);
  if (stroke) {
    setStroke(commands, stroke, 1);
  }

  commands.push(`${number(x + radius)} ${number(y)} m`);
  commands.push(`${number(right - radius)} ${number(y)} l`);
  commands.push(
    `${number(right - radius + control)} ${number(y)} ${number(right)} ${number(y + radius - control)} ${number(right)} ${number(y + radius)} c`,
  );
  commands.push(`${number(right)} ${number(top - radius)} l`);
  commands.push(
    `${number(right)} ${number(top - radius + control)} ${number(right - radius + control)} ${number(top)} ${number(right - radius)} ${number(top)} c`,
  );
  commands.push(`${number(x + radius)} ${number(top)} l`);
  commands.push(
    `${number(x + radius - control)} ${number(top)} ${number(x)} ${number(top - radius + control)} ${number(x)} ${number(top - radius)} c`,
  );
  commands.push(`${number(x)} ${number(y + radius)} l`);
  commands.push(
    `${number(x)} ${number(y + radius - control)} ${number(x + radius - control)} ${number(y)} ${number(x + radius)} ${number(y)} c`,
  );
  commands.push(stroke ? "B" : "f");
}

function rect(
  commands: string[],
  x: number,
  yTop: number,
  width: number,
  height: number,
  fill: PdfColor,
  stroke?: PdfColor,
  rotation = 0,
) {
  const y = toPdfY(yTop + height);

  if (rotation !== 0) {
    const radians = (rotation * Math.PI) / 180;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    commands.push("q");
    commands.push(
      `${number(cos)} ${number(sin)} ${number(-sin)} ${number(cos)} ${number(centerX)} ${number(centerY)} cm`,
    );
    setFill(commands, fill);
    if (stroke) {
      setStroke(commands, stroke, 1);
      commands.push(`${number(-width / 2)} ${number(-height / 2)} ${number(width)} ${number(height)} re B`);
    } else {
      commands.push(`${number(-width / 2)} ${number(-height / 2)} ${number(width)} ${number(height)} re f`);
    }
    commands.push("Q");
    return;
  }

  setFill(commands, fill);
  if (stroke) {
    setStroke(commands, stroke, 1);
  }
  commands.push(`${number(x)} ${number(y)} ${number(width)} ${number(height)} re ${stroke ? "B" : "f"}`);
}

function ellipse(
  commands: string[],
  centerX: number,
  centerYTop: number,
  radiusX: number,
  radiusY: number,
  fill: PdfColor,
) {
  const cy = toPdfY(centerYTop);
  const k = 0.5522847498;
  const ox = radiusX * k;
  const oy = radiusY * k;

  setFill(commands, fill);
  commands.push(`${number(centerX)} ${number(cy + radiusY)} m`);
  commands.push(
    `${number(centerX + ox)} ${number(cy + radiusY)} ${number(centerX + radiusX)} ${number(cy + oy)} ${number(centerX + radiusX)} ${number(cy)} c`,
  );
  commands.push(
    `${number(centerX + radiusX)} ${number(cy - oy)} ${number(centerX + ox)} ${number(cy - radiusY)} ${number(centerX)} ${number(cy - radiusY)} c`,
  );
  commands.push(
    `${number(centerX - ox)} ${number(cy - radiusY)} ${number(centerX - radiusX)} ${number(cy - oy)} ${number(centerX - radiusX)} ${number(cy)} c`,
  );
  commands.push(
    `${number(centerX - radiusX)} ${number(cy + oy)} ${number(centerX - ox)} ${number(cy + radiusY)} ${number(centerX)} ${number(cy + radiusY)} c`,
  );
  commands.push("f");
}

function drawText(commands: string[], text: string, options: TextOptions) {
  const safeText = escapePdfText(text);
  const x = alignedX(text, options);
  const baselineY = PAGE_HEIGHT - options.y - options.size;

  commands.push("BT");
  commands.push(`/${options.font} ${number(options.size)} Tf`);
  commands.push(`${color(options.color)} rg`);
  commands.push(`1 0 0 1 ${number(x)} ${number(baselineY)} Tm`);
  commands.push(`(${safeText}) Tj`);
  commands.push("ET");
}

function drawParagraph(
  commands: string[],
  lines: string[],
  options: {
    font: "F1" | "F2";
    size: number;
    x: number;
    y: number;
    lineHeight: number;
    color: PdfColor;
    align?: "left" | "center" | "right";
  },
) {
  lines.forEach((line, index) => {
    drawText(commands, line, {
      font: options.font,
      size: options.size,
      x: options.x,
      y: options.y + index * options.lineHeight,
      color: options.color,
      align: options.align,
    });
  });
}

function moveTo(commands: string[], x: number, yTop: number) {
  commands.push(`${number(x)} ${number(toPdfY(yTop))} m`);
}

function lineTo(commands: string[], x: number, yTop: number) {
  commands.push(`${number(x)} ${number(toPdfY(yTop))} l`);
}

function curveTo(
  commands: string[],
  x1: number,
  y1Top: number,
  x2: number,
  y2Top: number,
  x3: number,
  y3Top: number,
) {
  commands.push(
    `${number(x1)} ${number(toPdfY(y1Top))} ${number(x2)} ${number(toPdfY(y2Top))} ${number(x3)} ${number(toPdfY(y3Top))} c`,
  );
}

function setFill(commands: string[], fill: PdfColor) {
  commands.push(`${color(fill)} rg`);
}

function setStroke(commands: string[], stroke: PdfColor, width: number) {
  commands.push(`${color(stroke)} RG`);
  commands.push(`${number(width)} w`);
}

function toPdfColor(hex: string): PdfColor {
  const clean = hex.replace("#", "");
  const red = Number.parseInt(clean.slice(0, 2), 16) / 255;
  const green = Number.parseInt(clean.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(clean.slice(4, 6), 16) / 255;
  return [red, green, blue];
}

function color([red, green, blue]: PdfColor) {
  return `${number(red)} ${number(green)} ${number(blue)}`;
}

function alignedX(text: string, options: TextOptions) {
  const width = estimateTextWidth(text, options.size);

  if (options.align === "center") {
    return options.x - width / 2;
  }

  if (options.align === "right") {
    return options.x - width;
  }

  return options.x;
}

function wrapText(text: string, maxWidth: number, fontSize: number, maxLines: number) {
  const normalized = sanitizePdfText(text).replace(/\s+/g, " ").trim();

  if (!normalized) {
    return [""];
  }

  const words = normalized.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (estimateTextWidth(candidate, fontSize) <= maxWidth) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      lines.push(word);
      currentLine = "";
    }

    if (lines.length === maxLines) {
      break;
    }
  }

  if (lines.length < maxLines && currentLine) {
    lines.push(currentLine);
  }

  const joined = lines.join(" ");
  if (joined !== normalized) {
    return addEllipsis(lines.slice(0, maxLines), maxWidth, fontSize);
  }

  return lines;
}

function addEllipsis(lines: string[], maxWidth: number, fontSize: number) {
  if (lines.length === 0) {
    return ["..."];
  }

  const output = [...lines];
  let lastLine = output[output.length - 1];

  while (lastLine.length > 0 && estimateTextWidth(`${lastLine}...`, fontSize) > maxWidth) {
    lastLine = lastLine.slice(0, -1).trimEnd();
  }

  output[output.length - 1] = `${lastLine}...`;
  return output;
}

function estimateTextWidth(text: string, fontSize: number) {
  let units = 0;

  for (const character of sanitizePdfText(text)) {
    if ("ilI'.,:;| ".includes(character)) {
      units += 0.26;
    } else if ("mwMW@#%&".includes(character)) {
      units += 0.9;
    } else if ("fjrt()[]{}".includes(character)) {
      units += 0.38;
    } else if (character >= "A" && character <= "Z") {
      units += 0.66;
    } else if (character >= "0" && character <= "9") {
      units += 0.58;
    } else {
      units += 0.54;
    }
  }

  return units * fontSize;
}

function escapePdfText(text: string) {
  return sanitizePdfText(text)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function sanitizePdfText(text: string) {
  return text
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\u2026/g, "...")
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/[^\x20-\x7E]/g, "");
}

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(isoDate));
}

function chunkEntries(entries: SignatureEntry[], size: number) {
  const chunks: SignatureEntry[][] = [];

  for (let index = 0; index < entries.length; index += size) {
    chunks.push(entries.slice(index, index + size));
  }

  return chunks;
}

function toPdfY(top: number) {
  return PAGE_HEIGHT - top;
}

function number(value: number) {
  return value.toFixed(2).replace(/\.00$/, "");
}
