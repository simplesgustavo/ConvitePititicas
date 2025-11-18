import { prisma } from "@/lib/server/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const rsvpBodySchema = z.object({
  token: z.string(),
  status: z.enum(["yes", "no"]),
  participantsAbove8: z.number().int().min(0).optional().default(0),
  participants3To7: z.number().int().min(0).optional().default(0)
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { token, status, participantsAbove8, participants3To7 } = rsvpBodySchema.parse(req.body);

    const invite = await prisma.invite.findUnique({
      where: { shortCode: token },
      include: {
        guest: true,
        event: true
      }
    });

    if (!invite) {
      return res.status(404).json({ message: "Este convite foi revogado e não possui mais validade." });
    }

    // Verifica se o prazo para resposta já passou
    if (invite.event.rsvpDeadline && invite.event.rsvpDeadline.getTime() < Date.now()) {
      return res.status(400).json({ message: "O prazo para confirmar a presença já encerrou." });
    }

    // Valida o número de acompanhantes
    const totalConfirmed = status === "yes" ? participantsAbove8 + participants3To7 : 0;

    if (status === "yes" && totalConfirmed > invite.guest.maxCompanions) {
      return res.status(400).json({
        message: `O número de pessoas confirmadas excede o limite de ${invite.guest.maxCompanions}.`
      });
    }

    const finalCompanions = totalConfirmed;
    const finalAbove8 = status === "yes" ? participantsAbove8 : 0;
    const final3To7 = status === "yes" ? participants3To7 : 0;

    // Salva ou atualiza a resposta no banco de dados
    await prisma.rsvp.upsert({
      where: { inviteId: invite.id },
      create: {
        inviteId: invite.id,
        status,
        companions: finalCompanions,
        participantsAbove8: finalAbove8,
        participants3To7: final3To7
      },
      update: {
        status,
        companions: finalCompanions,
        participantsAbove8: finalAbove8,
        participants3To7: final3To7,
        respondedAt: new Date()
      }
    });

    return res.status(200).json({ message: "Resposta registrada com sucesso!" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Dados inválidos.", details: error.errors });
    }

    console.error("Erro ao processar RSVP:", error);
    return res.status(500).json({ message: "Ocorreu um erro no servidor." });
  }
}
