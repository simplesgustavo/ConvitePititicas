import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { getInvitePreview, InvitePreview } from "@/lib/server/invite-preview";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

type InvitePageProps = {
  invite: InvitePreview | null;
};

// Componente para o seletor de acompanhantes
const CompanionsSelector = ({
  max,
  value,
  onChange
}: {
  max: number;
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex items-center justify-center gap-4">
    <button
      onClick={() => onChange(Math.max(0, value - 1))}
      className="text-4xl font-bold"
    >
      -
    </button>
    <span className="text-3xl font-bold">{value}</span>
    <button
      onClick={() => onChange(Math.min(max, value + 1))}
      className="text-4xl font-bold"
    >
      +
    </button>
  </div>
);

const InviteContent = ({ invite }: { invite: InvitePreview }) => {
  const defaultView: "question" | "selecting" | "confirmed_yes" | "confirmed_no" =
    invite.latestStatus === "yes" ? "confirmed_yes" : invite.latestStatus === "no" ? "confirmed_no" : "question";

  const [view, setView] = useState<"question" | "selecting" | "confirmed_yes" | "confirmed_no">(defaultView);
  const [companions, setCompanions] = useState(invite.latestCompanions ?? 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState(invite.tanabataMessage ?? "");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [messageFeedback, setMessageFeedback] = useState<string | null>(null);
  const maxMessageLength = 99;
  const remainingCharacters = maxMessageLength - message.length;
  const [showTanabataOverlay, setShowTanabataOverlay] = useState(false);

  useEffect(() => {
    if (!showTanabataOverlay) {
      setMessageFeedback(null);
    }
  }, [showTanabataOverlay]);

  useEffect(() => {
    if ((defaultView === "confirmed_yes" || defaultView === "confirmed_no") && !invite.tanabataMessage) {
      setShowTanabataOverlay(true);
    }
  }, [defaultView, invite.tanabataMessage]);

  useEffect(() => {
    const videoEl = document.getElementById("invite-background-video") as HTMLVideoElement | null;
    if (!videoEl) return;

    videoEl.loop = true;
    videoEl.playsInline = true;
    videoEl.muted = true;
    videoEl.autoplay = true;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        videoEl.play().catch(() => {});
      } else {
        videoEl.pause();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    if (videoEl.readyState >= 1) {
      videoEl.play().catch(() => {});
    } else {
      const playOnce = () => {
        videoEl.play().catch(() => {});
        videoEl.removeEventListener("loadedmetadata", playOnce);
      };
      videoEl.addEventListener("loadedmetadata", playOnce);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [invite.videoUrl]);

  const handleRsvp = async (status: "yes" | "no") => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: invite.token, status, companions })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Ocorreu um erro.");
      }

      if (status === "yes") {
        setView("confirmed_yes");
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else {
        setView("confirmed_no");
      }
      setShowTanabataOverlay(true);
      setMessageFeedback(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageSubmit = async () => {
    const trimmed = message.trim();
    if (trimmed.length === 0) {
      setMessageFeedback("Escreva um recado antes de enviar.");
      return;
    }
    if (trimmed.length > maxMessageLength) {
      setMessageFeedback("A mensagem está muito longa.");
      return;
    }

    setIsSendingMessage(true);
    setMessageFeedback(null);

    try {
      const response = await fetch(`/api/tanabata/${invite.token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed })
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Não foi possível salvar sua mensagem.");
      }

      setMessage(trimmed);
      setMessageFeedback("Recado enviado para o mural! 🌠");
    } catch (submitError: any) {
      setMessageFeedback(submitError?.message ?? "Não foi possível salvar sua mensagem.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <>
      <Head>
        <title>Convite especial | {invite.eventName}</title>
        <meta name="description" content={`Convite para ${invite.guestName} participar de ${invite.eventName}.`} />
        {invite.faviconUrl && <link rel="icon" href={invite.faviconUrl} />}
      </Head>

      <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
        <video
          key={invite.videoUrl}
          id="invite-background-video"
          autoPlay
          muted
          playsInline
          preload="auto"
          loop
          className="absolute top-0 left-0 h-full w-full object-cover object-center"
          poster={invite.fallbackImageUrl || ""}
        >
          <source src={invite.videoUrl || ""} type="video/mp4" />
          Seu navegador não suporta o formato de vídeo.
        </video>

        <div className="absolute inset-0 bg-black/55 mix-blend-multiply" />

        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none absolute -top-40 -left-24 h-80 w-80 rounded-full bg-gradient-to-br from-[#ff9966]/45 to-[#ff5e62]/35 blur-[140px]" />
          <div className="pointer-events-none absolute bottom-0 right-[-10%] h-96 w-96 rounded-full bg-gradient-to-br from-[#00c6ff]/35 to-[#0072ff]/35 blur-[150px]" />
        </div>

        <div className={`relative z-10 flex w-full justify-center px-4 py-12 transition duration-500 ${view === "confirmed_no" ? "grayscale" : ""}`}>
          <div className="relative w-full max-w-4xl">
            <div className="pointer-events-none absolute -top-28 left-6 hidden h-64 w-64 rounded-full bg-gradient-to-br from-[#ffde7d]/45 to-[#ff9a62]/35 blur-[110px] md:block" />
            <div className="pointer-events-none absolute -bottom-24 right-10 hidden h-72 w-72 rounded-full bg-gradient-to-br from-[#7c5dff]/45 to-[#9c5dfd]/35 blur-[120px] md:block" />

            <div className="relative overflow-hidden rounded-[36px] border border-white/16 bg-white/8 p-[1px] backdrop-blur-lg shadow-[0_60px_140px_-60px_rgba(10,12,48,0.8)]">
              <div className="pointer-events-none absolute inset-0 rounded-[36px] border border-white/12" aria-hidden="true" />
              <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-full -translate-x-1/2 rounded-full bg-gradient-to-r from-[#ff8b5d]/45 via-[#ffd27d]/30 to-transparent opacity-70 blur-[180px]" />
              <div className="pointer-events-none absolute bottom-[-30%] right-[-20%] h-96 w-96 rounded-full bg-gradient-to-br from-[#00c6ff]/30 to-transparent opacity-70 blur-[200px]" />

              <div className="relative flex flex-col gap-10 rounded-[34px] bg-white/10 p-8 text-center backdrop-blur-xl sm:p-10 md:p-14">
                <div className="flex flex-col items-center gap-4">
                  {invite.characterImageUrl && (
                    <div className="relative flex w-[160px] items-end justify-center">
                      <span className="absolute -bottom-2 h-10 w-24 rounded-full bg-black/40 blur-xl" aria-hidden="true" />
                      <img
                      src={invite.characterImageUrl}
                      alt="Personagem do convite"
                      className="relative w-[150px] -mb-6 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <h1 className="text-4xl font-black uppercase tracking-tight text-[#f5ecff] drop-shadow-[0_6px_16px_rgba(45,10,90,0.7)] md:text-6xl">
                    {invite.eventName}
                  </h1>
                  {invite.eventSubtitle && (
                    <p className="text-base font-semibold uppercase tracking-[0.35em] text-[#ceb8ff] md:text-lg">
                      {invite.eventSubtitle}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1 text-sm text-[#f0e8ff]">
                  <span className="rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#f8e9ff]">
                    {invite.eventDateLabel}
                  </span>
                  {invite.eventVenue && <p className="text-base font-medium text-white/80">{invite.eventVenue}</p>}
                </div>
              </div>

              <div className="flex w-full flex-col gap-6 rounded-3xl border border-white/12 bg-white/8 p-6 text-center shadow-inner backdrop-blur-sm md:p-10">
                {view === "question" && (
                  <div className="space-y-5">
                    <p className="inline-flex items-center justify-center rounded-full bg-[#ff8b5d]/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#ffae86]">
                      RSVP
                    </p>
                    <h2 className="text-2xl md:text-3xl">
                      Olá, <span className="font-bold text-[#fbe9ff]">{invite.guestName}</span>!
                    </h2>
                    <p className="text-lg text-[#f6eaff]">Que alegria ter você por aqui! Vamos celebrar juntos?</p>
                    <div className="mt-2 flex w-full flex-col gap-4 sm:flex-row">
                      <button
                        onClick={() => setView("selecting")}
                        disabled={isLoading}
                        className="w-full rounded-full bg-gradient-to-r from-[#ff8b5d] via-[#ffae86] to-[#ffd27d] px-8 py-3 text-lg font-semibold uppercase tracking-wide text-[#3f1b0e] shadow-lg shadow-[#ff8b5d]/40 transition hover:scale-105 disabled:opacity-50"
                      >
                        Vou! 🍻
                      </button>
                      <button
                        onClick={() => handleRsvp("no")}
                        disabled={isLoading}
                        className="w-full rounded-full border border-white/30 px-8 py-3 text-lg font-semibold uppercase tracking-wide text-white transition hover:bg-white/10 disabled:opacity-50"
                      >
                        Não vou 😢
                      </button>
                    </div>
                  </div>
                )}

                {view === "selecting" && (
                  <div className="space-y-5">
                    <h2 className="text-2xl font-semibold text-[#fbe9ff] md:text-3xl">Quantos acompanhantes?</h2>
                    <p className="text-sm text-[#e6daff]">(Além de você até {invite.maxCompanions}. Confirmar presença apenas de maiores de 11 anos.)</p>
                    <CompanionsSelector max={invite.maxCompanions} value={companions} onChange={setCompanions} />
                    <div className="mt-2 flex w-full flex-col gap-4 sm:flex-row">
                      <button
                        onClick={() => handleRsvp("yes")}
                        disabled={isLoading}
                        className="w-full rounded-full bg-gradient-to-r from-[#ff8b5d] via-[#ffae86] to-[#ffd27d] px-8 py-3 text-lg font-semibold uppercase tracking-wide text-[#3f1b0e] shadow-lg shadow-[#ff8b5d]/40 transition hover:scale-105 disabled:opacity-50"
                      >
                        Confirmar presença
                      </button>
                      <button
                        onClick={() => setView("question")}
                        disabled={isLoading}
                        className="w-full rounded-full border border-white/30 px-8 py-3 text-lg font-semibold uppercase tracking-wide text-white transition hover:bg-white/10 disabled:opacity-50"
                      >
                        Voltar
                      </button>
                    </div>
                  </div>
                )}

                {view === "confirmed_yes" && (
                  <div className="space-y-4 text-center">
                    <p className="inline-flex items-center justify-center rounded-full bg-[#5ad19b]/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#9bfac5]">
                      RSVP Confirmado
                    </p>
                    <h2 className="text-4xl font-bold text-[#fdf7ff]">Oba!</h2>
                    <p className="text-lg text-[#f5ecff]">Te espero em {invite.eventName}!</p>
                    <p className="rounded-full bg-[#1d4534]/60 px-4 py-2 text-sm text-[#b7f7d5]">
                      {companions > 0
                        ? `Você + ${companions} acompanhante(s) confirmado(s).`
                        : "Sua presença está confirmada."}
                    </p>
                    <button
                      onClick={() => setShowTanabataOverlay(true)}
                      className="rounded-full border border-white/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-white/10"
                    >
                      Deixar recado no mural
                    </button>
                  </div>
                )}

                {view === "confirmed_no" && (
                  <div className="space-y-4 text-center">
                    <p className="inline-flex items-center justify-center rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                      RSVP Recusado
                    </p>
                    <h2 className="text-4xl font-bold text-white/90">Poxa...</h2>
                    <p className="text-lg text-white/70">Vamos sentir sua falta 😢</p>
                    <button
                      onClick={() => setShowTanabataOverlay(true)}
                      className="rounded-full border border-white/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-white/10"
                    >
                      Deixar recado no mural
                    </button>
                  </div>
                )}

                {error && <p className="text-sm text-[#ffb3c1]">{error}</p>}
              </div>

              <div className="space-y-3 text-sm text-white/85">
                {invite.eventNotes && (
                  <p className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 font-medium text-white/90">
                    {invite.eventNotes}
                  </p>
                )}
                <p>
                  Por favor, responda até <span className="font-semibold text-white">{invite.deadlineLabel}</span>.
                </p>
              </div>
            </div>
          </div>
        </div>

        </div>

        {showTanabataOverlay && (
          <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/15 bg-white/12 p-6 shadow-[0_40px_120px_-60px_rgba(10,12,38,0.85)] backdrop-blur-xl">
              <button
                onClick={() => setShowTanabataOverlay(false)}
                className="absolute right-4 top-4 text-xs uppercase tracking-[0.35em] text-white/70 transition hover:text-white"
              >
                Fechar
              </button>
              <div className="space-y-5 pt-6">
                <h3 className="text-center text-xl font-semibold text-white/90">Deixe seu recado</h3>
                <p className="text-center text-sm text-white/70">
                  Escreva um desejo, um recado ou uma memória para o nosso mural de recados.
                </p>
                <textarea
                  value={message}
                  onChange={(event) => {
                    const next = event.target.value;
                    if (next.length <= maxMessageLength) {
                      setMessage(next);
                      setMessageFeedback(null);
                    }
                  }}
                  maxLength={maxMessageLength}
                  rows={4}
                  placeholder="Até 99 caracteres..."
                  className="w-full rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-sm text-white shadow-inner placeholder:text-white/60 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/40"
                />
                <div className="flex flex-col items-center gap-3 text-xs text-white/60 sm:flex-row sm:justify-between">
                  <span>{remainingCharacters} caracteres restantes</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleMessageSubmit}
                      disabled={isSendingMessage}
                      className="rounded-full bg-gradient-to-r from-[#ff8b5d] via-[#ffae86] to-[#ffd27d] px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#422210] shadow-md shadow-[#ff8b5d]/30 transition hover:scale-105 disabled:opacity-60"
                    >
                      {isSendingMessage ? "Salvando..." : "Enviar recado"}
                    </button>
                    <Link
                      href={`/convite/arvore?invite=${invite.token}`}
                      className="rounded-full border border-white/30 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-white/10"
                    >
                      Ver mural
                    </Link>
                  </div>
                </div>
                {messageFeedback && (
                  <p className="text-center text-sm text-[#ffe5ec]">{messageFeedback}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

const InvitePage: NextPage<InvitePageProps> = ({ invite }) => {
  if (!invite) {
    return (
      <>
        <Head>
          <title>Convite revogado</title>
          <meta name="robots" content="noindex" />
        </Head>
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#1c1a3b] via-[#3f1f6b] to-[#0f162b] p-6 text-white">
          <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
            <h1 className="text-3xl font-bold uppercase tracking-[0.3em] text-red-200 drop-shadow-lg">
              Convite revogado
            </h1>
            <p className="mt-4 text-sm text-white/80">
              Este convite foi revogado e não possui mais validade. Entre em contato com o organizador
              para confirmar seu status ou solicitar um novo link.
            </p>
            <Link
              href="/"
              className="mt-8 inline-flex items-center justify-center rounded-full border border-white/30 bg-white/15 px-6 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:scale-[1.02] hover:border-white/60 hover:bg-white/25"
            >
              Voltar ao início
            </Link>
          </div>
        </main>
      </>
    );
  }

  return <InviteContent invite={invite} />;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const token = context.params?.token as string;

  const invite = await getInvitePreview(token);

  return {
    props: {
      invite
    }
  };
};

export default InvitePage;
