import { prisma } from "@/lib/server/prisma";
import type { Prisma } from "@prisma/client";
import { randomBytes } from "crypto";

export const eventSelectFields = {
  id: true,
  name: true,
  slug: true,
  subtitle: true,
  videoUrl: true,
  fallbackImageUrl: true,
  characterImageUrl: true,
  faviconUrl: true,
  customDateLabel: true,
  notes: true,
  venue: true,
  startsAt: true,
  rsvpDeadline: true,
} satisfies Prisma.EventSelect;

export type EventSelection = Prisma.EventGetPayload<{ select: typeof eventSelectFields }>;

export async function ensureEvent(eventId?: string | null): Promise<EventSelection> {
  if (eventId) {
    const byId = await prisma.event.findUnique({
      where: { id: eventId },
      select: eventSelectFields,
    });
    if (byId) {
      return byId;
    }
  }

  const existing = await prisma.event.findFirst({
    orderBy: { createdAt: "asc" },
    select: eventSelectFields,
  });
  if (existing) {
    return existing;
  }

  const slug = `evento-${randomBytes(6).toString("hex")}`;
  return prisma.event.create({
    data: {
      slug,
      name: "Meu Evento Especial",
      startsAt: new Date(),
      subtitle: null,
      venue: null,
      notes: null,
      customDateLabel: null,
    },
    select: eventSelectFields,
  });
}
