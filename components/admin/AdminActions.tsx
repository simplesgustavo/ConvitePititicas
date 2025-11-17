"use client";

import { useState } from "react";
import { AddGuestModal } from "./AddGuestModal";
import { ImportGuestsModal } from "./ImportGuestsModal";

export const AdminActions = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  return (
    <>
      <div className="rounded-lg bg-gray-50 p-4 shadow-sm ring-1 ring-gray-900/5">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">Gerenciar Convidados</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Adicione um convidado manualmente ou importe uma lista completa.
            </p>
          </div>
          <div className="flex flex-shrink-0 gap-2">
            <a href="/api/admin/template" download="modelo_convidados.csv" className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Baixar Modelo</a>
            <button type="button" onClick={() => setIsImportModalOpen(true)} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">Importar CSV</button>
            <button type="button" onClick={() => setIsAddModalOpen(true)} className="rounded-md bg-[#7c5dff] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#6a49f2]">Adicionar Convidado</button>
          </div>
        </div>
      </div>
      <AddGuestModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
      <ImportGuestsModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} />
    </>
  );
};
