import { ensureEvent } from "@/lib/server/event-helpers";
import { prisma } from "@/lib/server/prisma";
import { Prisma } from "@prisma/client";
import { randomBytes } from "crypto";
import { getServerSession } from "next-auth/next";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { authOptions } from "../auth/[...nextauth]";

const guestPayloadSchema = z.object({
  fullName: z
    .preprocess((value) => (typeof value === "string" ? value.trim() : value), z.string().min(3, "Nome completo é obrigatório.")),
  phone: z
    .preprocess((value) => (typeof value === "string" ? value.trim() : value), z.string().min(10, "Telefone inválido.")),
  email: z
    .preprocess((value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    }, z.string().email("Email inválido.").optional()),
  maxCompanions: z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() !== "") {
        return Number(value);
      }
      return value;
    },
    z.number().int().min(0)
  )
});

async function generateUniqueShortCode(): Promise<string> {
  while (true) {
    const candidate = randomBytes(10).toString("hex");
    const existing = await prisma.invite.findUnique({ where: { shortCode: candidate } });
    if (!existing) {
      return candidate;
    }
  }
}

function normalizeEmail(email: string | null | undefined) {
  if (email === undefined || email === null) return null;
  const trimmed = email.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function extractGuestId(idParam: string | string[] | undefined): string | null {
  if (Array.isArray(idParam)) return idParam[0] ?? null;
  return typeof idParam === "string" && idParam.length > 0 ? idParam : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Não autorizado." });
  }

  if (req.method === "POST") {
    try {
      const data = guestPayloadSchema.parse(req.body);

      const duplicateGuest = await prisma.guest.findUnique({
        where: { phone: data.phone },
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          invite: {
            select: {
              shortCode: true
            }
          }
        }
      });

      if (duplicateGuest) {
        return res.status(409).json({
          message: "Já existe um convidado cadastrado com este telefone.",
          guest: duplicateGuest
        });
      }

      const event = await ensureEvent();

      const shortCode = await generateUniqueShortCode();

      const newGuest = await prisma.$transaction(async (tx) => {
        const guest = await tx.guest.create({
          data: {
            eventId: event.id,
            fullName: data.fullName,
            phone: data.phone,
            email: normalizeEmail(data.email ?? null),
            maxCompanions: data.maxCompanions
          }
        });

        await tx.invite.create({
          data: {
            eventId: event.id,
            guestId: guest.id,
            shortCode: shortCode
          }
        });

        return guest;
      });

      return res.status(201).json(newGuest);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const existingByPhone = await prisma.guest.findUnique({
          where: { phone: req.body?.phone },
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            invite: {
              select: { shortCode: true }
            }
          }
        });
        return res.status(409).json({
          message: "Já existe um convidado cadastrado com este telefone.",
          guest: existingByPhone ?? null
        });
      }
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos.", details: error.errors });
      }
      console.error("Erro ao adicionar convidado:", error);
      return res.status(500).json({ message: "Ocorreu um erro no servidor." });
    }
  }

  if (req.method === "PUT") {
    const guestId = extractGuestId(req.query.id);
    if (!guestId) {
      return res.status(400).json({ message: "Informe o convidado que deseja atualizar." });
    }

    try {
      const data = guestPayloadSchema.parse(req.body);

      const existingGuest = await prisma.guest.findUnique({
        where: { id: guestId },
        select: {
          id: true,
          phone: true
        }
      });

      if (!existingGuest) {
        return res.status(404).json({ message: "Convidado não encontrado." });
      }

      if (data.phone !== existingGuest.phone) {
        const duplicateGuest = await prisma.guest.findUnique({
          where: { phone: data.phone },
          select: {
            id: true,
            fullName: true,
            phone: true
          }
        });

        if (duplicateGuest) {
          return res.status(409).json({
            message: "Já existe outro convidado cadastrado com este telefone.",
            guest: duplicateGuest
          });
        }
      }

      const updatedGuest = await prisma.guest.update({
        where: { id: guestId },
        data: {
          fullName: data.fullName,
          phone: data.phone,
          email: normalizeEmail(data.email ?? null),
          maxCompanions: data.maxCompanions
        },
        include: {
          invite: {
            select: { shortCode: true }
          }
        }
      });

      return res.status(200).json(updatedGuest);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return res.status(409).json({
          message: "Já existe outro convidado cadastrado com este telefone."
        });
      }
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos.", details: error.errors });
      }
      console.error("Erro ao atualizar convidado:", error);
      return res.status(500).json({ message: "Ocorreu um erro no servidor." });
    }
  }

  if (req.method === "DELETE") {
    const guestId = extractGuestId(req.query.id);
    if (!guestId) {
      return res.status(400).json({ message: "Informe o convidado que deseja excluir." });
    }

    try {
      await prisma.guest.delete({
        where: { id: guestId }
      });
      return res.status(204).end();
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return res.status(404).json({ message: "Convidado não encontrado." });
      }
      console.error("Erro ao excluir convidado:", error);
      return res.status(500).json({ message: "Ocorreu um erro no servidor." });
    }
  }

  res.setHeader("Allow", ["POST", "PUT", "DELETE"]);
  return res.status(405).json({ message: "Método não permitido." });
}
