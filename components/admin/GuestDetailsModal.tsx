"use client";

import { useMemo } from "react";
import type { GuestWithRsvp } from "@/lib/server/admin-dashboard";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});

const numberFormatter = new Intl.NumberFormat("pt-BR");

type GuestDetailsModalProps = {
  guest: GuestWithRsvp | null;
  isOpen: boolean;
  onClose: () => void;
};

export const GuestDetailsModal = ({ guest, isOpen, onClose }: GuestDetailsModalProps) => {
  const normalizeDate = (value: Date | string | null | undefined) => {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  };

  const viewInfo = useMemo(() => {
    if (!guest?.invite) {
      return {
        firstViewedAt: "Ainda não visualizado",
        lastViewedAt: "Ainda não visualizado",
        viewCount: "0",
      };
    }

    const { firstViewedAt, lastViewedAt, viewCount } = guest.invite;
    const firstDate = normalizeDate(firstViewedAt);
    const lastDate = normalizeDate(lastViewedAt);

    return {
      firstViewedAt: firstDate ? dateFormatter.format(firstDate) : "Ainda não visualizado",
      lastViewedAt: lastDate ? dateFormatter.format(lastDate) : "Ainda não visualizado",
      viewCount: numberFormatter.format(viewCount ?? 0),
    };
  }, [guest?.invite]);

  if (!isOpen || !guest) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-br from-[#110b25] via-[#1b1238] to-[#120b26] p-6 text-white shadow-[0_40px_120px_-60px_rgba(76,41,150,0.8)]">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/70 transition hover:text-white"
        >
          Fechar
        </button>

        <header className="pr-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[#9c8ef7]">Detalhes do convidado</p>
          <h2 className="mt-2 text-2xl font-bold text-white">{guest.fullName}</h2>
          <p className="mt-1 text-sm text-white/70">
            Convite:{" "}
            <span className="font-mono text-white/90">{guest.invite?.shortCode ?? "sem código"}</span>
          </p>
        </header>

        <section className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-xs uppercase tracking-[0.22em] text-white/50">Contato</h3>
            <dl className="mt-3 space-y-2">
              <div>
                <dt className="text-white/60">Telefone</dt>
                <dd className="font-medium text-white/90">{guest.phone}</dd>
              </div>
              {guest.email && (
                <div>
                  <dt className="text-white/60">E-mail</dt>
                  <dd className="font-medium text-white/90">{guest.email}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <h3 className="text-xs uppercase tracking-[0.22em] text-white/50">RSVP</h3>
            <dl className="mt-3 space-y-2">
              <div>
                <dt className="text-white/60">Status</dt>
                <dd className="font-medium text-white/90">
                  {guest.invite?.rsvp?.status === "yes"
                    ? "Confirmado"
                    : guest.invite?.rsvp?.status === "no"
                      ? "Recusado"
                      : "Pendente"}
                </dd>
              </div>
              <div>
                <dt className="text-white/60">Acompanhantes</dt>
                <dd className="font-medium text-white/90">
                  {guest.invite?.rsvp?.companions ?? 0} de {guest.maxCompanions ?? 0}
                </dd>
              </div>
              {guest.invite?.rsvp?.status === "yes" && (
                <div>
                  <dt className="text-white/60">Faixa etária</dt>
                  <dd className="font-medium text-white/90">
                    {guest.invite?.rsvp?.participantsAbove8 ?? 0} acima de 8 anos •{" "}
                    {guest.invite?.rsvp?.participants3To7 ?? 0} de 3 a 7 anos
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <h3 className="text-xs uppercase tracking-[0.22em] text-white/50">
            Engajamento do convite
          </h3>
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <dt className="text-xs uppercase tracking-[0.25em] text-white/50">Primeiro acesso</dt>
              <dd className="mt-2 text-sm font-medium text-white">{viewInfo.firstViewedAt}</dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <dt className="text-xs uppercase tracking-[0.25em] text-white/50">Última visualização</dt>
              <dd className="mt-2 text-sm font-medium text-white">{viewInfo.lastViewedAt}</dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
              <dt className="text-xs uppercase tracking-[0.25em] text-white/50">Total de visualizações</dt>
              <dd className="mt-2 text-2xl font-bold text-white">{viewInfo.viewCount}</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
};
