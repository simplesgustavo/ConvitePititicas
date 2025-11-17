"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type DuplicateGuestInfo = {
  id?: string;
  fullName?: string | null;
  phone?: string | null;
  email?: string | null;
  invite?: {
    shortCode?: string | null;
  } | null;
};

type AddGuestModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AddGuestModal = ({ isOpen, onClose }: AddGuestModalProps) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [duplicateGuest, setDuplicateGuest] = useState<DuplicateGuestInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setDuplicateGuest(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const payload = {
      fullName: typeof data.fullName === "string" ? data.fullName : "",
      phone: typeof data.phone === "string" ? data.phone : "",
      email: typeof data.email === "string" ? data.email : "",
      maxCompanions: Number(data.maxCompanions ?? 0)
    };

    try {
      const response = await fetch("/api/admin/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 409) {
          const duplicateInfo = errorData.guest ?? {};
          setDuplicateGuest({
            ...duplicateInfo,
            phone: duplicateInfo?.phone ?? payload.phone
          });
          return;
        }
        throw new Error(errorData.message || "Falha ao adicionar convidado.");
      }

      setDuplicateGuest(null);
      onClose();
      router.refresh(); // Recarrega os dados da página do servidor
    } catch (err: any) {
      setError(err?.message || "Falha ao adicionar convidado.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-900">Adicionar Novo Convidado</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nome Completo</label>
              <input type="text" name="fullName" id="fullName" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone (com DDI, ex: 5511...)</label>
              <input type="tel" name="phone" id="phone" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email (Opcional)</label>
              <input type="email" name="email" id="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            <div>
              <label htmlFor="maxCompanions" className="block text-sm font-medium text-gray-700">Nº de Acompanhantes</label>
              <input type="number" name="maxCompanions" id="maxCompanions" defaultValue={0} min={0} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="mt-6 flex justify-end gap-4">
              <button type="button" onClick={onClose} disabled={isLoading} className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                Cancelar
              </button>
            <button type="submit" disabled={isLoading} className="rounded-md bg-[#7c5dff] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#6a49f2] disabled:opacity-50">
              {isLoading ? "Salvando..." : "Salvar Convidado"}
            </button>
            </div>
          </form>
        </div>
      </div>
      {duplicateGuest && <DuplicateGuestModal guest={duplicateGuest} onClose={() => setDuplicateGuest(null)} />}
    </>
  );
};

const DuplicateGuestModal = ({ guest, onClose }: { guest: DuplicateGuestInfo; onClose: () => void }) => {
  const inviteUrl =
    typeof window !== "undefined" && guest?.invite?.shortCode
      ? `${window.location.origin}/convite/${guest.invite.shortCode}`
      : null;

  const handleCopyInvite = () => {
    if (!inviteUrl) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
      alert("Link do convite copiado!");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 text-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold">Convidado já cadastrado</h3>
        <p className="mt-2 text-sm text-gray-700">
          Já existe um convidado registrado com o telefone {guest.phone ?? "informado"}.
        </p>
        {guest.fullName && (
          <p className="mt-1 text-sm text-gray-700">
            Nome: <span className="font-medium">{guest.fullName}</span>
          </p>
        )}
        {inviteUrl && (
          <div className="mt-3 rounded-md border border-[#d6c3ff] bg-[#f3ecff] p-3 text-sm">
            <p className="font-semibold text-[#5c3bb5]">Convite existente</p>
            <p className="mt-1 break-words text-[#4b2f94]">{inviteUrl}</p>
            <button
              type="button"
              onClick={handleCopyInvite}
              className="mt-2 inline-flex items-center text-sm font-medium text-[#5c3bb5] hover:text-[#6a49f2]"
            >
              Copiar link
            </button>
          </div>
        )}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-[#7c5dff] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#6a49f2]"
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
};
