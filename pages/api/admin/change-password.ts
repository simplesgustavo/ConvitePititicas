import { compare, hash } from "bcryptjs";
import { getServerSession } from "next-auth/next";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";
import { authOptions } from "../auth/[...nextauth]";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Informe a senha atual."),
  newPassword: z.string().min(8, "A nova senha precisa ter pelo menos 8 caracteres."),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.id) {
    return res.status(401).json({ message: "Não autorizado." });
  }

  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).json({ message: "Método não permitido." });
  }

  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body ?? {});

    const adminUser = await prisma.adminUser.findUnique({
      where: { id: session.user.id },
    });

    if (!adminUser) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const isCurrentPasswordValid = await compare(currentPassword, adminUser.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Senha atual incorreta." });
    }

    const isSamePassword = await compare(newPassword, adminUser.passwordHash);
    if (isSamePassword) {
      return res.status(400).json({ message: "Escolha uma senha diferente da atual." });
    }

    const newPasswordHash = await hash(newPassword, 12);

    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { passwordHash: newPasswordHash },
    });

    return res.status(200).json({ message: "Senha atualizada com sucesso." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Dados inválidos.", details: error.errors });
    }

    console.error("Erro ao alterar senha:", error);
    return res.status(500).json({ message: "Ocorreu um erro no servidor." });
  }
}
