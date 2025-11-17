import { ensureEvent } from "@/lib/server/event-helpers";
import { prisma } from "@/lib/server/prisma";
import { Prisma } from "@prisma/client";
import { randomBytes } from "crypto";
import formidable from "formidable";
import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";

export const config = {
  api: {
    bodyParser: false,
  },
};

type ImportMetrics = {
  imported: number;
  duplicates: number;
  invalid: number;
  errors: Array<{ line: number; message: string }>;
};

const csvHeaderMap: Record<string, keyof GuestCsvRow> = {
  fullname: "fullName",
  phone: "phone",
  email: "email",
  maxcompanions: "maxCompanions",
};

const REQUIRED_HEADERS = ["fullName", "phone", "maxCompanions"] as const;

type GuestCsvRow = {
  fullName: string;
  phone: string;
  email?: string | null;
  maxCompanions: number;
};

async function generateShortCode(): Promise<string> {
  while (true) {
    const candidate = randomBytes(10).toString("hex");
    const existing = await prisma.invite.findUnique({
      where: { shortCode: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
}

function sanitizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "").trim();
}

function normalizeEmail(email: string | null | undefined) {
  if (!email) return null;
  const trimmed = email.trim();
  return trimmed.length === 0 ? null : trimmed;
}

async function parseCsv(filePath: string) {
  const fs = await import("fs/promises");
  const buffer = await fs.readFile(filePath);
  const content = buffer.toString("utf-8");
  const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    throw new Error("O arquivo CSV está vazio.");
  }

  const headerLine = lines[0];
  const headers = headerLine.split(",").map((header) => header.trim().replace(/(^"|"$)/g, ""));

  const normalizedHeaders = headers.map((header) => csvHeaderMap[header.toLowerCase()] ?? header);

  REQUIRED_HEADERS.forEach((required) => {
    if (!normalizedHeaders.includes(required)) {
      throw new Error(`Cabeçalho obrigatório ausente no CSV: ${required}`);
    }
  });

  const rows: Array<{ raw: string[]; parsed: GuestCsvRow; lineNumber: number }> = [];

  for (let index = 1; index < lines.length; index++) {
    const lineNumber = index + 1;
    const line = lines[index];
    const columns = line.split(",").map((value) => value.trim().replace(/(^"|"$)/g, ""));
    if (columns.every((column) => column.length === 0)) continue;

    const row: Partial<GuestCsvRow> = {};

    normalizedHeaders.forEach((header, columnIndex) => {
      const value = columns[columnIndex] ?? "";
      if (header === "maxCompanions") {
        row.maxCompanions = Number(value ?? "0");
      } else if (header === "phone") {
        row.phone = sanitizePhone(value);
      } else if (header === "fullName") {
        row.fullName = value.trim();
      } else if (header === "email") {
        row.email = value.trim();
      }
    });

    rows.push({
      raw: columns,
      parsed: row as GuestCsvRow,
      lineNumber,
    });
  }

  return rows;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Não autorizado." });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Método não permitido." });
  }

  const form = formidable({ multiples: false });

  try {
    const [fields, files] = await form.parse(req);
    const uploadedFileEntry = files.file;
    const uploaded = Array.isArray(uploadedFileEntry) ? uploadedFileEntry[0] : uploadedFileEntry;

    if (!uploaded) {
      return res.status(400).json({ message: "Arquivo CSV não encontrado no envio." });
    }

    const rows = await parseCsv(uploaded.filepath);
    const metrics: ImportMetrics = { ...initialMetrics };
    const event = await ensureEvent();

    const phonesInCsv = new Set<string>();

    const validatedRows = rows.map(({ parsed, lineNumber }) => {
      const errors: string[] = [];

      if (!parsed.fullName || parsed.fullName.length < 3) {
        errors.push("Nome completo obrigatório (mínimo 3 caracteres).");
      }

      if (!parsed.phone || parsed.phone.length < 10) {
        errors.push("Telefone inválido (mínimo 10 dígitos).");
      }

      if (parsed.maxCompanions === undefined || Number.isNaN(parsed.maxCompanions) || parsed.maxCompanions < 0) {
        errors.push("maxCompanions deve ser um número inteiro maior ou igual a zero.");
      }

      if (parsed.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parsed.email)) {
        errors.push("Email inválido.");
      }

      const normalizedPhone = sanitizePhone(parsed.phone ?? "");
      if (phonesInCsv.has(normalizedPhone)) {
        errors.push("Telefone repetido no arquivo.");
      } else {
        phonesInCsv.add(normalizedPhone);
      }

      return {
        data: { ...parsed, phone: normalizedPhone, email: normalizeEmail(parsed.email ?? null) },
        lineNumber,
        errors,
      };
    });

    const validRows = validatedRows.filter((row) => {
      if (row.errors.length > 0) {
        metrics.invalid += 1;
        row.errors.forEach((message) => {
          metrics.errors.push({ line: row.lineNumber, message });
        });
        return false;
      }
      return true;
    });

    for (const row of validRows) {
      const { data, lineNumber } = row;
      try {
        const duplicate = await prisma.guest.findUnique({
          where: { phone: data.phone },
          select: { id: true },
        });

        if (duplicate) {
          metrics.duplicates += 1;
          continue;
        }

        await prisma.$transaction(async (tx) => {
          const guest = await tx.guest.create({
            data: {
              eventId: event.id,
              fullName: data.fullName,
              phone: data.phone,
              email: data.email,
              maxCompanions: data.maxCompanions,
            },
          });

          await tx.invite.create({
            data: {
              eventId: event.id,
              guestId: guest.id,
              shortCode: await generateShortCode(),
            },
          });
        });

        metrics.imported += 1;
      } catch (error) {
        metrics.invalid += 1;
        const isDuplicateError =
          error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
        metrics.errors.push({
          line: lineNumber,
          message: isDuplicateError
            ? "Telefone já cadastrado anteriormente."
            : "Erro inesperado ao salvar convidado.",
        });
      }
    }

    return res.status(200).json(metrics);
  } catch (error: any) {
    console.error("Erro ao importar convidados:", error);
    return res.status(500).json({
      message: error?.message ?? "Não foi possível processar o arquivo enviado.",
    });
  }
}

const initialMetrics: ImportMetrics = {
  imported: 0,
  duplicates: 0,
  invalid: 0,
  errors: [],
};
