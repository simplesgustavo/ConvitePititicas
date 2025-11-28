import { prisma } from "@/lib/server/prisma";
import { Event, Guest, Invite, Rsvp } from "@prisma/client";

// Criamos um tipo mais específico para os dados que vamos buscar,
// garantindo que o TypeScript entenda a estrutura completa.
export type GuestWithRsvp = Guest & {
  invite: (Invite & {
    rsvp: Rsvp | null;
  }) | null;
};

export type DashboardStats = {
  totalGuests: number;
  confirmedCount: number;
  refusedCount: number;
  pendingCount: number;
  totalInvitedPeople: number;
  confirmedPeopleTotal: number;
  confirmedAbove8: number;
  confirmed3To7: number;
};

export type DashboardAnalytics = {
  totalInvites: number;
  totalCompanionCapacity: number;
  totalViewCount: number;
  viewedInvites: number;
  unopenedInvites: number;
  timeline: Array<{
    date: string;
    label: string;
    firstViews: number;
    additionalViews: number;
  }>;
};

export type EventAppearanceSettings = Pick<
  Event,
  | "id"
  | "name"
  | "subtitle"
  | "slug"
  | "videoUrl"
  | "fallbackImageUrl"
  | "characterImageUrl"
  | "customDateLabel"
  | "faviconUrl"
  | "notes"
  | "venue"
  | "startsAt"
  | "rsvpDeadline"
>;

export async function getAdminDashboardData() {
  const [guests, event] = await Promise.all([
    prisma.guest.findMany({
      include: {
        invite: {
          include: {
            rsvp: true
          }
        }
      },
      orderBy: {
        fullName: "asc"
      }
    }),
    prisma.event.findFirst({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        subtitle: true,
        videoUrl: true,
        fallbackImageUrl: true,
        characterImageUrl: true,
        customDateLabel: true,
        faviconUrl: true,
        notes: true,
        venue: true,
        startsAt: true,
        rsvpDeadline: true
      }
    })
  ]);

  // Otimização: Calcula as estatísticas usando o método `reduce` para um código mais funcional e conciso.
  const stats = guests.reduce(
    (acc, guest) => {
      acc.totalInvitedPeople += guest.maxCompanions ?? 0;

      const invite = guest.invite;
      const rsvp = invite?.rsvp;
      if (rsvp?.status === "yes") {
        const above8 = rsvp.participantsAbove8 ?? 0;
        const from3To7 = rsvp.participants3To7 ?? 0;
        acc.confirmedCount++;
        acc.confirmedAbove8 += above8;
        acc.confirmed3To7 += from3To7;
        acc.confirmedPeopleTotal += above8 + from3To7;
      } else if (rsvp?.status === "no") {
        acc.refusedCount++;
      }
      return acc;
    },
    {
      confirmedCount: 0,
      refusedCount: 0,
      totalInvitedPeople: 0,
      confirmedPeopleTotal: 0,
      confirmedAbove8: 0,
      confirmed3To7: 0,
    }
  );

  return {
    guests,
    stats: {
      totalGuests: guests.length,
      confirmedCount: stats.confirmedCount,
      refusedCount: stats.refusedCount,
      pendingCount: guests.length - stats.confirmedCount - stats.refusedCount,
      totalInvitedPeople: stats.totalInvitedPeople,
      confirmedPeopleTotal: stats.confirmedPeopleTotal,
      confirmedAbove8: stats.confirmedAbove8,
      confirmed3To7: stats.confirmed3To7,
    },
    analytics: buildAnalytics(guests),
    appearance: event
  };
}

function buildAnalytics(guests: GuestWithRsvp[]): DashboardAnalytics {
  const invites = guests
    .map((guest) => guest.invite)
    .filter((invite): invite is NonNullable<GuestWithRsvp["invite"]> => Boolean(invite));

  const totalCompanionCapacity = guests.reduce((acc, guest) => acc + (guest.maxCompanions ?? 0), 0);
  const totalViewCount = invites.reduce((acc, invite) => acc + (invite.viewCount ?? 0), 0);
  const viewedInvites = invites.filter((invite) => (invite.viewCount ?? 0) > 0).length;
  const unopenedInvites = invites.length - viewedInvites;

  const timelineRangeDays = 14;
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (timelineRangeDays - 1));

  const timelineMap = new Map<
    string,
    {
      date: string;
      label: string;
      firstViews: number;
      additionalViews: number;
    }
  >();

  for (let index = 0; index < timelineRangeDays; index++) {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    const key = toDateKey(current);
    timelineMap.set(key, {
      date: key,
      label: current.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      firstViews: 0,
      additionalViews: 0,
    });
  }

  invites.forEach((invite) => {
    if (invite.firstViewedAt) {
      const firstKey = toDateKey(invite.firstViewedAt);
      const slot = timelineMap.get(firstKey);
      if (slot) {
        slot.firstViews += 1;
      }
    }

    if (invite.lastViewedAt && (invite.viewCount ?? 0) > 0) {
      const lastKey = toDateKey(invite.lastViewedAt);
      const slot = timelineMap.get(lastKey);
      if (slot) {
        const additional = Math.max(0, (invite.viewCount ?? 0) - 1);
        slot.additionalViews += additional;
      }
    }
  });

  const timeline = Array.from(timelineMap.values());

  return {
    totalInvites: invites.length,
    totalCompanionCapacity,
    totalViewCount,
    viewedInvites,
    unopenedInvites: Math.max(0, unopenedInvites),
    timeline,
  };
}

function toDateKey(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString().slice(0, 10);
}
