import { prisma } from "@/lib/server/prisma";
import { formatDateTimeForInvite } from "@/lib/utils/format";

export type InvitePreview = {
  token: string;
  guestName: string;
  eventName: string;
  eventSubtitle: string | null;
  faviconUrl: string | null;
  eventDate: string;
  eventDateLabel: string;
  eventVenue: string;
  eventNotes: string | null;
  eventStartsAtIso: string;
  videoUrl: string | null;
  fallbackImageUrl: string | null;
  characterImageUrl: string | null;
  tanabataMessage: string | null;
  tanabataMessageCreatedAt: string | null;
  maxCompanions: number;
  latestStatus: "yes" | "no" | null;
  latestCompanions: number | null;
  latestParticipantsAbove8: number | null;
  latestParticipants3To7: number | null;
  deadlinePassed: boolean;
  deadlineLabel: string;
  deadlineAt: string | null;
  firstViewedAt: string | null;
  lastViewedAt: string | null;
  viewCount: number;
};

export async function getInvitePreview(token: string): Promise<InvitePreview | null> {
  if (!token) return null;

  const invite = await prisma.invite.findUnique({
    where: { shortCode: token },
    include: {
      guest: true,
      event: true,
      rsvp: true
    }
  });

  if (!invite) {
    return null;
  }

  const event = invite.event;
  const latestResponse = invite.rsvp ?? null;
  const deadline = event.rsvpDeadline;
  const now = new Date();

  const tracking = await prisma.invite.update({
    where: { id: invite.id },
    data: {
      firstViewedAt: invite.firstViewedAt ?? now,
      lastViewedAt: now,
      viewCount: {
        increment: 1
      }
    },
    select: {
      firstViewedAt: true,
      lastViewedAt: true,
      viewCount: true
    }
  });

  const eventDate = formatDateTimeForInvite(event.startsAt);
  const deadlineLabel = deadline ? formatDateTimeForInvite(deadline) : "o dia do evento";
  const defaultFavicon = "https://ia.olso.com.br/var/assets/img/Personagem%20Gustavo%20Convite.ico";

  return {
    token,
    guestName: invite.guest.fullName,
    eventName: event.name,
    eventSubtitle: event.subtitle ?? null,
    faviconUrl: event.faviconUrl ?? defaultFavicon,
    eventVenue: event.venue ?? "Village Dahma 3 - Mirassol/SP",
    eventDate,
    eventDateLabel: event.customDateLabel ?? eventDate,
    eventNotes: event.notes ?? null,
    eventStartsAtIso: event.startsAt.toISOString(),
    videoUrl: event.videoUrl,
    fallbackImageUrl: event.fallbackImageUrl,
    characterImageUrl: event.characterImageUrl ?? null,
    tanabataMessage: invite.tanabataMessage ?? null,
    tanabataMessageCreatedAt: invite.tanabataMessageCreatedAt ? invite.tanabataMessageCreatedAt.toISOString() : null,
    maxCompanions: invite.guest.maxCompanions ?? 0,
    latestStatus: (latestResponse?.status as "yes" | "no" | null) ?? null,
    latestCompanions: latestResponse?.companions ?? null,
    latestParticipantsAbove8: latestResponse?.participantsAbove8 ?? null,
    latestParticipants3To7: latestResponse?.participants3To7 ?? null,
    deadlinePassed: deadline ? deadline.getTime() < Date.now() : false,
    deadlineLabel,
    deadlineAt: deadline ? deadline.toISOString() : null,
    firstViewedAt: tracking.firstViewedAt ? tracking.firstViewedAt.toISOString() : null,
    lastViewedAt: tracking.lastViewedAt ? tracking.lastViewedAt.toISOString() : now.toISOString(),
    viewCount: tracking.viewCount
  };
}
