"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { EventAppearanceSettings } from "@/lib/server/admin-dashboard";

type InviteAppearanceFormProps = {
  appearance: EventAppearanceSettings | null;
};

type FormState = {
  videoUrl: string;
  fallbackImageUrl: string;
  characterImageUrl: string;
};

export const InviteAppearanceForm = ({ appearance }: InviteAppearanceFormProps) => {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    videoUrl: appearance?.videoUrl ?? "",
    fallbackImageUrl: appearance?.fallbackImageUrl ?? "",
    characterImageUrl: appearance?.characterImageUrl ?? "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      videoUrl: appearance?.videoUrl ?? "",
      fallbackImageUrl: appearance?.fallbackImageUrl ?? "",
      characterImageUrl: appearance?.characterImageUrl ?? "",
    });
  }, [appearance?.videoUrl, appearance?.fallbackImageUrl, appearance?.characterImageUrl]);

  const handleChange = (field: keyof FormState) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/event", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: appearance?.id,
          ...form,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "Não foi possível salvar as configurações.");
      }

      setSuccess("Convite atualizado com sucesso!");
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? "Não foi possível salvar as configurações.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
      <div className="flex flex-col gap-2 border-b border-gray-100 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">Aparência do Convite</h2>
        <p className="text-sm text-gray-600">
          Personalize o visual que os convidados veem ao abrir o convite. Use URLs completas (https://) para imagens e vídeos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-5">
        <FieldGroup
          label="Vídeo de fundo"
          description="URL de um vídeo em MP4 para rodar no plano de fundo. Deixe vazio para remover."
          value={form.videoUrl}
          onChange={handleChange("videoUrl")}
          placeholder="https://..."
        />

        <FieldGroup
          label="Imagem de fundo"
          description="Imagem exibida enquanto o vídeo carrega ou se ele não estiver disponível."
          value={form.fallbackImageUrl}
          onChange={handleChange("fallbackImageUrl")}
          placeholder="https://..."
        />

        <div className="text-sm">
          <span className="font-semibold text-gray-800">Personagem</span>
          <span className="mt-1 block text-xs text-gray-500">
            Informe a URL completa (https://...) de uma imagem PNG/JPG com fundo transparente para aparecer acima do título do convite.
          </span>
          <input
            type="url"
            value={form.characterImageUrl}
            onChange={handleChange("characterImageUrl")}
            placeholder="https://..."
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#7c5dff] focus:outline-none focus:ring-1 focus:ring-[#7c5dff]/60"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              setForm({
                videoUrl: appearance?.videoUrl ?? "",
                fallbackImageUrl: appearance?.fallbackImageUrl ?? "",
                characterImageUrl: appearance?.characterImageUrl ?? "",
              });
              setError(null);
              setSuccess(null);
            }}
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            disabled={isSubmitting}
          >
            Desfazer alterações
          </button>
          <button
            type="submit"
            className="rounded-md bg-[#7c5dff] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#6a49f2] disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Salvando..." : "Salvar aparência"}
          </button>
        </div>
      </form>

      <PreviewSection
        form={form}
        eventMeta={{
          name: appearance?.name,
          subtitle: appearance?.subtitle,
          dateLabel: appearance?.customDateLabel,
          venue: appearance?.venue,
        }}
      />
    </div>
  );
};

const FieldGroup = ({
  label,
  description,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) => (
  <label className="block text-sm">
    <span className="font-semibold text-gray-800">{label}</span>
    <span className="mt-1 block text-xs text-gray-500">{description}</span>
    <input
      type="url"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#7c5dff] focus:outline-none focus:ring-1 focus:ring-[#7c5dff]/60"
    />
  </label>
);

type PreviewMeta = {
  name?: string | null;
  subtitle?: string | null;
  dateLabel?: string | null;
  venue?: string | null;
};

const PreviewSection = ({ form, eventMeta }: { form: FormState; eventMeta: PreviewMeta }) => {
  const hasBackground = Boolean(form.fallbackImageUrl);
  const hasCharacter = Boolean(form.characterImageUrl);
  const showEmptyState = !hasBackground && !hasCharacter;
  const eventName = eventMeta.name?.trim() || "Título do evento";
  const eventSubtitle = eventMeta.subtitle?.trim() || "Subtítulo do convite";
  const eventDateLabel = eventMeta.dateLabel?.trim();
  const eventVenue = eventMeta.venue?.trim();

  return (
    <div className="mt-8 rounded-md border border-dashed border-gray-200 bg-gray-50 p-4">
      <h3 className="text-sm font-semibold text-gray-700">Pré-visualização rápida</h3>
      <p className="mt-1 text-xs text-gray-500">
        Este preview é ilustrativo — abra um convite real para ver o resultado final.
      </p>
      <div className="mt-4 flex h-56 items-center justify-center overflow-hidden rounded-md bg-black/60 text-gray-200">
        {showEmptyState ? (
          <span className="text-xs text-gray-400">Adicione uma imagem de fundo ou personagem para visualizar.</span>
        ) : (
          <div className="relative h-full w-full overflow-hidden">
            {hasBackground ? (
              <img
                key={form.fallbackImageUrl}
                src={form.fallbackImageUrl}
                alt="Plano de fundo"
                className="absolute inset-0 h-full w-full object-cover opacity-70"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-black" />
            )}

            <div className="absolute inset-0 bg-black/45" />

            {!hasBackground && (
              <div className="absolute top-3 right-3 rounded-full border border-white/30 px-3 py-1 text-[10px] uppercase tracking-wider text-white/70">
                Sem imagem de fundo
              </div>
            )}

            <div className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-4 p-6 text-center">
              <div className="relative flex w-[150px] items-end justify-center">
                {hasCharacter ? (
                  <img
                    key={form.characterImageUrl}
                    src={form.characterImageUrl}
                    alt="Personagem"
                    className="w-[150px] -mb-5 object-contain"
                  />
                ) : (
                  <div className="flex w-[150px] items-center justify-center rounded-full border border-dashed border-white/40 text-[10px] uppercase tracking-wider text-white/70">
                    Logo
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="text-base font-bold text-[#f1e4ff] drop-shadow-[0_2px_6px_rgba(80,35,135,0.55)]">{eventName}</p>
                {eventSubtitle && (
                  <p className="text-xs uppercase tracking-wide text-[#d9cbff]">{eventSubtitle}</p>
                )}
              </div>
              <div className="flex w-full flex-col items-center gap-2 text-xs text-gray-200">
                <span className="rounded-full bg-[#7c5dff]/20 px-3 py-1 font-semibold uppercase tracking-widest text-[#d9cbff]">
                  RSVP
                </span>
                {eventDateLabel && <p className="font-semibold text-[#e7dfff]">{eventDateLabel}</p>}
                {eventVenue && <p className="text-[11px] text-white/70">{eventVenue}</p>}
                <p>Olá, Convidado Exemplo!</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
