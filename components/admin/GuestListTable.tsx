"use client"; // Transforma este em um Client Component para interatividade
import { useEffect, useState } from "react";
import { GuestWithRsvp } from "@/lib/server/admin-dashboard";
import { EditGuestModal } from "./EditGuestModal";
import { DeleteGuestModal } from "./DeleteGuestModal";
import { GuestDetailsModal } from "./GuestDetailsModal";

type GuestListTableProps = {
  guests: GuestWithRsvp[];
  eventName?: string;
};

const StatusBadge = ({ status }: { status: string | null | undefined }) => {
  switch (status) {
    case "yes":
      return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Confirmado</span>;
    case "no":
      return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">Recusado</span>;
    default:
      return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">Pendente</span>;
  }
};

export const GuestListTable = ({ guests, eventName = "nossa festa" }: GuestListTableProps) => {
  const [origin, setOrigin] = useState<string>("");
  const [editingGuest, setEditingGuest] = useState<GuestWithRsvp | null>(null);
  const [guestPendingDeletion, setGuestPendingDeletion] = useState<GuestWithRsvp | null>(null);
  const [detailsGuest, setDetailsGuest] = useState<GuestWithRsvp | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleCopyLink = (shortCode: string | undefined) => {
    if (!shortCode || !origin) return;
    const inviteLink = `${origin}/convite/${shortCode}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(inviteLink);
      alert("Link do convite copiado!");
    }
  };

  const generateWhatsAppLink = (guest: GuestWithRsvp) => {
    if (!guest.invite?.shortCode || !guest.phone || !origin) return "#";
    const inviteLink = `${origin}/convite/${guest.invite.shortCode}`;
    const message = `Olá ${guest.fullName}! 
    🎉 Sabrina e Gustavo convidam para a festa de 1 aninho de nossas filhas ${eventName}! 
    Confirme sua presença aqui: 
    ${inviteLink}`;
    const encodedMessage = encodeURIComponent(message);

    return `https://api.whatsapp.com/send?phone=${guest.phone}&text=${encodedMessage}`;
  };

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Nome
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Acompanhantes
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {guests.map((guest) => (
                <tr key={guest.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {guest.fullName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <StatusBadge status={guest.invite?.rsvp?.status} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {guest.invite?.rsvp?.status === "yes" ? (
                      (() => {
                        const above8 = guest.invite?.rsvp?.participantsAbove8 ?? 0;
                        const from3To7 = guest.invite?.rsvp?.participants3To7 ?? 0;
                        const total = above8 + from3To7;
                        return `${total} (8+: ${above8}, 3-7: ${from3To7})`;
                      })()
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        onClick={() => handleCopyLink(guest.invite?.shortCode)}
                        className="text-gray-500 hover:text-gray-800"
                        title="Copiar link do convite"
                      >
                        Copiar Link
                      </button>
                      <a
                        href={generateWhatsAppLink(guest)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-500"
                      >
                        WhatsApp
                      </a>
                      <button
                        onClick={() => setDetailsGuest(guest)}
                        className="rounded-md bg-[#1f1635] px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-[#2a1f55]"
                      >
                        Detalhes
                      </button>
                      <button
                        onClick={() => setEditingGuest(guest)}
                        className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-[#7c5dff] shadow-sm ring-1 ring-inset ring-[#7c5dff]/40 hover:bg-[#f4f0ff]"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setGuestPendingDeletion(guest)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <EditGuestModal guest={editingGuest} isOpen={Boolean(editingGuest)} onClose={() => setEditingGuest(null)} />
      <DeleteGuestModal
        guest={guestPendingDeletion}
        isOpen={Boolean(guestPendingDeletion)}
        onClose={() => setGuestPendingDeletion(null)}
      />
      <GuestDetailsModal
        guest={detailsGuest}
        isOpen={Boolean(detailsGuest)}
        onClose={() => setDetailsGuest(null)}
      />
    </div>
  );
};
