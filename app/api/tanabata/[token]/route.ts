import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/server/prisma";

const messageSchema = z.object({
  message: z
    .string()
    .trim()
    .max(99, "A mensagem deve ter no máximo 99 caracteres."),
});

type Params = {
  params: {
    token: string;
  };
};

export async function PATCH(request: Request, { params }: Params) {
  const token = params.token;

  if (!token) {
    return NextResponse.json({ error: "Token inválido." }, { status: 400 });
  }

  const body = await request.json();
  const parsed = messageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Mensagem inválida.", details: parsed.error.issues }, { status: 400 });
  }

  const invite = await prisma.invite.findUnique({
    where: { shortCode: token },
    include: { event: true },
  });

  if (!invite) {
    return NextResponse.json(
      { error: "Este convite foi revogado e não possui mais validade." },
      { status: 404 }
    );
  }

  await prisma.invite.update({
    where: { id: invite.id },
    data: {
      tanabataMessage: parsed.data.message,
      tanabataMessageCreatedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
