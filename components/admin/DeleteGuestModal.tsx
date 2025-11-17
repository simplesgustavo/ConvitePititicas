"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { GuestWithRsvp } from "@/lib/server/admin-dashboard";

type DeleteGuestModalProps = {
  guest: GuestWithRsvp | null;
  isOpen: boolean;
  onClose: () => void;
};

export const DeleteGuestModal = ({ guest, isOpen, onClose }: DeleteGuestModalProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsDeleting(false);
    }
  }, [isOpen, guest?.id]);

  if (!isOpen || !guest) {
    return null;
  }

  const handleDelete = async () => {
    setError(null);
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/guests?id=${guest.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Não foi possível excluir o convidado.");
      }

      router.refresh();
      onClose();
    } catch (deleteError: any) {
      setError(deleteError?.message ?? "Falha ao excluir convidado.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold text-gray-900">Excluir convidado</h2>
        <p className="mt-2 text-sm text-gray-700">
          Tem certeza que deseja remover <span className="font-semibold">{guest.fullName}</span> da lista?
        </p>
        <p className="mt-1 text-sm text-gray-500">
          O convite e a resposta de presença associados também serão removidos.
        </p>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? "Removendo..." : "Excluir"}
          </button>
        </div>
      </div>
    </div>
  );
};
