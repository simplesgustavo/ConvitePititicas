"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";

type ImportGuestsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ImportResult = {
  imported: number;
  duplicates: number;
  invalid: number;
  errors: Array<{ line: number; message: string }>;
};

const initialResult: ImportResult = {
  imported: 0,
  duplicates: 0,
  invalid: 0,
  errors: [],
};

export const ImportGuestsModal = ({ isOpen, onClose }: ImportGuestsModalProps) => {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<ImportResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
    setFeedback(null);
    setErrorMessage(null);
  };

  const resetState = () => {
    setFile(null);
    setIsUploading(false);
    setFeedback(null);
    setErrorMessage(null);
  };

  const handleClose = () => {
    if (!isUploading) {
      resetState();
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setErrorMessage("Selecione um arquivo CSV antes de importar.");
      return;
    }

    setIsUploading(true);
    setFeedback(null);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/admin/guests/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => initialResult);

      if (!response.ok) {
        throw new Error(result?.message || "Não foi possível importar a lista.");
      }

      setFeedback({
        imported: result.imported ?? 0,
        duplicates: result.duplicates ?? 0,
        invalid: result.invalid ?? 0,
        errors: Array.isArray(result.errors) ? result.errors : [],
      });

      router.refresh();
    } catch (error: any) {
      setErrorMessage(error?.message ?? "Falha ao importar convidados.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="border-b border-gray-200 bg-gradient-to-r from-[#150f42] via-[#21175c] to-[#2a1c70] px-6 py-4 text-white">
          <h2 className="text-lg font-semibold">Importar convidados via CSV</h2>
          <p className="mt-1 text-xs text-white/70">
            Utilize o modelo disponível para garantir o formato correto. Cada linha representa um convidado.
          </p>
        </header>

        <div className="space-y-4 px-6 py-5 text-sm text-gray-700">
          <div className="rounded-lg border border-dashed border-[#7c5dff]/60 bg-[#f7f3ff] p-5 text-center">
            <p className="font-semibold text-[#42307d]">Arraste o arquivo CSV aqui ou clique para selecionar</p>
            <p className="mt-1 text-xs text-[#7c6bb1]">Colunas obrigatórias: fullName, phone, email (opcional), maxCompanions.</p>
            <label
              htmlFor="guest-import-file"
              className="mt-4 inline-flex cursor-pointer items-center rounded-full border border-[#7c5dff]/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#7c5dff] shadow-sm transition hover:bg-[#7c5dff] hover:text-white"
            >
              Selecionar arquivo
            </label>
            <input
              id="guest-import-file"
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {file && (
              <p className="mt-3 text-xs font-medium text-[#42307d]">
                Arquivo selecionado: <span className="font-semibold">{file.name}</span>
              </p>
            )}
          </div>

          {feedback && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              <p className="font-semibold">Importação concluída</p>
              <ul className="mt-2 space-y-1">
                <li>Convidados importados: <strong>{feedback.imported}</strong></li>
                <li>Telefones duplicados ignorados: <strong>{feedback.duplicates}</strong></li>
                <li>Linhas inválidas: <strong>{feedback.invalid}</strong></li>
              </ul>
              {feedback.errors.length > 0 && (
                <details className="mt-3 text-xs">
                  <summary className="cursor-pointer font-semibold text-green-800">Detalhes das linhas inválidas</summary>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-green-900">
                    {feedback.errors.map((error) => (
                      <li key={`error-line-${error.line}`}>
                        Linha {error.line}: {error.message}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          {errorMessage && (
            <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {errorMessage}
            </p>
          )}
        </div>

        <footer className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            disabled={isUploading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-md bg-[#7c5dff] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6a49f2] disabled:opacity-60"
            disabled={isUploading}
          >
            {isUploading ? "Importando..." : "Importar CSV"}
          </button>
        </footer>
      </div>
    </div>
  );
};
