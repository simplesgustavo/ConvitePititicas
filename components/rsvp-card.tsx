"use client";

import { useState } from "react";
import classNames from "classnames";
import confetti from "canvas-confetti";
import { AnimatePresence, motion } from "framer-motion";
import type { InvitePreview } from "@/lib/server/invite-preview";
import { formatPluralGuests } from "@/lib/utils/format";

type RSVPCardProps = {
  invite: InvitePreview;
};

export default function RSVPCard({ invite }: RSVPCardProps) {
  const [status, setStatus] = useState<"yes" | "no" | null>(invite.latestStatus ?? null);
  const [companions, setCompanions] = useState(invite.latestCompanions ?? 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const maxAllowed = invite.maxCompanions ?? 0;

  const handlePositive = async () => {
    if (status === "yes") return;
    setStatus("yes");
    triggerConfetti();
    await submitRSVP("yes", companions);
  };

  const handleNegative = async () => {
    if (status === "no") return;
    setStatus("no");
    await submitRSVP("no", 0);
  };

  const submitRSVP = async (nextStatus: "yes" | "no", nextCompanions: number) => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/rsvp/${invite.token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus, companions: nextCompanions })
      });
    } catch (error) {
      console.error("Erro ao registrar presença", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerConfetti = () => {
    void confetti({
      particleCount: 180,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const isPastDeadline = invite.deadlinePassed;

  return (
    <div
      className={classNames("space-y-6 transition-all", {
        "grayscale": status === "no",
        "opacity-80": isSubmitting
      })}
    >
      <div className="flex flex-col gap-4 md:flex-row md:justify-center">
        <button
          className={classNames(
            "rounded-full px-6 py-3 text-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-chop-200",
            status === "yes"
              ? "bg-chop-400 text-feijoada shadow-lg shadow-chop-500/40"
              : "border border-chop-400 text-chop-200 hover:bg-chop-400 hover:text-feijoada"
          )}
          disabled={isPastDeadline || isSubmitting}
          onClick={handlePositive}
        >
          Vou 🎉
        </button>
        <button
          className={classNames(
            "rounded-full px-6 py-3 text-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-200",
            status === "no"
              ? "bg-slate-700 text-slate-100 shadow-lg shadow-black/40"
              : "border border-slate-400 text-slate-200 hover:bg-slate-500/40"
          )}
          disabled={isPastDeadline || isSubmitting}
          onClick={handleNegative}
        >
          Não vou 😢
        </button>
      </div>

      <AnimatePresence mode="wait">
        {status === "yes" && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
            exit={{ opacity: 0, y: 20 }}
            initial={{ opacity: 0, y: 20 }}
            key="companions"
          >
            {maxAllowed > 0 ? (
              <div className="space-y-2">
                <label className="block text-sm font-semibold uppercase tracking-wide text-chop-200">
                  Acompanhantes
                </label>
                <input
                  aria-label="Quantidade de acompanhantes"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-center text-lg font-semibold focus:border-chop-400 focus:outline-none"
                  max={maxAllowed}
                  min={0}
                  onChange={(event) => setCompanions(Number(event.target.value))}
                  type="number"
                  value={companions}
                />
                <p className="text-sm text-slate-300">
                  Você pode levar até {formatPluralGuests(maxAllowed)}.
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-300">Convite individual — aguardamos você!</p>
            )}
            <p className="rounded-2xl bg-black/30 px-4 py-3 text-base text-chop-100">
              Oba! Te espero em {invite.eventName}! {invite.eventSubtitle ? `🍻 ${invite.eventSubtitle}` : "🎉"}
            </p>
          </motion.div>
        )}

        {status === "no" && (
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-black/30 px-4 py-3 text-base text-slate-200"
            exit={{ opacity: 0, y: 20 }}
            initial={{ opacity: 0, y: 20 }}
            key="sad"
          >
            Poxa, vamos sentir sua falta 😢
          </motion.p>
        )}
      </AnimatePresence>

      {isPastDeadline ? (
        <p className="text-sm text-slate-400">
          Prazo encerrado em {invite.deadlineLabel}. Contate o Gustavo se precisar alterar sua resposta.
        </p>
      ) : (
        <p className="text-sm text-slate-300">
          Você pode alterar sua resposta até {invite.deadlineLabel}. Confirmado em {invite.eventDateLabel}.
        </p>
      )}
    </div>
  );
}
