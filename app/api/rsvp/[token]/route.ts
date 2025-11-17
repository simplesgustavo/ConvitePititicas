import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { z } from "zod";

const rsvpSchema = z.object({
  status: z.enum(["yes", "no"]),
  companions: z.number().int().min(0).max(10).default(0)
});

type RouteParams = {
  params: {
    token: string;
  };
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const token = params.token;

  if (!token) {
    return NextResponse.json({ error: "Token inválido" }, { status: 400 });
  }

  const body = await request.json();
  const parsed = rsvpSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.issues }, { status: 400 });
  }

  const invite = await prisma.invite.findUnique({
    where: { shortCode: token },
    include: { guest: true, event: true }
  });

  if (!invite) {
    return NextResponse.json(
      { error: "Este convite foi revogado e não possui mais validade." },
      { status: 404 }
    );
  }

  if (invite.event.rsvpDeadline && invite.event.rsvpDeadline.getTime() < Date.now()) {
    return NextResponse.json({ error: "Prazo encerrado" }, { status: 403 });
  }

  if (parsed.data.status === "yes" && parsed.data.companions > (invite.guest.maxCompanions ?? 0)) {
    return NextResponse.json(
      { error: "Quantidade de acompanhantes excede o limite" },
      { status: 400 }
    );
  }

  await prisma.rsvp.upsert({
    where: { inviteId: invite.id },
    update: {
      status: parsed.data.status,
      companions: parsed.data.status === "yes" ? parsed.data.companions : 0
    },
    create: {
      inviteId: invite.id,
      status: parsed.data.status,
      companions: parsed.data.status === "yes" ? parsed.data.companions : 0
    }
  });

  return NextResponse.json({ ok: true });
}
