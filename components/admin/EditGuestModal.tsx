"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { GuestWithRsvp } from "@/lib/server/admin-dashboard";

type EditGuestModalProps = {
  guest: GuestWithRsvp | null;
  isOpen: boolean;
  onClose: () => void;
};

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  maxCompanions: string;
};

export const EditGuestModal = ({ guest, isOpen, onClose }: EditGuestModalProps) => {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    fullName: "",
    phone: "",
    email: "",
    maxCompanions: "0",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guestId = guest?.id;

  const initialFormState = useMemo<FormState>(() => {
    if (!guest) {
      return {
        fullName: "",
        phone: "",
        email: "",
        maxCompanions: "0",
      };
    }

    return {
      fullName: guest.fullName ?? "",
      phone: guest.phone ?? "",
      email: guest.email ?? "",
      maxCompanions: String(guest.maxCompanions ?? 0),
    };
  }, [guest]);

  useEffect(() => {
    if (isOpen) {
      setFormState(initialFormState);
      setError(null);
      setIsSubmitting(false);
    }
  }, [initialFormState, isOpen]);

  if (!isOpen || !guest || !guestId) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const maxCompanionsNumber = Number(formState.maxCompanions);
    if (Number.isNaN(maxCompanionsNumber) || maxCompanionsNumber < 0) {
      setError("Informe a quantidade de acompanhantes como um número válido.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/guests?id=${guestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formState.fullName.trim(),
          phone: formState.phone.trim(),
          email: formState.email.trim(),
          maxCompanions: maxCompanionsNumber,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Não foi possível atualizar o convidado.");
      }

      router.refresh();
      onClose();
    } catch (updateError: any) {
      setError(updateError?.message ?? "Falha ao atualizar convidado.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900">Editar Convidado</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="edit-fullName" className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input
              id="edit-fullName"
              type="text"
              value={formState.fullName}
              onChange={(event) => setFormState((prev) => ({ ...prev, fullName: event.target.value }))}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7c5dff] focus:ring-[#7c5dff]/60"
            />
          </div>
          <div>
            <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700">Telefone (com DDI, ex: 5511...)</label>
            <input
              id="edit-phone"
              type="tel"
              value={formState.phone}
              onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7c5dff] focus:ring-[#7c5dff]/60"
            />
          </div>
          <div>
            <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700">Email (Opcional)</label>
            <input
              id="edit-email"
              type="email"
              value={formState.email}
              onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7c5dff] focus:ring-[#7c5dff]/60"
            />
          </div>
          <div>
            <label htmlFor="edit-maxCompanions" className="block text-sm font-medium text-gray-700">Nº de Acompanhantes</label>
            <input
              id="edit-maxCompanions"
              type="number"
              min={0}
              value={formState.maxCompanions}
              onChange={(event) => setFormState((prev) => ({ ...prev, maxCompanions: event.target.value }))}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#7c5dff] focus:ring-[#7c5dff]/60"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-[#7c5dff] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#6a49f2] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
