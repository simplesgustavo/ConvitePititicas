import { getServerSession } from "next-auth/next";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { authOptions } from "../auth/[...nextauth]";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};

const uploadSchema = z.object({
  fileName: z.string().min(1).max(180),
  content: z.string().min(1),
});

const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Não autorizado." });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: "Método não permitido." });
  }

  try {
    const payload = uploadSchema.parse(req.body ?? {});
    const parsed = parseDataUrl(payload.content);

    if (!parsed) {
      return res.status(400).json({ message: "Formato de arquivo inválido." });
    }

    if (!ALLOWED_MIME_TYPES.has(parsed.mime)) {
      return res.status(400).json({ message: "Formato de imagem não suportado. Use PNG, JPG, WEBP ou GIF." });
    }

    if (parsed.buffer.length > MAX_FILE_BYTES) {
      return res.status(400).json({ message: "O arquivo do personagem deve ter no máximo 2MB." });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const safeBaseName = sanitizeFileName(payload.fileName);
    const extension = extensionFromMime(parsed.mime);
    const uniqueId = crypto.randomBytes(6).toString("hex");
    const finalFileName = `${safeBaseName}-${uniqueId}.${extension}`;
    const finalPath = path.join(uploadDir, finalFileName);

    await fs.writeFile(finalPath, parsed.buffer);

    return res.status(200).json({
      url: `/uploads/${finalFileName}`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Dados inválidos.", details: error.errors });
    }
    console.error("Erro ao enviar personagem:", error);
    return res.status(500).json({ message: "Ocorreu um erro ao enviar o personagem." });
  }
}

function parseDataUrl(dataUrl: string) {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    return null;
  }

  const mime = matches[1];
  const base64Data = matches[2];

  try {
    const buffer = Buffer.from(base64Data, "base64");
    return { mime, buffer };
  } catch {
    return null;
  }
}

function sanitizeFileName(fileName: string) {
  const baseName = path.basename(fileName, path.extname(fileName));
  const normalized = baseName.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  const cleaned = normalized.replace(/[^a-zA-Z0-9-_]/g, "-").toLowerCase();
  return cleaned.length > 0 ? cleaned.slice(0, 40) : "personagem";
}

function extensionFromMime(mime: string) {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}
