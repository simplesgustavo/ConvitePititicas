"use client";

import { useState } from "react";

type Feedback = {
  type: "success" | "error";
  message: string;
} | null;

export const ChangePasswordForm = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", message: "A confirmação da nova senha não confere." });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Não foi possível atualizar a senha.");
      }

      resetForm();
      setFeedback({ type: "success", message: data.message || "Senha alterada com sucesso." });
    } catch (error: any) {
      setFeedback({ type: "error", message: error?.message ?? "Ocorreu um erro ao salvar a nova senha." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
      <header className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">Segurança da conta</h2>
        <p className="text-sm text-gray-600">
          Mantenha o acesso protegido alterando a senha periodicamente.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Senha atual
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#7c5dff] focus:outline-none focus:ring-1 focus:ring-[#7c5dff]/60"
              autoComplete="current-password"
              required
            />
          </label>
        </div>

        <div>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Nova senha
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#7c5dff] focus:outline-none focus:ring-1 focus:ring-[#7c5dff]/60"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
        </div>

        <div>
          <label className="flex flex-col gap-1 text-sm text-gray-700">
            Confirmar nova senha
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#7c5dff] focus:outline-none focus:ring-1 focus:ring-[#7c5dff]/60"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </label>
        </div>

        {feedback && (
          <p
            className={`md:col-span-2 text-sm ${feedback.type === "success" ? "text-green-600" : "text-red-600"}`}
          >
            {feedback.message}
          </p>
        )}

        <div className="md:col-span-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setFeedback(null);
            }}
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            disabled={isSubmitting}
          >
            Limpar
          </button>
          <button
            type="submit"
            className="rounded-md bg-[#7c5dff] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#6a49f2] disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Salvar nova senha"}
          </button>
        </div>
      </form>
    </section>
  );
};
