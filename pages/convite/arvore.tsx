import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps, NextPage } from "next";
import { prisma } from "@/lib/server/prisma";

type MuralMessage = {
  id: string;
  guestName: string;
  message: string;
  createdAt: string;
};

type EventDetails = {
  name: string;
  videoUrl: string | null;
  fallbackImageUrl: string | null;
};

type MuralPageProps = {
  messages: MuralMessage[];
  inviteToken: string | null;
  eventName: string | null;
  eventMedia: {
    videoUrl: string | null;
    fallbackImageUrl: string | null;
  } | null;
};

const MuralPage: NextPage<MuralPageProps> = ({ messages, inviteToken, eventName, eventMedia }) => {
  const backHref = inviteToken ? `/convite/${inviteToken}` : "/convite";
  const pageTitle = eventName ? `Mural de Recados | ${eventName}` : "Mural de Recados";
  const eventLabel = eventName ?? "essa celebração";
  const backgroundVideoUrl = eventMedia?.videoUrl ?? null;
  const backgroundFallbackImage = eventMedia?.fallbackImageUrl ?? null;
  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
        {backgroundVideoUrl ? (
          <video
            key={backgroundVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover object-center"
            poster={backgroundFallbackImage || undefined}
          >
            <source src={backgroundVideoUrl} type="video/mp4" />
          </video>
        ) : (
          backgroundFallbackImage && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${backgroundFallbackImage})` }}
              aria-hidden="true"
            />
          )
        )}
        <div className="absolute inset-0 bg-black/55 mix-blend-multiply" aria-hidden="true" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none absolute -top-40 -left-24 h-80 w-80 rounded-full bg-gradient-to-br from-[#ff9966]/45 to-[#ff5e62]/35 blur-[140px]" aria-hidden="true" />
          <div className="pointer-events-none absolute bottom-0 right-[-10%] h-96 w-96 rounded-full bg-gradient-to-br from-[#00c6ff]/35 to-[#0072ff]/35 blur-[150px]" aria-hidden="true" />
        </div>

        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center px-4 py-16">
          <header className="text-center">
            <p className="text-sm uppercase tracking-[0.5em] text-white/70">Mural de Recados</p>
            <h1 className="mt-3 text-4xl font-black uppercase tracking-wide text-white drop-shadow-[0_8px_24px_rgba(15,10,30,0.65)] md:text-5xl">
              Nosso mural especial
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-white/80 md:text-base">
              Cada recado carrega uma mensagem especial de quem vai celebrar {eventLabel}. Clique nos cartões para ler tudo o que já foi compartilhado.
            </p>
          </header>

          <section className="relative mt-16 flex w-full justify-center">
            <div className="tree-scene">
              <div className="tree-canopy" aria-hidden="true" />
              <div className="relative flex w-full flex-col items-center">
                <div className="tree-trunk" aria-hidden="true" />

                <div className="tree-branches">
                  {messages.length === 0 ? (
                    <p className="rounded-3xl border border-white/10 bg-white/10 px-6 py-4 text-center text-sm text-white/80 backdrop-blur">
                      Ainda não temos recados por aqui. Seja o primeiro a compartilhar uma mensagem!
                    </p>
                  ) : (
                    messages.map((message, index) => {
                      const side = index % 2 === 0 ? "left" : "right";
                      const delay = (index % 5) * 0.5;
                      const variants = ["sunrise", "lagoon", "orchid", "matcha", "sakura", "twilight"] as const;
                      const variant = variants[index % variants.length];
                      return (
                        <div
                          key={message.id}
                          className={`tanzaku ${side}`}
                          style={{ animationDelay: `${delay}s` }}
                        >
                          <div className="tanzaku-paper" data-variant={variant}>
                            <p className="tanzaku-message">“{message.message}”</p>
                            <span className="tanzaku-name">— {message.guestName}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </section>

          <footer className="mt-16 text-center text-sm text-white/70">
            <Link
              href={backHref}
              className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.4em] text-white transition hover:bg-white/10"
            >
              Voltar ao convite
            </Link>
            <p className="mt-3 text-xs text-white/60">
              Para editar sua mensagem, retorne ao convite e confirme ou ajuste sua presença novamente.
            </p>
          </footer>
        </div>
      </main>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<MuralPageProps> = async (context) => {
  const requestedInvite = typeof context.query.invite === "string" ? context.query.invite : null;

  const invites = await prisma.invite.findMany({
    where: {
      tanabataMessage: {
        not: null,
      },
    },
    select: {
      id: true,
      tanabataMessage: true,
      tanabataMessageCreatedAt: true,
      guest: {
        select: {
          fullName: true,
        },
      },
      shortCode: true,
      event: {
        select: {
          name: true,
          videoUrl: true,
          fallbackImageUrl: true,
        },
      },
    },
    orderBy: {
      tanabataMessageCreatedAt: "desc",
    },
  });

  const messages: MuralMessage[] = invites.map((invite) => ({
    id: invite.id,
    guestName: invite.guest.fullName,
    message: invite.tanabataMessage ?? "",
    createdAt: invite.tanabataMessageCreatedAt?.toISOString() ?? new Date().toISOString(),
  }));

  const fallbackToken = invites[0]?.shortCode ?? null;
  let eventDetails: EventDetails | null = invites[0]?.event ?? null;

  if (!eventDetails && requestedInvite) {
    const inviteForEvent = await prisma.invite.findUnique({
      where: { shortCode: requestedInvite },
      select: {
        event: {
          select: {
            name: true,
            videoUrl: true,
            fallbackImageUrl: true,
          },
        },
      },
    });
    eventDetails = (inviteForEvent?.event ?? null) as EventDetails | null;
  }

  if (!eventDetails) {
    const latestEvent = await prisma.event.findFirst({
      select: {
        name: true,
        videoUrl: true,
        fallbackImageUrl: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    eventDetails = (latestEvent ?? null) as EventDetails | null;
  }

  const eventName = eventDetails?.name ?? null;
  const eventMedia = eventDetails
    ? {
        videoUrl: eventDetails.videoUrl ?? null,
        fallbackImageUrl: eventDetails.fallbackImageUrl ?? null,
      }
    : null;

  return {
    props: {
      messages,
      inviteToken: requestedInvite ?? fallbackToken,
      eventName,
      eventMedia,
    },
  };
};

export default MuralPage;
