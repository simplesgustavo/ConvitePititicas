/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

function createShortCode(seed) {
  return crypto.createHash("sha256").update(seed).digest("hex").slice(0, 16);
}

const defaultVideoUrl = "https://cdn.exemplo.com/videos/pititicas-jardim-loop.mp4";
const defaultFallbackImage =
  "https://cdn.exemplo.com/images/pititicas-jardim-fallback.jpg";
const defaultCharacterImage = "https://cdn.exemplo.com/images/pititicas-borboleta.png";
const defaultName = "Pititicas Jardim Encantado – 1º Aninho";
const defaultSubtitle = "Flores, Borboletas & Magia";
const defaultVenue = "Casa Pititicas • Jardim Encantado - São Paulo/SP";
const defaultStartsAt = new Date("2025-03-22T15:00:00-03:00");
const defaultDeadline = new Date("2025-03-10T23:59:00-03:00");
const defaultDateLabel = "Sábado, 22 de março às 15h";
const defaultNotes = "Dress code floral/pastel. Haverá cantinho de piquenique e pintura de rosto.";
const defaultFavicon =
  "https://cdn.exemplo.com/icons/pititicas-jardim.ico";
const defaultTheme = {
  primary: "#8de4c2",
  secondary: "#2c1f2f",
  accent: "#f9b5d0",
};
const defaultAdminUsername = process.env.DEFAULT_ADMIN_USERNAME ?? "admin";
const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD ?? "confraRacha";
const defaultAdminName = "Admin";

async function main() {
  const eventSlug = "pititicas-jardim-encantado";

  let event = await prisma.event.findUnique({
    where: { slug: eventSlug },
  });

  if (!event) {
    event = await prisma.event.create({
      data: {
        slug: eventSlug,
        name: defaultName,
        subtitle: defaultSubtitle,
        startsAt: defaultStartsAt,
        venue: defaultVenue,
        theme: defaultTheme,
        videoUrl: defaultVideoUrl,
        fallbackImageUrl: defaultFallbackImage,
        characterImageUrl: defaultCharacterImage,
        customDateLabel: defaultDateLabel,
        faviconUrl: defaultFavicon,
        notes: defaultNotes,
        rsvpDeadline: defaultDeadline, // Ano alterado para o futuro
      },
    });
  } else {
    const updateData = {
      name: event.name ?? defaultName,
      subtitle: event.subtitle ?? defaultSubtitle,
      startsAt: event.startsAt ?? defaultStartsAt,
      venue: event.venue ?? defaultVenue,
      theme: event.theme ?? defaultTheme,
      videoUrl: event.videoUrl ?? defaultVideoUrl,
      fallbackImageUrl: event.fallbackImageUrl ?? defaultFallbackImage,
      characterImageUrl: event.characterImageUrl ?? defaultCharacterImage,
      customDateLabel: event.customDateLabel ?? defaultDateLabel,
      faviconUrl: event.faviconUrl ?? defaultFavicon,
      notes: event.notes ?? defaultNotes,
      rsvpDeadline: event.rsvpDeadline ?? defaultDeadline,
    };

    event = await prisma.event.update({
      where: { slug: eventSlug },
      data: updateData,
    });
  }

  const guests = [
    {
      fullName: "Convidado Exemplo",
      phone: "5511900000000",
      email: "exemplo@example.com",
      maxCompanions: 2
    },
    {
      fullName: "Ana Paula",
      phone: "5511999990001",
      email: "ana@example.com",
      maxCompanions: 2
    },
    {
      fullName: "Bruno Martins",
      phone: "5511988880002",
      email: "bruno@example.com",
      maxCompanions: 0
    },
    {
      fullName: "Carla Souza",
      phone: "5511977770003",
      email: "carla@example.com",
      maxCompanions: 1
    },
    {
      fullName: "Diego Ferreira",
      phone: "5511966660004",
      email: "diego@example.com",
      maxCompanions: 3
    },
    {
      fullName: "Eduarda Lima",
      phone: "5511955550005",
      email: "eduarda@example.com",
      maxCompanions: 1
    }
  ].map((guest) => ({
    ...guest,
    shortCode: createShortCode(guest.phone)
  }));

  // Otimização: Usar transação para criar todos os convidados e convites de uma vez.
  // Isso é muito mais rápido e seguro do que fazer um `upsert` por vez dentro de um loop.
  for (const guestData of guests) {
    const guest = await prisma.guest.upsert({
      where: { phone: guestData.phone },
      update: {
        fullName: guestData.fullName,
        email: guestData.email,
        maxCompanions: guestData.maxCompanions,
      },
      create: {
        eventId: event.id,
        fullName: guestData.fullName,
        phone: guestData.phone,
        email: guestData.email,
        maxCompanions: guestData.maxCompanions,
      },
    });

    // Cria ou atualiza o convite associado ao convidado, garantindo idempotência.
    await prisma.invite.upsert({
      where: { guestId: guest.id },
      update: { shortCode: guestData.shortCode },
      create: {
        eventId: event.id,
        guestId: guest.id,
        shortCode: guestData.shortCode,
      },
    });
  }

  const anaShortCode = guests.find((guest) => guest.fullName === "Ana Paula")?.shortCode;
  const brunoShortCode = guests.find((guest) => guest.fullName === "Bruno Martins")?.shortCode;

  const anaInvite = await prisma.invite.findFirstOrThrow({
    where: { shortCode: anaShortCode }
  });

  await prisma.rsvp.upsert({
    where: { inviteId: anaInvite.id },
    update: {
      status: "yes",
      companions: 2,
      participantsAbove8: 2,
      participants3To7: 0
    },
    create: {
      inviteId: anaInvite.id,
      status: "yes",
      companions: 2,
      participantsAbove8: 2,
      participants3To7: 0
    }
  });

  const brunoInvite = await prisma.invite.findFirstOrThrow({
    where: { shortCode: brunoShortCode }
  });

  await prisma.rsvp.upsert({
    where: { inviteId: brunoInvite.id },
    update: {
      status: "no",
      companions: 0,
      participantsAbove8: 0,
      participants3To7: 0
    },
    create: {
      inviteId: brunoInvite.id,
      status: "no",
      companions: 0,
      participantsAbove8: 0,
      participants3To7: 0
    }
  });

  const normalizedAdminUsername = defaultAdminUsername.trim().toLowerCase();

  const existingAdmin = await prisma.adminUser.findUnique({
    where: { username: normalizedAdminUsername },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(defaultAdminPassword, 12);
    await prisma.adminUser.create({
      data: {
        username: normalizedAdminUsername,
        passwordHash,
        name: defaultAdminName,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
