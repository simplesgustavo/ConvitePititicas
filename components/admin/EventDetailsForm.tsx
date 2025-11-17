"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent, HTMLInputTypeAttribute } from "react";
import { useRouter } from "next/navigation";
import type { EventAppearanceSettings } from "@/lib/server/admin-dashboard";

type EventDetailsFormProps = {
  event: EventAppearanceSettings | null;
};

type FormState = {
  name: string;
  subtitle: string;
  customDateLabel: string;
  startsAt: string;
  venue: string;
  rsvpDeadline: string;
  notes: string;
  faviconUrl: string;
};

const toDateTimeLocal = (value?: string | Date | null) => {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  const pad = (num: number) => `${num}`.padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const EventDetailsForm = ({ event }: EventDetailsFormProps) => {
  const router = useRouter();
  const initialForm = useMemo<FormState>(
    () => ({
      name: event?.name ?? "",
      subtitle: event?.subtitle ?? "",
      customDateLabel: event?.customDateLabel ?? "",
      startsAt: toDateTimeLocal(event?.startsAt ?? null),
      venue: event?.venue ?? "",
      rsvpDeadline: toDateTimeLocal(event?.rsvpDeadline ?? null),
      notes: event?.notes ?? "",
      faviconUrl: event?.faviconUrl ?? "",
    }),
    [event?.customDateLabel, event?.faviconUrl, event?.name, event?.notes, event?.rsvpDeadline, event?.startsAt, event?.subtitle, event?.venue],
  );

  const [form, setForm] = useState<FormState>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (eventSubmit: FormEvent) => {
    eventSubmit.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/admin/event", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event?.id,
          name: form.name,
          subtitle: form.subtitle,
          customDateLabel: form.customDateLabel,
          startsAt: form.startsAt,
          venue: form.venue,
          rsvpDeadline: form.rsvpDeadline,
          notes: form.notes,
          faviconUrl: form.faviconUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Não foi possível salvar os detalhes do evento.");
      }

      setFeedback({ type: "success", message: "Detalhes do evento atualizados!" });
      router.refresh();
    } catch (error: any) {
      setFeedback({ type: "error", message: error?.message ?? "Ocorreu um erro ao salvar os detalhes." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
      <header className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">Detalhes do Evento</h2>
        <p className="text-sm text-gray-600">
          Personalize as informações principais que aparecem no convite e no painel.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Field
          label="Título da festa"
          value={form.name}
          onChange={handleChange("name")}
          placeholder="Ex.: Gustavo 4.0"
          required
        />
        <Field
          label="Subtítulo"
          value={form.subtitle}
          onChange={handleChange("subtitle")}
          placeholder="Ex.: Feijoada & Chopp"
        />
        <Field
          label="Data (texto livre)"
          value={form.customDateLabel}
          onChange={handleChange("customDateLabel")}
          placeholder="Ex.: Sábado, 22 de novembro às 13h"
        />
        <Field
          label="Horário oficial"
          type="datetime-local"
          value={form.startsAt}
          onChange={handleChange("startsAt")}
          help="Usado para relatórios e automatizações. Opcional, mas recomendado."
        />
        <Field
          label="Local"
          value={form.venue}
          onChange={handleChange("venue")}
          placeholder="Endereço ou nome do espaço"
        />
        <Field
          label="Prazo para RSVP"
          type="datetime-local"
          value={form.rsvpDeadline}
          onChange={handleChange("rsvpDeadline")}
        />
        <Field
          label="Favicon do site"
          value={form.faviconUrl}
          onChange={handleChange("faviconUrl")}
          placeholder="https://..."
          help="Link para o ícone do navegador (.ico ou PNG quadrado)."
        />
        <div className="lg:col-span-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-semibold text-gray-800">Mensagem adicional</span>
            <span className="text-xs text-gray-500">Inclua lembretes importantes, dress code ou instruções especiais.</span>
            <textarea
              rows={3}
              value={form.notes}
              onChange={handleChange("notes")}
              placeholder="Ex.: Venha com traje tropical! Estacionamento no local."
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#7c5dff] focus:outline-none focus:ring-1 focus:ring-[#7c5dff]/60"
            />
          </label>
        </div>

        {feedback && (
          <p
            className={`lg:col-span-2 text-sm ${feedback.type === "success" ? "text-green-600" : "text-red-600"}`}
          >
            {feedback.message}
          </p>
        )}

        <div className="lg:col-span-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setForm(initialForm);
              setFeedback(null);
            }}
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            disabled={isSaving}
          >
            Desfazer alterações
          </button>
          <button
            type="submit"
            className="rounded-md bg-[#7c5dff] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#6a49f2] disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? "Salvando..." : "Salvar detalhes"}
          </button>
        </div>
      </form>
    </section>
  );
};

type FieldProps = {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  type?: HTMLInputTypeAttribute;
  help?: string;
};

const Field = ({ label, value, onChange, placeholder, required = false, type = "text", help }: FieldProps) => (
  <label className="flex flex-col gap-1 text-sm">
    <span className="font-semibold text-gray-800">
      {label}
      {required && <span className="text-red-500"> *</span>}
    </span>
    {help && <span className="text-xs text-gray-500">{help}</span>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#7c5dff] focus:outline-none focus:ring-1 focus:ring-[#7c5dff]/60"
    />
  </label>
);
