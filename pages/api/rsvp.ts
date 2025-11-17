import { prisma } from "@/lib/server/prisma";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const rsvpBodySchema = z.object({
  token: z.string(),
  status: z.enum(["yes", "no"]),
  companions: z.number().int().min(0).optional().default(0)
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { token, status, companions } = rsvpBodySchema.parse(req.body);

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
    if (status === "yes" && companions > invite.guest.maxCompanions) {
      return res.status(400).json({
        message: `O número de acompanhantes excede o limite de ${invite.guest.maxCompanions}.`
      });
    }

    const finalCompanions = status === "yes" ? companions : 0;

    // Salva ou atualiza a resposta no banco de dados
    await prisma.rsvp.upsert({
      where: { inviteId: invite.id },
      create: {
        inviteId: invite.id,
        status,
        companions: finalCompanions
      },
      update: {
        status,
        companions: finalCompanions,
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
