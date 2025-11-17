import { prisma } from "@/lib/server/prisma";
import { ensureEvent, eventSelectFields } from "@/lib/server/event-helpers";
import type { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { authOptions } from "../auth/[...nextauth]";

const urlField = z
  .string()
  .trim()
  .max(512, "URL muito longa.")
  .refine((value) => value.length === 0 || /^https?:\/\//i.test(value), {
    message: "Informe uma URL completa começando com http:// ou https://.",
  })
  .optional();

const shortTextField = z.string().trim().max(191, "Texto muito longo.").optional();
const longTextField = z.string().trim().max(512, "Texto muito longo.").optional();
const dateTimeField = z.string().max(50).optional();

const DEFAULT_TIMEZONE_OFFSET_MINUTES = -3 * 60; // America/Sao_Paulo (UTC-3)

const updateEventSchema = z.object({
  eventId: z.string().optional(),
  name: shortTextField,
  subtitle: shortTextField,
  customDateLabel: shortTextField,
  venue: shortTextField,
  notes: longTextField,
  startsAt: dateTimeField,
  rsvpDeadline: dateTimeField,
  videoUrl: urlField,
  fallbackImageUrl: urlField,
  characterImageUrl: urlField,
  faviconUrl: urlField,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ message: "Não autorizado." });
  }

  if (req.method === "PUT") {
    try {
      const payload = updateEventSchema.parse(req.body ?? {});

      const event = await ensureEvent(payload.eventId);

      const updateData: Prisma.EventUpdateInput = {};

      if (payload.name !== undefined) {
        const trimmed = payload.name?.trim() ?? "";
        updateData.name = trimmed.length > 0 ? trimmed : event.name ?? "Evento sem nome";
      }

      if (payload.subtitle !== undefined) {
        updateData.subtitle = normalizeNullableString(payload.subtitle);
      }

      if (payload.customDateLabel !== undefined) {
        updateData.customDateLabel = normalizeNullableString(payload.customDateLabel);
      }

      if (payload.venue !== undefined) {
        updateData.venue = normalizeNullableString(payload.venue);
      }

      if (payload.notes !== undefined) {
        updateData.notes = normalizeNullableString(payload.notes);
      }

      if (payload.startsAt !== undefined) {
        if (!payload.startsAt) {
          updateData.startsAt = event.startsAt ?? new Date();
        } else {
          const newDate = parseDateTimeInTimezone(payload.startsAt, DEFAULT_TIMEZONE_OFFSET_MINUTES);
          if (!newDate) {
            return res.status(400).json({ message: "Horário do evento inválido." });
          }
          updateData.startsAt = newDate;
        }
      }

      if (payload.rsvpDeadline !== undefined) {
        if (!payload.rsvpDeadline) {
          updateData.rsvpDeadline = null;
        } else {
          const deadline = parseDateTimeInTimezone(payload.rsvpDeadline, DEFAULT_TIMEZONE_OFFSET_MINUTES);
          if (!deadline) {
            return res.status(400).json({ message: "Prazo de RSVP inválido." });
          }
          updateData.rsvpDeadline = deadline;
        }
      }

      if (payload.videoUrl !== undefined) {
        updateData.videoUrl = normalizeNullableUrl(payload.videoUrl);
      }
      if (payload.fallbackImageUrl !== undefined) {
        updateData.fallbackImageUrl = normalizeNullableUrl(payload.fallbackImageUrl);
      }
      if (payload.characterImageUrl !== undefined) {
        updateData.characterImageUrl = normalizeNullableUrl(payload.characterImageUrl);
      }
      if (payload.faviconUrl !== undefined) {
        updateData.faviconUrl = normalizeNullableUrl(payload.faviconUrl);
      }

      const updated = await prisma.event.update({
        where: { id: event.id },
        data: updateData,
        select: eventSelectFields,
      });

      return res.status(200).json({ message: "Configurações atualizadas.", event: updated });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos.", details: error.errors });
      }
      console.error("Erro ao atualizar evento:", error);
      return res.status(500).json({ message: "Ocorreu um erro no servidor." });
    }
  }

  if (req.method === "GET") {
    const event = await ensureEvent(req.query?.eventId as string | undefined);
    return res.status(200).json({
      event: {
        id: event.id,
        name: event.name,
        subtitle: event.subtitle,
        slug: event.slug,
        videoUrl: event.videoUrl,
        fallbackImageUrl: event.fallbackImageUrl,
        characterImageUrl: event.characterImageUrl,
        faviconUrl: event.faviconUrl,
        customDateLabel: event.customDateLabel,
        notes: event.notes,
        venue: event.venue,
        startsAt: event.startsAt,
        rsvpDeadline: event.rsvpDeadline,
      },
    });
  }

  res.setHeader("Allow", ["GET", "PUT"]);
  return res.status(405).json({ message: "Método não permitido." });
}

function normalizeNullableUrl(value: string | undefined) {
  if (value === undefined || value === null) return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function normalizeNullableString(value: string | undefined) {
  if (value === undefined || value === null) return undefined;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function parseDateTimeInTimezone(value: string, offsetMinutes: number) {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match.map(Number);
  const utcTimestamp = Date.UTC(year, month - 1, day, hour, minute);
  const offsetMs = offsetMinutes * 60 * 1000;
  return new Date(utcTimestamp - offsetMs);
}
